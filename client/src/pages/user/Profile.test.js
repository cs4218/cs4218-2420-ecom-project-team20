import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Profile from "./Profile";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{
    user: testUser
  }, jest.fn()]),
}));
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

// set a testUser to use for auth

describe("Profile", () => {
  // testing display of page
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: "USER PROFILE" })).toBeInTheDocument();
  });
  it('renders form', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByTestId("form-container")).toBeInTheDocument();
    expect(screen.getByTestId("form")).toBeInTheDocument();
  });

  // testing that the initial values in the form have been set to the user's details
  it('initially renders original name of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialName = screen.getByPlaceholderText("Enter Your Name");
    expect(initialName).toBeInTheDocument();
    expect(initialName.value).toEqual(testUser.name);
  });

  it('initially renders original email of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail.value).toEqual(testUser.email);
  });

  it('does not display original password of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialPassword = screen.getByPlaceholderText("Enter Your Password");
    expect(initialPassword).toBeInTheDocument();
    expect(initialPassword.value).toEqual("");
    expect(initialPassword.value).toHaveLength(0);
  });

  it('initially renders original phone of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialPhone = screen.getByPlaceholderText("Enter Your Phone");
    expect(initialPhone).toBeInTheDocument();
    expect(initialPhone.value).toEqual(testUser.phone);
  });

  it('initially renders original address of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialAddress = screen.getByPlaceholderText("Enter Your Address");
    expect(initialAddress).toBeInTheDocument();
    expect(initialAddress.value).toEqual(testUser.address);
  });

  // testing the functionality of the form
  it('does not allow changing email of user', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    const initialEmail = screen.getByPlaceholderText("Enter Your Email");
    expect(initialEmail).toBeInTheDocument();
    expect(initialEmail).toBeDisabled();
  });
});

// test form function with axios.put
// test that the values change after submitting the form