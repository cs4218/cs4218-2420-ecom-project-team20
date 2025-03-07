import React from 'react';
import axios from "axios";
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Orders from "./Orders";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  password: "johnsmithpw",
  phone: "0123456789",
  address: "10 Apple Street",
};
const mockOrders = [
  {
    _id: 1,
    products: [
      {
        _id: 1,
        name: "Product 1",
        description: "Description 1",
        price: 1,
      },
      {
        _id: 2,
        name: "Product 2",
        description: "Description 2",
        price: 2,
      },
    ],
    payment: { success: true },
    buyer: testUser,
    status: "Processed",
    createdAt: Date.now() - (24 * 60 * 60),
    updatedAt: Date.now() - (24 * 60 * 60),
  },
  {
    _id: 2,
    products: [
      {
        _id: 3,
        name: "Product 3",
        description: "Description 3",
        price: 3,
      },
      {
        _id: 4,
        name: "Product 4",
        description: "Description 4",
        price: 4,
      },
    ],
    payment: {
      error: { validationErrors: {}, errorCollections: {} },
      message: "Amount is an invalid format. Credit card number is not an accepted test number.",
      success: false
    },
    buyer: testUser,
    status: "Not Process",
    createdAt: Date.now() - (24 * 60 * 60),
    updatedAt: Date.now() - (24 * 60 * 60),
  },
  {
    _id: 3,
    products: [
      {
        _id: 5,
        name: "Product 5",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam nec pharetra nisi. Nunc vehicula metus a nulla pulvinar, non fringilla nulla maximus. Donec posuere condimentum neque, non sollicitudin felis elementum nec. Donec eu diam vel mi ornare dictum ac facilisis libero. Curabitur id eros non neque rutrum commodo ut vel massa. Fusce fermentum egestas urna consequat feugiat. Cras id porttitor velit, sed condimentum nisi. Maecenas eleifend fringilla sagittis. Nulla facilisi. Ut vestibulum, neque ut vehicula iaculis, lacus augue sagittis turpis, rutrum dapibus lacus arcu sit amet erat.\n",
        price: 5,
      },
    ],
    payment: {
      error: { validationErrors: {}, errorCollections: {} },
      message: "Amount is an invalid format. Credit card number is not an accepted test number.",
      success: false
    },
    buyer: testUser,
    status: "Not Process",
    createdAt: Date.now() - (24 * 60 * 60),
    updatedAt: Date.now() - (24 * 60 * 60),
  },
];

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(() => [{
    user: testUser,
    token: "testToken",
  }, jest.fn()]),
}));
jest.mock("../../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Orders", () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <Orders/>
      </MemoryRouter>
    );
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders heading", () => {
    renderComponent();
    expect(screen.getByRole("heading", { name: "All Orders" })).toBeInTheDocument();
  });
  it("renders headers of order table correctly", async () => {
    axios.get.mockResolvedValue({ data: [mockOrders[0]] });
    renderComponent();

    const numOrderTables = await waitFor(() => screen.getAllByText("#").length);
    expect(numOrderTables).toEqual(1);
    await waitFor(() => expect(screen.getByText("#")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Status")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Buyer")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Date")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Payment")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByText("Quantity")).toBeInTheDocument());
  });
  it("renders correct number of order tables when multiple orders exist", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });
    renderComponent();
    const numOrderTables = await waitFor(() => screen.getAllByText("#").length);
    expect(numOrderTables).toEqual(mockOrders.length);
  });

  it("renders successful order details correctly", async () => {
    axios.get.mockResolvedValue({ data: [mockOrders[0]] });
    renderComponent();

    const status = await waitFor(() => screen.getByText(mockOrders[0].status));
    const paymentStatus = await waitFor(() => screen.getByTestId("payment-status"));
    const quantity = await waitFor(() => screen.getByTestId("quantity"));

    expect(status).toBeInTheDocument();
    expect(paymentStatus.textContent).toEqual("Success");
    expect(parseInt(quantity.textContent)).toEqual(mockOrders[0].products.length);
  });
  it("renders unsuccessful order details correctly", async () => {
    axios.get.mockResolvedValue({ data: [mockOrders[1]] });
    renderComponent();
    const status = await waitFor(() => screen.getByText(mockOrders[1].status));
    const paymentStatus = await waitFor(() => screen.getByTestId("payment-status"));
    const quantity = await waitFor(() => screen.getByTestId("quantity"));

    expect(status).toBeInTheDocument();
    expect(paymentStatus.textContent).toEqual("Failed");
    expect(parseInt(quantity.textContent)).toEqual(mockOrders[1].products.length);
  });
  it("renders general product details correctly", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });
    renderComponent();
    let expectedProducts = [];
    for (let i = 0; i < mockOrders[0].products.length; i++) {
      const mockProduct = mockOrders[0].products[i];
      const productName = await waitFor(() => screen.getByText(mockProduct.name));
      const productDescription = await waitFor(() => screen.getByText(mockProduct.description));
      const productPrice = await waitFor(() => screen.getByText(`Price : ${mockProduct.price}`));
      expectedProducts.push({ name: productName, description: productDescription, price: productPrice });
    }

    for (let i = 0; i < mockOrders[1].products.length; i++) {
      const mockProduct = mockOrders[1].products[i];
      const productName = await waitFor(() => screen.getByText(mockProduct.name));
      const productDescription = await waitFor(() => screen.getByText(mockProduct.description));
      const productPrice = await waitFor(() => screen.getByText(`Price : ${mockProduct.price}`));
      expectedProducts.push({ name: productName, description: productDescription, price: productPrice });
    }

    for (let i = 0; i < expectedProducts.length; i++) {
      const expectedProduct = expectedProducts[i];
      expect(expectedProduct.name).toBeInTheDocument();
      expect(expectedProduct.description).toBeInTheDocument();
      expect(expectedProduct.price).toBeInTheDocument();
    }
  });
  it("renders description up to 30 characters", async () => {
    axios.get.mockResolvedValue({ data: mockOrders });
    renderComponent();

    const description = await waitFor(() => screen.getByText("Lorem ipsum", { exact: false }));
    expect(description).toBeInTheDocument();
    expect((description.textContent).length).toBeLessThanOrEqual(30);
  });

  it("fetches orders", async () => {
    renderComponent();
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
  });
});
