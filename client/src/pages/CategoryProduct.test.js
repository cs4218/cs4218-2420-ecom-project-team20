import React from "react";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

import CategoryProduct from "./CategoryProduct";

const mockCategoryProducts = [
  {
    products: [
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
        _id: 2,
        name: "Novel",
        slug: "novel",
        description: "A bestselling novel",
        price: 14.99,
        category: "Books",
        quantity: 200,
        shipping: true,
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
    ],
    category: { slug: "books", name: "Books" },
  },
  {
    products: [
      {
        _id: 3,
        name: "Laptop",
        slug: "laptop",
        description: "A powerful laptop",
        price: 1499.99,
        category: "Electronics",
        quantity: 30,
        shipping: true,
      },
      {
        _id: 4,
        name: "Smartphone",
        slug: "smartphone",
        description: "A high-end smartphone",
        price: 999.99,
        category: "Electronics",
        quantity: 50,
        shipping: true,
      },
    ],
    category: { slug: "books", name: "Electronics" },
  },
]

const mockUseNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom')),
  useNavigate: () => mockUseNavigate,
}))
jest.mock("axios");
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));
jest.mock("../hooks/useCategory", () => jest.fn(() => []));

describe("CategoryProduct", () => {
  const renderComponent = (slug) => {
    render(
      <MemoryRouter initialEntries={ [`/category/${ slug }`] }>
        <Routes>
          <Route path="/category/:slug" element={ <CategoryProduct/> }/>
        </Routes>
      </MemoryRouter>
    );
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders heading of category', async () => {
    axios.get.mockResolvedValue({ data: mockCategoryProducts[0] });
    renderComponent(mockCategoryProducts[0].category.slug);
    await waitFor(() => expect(screen.getByRole("heading", { name: `Category - ${ mockCategoryProducts[0].category.name }` })).toBeInTheDocument());
  });

  it("renders number of results found for the category", async () => {
    axios.get.mockResolvedValue({ data: mockCategoryProducts[0] });
    renderComponent(mockCategoryProducts[0].category.slug);
    await waitFor(() => expect(screen.getByRole("heading", { name: `${ mockCategoryProducts[0].products.length } result found` })).toBeInTheDocument());
  });

  it('renders details for category products', async () => {
    axios.get.mockResolvedValue({ data: mockCategoryProducts[0] });
    renderComponent(mockCategoryProducts[0].category.slug);

    let expectedProducts = [];
    for (let i = 0; i < mockCategoryProducts[0].products.length; i++) {
      const mockProduct = mockCategoryProducts[0].products[i];
      const productName = await waitFor(() => screen.getByText(mockProduct.name));
      const productPrice = await waitFor(() => screen.getByText(mockProduct.price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })));
      const productDescription = await waitFor(() => screen.getByText(`${ mockProduct.description.substring(0, 60) }...`));
      expectedProducts.push({
        name: productName,
        price: productPrice,
        description: productDescription,
      });
    }
    for (let i = 0; i < expectedProducts.length; i++) {
      const expectedProduct = expectedProducts[i];
      expect(expectedProduct.name).toBeInTheDocument();
      expect(expectedProduct.price).toBeInTheDocument();
      expect(expectedProduct.description).toBeInTheDocument();
    }
    const productButtons = await waitFor(() => screen.getAllByRole("button", { name: "More Details" }));
    expect(productButtons.length).toEqual(mockCategoryProducts[0].products.length);
  });

  it("renders images of category products", async () => {
    axios.get.mockResolvedValue({ data: mockCategoryProducts[0] });
    renderComponent(mockCategoryProducts[0].category.slug);

    mockCategoryProducts[0].products.map(async (product) => {
      const image = await waitFor(() => screen.getByTestId(`cp-img-${ product.name }`));
      expect(image.src).toEqual(`http://localhost/api/v1/product/product-photo/${ product._id }`);
      expect(image.alt).toEqual(`${ product.name }`);
    });
  });

  it('renders and links buttons to product detail pages', async () => {
    axios.get.mockResolvedValue({ data: mockCategoryProducts[0] });
    renderComponent(mockCategoryProducts[0].category.slug);

    mockCategoryProducts[0].products.map(async (product) => {
      const productButton = await waitFor(() => screen.getByTestId(`cd-button-${ product.slug }`));
      fireEvent.click(productButton);
      expect(mockUseNavigate).toBeCalledTimes(1);
      expect(mockUseNavigate).toBeCalledWith(`/product/${ product.slug }`);
      mockUseNavigate.mockRestore();
    });
  });
});
