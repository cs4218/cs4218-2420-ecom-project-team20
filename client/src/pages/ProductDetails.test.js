import React from "react";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

import ProductDetails from "./ProductDetails";

const mockProduct = {
  _id: 1,
  name: "Textbook",
  slug: "textbook",
  description: "A comprehensive textbook",
  price: 79.99,
  category: { name: "Books" },
  quantity: 50,
  shipping: false,
};
const mockSimilarProducts = [
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
    _id: 2,
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
jest.mock("axios");
jest.mock("../components/layout", () => ({ children }) => <div>{ children }</div>);

describe("ProductDetails", () => {
  const renderComponent = (slug) => {
    render(
      <MemoryRouter initialEntries={ [`/product/${ slug }`] }>
        <Routes>
          <Route path="/product/:slug" element={ <ProductDetails/> }/>
        </Routes>
      </MemoryRouter>
    );
  };
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders headings', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    const productDetailsHeading = await waitFor(() => screen.getByRole("heading", { name: "Product Details" }));
    const similarProductsHeading = await waitFor(() => screen.getByRole("heading", { name: "Similar Products ➡️" }));
    expect(productDetailsHeading).toBeInTheDocument();
    expect(similarProductsHeading).toBeInTheDocument();
  });
  it("renders details of product", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    const name = await waitFor(() => screen.getByRole("heading", { name: `Name: ${ mockProduct.name }` }));
    const description = await waitFor(() => screen.getByRole("heading", { name: `Description: ${ mockProduct.description }` }));
    const category = await waitFor(() => screen.getByRole("heading", { name: `Category: ${ mockProduct.category.name }` }));
    const price = await waitFor(() => screen.getByRole("heading", {
      name: `Price: ${ mockProduct.price.toLocaleString("en-US",
        {
          style: "currency",
          currency: "USD",
        }) }`
    }));
    expect(name).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(price).toBeInTheDocument();
    expect(category).toBeInTheDocument();
  });
  it("renders image of product", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    const image = await waitFor(() => screen.getByTestId(`pd-image-${ mockProduct.name }`));
    expect(image.src).toEqual(`http://localhost/api/v1/product/product-photo/${ mockProduct._id }`);
    expect(image.alt).toEqual(`${ mockProduct.name }`);
  });

  it("handles display in case of no similar products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: [] } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    const message = await waitFor(() => screen.getByText("No similar products found"));
    const similarProductsButtons = await waitFor(() => screen.queryAllByRole("button", { name: "More Details" }));
    expect(similarProductsButtons.length).toEqual(0);
    expect(message).toBeInTheDocument();
  });
  it("renders similar products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    mockSimilarProducts.map(async (similarProduct) => {
      const name = await waitFor(() => screen.getByRole("heading", { name: `${ similarProduct.name }` }));
      const description = await waitFor(() => screen.getByRole("heading", { name: `${ mockProduct.description.substring(0, 60) }` }));
      const price = await waitFor(() => screen.getByRole("heading", {
        name: `${ mockProduct.price.toLocaleString("en-US",
          {
            style: "currency",
            currency: "USD",
          }) }`
      }));
      expect(name).toBeInTheDocument();
      expect(description).toBeInTheDocument();
      expect(price).toBeInTheDocument();
    });

    const similarProductsButtons = await waitFor(() => screen.getAllByRole("button", { name: "More Details" }));
    expect(similarProductsButtons.length).toEqual(mockSimilarProducts.length);
  });
  it("renders images of similar products", async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    mockSimilarProducts.map(async (similarProduct) => {
      const image = await waitFor(() => screen.getByTestId(`pd-image-${ similarProduct.name }`));
      expect(image.src).toEqual(`http://localhost/api/v1/product/product-photo/${ similarProduct._id }`);
      expect(image.alt).toEqual(`${ similarProduct.name }`);
    });
  });
  it('links buttons to relevant similar product detail pages', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/get-product/')) {
        return Promise.resolve({ data: { product: mockProduct } });
      } else if (url.includes('/related-product/')) {
        return Promise.resolve({ data: { products: mockSimilarProducts } });
      }
      return Promise.reject(new Error('Not Found'));
    });
    renderComponent(mockProduct.slug);

    mockSimilarProducts.map(async (similarProduct) => {
      const similarProductButton = await waitFor(() => screen.getByTestId(`pd-button-${ similarProduct.slug }`));
      fireEvent.click(similarProductButton);
      expect(mockUseNavigate).toBeCalledTimes(1);
      expect(mockUseNavigate).toBeCalledWith(`/product/${ similarProduct.slug }`);
      mockUseNavigate.mockRestore();
    });
  });
});
