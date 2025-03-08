import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Dashboard from "./Dashboard";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{ user: testUser }, jest.fn()]),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));
jest.mock("../../hooks/useCategory", () => jest.fn(() => []));

describe('Dashboard', () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Dashboard/>
      </MemoryRouter>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders name of user', () => {
    renderComponent();
    const name = screen.getByRole('heading', { name: testUser.name });
    expect(name).toBeInTheDocument();
  });
  it('renders email of user', () => {
    renderComponent();
    const email = screen.getByRole('heading', { name: testUser.email });
    expect(email).toBeInTheDocument();
  });
  it('renders address of user', () => {
    renderComponent();
    const address = screen.getByRole('heading', { name: testUser.address });
    expect(address).toBeInTheDocument();
  });
});
