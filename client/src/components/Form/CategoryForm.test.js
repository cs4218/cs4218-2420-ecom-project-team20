import { render, fireEvent } from "@testing-library/react";
import { useState } from "react";
import CategoryForm from "./CategoryForm";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

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

  it("clears input field after submission", () => {
    const MockComponent = () => {
      const [value, setValue] = useState(""); // Local state for input
      const handleSubmit = jest.fn(); // Mock function

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
