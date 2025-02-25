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

  it("renders input field and submit button", () => {
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
    const handleSubmitMock = jest.fn((e) => e.preventDefault());
    const setValueMock = jest.fn();

    const { getByLabelText } = render(
      <CategoryForm
        handleSubmit={handleSubmitMock}
        value="Test"
        setValue={setValueMock}
      />
    );

    const form = getByLabelText("category-form");

    fireEvent.submit(form);

    expect(setValueMock).toHaveBeenCalled();
    expect(handleSubmitMock).toHaveBeenCalled();
  });

  it("calls handleSubmit when submitted", () => {
    const handleSubmitMock = jest.fn();
    const setValueMock = jest.fn();

    const { getByLabelText } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmitMock}
          value="Books"
          setValue={setValueMock}
        />
      </MemoryRouter>
    );

    const form = getByLabelText("category-form");
    fireEvent.submit(form);

    expect(handleSubmitMock).toHaveBeenCalled();
    expect(setValueMock).toHaveBeenCalledWith(""); // Expect input to be cleared after submission
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

    const { getByPlaceholderText, getByText } = render(<MockComponent />);

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByText("Submit");

    fireEvent.change(input, { target: { value: "New Category" } });

    expect(input.value).toBe("New Category");

    fireEvent.click(submitButton);

    expect(input.value).toBe("");
  });
});
