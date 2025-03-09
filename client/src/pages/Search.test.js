import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";

import Search from "./Search";
import { useSearch } from "../context/search";

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
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() =>
    [
      {
        keyword: mockKeyword,
        results: mockSearchResults,
      },
      jest.fn()
    ]),
}));
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("Search", () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Search/>
      </MemoryRouter>
    );
  };
  beforeEach(() => {
    jest.mock("../context/search", () => ({
      useSearch: jest.fn(() =>
        [
          {
            keyword: mockKeyword,
            results: mockSearchResults,
          },
          jest.fn()
        ]),
    }));
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading", async () => {
    renderComponent();

    const heading = await waitFor(() => screen.getByRole("heading", { name: "Search Results" }));
    expect(heading).toBeInTheDocument();
  });

  it("renders number of search results when results exist", async () => {
    renderComponent();

    const resultMessage = await waitFor(() => screen.getByRole("heading", { name: `Found ${mockSearchResults.length}` }));
    expect(resultMessage).toBeInTheDocument();
  });

  it("renders details of search results", async () => {
    renderComponent();

    for (let i = 0; i < mockSearchResults.length; i++) {
      const product = mockSearchResults[i];
      const name = await waitFor(() => screen.getByRole("heading", { name : `${product.name}`}));
      const description = await waitFor(() => screen.getByText(`${ product.description.substring(0, 30) }...`));
      const price = await waitFor(() => screen.getByText(`${ product.price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}`));
      expect(name).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(price).toBeInTheDocument();
    }
    const detailButtons = await waitFor(() => screen.getAllByRole("button", { name : "More Details" }));
    const cartButtons = await waitFor(() => screen.getAllByRole("button", { name : "ADD TO CART" }));

    expect(detailButtons.length).toBe(mockSearchResults.length);
    expect(cartButtons.length).toBe(mockSearchResults.length);
  });

  it("renders images of search result products", async () => {
    renderComponent();

    mockSearchResults.map(async (product) => {
      const image = await waitFor(() => screen.getByTestId(`s-img-${ product.name }`));
      expect(image.src).toEqual(`http://localhost/api/v1/product/product-photo/${ product._id }`);
      expect(image.alt).toEqual(`${ product.name }`);
    });
  });

  it("renders and links buttons to search result product detail pages", async () => {
    renderComponent();

    mockSearchResults.map(async (product) => {
      const productButton = await waitFor(() => screen.getByTestId(`s-md-button-${ product.slug }`));
      fireEvent.click(productButton);
      expect(mockUseNavigate).toBeCalledTimes(1);
      expect(mockUseNavigate).toBeCalledWith(`/product/${ product.slug }`);
      mockUseNavigate.mockRestore();
    });
  });

  it("renders proper message when results do not exist", async () => {
    useSearch.mockReturnValue([
      {
        keyword: mockKeyword,
        results: [],
      },
      jest.fn()
    ]);
    renderComponent();

    const resultMessage = await waitFor(() => screen.getByRole("heading", { name: "No Products Found" }));
    expect(resultMessage).toBeInTheDocument();
  });
});
