import { render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import React from "react";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div />);

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  Select: ({ value, onChange, "data-testid": testId }) => {
    let options = [];

    if (testId === "category-select") {
      options = [
        <option key="category-1" value="Category 1">
          Category 1
        </option>,
        <option key="category-2" value="Category 2">
          Category 2
        </option>,
      ];
    } else if (testId === "shipping-select") {
      options = [
        <option key="yes" value="Yes">
          Yes
        </option>,
        <option key="no" value="No">
          No
        </option>,
      ];
    }

    return (
      <select
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options}
      </select>
    );
  },
}));

describe("CreateProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockCategories = [
    {
      _id: "1",
      name: "Category 1",
    },
    {
      _id: "2",
      name: "Category 2",
    },
  ];

  it("renders the form fields correctly", () => {
    axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });
    const { getByPlaceholderText, getByTestId } = render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    expect(getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(getByPlaceholderText("write a description")).toBeInTheDocument();
    expect(getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(getByPlaceholderText("write a quantity")).toBeInTheDocument();
    expect(getByTestId("category-select")).toBeInTheDocument();
    expect(getByTestId("shipping-select")).toBeInTheDocument();
  });

  it("should create a product successfully", async () => {
    axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });

    axios.post.mockResolvedValue({
      data: {
        success: true,
        message: "Product Created Successfully",
      },
    });

    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    const { getByRole, getByPlaceholderText, getByText, getByTestId } = render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );
    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Product Name" },
    });
    fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "Product Description" },
    });
    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const categorySelect = getByTestId("category-select");
    fireEvent.mouseDown(categorySelect);
    const categoryOption = getByText("Category 1");
    fireEvent.click(categoryOption);

    expect(categorySelect).toHaveValue("Category 1");

    const shippingSelect = getByTestId("shipping-select");
    fireEvent.mouseDown(shippingSelect);
    const shippingOption = getByText("Yes");
    fireEvent.click(shippingOption);

    expect(shippingSelect).toHaveValue("Yes");

    const submitButton = getByRole("button", {
      name: /CREATE PRODUCT/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/create-product",
        expect.any(FormData)
      );
      expect(toast.success).toHaveBeenCalledWith(
        "Product Created Successfully"
      );

      expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/products");
    });
  });

  it("should handle product creation failure", async () => {
    axios.get.mockResolvedValueOnce({ data: { category: mockCategories } });
    axios.post.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Failed to create product",
      },
    });

    const mockNavigate = jest.fn();
    jest
      .spyOn(require("react-router-dom"), "useNavigate")
      .mockReturnValue(mockNavigate);

    const { getByRole, getByPlaceholderText, getByText, getByTestId } = render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText("write a name"), {
      target: { value: "Product Name" },
    });
    fireEvent.change(getByPlaceholderText("write a description"), {
      target: { value: "Product Description" },
    });
    fireEvent.change(getByPlaceholderText("write a Price"), {
      target: { value: "100" },
    });
    fireEvent.change(getByPlaceholderText("write a quantity"), {
      target: { value: "10" },
    });

    const categorySelect = getByTestId("category-select");
    fireEvent.mouseDown(categorySelect);
    const categoryOption = getByText("Category 1");
    fireEvent.click(categoryOption);

    const shippingSelect = getByTestId("shipping-select");
    fireEvent.mouseDown(shippingSelect);
    const shippingOption = getByText("Yes");
    fireEvent.click(shippingOption);

    const submitButton = getByRole("button", {
      name: /CREATE PRODUCT/i,
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to create product");
      expect(axios.post).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
