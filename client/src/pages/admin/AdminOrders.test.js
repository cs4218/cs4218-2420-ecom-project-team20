import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AdminOrders from "./AdminOrders";
import "@testing-library/jest-dom";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({ error: jest.fn(), success: jest.fn() }));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div />);

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("antd", () => ({
  ...jest.requireActual("antd"),
  Select: ({ value, onChange }) => {
    const statusOptions = [
      "Not Process",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    const options = statusOptions.map((status) => (
      <option key={status} value={status}>
        {status}
      </option>
    ));

    return (
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options}
      </select>
    );
  },
}));

describe("AdminOrders Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component correctly", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "order123",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product123",
              name: "Product 1",
              description: "Product description",
              price: 50,
            },
          ],
        },
      ],
    });

    const { getByText } = render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => getByText("All Orders"));

    const buyerName = await screen.findByText(/John Doe/i);
    expect(buyerName).toBeInTheDocument();

    expect(getByText("Not Process")).toBeInTheDocument();
    expect(getByText("Success")).toBeInTheDocument();
    expect(getByText("a few seconds ago")).toBeInTheDocument();

    const productName = await screen.findByText("Product 1");
    expect(productName).toBeInTheDocument();

    const productDescription = getByText(/Product description/i);
    expect(productDescription).toBeInTheDocument();

    const productPrice = getByText(/Price : 50/i);
    expect(productPrice).toBeInTheDocument();
  });

  it("updates order status when a new status is selected", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "order123",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product123",
              name: "Product 1",
              description: "Product description",
              price: 50,
            },
          ],
        },
      ],
    });

    axios.put.mockResolvedValueOnce({
      data: { success: true, message: "Status updated successfully" },
    });

    const { getByText, getByDisplayValue } = render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => getByText("All Orders"));

    const buyerName = await screen.findByText(/John Doe/i);
    expect(buyerName).toBeInTheDocument();

    const statusSelect = getByDisplayValue("Not Process");
    fireEvent.change(statusSelect, { target: { value: "Processing" } });

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Status updated successfully")
    );

    expect(getByText("Processing")).toBeInTheDocument();
  });

  it("displays error toast if updating status fails", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "order123",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product123",
              name: "Product 1",
              description: "Product description",
              price: 50,
            },
          ],
        },
      ],
    });

    axios.put.mockRejectedValueOnce(new Error("Failed to update"));

    const { getByText, getByDisplayValue } = render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => getByText("All Orders"));

    const buyerName = await screen.findByText(/John Doe/i);
    expect(buyerName).toBeInTheDocument();

    const statusSelect = getByDisplayValue("Not Process");
    fireEvent.change(statusSelect, { target: { value: "Processing" } });

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Something went wrong in updating status"
      )
    );
  });

  it("displays 'No orders found' if no orders are returned from the API", async () => {
    axios.get.mockResolvedValueOnce({
      data: [],
    });

    const { getByText } = render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => screen.getByText("All Orders"));
    expect(getByText("No orders found")).toBeInTheDocument();
  });

  it("renders multiple orders correctly", async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: "order123",
          status: "Not Process",
          buyer: { name: "John Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product123",
              name: "Product 1",
              description: "Product description",
              price: 50,
            },
          ],
        },
        {
          _id: "order124",
          status: "Processing",
          buyer: { name: "Jane Doe" },
          createAt: new Date(),
          payment: { success: true },
          products: [
            {
              _id: "product124",
              name: "Product 2",
              description: "Product description 2",
              price: 100,
            },
          ],
        },
      ],
    });

    const { getByText } = render(
      <MemoryRouter>
        <AdminOrders />
      </MemoryRouter>
    );

    await waitFor(() => getByText("All Orders"));

    const johnName = await screen.findByText(/John Doe/i);
    const janeName = await screen.findByText(/Jane Doe/i);
    expect(johnName).toBeInTheDocument();
    expect(janeName).toBeInTheDocument();
  });
});
