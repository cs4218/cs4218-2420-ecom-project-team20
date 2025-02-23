import { render, fireEvent } from "@testing-library/react";
import { useState } from "react";
import CategoryForm from "./CategoryForm";
import React from "react";

describe("CategoryForm Component", () => {
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
