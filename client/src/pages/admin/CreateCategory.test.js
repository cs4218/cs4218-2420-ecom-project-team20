import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { MemoryRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import AdminMenu from "../../components/AdminMenu";
import CategoryForm from "../../components/Form/CategoryForm";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Form/CategoryForm", () => () => (
  <form>CategoryForm</form>
));

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CreateCategory component and loads categories", async () => {
    const mockCategories = [
      { _id: "1", name: "Books" },
      { _id: "2", name: "Electronics" },
    ];

    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Manage Category")).toBeInTheDocument();
      expect(getByText("Books")).toBeInTheDocument();
      expect(getByText("Electronics")).toBeInTheDocument();
    });
  });

  it("should not update if category already exists", async () => {
    const mockCategories = [
      { _id: "1", name: "Books" },
      { _id: "2", name: "Electronics" },
    ];

    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });

    axios.put.mockResolvedValue({
      data: { success: true, message: "Category updated successfully" },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    // Wait for categories to load
    await waitFor(() => expect(screen.getByText("Books")).toBeInTheDocument());

    // Find and click the first "Edit" button
    const editButtons = screen.getAllByText("Edit");
    fireEvent.click(editButtons[0]);

    // 🔥 **Wait for input field to appear**
    const input = await waitFor(() => screen.getByRole("textbox"));

    // Change input value to an existing category name ("Electronics")
    fireEvent.change(input, { target: { value: "Electronics" } });

    // Submit update form
    fireEvent.click(screen.getByText("Submit"));

    // **Ensure PUT request was NOT called**
    await waitFor(() => {
      expect(axios.put).not.toHaveBeenCalled();
    });

    // **Ensure error toast is displayed**
    expect(toast.error).toHaveBeenCalledWith("Category already exists!");
  });

  //   it("should throw error upon submission of duplicate categories", async () => {
  //     const categories = [
  //       { _id: "1", name: "Electronics" },
  //       { _id: "2", name: "Clothing" },
  //     ];

  //     const mockHandleSubmit = jest.fn((e) => {
  //       e.preventDefault();
  //       if (categories.some((c) => c.name.toLowerCase() === "electronics")) {
  //         toast.error("Category already exists!");
  //       }
  //     });

  //     const { getByPlaceholderText, getByRole } = render(
  //       <MemoryRouter>
  //         <CategoryForm
  //           handleSubmit={mockHandleSubmit}
  //           value="Electronics"
  //           setValue={jest.fn()}
  //           categories={categories}
  //         />
  //       </MemoryRouter>
  //     );

  //     const input = getByPlaceholderText("Enter new category");
  //     const submitButton = getByRole("button", { name: /submit/i });

  //     fireEvent.change(input, { target: { value: "Electronics" } });

  //     fireEvent.click(submitButton);

  //     await waitFor(() => {
  //       expect(toast.error).toHaveBeenCalledWith("Category already exists!");
  //     });

  //     expect(mockHandleSubmit).toHaveBeenCalled();
  //   });
});
