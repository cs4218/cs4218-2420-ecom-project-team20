import { render, screen, waitFor } from "@testing-library/react";
import Products from "./Products";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";
import React from "react";

jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));
jest.mock("../../components/AdminMenu", () => () => <div />); // Mocking AdminMenu

describe("Products Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render products list correctly", async () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Product 1",
        description: "Description 1",
        slug: "product-1",
      },
      {
        _id: "2",
        name: "Product 2",
        description: "Description 2",
        slug: "product-2",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    const { getByText } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Wait for the products to load
    await waitFor(() => {
      expect(getByText("Product 1")).toBeInTheDocument();
      expect(getByText("Product 2")).toBeInTheDocument();
    });

    expect(getByText("Product 1").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/product/product-1"
    );
    expect(getByText("Product 2").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/product/product-2"
    );
  });

  it("should show error message if API call fails", async () => {
    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    // Wait for the error toast to be called
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something Went Wrong")
    );
  });

  it("should display product images correctly", async () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Product 1",
        description: "Description 1",
        slug: "product-1",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(screen.getByText("Product 1")).toBeInTheDocument()
    );

    const productImage = screen.getByAltText("Product 1");
    expect(productImage).toHaveAttribute(
      "src",
      "/api/v1/product/product-photo/1"
    );
  });

  it("should render the correct number of products", async () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Product 1",
        description: "Description 1",
        slug: "product-1",
      },
      {
        _id: "2",
        name: "Product 2",
        description: "Description 2",
        slug: "product-2",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Product 1")).toBeInTheDocument();
      expect(screen.getByText("Product 2")).toBeInTheDocument();
    });

    const productLinks = screen.getAllByRole("link");
    expect(productLinks.length).toBe(mockProducts.length);
  });

  it("should navigate to the product detail page when a product is clicked", async () => {
    const mockProducts = [
      {
        _id: "1",
        name: "Product 1",
        description: "Description 1",
        slug: "product-1",
      },
    ];

    axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    );

    const productLink = screen.getByText("Product 1").closest("a");
    productLink.click();

    // Wait for the navigation and check the correct path
    await waitFor(() => {
      expect(window.location.pathname).toBe(
        "/dashboard/admin/product/product-1"
      );
    });
  });
});
