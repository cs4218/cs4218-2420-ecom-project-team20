import { render, fireEvent, waitFor } from "@testing-library/react";
import CategoryForm from "./CategoryForm";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";

// Ensure axios is fully mocked
jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  error: jest.fn(),
  success: jest.fn(),
}));

describe("CategoryForm Component", () => {
  let handleSubmit, setValue;
  beforeEach(() => {
    handleSubmit = jest.fn();
    setValue = jest.fn();
  });

  it("renders CategoryForm component correctly", () => {
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

  it("allows user to type in input field and updates input value  on change", () => {
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

  it("calls handleSubmit when submitted", () => {
    const handleSubmitMock = jest.fn();
    const setValueMock = jest.fn();

    const { getByRole, getByPlaceholderText } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmitMock}
          value="Cats"
          setValue={setValueMock}
        />
      </MemoryRouter>
    );

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByRole("button", { name: /submit/i });
    expect(submitButton).not.toBeDisabled();

    fireEvent.submit(input);

    expect(handleSubmitMock).toHaveBeenCalledTimes(1);
    expect(setValueMock).toHaveBeenCalledWith("");
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

  it("prevents submission when input is empty", () => {
    const handleSubmitMock = jest.fn();
    const setValueMock = jest.fn();

    const { getByPlaceholderText, getByRole } = render(
      <MemoryRouter>
        <CategoryForm
          handleSubmit={handleSubmitMock}
          value=""
          setValue={setValueMock}
        />
      </MemoryRouter>
    );

    const input = getByPlaceholderText("Enter new category");
    const submitButton = getByRole("button", { name: /submit/i });

    expect(submitButton).toBeDisabled();

    fireEvent.change(input, { target: { value: "   " } });
    expect(submitButton).toBeDisabled();

    fireEvent.click(submitButton);

    expect(handleSubmitMock).not.toHaveBeenCalled();
  });
});
