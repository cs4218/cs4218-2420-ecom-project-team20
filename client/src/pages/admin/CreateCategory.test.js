import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Form/CategoryForm", () => (props) => (
  <form onSubmit={props.handleSubmit}>
    <input
      type="text"
      placeholder="Enter new category"
      value={props.value}
      onChange={(e) => props.setValue(e.target.value)}
    />
    <button type="submit">Submit</button>
  </form>
));

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CreateCategory component and loads categories from API", async () => {
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

      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");
    });
  });

  it("creates a new category successfully", async () => {
    const mockCategories = [{ _id: "1", name: "Books" }];

    axios.get.mockResolvedValueOnce({
      data: { success: true, category: mockCategories },
    });

    axios.post.mockResolvedValueOnce({
      data: { success: true },
    });

    render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText(/Enter new category/i), {
      target: { value: "New Category" },
    });

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("New Category is created");

      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "New Category",
        }
      );

      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it("calls getAllCategory after successful category creation", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    axios.get.mockResolvedValue({
      data: { success: true, category: [{ _id: "1", name: "Tech" }] },
    });

    const { getByPlaceholderText, getByRole, getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText(/Enter new category/i), {
      target: { value: "New Category" },
    });

    fireEvent.click(getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "New Category",
        }
      );

      expect(toast.success).toHaveBeenCalledWith("New Category is created");

      expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category");

      expect(getByText("Tech")).toBeInTheDocument();
    });
  });

  it("trims input before submitting", async () => {
    axios.post.mockResolvedValue({ data: { success: true } });

    const { getByRole, getByPlaceholderText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    fireEvent.change(getByPlaceholderText(/Enter new category/i), {
      target: { value: "   New Category   " },
    });

    fireEvent.click(getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/category/create-category",
        {
          name: "New Category",
        }
      );
    });
  });

  it("prevents creation of category when input is empty", async () => {
    const { getByRole } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    const submitButton = getByRole("button", { name: /submit/i });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Category cannot be empty.");
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("displays error on creation when category already exists", async () => {
    const mockCategories = [{ _id: "1", name: "Books" }];

    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });

    const { getByRole, getByPlaceholderText, getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Books")).toBeInTheDocument();
    });

    fireEvent.change(getByPlaceholderText(/Enter new category/i), {
      target: { value: "Books" },
    });

    fireEvent.click(getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Category already exists!");
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  it("updates a category successfully", async () => {
    axios.get.mockResolvedValue({
      data: { success: true, category: [{ _id: "1", name: "OldCat" }] },
    });
    axios.put.mockResolvedValue({ data: { success: true } });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("OldCat"));
    const editButton = getByText("Edit");
    fireEvent.click(editButton); // Open the modal

    const modal = await screen.findByRole("dialog");
    const modalInput = within(modal).getByPlaceholderText("Enter new category");
    fireEvent.change(modalInput, { target: { value: "UpdatedCat" } });

    const submitButton = within(modal).getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/api/v1/category/update-category/1",
        {
          name: "UpdatedCat",
        }
      );

      expect(toast.success).toHaveBeenCalledWith("UpdatedCat is updated");
    });
  });

  it("should show error message when updating a category with a duplicate name", async () => {
    axios.put.mockResolvedValueOnce({
      data: {
        success: false,
        message: "Category already exists",
      },
    });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("OldCat"));
    const editButton = getByText("Edit");
    fireEvent.click(editButton);

    const modal = await screen.findByRole("dialog");

    const modalInput = within(modal).getByPlaceholderText("Enter new category");
    fireEvent.change(modalInput, { target: { value: "OldCat" } });

    const submitButton = within(modal).getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Category already exists");
    });
  });

  it("should show 'Something went wrong' message when updating a category fails", async () => {
    axios.put.mockRejectedValueOnce(new Error("Something went wrong"));

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("OldCat"));
    const editButton = getByText("Edit");
    fireEvent.click(editButton);

    const modal = await screen.findByRole("dialog");

    const modalInput = within(modal).getByPlaceholderText("Enter new category");
    fireEvent.change(modalInput, { target: { value: "UpdatedCat" } });

    const submitButton = within(modal).getByRole("button", { name: /submit/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });

  it("deletes a category successfully", async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });
    axios.get.mockResolvedValue({
      data: { success: true, category: [{ _id: "1", name: "Books" }] },
    });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("Books"));
    const deleteButton = getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
      expect(axios.get).toHaveBeenCalledTimes(2);
    });
  });

  it("shows success message after category deletion", async () => {
    axios.delete.mockResolvedValue({ data: { success: true } });
    axios.get.mockResolvedValue({
      data: { success: true, category: [{ _id: "1", name: "Books" }] },
    });

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("Books"));
    const deleteButton = getByText("Delete");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.delete).toHaveBeenCalledWith(
        "/api/v1/category/delete-category/1"
      );
      expect(toast.success).toHaveBeenCalledWith("category is deleted");
    });
  });

  it("shows error message when deletion fails", async () => {
    axios.delete.mockRejectedValue(new Error("Network error"));

    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => getByText("Books"));
    const deleteButton = getByText("Delete");
    fireEvent.click(deleteButton); // Open the modal

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
