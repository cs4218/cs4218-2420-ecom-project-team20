import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import SearchInput from "./SearchInput";

const mockKeyword = "book";
const mockSearchResults = [
  {
    _id: 1,
    name: "Textbook",
    slug: "textbook",
    description: "A comprehensive textbook",
    price: 79.99,
    category: "Books",
    quantity: 50,
    shipping: false,
  },
  {
    _id: 3,
    name: "The Law of Contract in Singapore",
    slug: "the-law-of-contract-in-singapore",
    description: "A bestselling book in Singapore",
    price: 54.99,
    category: "Books",
    quantity: 200,
    shipping: true,
  },
];

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockUseNavigate,
}));
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() =>
    [
      {
        keyword: mockKeyword,
        results: mockSearchResults,
      },
      jest.fn()
    ]),
}));

describe("SearchInput", () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <SearchInput/>
      </MemoryRouter>
    );
  };
  const handleOnSubmitMock = jest.fn();

  it("renders button", async () => {
    renderComponent();

    const button = await waitFor(() => screen.getByRole("button", { name: "Search" }))
    expect(button).toBeInTheDocument();
  });

  it("calls handle submit on search button clicked", async () => {
    renderComponent();

    const form = screen.getByRole("search", { name: "si-form" });
    const button = screen.getByRole("button", { name: "Search" });

    form.onsubmit = handleOnSubmitMock();
    fireEvent.click(button);

    expect(handleOnSubmitMock).toHaveBeenCalled();
  });
});
