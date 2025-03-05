import React from 'react';
import axios from "axios";
import { fireEvent, getByPlaceholderText, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Profile from "./Profile";

const testUser = {
  _id: "1",
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};

const newUser = {
  _id: "1",
  name: "Johnny Smith",
  email: "johnsmith@email.com",
  password: "johnnysmithpw",
  phone: "9876543210",
  address: "10 Pear Street",
};

jest.mock("axios");
jest.mock("react-hot-toast");
jest.mock("jsonwebtoken");

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
  // testing the display of the page
  it("renders heading", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    expect(screen.getByRole("heading", { name: "USER PROFILE" })).toBeInTheDocument();
  });
  it("renders form", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    expect(screen.getByTestId("form-container")).toBeInTheDocument();
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  // testing that the initial values in the form have been set to the user's details
  it("initially renders original name of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    const initialName = screen.getByPlaceholderText("Enter Your Name");
    expect(initialName).toBeInTheDocument();
    expect(initialName.value).toEqual(testUser.name);
  });
  it("initially renders original email of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail.value).toEqual(testUser.email);
  });
  it("does not display original password of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    const initialPassword = screen.getByPlaceholderText("Enter Your Password");
    expect(initialPassword).toBeInTheDocument();
    expect(initialPassword.value).toEqual("");
    expect(initialPassword.value).toHaveLength(0);
  });
  it("initially renders original phone of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    const initialPhone = screen.getByPlaceholderText("Enter Your Phone");
    expect(initialPhone).toBeInTheDocument();
    expect(initialPhone.value).toEqual(testUser.phone);
  });
  it("initially renders original address of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
    const initialAddress = screen.getByPlaceholderText("Enter Your Address");
    expect(initialAddress).toBeInTheDocument();
    expect(initialAddress.value).toEqual(testUser.address);
  });

  // testing the functionality of the form
  it("does not allow changing email of user", () => {
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
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
    render(
      <MemoryRouter>
        <Profile/>
      </MemoryRouter>
    );
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

    fireEvent.click(screen.getByText("UPDATE"));
    await waitFor(() => expect(axios.put).toHaveBeenCalled());

    // TODO: toast.success isn't showing up for this test
    // await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Profile Updated Successfully"));
  });

  // TODO: Fix these test cases
  // it("does not allow form submission when len(password) < 6", async () => {
  //   render(
  //     <MemoryRouter>
  //       <Profile/>
  //     </MemoryRouter>
  //   );
  //   fireEvent.change(screen.getByPlaceholderText("Enter Your Name"), {
  //     target: { value: newUser.name },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("Enter Your Password"), {
  //     target: { value: "short" },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("Enter Your Phone"), {
  //     target: { value: newUser.phone },
  //   });
  //   fireEvent.change(screen.getByPlaceholderText("Enter Your Address"), {
  //     target: { value: newUser.address },
  //   });
  //   fireEvent.click(screen.getByText("UPDATE"));
  //
  //   await waitFor(() => expect(axios.put).toHaveBeenCalled());
  //   expect(toast.error).toHaveBeenCalledWith("Password is required and 6 character long");
  // });

  // it("does not allow form submission when len(password) == 6", async () => {
  //   render(
  //     <MemoryRouter>
  //       <Profile/>
  //     </MemoryRouter>
  //   );
  // });
});
