import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "./CartPage";
import { useCart } from "../context/cart";
import { useAuth } from "../context/auth";
import { beforeEach } from "node:test";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));
  
jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [null, jest.fn()]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

jest.mock("../components/Layout", () => ({ title, children }) => (
    <div data-testid="layout" data-title={title}>
        {children}
    </div>
));


describe("CartPage page", () => {
    let setCartMock = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        setCartMock = jest.fn();
        useCart.mockReturnValue([[], setCartMock]);
    });

    it("renders CartPage page without crashing", () => {
        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);

        const layout = screen.getByTestId("layout");
        expect(layout).toHaveAttribute("data-title", "Your Cart");
    });

    it("renders guest for unauthorised user correctly", () => {
        useCart.mockReturnValue([[], setCartMock]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);
        
        expect(screen.getByText("Hello Guest")).toBeInTheDocument();
    });

    it("renders username for authorised user correctly", () => {
        useCart.mockReturnValue([[], setCartMock]);
        useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "1111" }]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);
        
        expect(screen.getByText("Hello John Doe")).toBeInTheDocument();
    });

    it("renders empty cart message correctly", () => {
        useCart.mockReturnValue([[], setCartMock]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);
        
        expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
    });

    it("does not display 'Make Payment' button when cart is empty", () => {
        useCart.mockReturnValue([[], setCartMock]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);
        
        expect(screen.queryByText("Make Payment")).not.toBeInTheDocument();
    });

    it("does not display 'Make Payment' button when user address is empty", () => {
        useCart.mockReturnValue([[{category: "67bbf984fc0354cf2d1f32d0", 
            createdAt: "2024-09-06T17:57:19.978Z",
            description: "A high-end smartphone",
            name: "Smartphone",
            price: 999.99,
            quantity: 50,
            shipping: false,
            slug: "Smartphone",
            updatedAt: "2025-03-09T03:57:50.399Z",
            __v: 0,
            _id: "1"}], jest.fn()]);
            useAuth.mockReturnValue([{ user: { name: "John Doe", address:"" }, token: "1111" }]);
    
        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);
    
        expect(screen.queryByText("Make Payment")).not.toBeInTheDocument();
    });

    it("renders cart items correctly", () => {
        useCart.mockReturnValue([[
            {category: "67bbf984fc0354cf2d1f32d0", 
                createdAt: "2024-09-06T17:57:19.978Z",
                description: "A high-end smartphone",
                name: "Smartphone",
                price: 999.99,
                quantity: 50,
                shipping: false,
                slug: "Smartphone",
                updatedAt: "2025-03-09T03:57:50.399Z",
                __v: 0,
                _id: "1"},],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "1111" }]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);

        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("A high-end smartphone")).toBeInTheDocument();
        expect(screen.getByText("Price : 999.99")).toBeInTheDocument();
    });

    it("computes and renders correct total price", () => {
        useCart.mockReturnValue([[
                {category: "67bbf984fc0354cf2d1f32d0", 
                    createdAt: "2024-09-06T17:57:19.978Z",
                    description: "A high-end smartphone",
                    name: "Smartphone",
                    price: 800.00,
                    quantity: 50,
                    shipping: false,
                    slug: "Smartphone",
                    updatedAt: "2025-03-09T03:57:50.399Z",
                    __v: 0,
                    _id: "1"},
                    {category: "67bbf984fc0354cf2d1f32d0", 
                    createdAt: "2024-09-06T17:57:19.978Z",
                    description: "A high-end tablet",
                    name: "Tablet",
                    price: 1200.00,
                    quantity: 50,
                    shipping: false,
                    slug: "Tablet",
                    updatedAt: "2025-03-09T03:57:50.399Z",
                    __v: 0,
                    _id: "2"},
            ],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "1111" }]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);

        expect(screen.getByText("Total : $2,000.00")).toBeInTheDocument();
    });

    it("renders 'Make Payment' button correctly", () => {
        useCart.mockReturnValue([[
            {category: "67bbf984fc0354cf2d1f32d0", 
                createdAt: "2024-09-06T17:57:19.978Z",
                description: "A high-end smartphone",
                name: "Smartphone",
                price: 999.99,
                quantity: 50,
                shipping: false,
                slug: "Smartphone",
                updatedAt: "2025-03-09T03:57:50.399Z",
                __v: 0,
                _id: "1"},],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "John Doe", address:"ABC Avenue" }, token: "1111" }]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);

        expect(screen.getByText("Smartphone")).toBeInTheDocument();
        expect(screen.getByText("A high-end smartphone")).toBeInTheDocument();
        expect(screen.getByText("Price : 999.99")).toBeInTheDocument();
    })

    it("remove item from cart correctly", () => {
        useCart.mockReturnValue([[
            {category: "67bbf984fc0354cf2d1f32d0", 
                createdAt: "2024-09-06T17:57:19.978Z",
                description: "A high-end smartphone",
                name: "Smartphone",
                price: 800.00,
                quantity: 50,
                shipping: false,
                slug: "Smartphone",
                updatedAt: "2025-03-09T03:57:50.399Z",
                __v: 0,
                _id: "1"},
                {category: "67bbf984fc0354cf2d1f32d0", 
                createdAt: "2024-09-06T17:57:19.978Z",
                description: "A high-end tablet",
                name: "Tablet",
                price: 1200.00,
                quantity: 50,
                shipping: false,
                slug: "Tablet",
                updatedAt: "2025-03-09T03:57:50.399Z",
                __v: 0,
                _id: "2"},
            ],
            setCartMock,
        ]);
        useAuth.mockReturnValue([{ user: { name: "John Doe" }, token: "1111" }]);

        render(
            <MemoryRouter>
                <CartPage />
            </MemoryRouter>);

        fireEvent.click(screen.getAllByText("Remove")[0]);

        expect(setCartMock).toHaveBeenCalledWith([{category: "67bbf984fc0354cf2d1f32d0", 
            createdAt: "2024-09-06T17:57:19.978Z",
            description: "A high-end tablet",
            name: "Tablet",
            price: 1200.00,
            quantity: 50,
            shipping: false,
            slug: "Tablet",
            updatedAt: "2025-03-09T03:57:50.399Z",
            __v: 0,
            _id: "2"}]);
    });


    
});