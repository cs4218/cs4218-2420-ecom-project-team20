import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import UpdateProduct from "./UpdateProduct";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({ error: jest.fn(), success: jest.fn() }));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div />);

describe("UpdateProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    axios.get.mockResolvedValueOnce({
      data: {
        product: {
          _id: "123",
          name: "Test Product",
          photo: "/api/v1/product/product-photo/123",
          description: "Test Description",
          price: 100,
          quantity: 10,
          shipping: 1,
          category: { _id: "cat123", name: "Test Category" },
        },
      },
    });

    axios.get.mockResolvedValueOnce({
      data: {
        success: true,
        category: [{ _id: "cat123", name: "Test Category" }],
      },
    });
  });

  const formDataToObject = (formData) => {
    const obj = {};
    formData.forEach((value, key) => {
      obj[key] = value;
    });
    return obj;
  };

  it("renders the component correctly", async () => {
    const { getByText, getByDisplayValue } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Update Product")).toBeInTheDocument();

      const nameInput = getByDisplayValue("Test Product");
      expect(nameInput).toBeInTheDocument();
      expect(nameInput).toHaveValue("Test Product");

      const descriptionTextarea = screen.getByDisplayValue("Test Description");
      expect(descriptionTextarea).toBeInTheDocument();
      expect(descriptionTextarea).toHaveValue("Test Description");

      const priceInput = screen.getByDisplayValue("100");
      expect(priceInput).toBeInTheDocument();
      expect(priceInput).toHaveValue(100);

      const quantityInput = screen.getByDisplayValue("10");
      expect(quantityInput).toBeInTheDocument();
      expect(quantityInput).toHaveValue(10);
    });

    const img = screen.getByAltText("product_photo");
    expect(img).toHaveAttribute("src", "/api/v1/product/product-photo/123");

    const shippingOption = await screen.findByText("yes");
    expect(shippingOption).toBeInTheDocument();

    const categoryOption = await screen.findByText("Test Category");
    expect(categoryOption).toBeInTheDocument();
  });

  it("updates product data when form is submitted", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: "Product Updated Successfully",
      },
    });

    const { getByDisplayValue, getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.change(getByDisplayValue("Test Product"), {
        target: { value: "Updated Product" },
      });
      fireEvent.change(getByDisplayValue("100"), {
        target: { value: "150" },
      });

      const updateButton = getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);
    });

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/product/update-product/123",
        expect.any(FormData)
      );
    });

    const formData = axios.put.mock.calls[0][1];
    const formDataObject = formDataToObject(formData);

    expect(formDataObject).toEqual({
      category: "cat123",
      description: "Test Description",
      name: "Updated Product",
      price: "150",
      quantity: "10",
      shipping: "1",
    });
  });

  it("displays an error message when the update request fails", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Error in Update product",
      },
    });

    const { getByDisplayValue, getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.change(getByDisplayValue("Test Product"), {
        target: { value: "Updated Product" },
      });
      fireEvent.change(getByDisplayValue("100"), {
        target: { value: "150" },
      });

      const updateButton = getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);
    });

    // Check that the error message is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error in Update product");
    });
  });

  it("displays Something went wrong when the update request fails from an error", async () => {
    axios.put.mockRejectedValueOnce(
      new Error("Request failed with status code 500")
    );

    const { getByDisplayValue, getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      fireEvent.change(getByDisplayValue("Test Product"), {
        target: { value: "Updated Product" },
      });
      fireEvent.change(getByDisplayValue("100"), {
        target: { value: "150" },
      });

      const updateButton = getByText("UPDATE PRODUCT");
      fireEvent.click(updateButton);
    });

    // Check that the error message is shown
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("should delete the product and redirect to product list", async () => {
    window.prompt = jest.fn().mockReturnValue("yes");

    axios.delete.mockResolvedValueOnce({ data: { success: true } });

    const { getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Update Product")).toBeInTheDocument();
    });

    const deleteButton = getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);

    await waitFor(() =>
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/product/delete-product/"
      )
    );

    expect(toast.success).toHaveBeenCalledWith("Product deleted successfully");

    window.prompt.mockRestore();
  });

  it("should not delete the product if the user cancels the delete prompt", async () => {
    window.prompt = jest.fn().mockReturnValue(null);

    const { getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Update Product")).toBeInTheDocument();
    });

    const deleteButton = getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);

    await waitFor(() => expect(axios.delete).not.toHaveBeenCalled());

    window.prompt.mockRestore();
  });

  it("should show error if the product deletion fails due to error", async () => {
    window.prompt = jest.fn().mockReturnValue("yes");

    axios.delete.mockRejectedValueOnce(new Error("Network error"));

    const { getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Update Product")).toBeInTheDocument();
    });

    const deleteButton = getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Something went wrong")
    );

    window.prompt.mockRestore();
  });

  it("should show error if the delete request is unsuccessful", async () => {
    window.prompt = jest.fn().mockReturnValue("yes");

    axios.delete.mockResolvedValueOnce({
      data: { success: false, message: "Failed to delete" },
    });

    const { getByText } = render(
      <MemoryRouter>
        <UpdateProduct />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Update Product")).toBeInTheDocument();
    });

    const deleteButton = getByText("DELETE PRODUCT");
    fireEvent.click(deleteButton);

    // Check if the error toast appeared with the appropriate message
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Failed to delete")
    );

    window.prompt.mockRestore();
  });
});
