import { render, fireEvent } from "@testing-library/react";
import { useState } from "react";
import CategoryForm from "./CategoryForm";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import axios from "axios";

// Ensure axios is fully mocked
jest.mock("axios", () => ({
  post: jest.fn(),
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
});
