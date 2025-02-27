import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Dashboard from "./Dashboard";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  address: "10 Apple Street"
};

jest.mock("../../hooks/useCategory", () => jest.fn(() => []));
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

describe('Dashboard', () => {
  it('renders name of user', () => {
    render(
      <MemoryRouter>
        <Dashboard/>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: testUser.name })).toBeInTheDocument();
  });

  it('renders email of user', () => {
    render(
      <MemoryRouter>
        <Dashboard/>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: testUser.email })).toBeInTheDocument();
  });

  it('renders address of user', () => {
    render(
      <MemoryRouter>
        <Dashboard/>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: testUser.address })).toBeInTheDocument();
  });
});
