import React from 'react';
import axios from "axios";
import { fireEvent, getByLabelText, getByPlaceholderText, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";
import toast from "react-hot-toast";

import Profile from "./Profile";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};
const newUser = {
  name: "Johnny Smith",
  email: "johnsmith@email.com",
  password: "johnnysmithpw",
  phone: "9876543210",
  address: "10 Pear Street",
};

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{
    user: testUser
  }, jest.fn()]),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Profile", () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
  };

  it("renders heading", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: "USER PROFILE" })).toBeInTheDocument();
  });

  it("renders button", () => {
    renderComponent();

    expect(screen.getByRole("button", { name: /UPDATE/i })).toBeInTheDocument();
  });

  it("renders form", () => {
    renderComponent();

    expect(screen.getByTestId("form-container")).toBeInTheDocument();
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  it("initially renders original details of the user", () => {
    renderComponent();

    const initialName = screen.getByPlaceholderText("Enter Your Name");
    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    const initialPhone = screen.getByPlaceholderText("Enter Your Phone");
    const initialAddress = screen.getByPlaceholderText("Enter Your Address");

    expect(initialName).toBeInTheDocument();
    expect(initialEmail).toBeInTheDocument();
    expect(initialPhone).toBeInTheDocument();
    expect(initialAddress).toBeInTheDocument();

    expect(initialName.value).toEqual(testUser.name);
    expect(initialEmail.value).toEqual(testUser.email);
    expect(initialPhone.value).toEqual(testUser.phone);
    expect(initialAddress.value).toEqual(testUser.address);
  });

  it("does not display original password of user", () => {
    renderComponent();

    const initialPassword = screen.getByPlaceholderText("Enter Your Password");
    expect(initialPassword).toBeInTheDocument();
    expect(initialPassword.value).toEqual("");
    expect(initialPassword.value).toHaveLength(0);
  });

  it("does not allow changing email of user", () => {
    renderComponent();

    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail).toBeDisabled();
  });

  it("handles form submission", async () => {
    axios.put.mockResolvedValue({
      data: {
        success: true,
        message: 'Profile Updated Successfully',
        updatedUser: newUser,
      },
    });
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: newUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: newUser.password },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: newUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: newUser.address },
    });
    const form = screen.getByLabelText("profile-form");
    fireEvent.submit(form);

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
  });

  it("does not allow form submission when len(password) < 6", async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: newUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: newUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: newUser.address },
    });
    const form = screen.getByLabelText("profile-form");
    fireEvent.submit(form);

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });

  it("does not allow form submission when len(password) == 6", async () => {
    renderComponent();

    fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
      target: { value: newUser.name },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
      target: { value: "123456" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
      target: { value: newUser.phone },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
      target: { value: newUser.address },
    });
    const form = screen.getByLabelText("profile-form");
    fireEvent.submit(form);

    await waitFor(() => expect(axios.put).toHaveBeenCalled());
    expect(toast.error).toHaveBeenCalled();
  });
});
