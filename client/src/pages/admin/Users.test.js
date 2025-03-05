import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Users from "./Users";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  address: "10 Apple Street"
};

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

describe("Users", () => {
  it("renders heading", () => {
    render(
      <MemoryRouter>
        <Users />
      </MemoryRouter>
    );
    expect(screen.getByText("All Users")).toBeInTheDocument();
  });
});
