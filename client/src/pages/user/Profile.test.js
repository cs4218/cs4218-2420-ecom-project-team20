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
jest.mock("../../components/Layout", () => ({ children }) => <div>{ children }</div>);

describe("Profile", () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
  };
  // testing the display of the page
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

  // testing that the initial values in the form have been set to the user's details
  it("initially renders original name of user", () => {
    renderComponent();

    const initialName = screen.getByPlaceholderText("Enter Your Name");
    expect(initialName).toBeInTheDocument();
    expect(initialName.value).toEqual(testUser.name);
  });
  it("initially renders original email of user", () => {
    renderComponent();

    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail.value).toEqual(testUser.email);
  });
  it("does not display original password of user", () => {
    renderComponent();

    const initialPassword = screen.getByPlaceholderText("Enter Your Password");
    expect(initialPassword).toBeInTheDocument();
    expect(initialPassword.value).toEqual("");
    expect(initialPassword.value).toHaveLength(0);
  });
  it("initially renders original phone of user", () => {
    renderComponent();

    const initialPhone = screen.getByPlaceholderText("Enter Your Phone");
    expect(initialPhone).toBeInTheDocument();
    expect(initialPhone.value).toEqual(testUser.phone);
  });
  it("initially renders original address of user", () => {
    renderComponent();

    const initialAddress = screen.getByPlaceholderText("Enter Your Address");
    expect(initialAddress).toBeInTheDocument();
    expect(initialAddress.value).toEqual(testUser.address);
  });

  // testing the functionality of the form
  it("does not allow changing email of user", () => {
    renderComponent();

    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail).toBeDisabled();
  });

  // testing the handleSubmit() function with axios.put
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
