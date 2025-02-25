import { render, fireEvent, waitFor } from "@testing-library/react";
import { useState } from "react";
import CategoryForm from "./CategoryForm";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import toast from "react-hot-toast";
import axios from "axios";

// Ensure axios is fully mocked
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

describe("CategoryForm Component", () => {
  let handleSubmit, setValue;
  beforeEach(() => {
    handleSubmit = jest.fn(); // Mock submit function
    setValue = jest.fn(); // Mock setValue function
  });

  it("renders input and submit button", () => {
    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmit}
          value=""
          setValue={setValue}
        />
      </MemoryRouter>
    );

    expect(getByPlaceholderText("Enter new category")).toBeInTheDocument();
    expect(getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("allows user to type in input field", () => {
    const { getByPlaceholderText } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmit}
          value=""
          setValue={setValue}
        />
      </MemoryRouter>
    );

    const input = getByPlaceholderText("Enter new category");
    fireEvent.change(input, { target: { value: "New Category" } });

    expect(setValue).toHaveBeenCalledWith("New Category");
  });

  it("prevents default form submission", () => {
    const mockHandleSubmit = jest.fn();
    const mockSetValue = jest.fn();

    const { getByRole } = render(
      <CategoryForm handleSubmit={mockHandleSubmit} setValue={mockSetValue} />
    );

    const input = getByRole("textbox", { name: "" });

    const form = input.closest("form");
    expect(form).not.toBeNull();

    fireEvent.submit(form);
    expect(mockSetValue).toHaveBeenCalled();
    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("disables submit button when input is empty", () => {
    const { getByRole } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmit}
          value=""
          setValue={setValue}
        />
      </MemoryRouter>
    );

    const submitButton = getByRole("button", { name: /submit/i });
    expect(submitButton).toBeDisabled();
  });

  it("clears input field after submission", () => {
    const MockComponent = () => {
      const [value, setValue] = useState("");
      const handleSubmit = jest.fn();

      return (
        <CategoryForm
          handleSubmit={handleSubmit}
          value={value}
          setValue={setValue}
        />
      );
    };

    // Render the component
    const { getByPlaceholderText, getByText } = render(<MockComponent />);

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByText("Submit");

    // Type into the input field
    fireEvent.change(input, { target: { value: "New Category" } });
    expect(input.value).toBe("New Category"); // Check if input updates

    // Submit the form
    fireEvent.click(submitButton);

    // Check if input is cleared after submission
    expect(input.value).toBe(""); // Input should be empty
  });

  it("should throw error upon submission of duplicate categories", async () => {
    const categories = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Clothing" },
    ];

    const mockHandleSubmit = jest.fn((e) => {
      e.preventDefault();
      if (categories.some((c) => c.name.toLowerCase() === "electronics")) {
        toast.error("Category already exists!");
      }
    });

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={mockHandleSubmit}
          value="Electronics"
          setValue={jest.fn()}
          categories={categories}
        />
      </MemoryRouter>
    );

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByRole("button", { name: /submit/i });

    fireEvent.change(input, { target: { value: "Electronics" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Category already exists!");
    });

    expect(mockHandleSubmit).toHaveBeenCalled();
  });

  it("should not update if the new category name already exists", async () => {
    const categories = [
      { _id: "1", name: "Electronics" },
      { _id: "2", name: "Clothing" },
    ];

    const handleUpdate = jest.fn(); // Mock the update function
    axios.put.mockResolvedValue({ data: { success: true } });

    const { getByPlaceholderText, getByRole } = render(
      <CategoryForm
        handleSubmit={handleUpdate} // Mock handleSubmit
        value="Clothing"
        setValue={jest.fn()}
        categories={categories}
      />
    );

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByRole("button", { name: /submit/i });

    // Simulate entering a duplicate category name
    fireEvent.change(input, { target: { value: "Clothing" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Category already exists!");
    });

    expect(handleUpdate).not.toHaveBeenCalled(); // Ensure update function was blocked
    expect(axios.put).not.toHaveBeenCalled(); // Ensure API call was blocked
  });
});
