import React from "react";
import { render, screen, fireEvent, waitFor} from "@testing-library/react";
import HomePage from "../pages/HomePage";
import { useCart } from "../context/cart";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import axios from "axios";

jest.mock("axios");

jest.mock("../context/auth", () => ({
    useAuth: jest.fn(() => [null, jest.fn()]),
}));

// Mock the cart context
jest.mock("../context/cart", () => ({
    useCart: jest.fn(() => [[{}, {}, {}]]),
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

describe("HomePage page", () => {
    let setCartMock = jest.fn();
    beforeEach(() => {
        jest.clearAllMocks();
        localStorage.clear();
        setCartMock = jest.fn();
        useCart.mockReturnValue([[], setCartMock]);

    });

    it("renders HomePage without crashing", () => {
        render(
            <MemoryRouter>
            <HomePage />
            </MemoryRouter>
        );

        const layout = screen.getByTestId("layout");
        expect(layout).toHaveAttribute("data-title", "ALL Products - Best offers");
    });

    it("renders banner image correctly", () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        const bannerImage = screen.getByAltText("bannerimage");
        expect(bannerImage).toBeInTheDocument();
    });

    it("renders 'Filter By Category' section correctly", () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
    });

    it("renders 'All Products' section correctly", () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByText("All Products")).toBeInTheDocument();
    });

    it("fetches categories on mount", async () => {
        axios.get.mockResolvedValueOnce({ 
            data: { 
                success: true,
                message: "All Categories List",
                category: [{ name: "Electronics", slug: "electronics" }, { name: "Furniture", slug: "furniture" }],
            },
        });

        render(
            <MemoryRouter>
              <HomePage />
            </MemoryRouter>
        );
        
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category")
        });

        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText("Furniture")).toBeInTheDocument();
        });
    });

    it("handles Categories API error gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
        });
    });

    it("handles category filter selection", async () => {
        axios.get.mockResolvedValueOnce({ 
            data: { 
                success: true,
                message: "All Categories List",
                category: [{ name: "Electronics", slug: "electronics" }],
            },
        });
        axios.get.mockResolvedValueOnce({ 
            data: { 
                success: true,
                counTotal: 10,
                message: "All Products",
                products: []
            },
        });
        axios.get.mockResolvedValueOnce({ 
            data: {
                success: true,
                total: 10
            },
        });

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/category/get-category")
        });
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-list/1")
        });
        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith("/api/v1/product/product-count")
        });

        await waitFor(() => {
            expect(screen.getByText("Electronics")).toBeInTheDocument();
        });

        const categoryCheckbox = screen.getByLabelText("Electronics");
        fireEvent.click(categoryCheckbox);
        expect(categoryCheckbox.checked).toBe(true);
    });

    it("fetches products on mount", async () => {
        axios.get.mockResolvedValue({
            data: {
                success: true,
                products: [
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
                    _id: "1"},
                    {category: "67bbf984fc0354cf2d1f32d0", 
                    createdAt: "2024-09-06T17:57:19.978Z",
                    description: "A high-end tablet",
                    name: "Tablet",
                    price: 1999.99,
                    quantity: 50,
                    shipping: false,
                    slug: "Tablet",
                    updatedAt: "2025-03-09T03:57:50.399Z",
                    __v: 0,
                    _id: "2"},
                ],
            },
        });


        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Smartphone")).toBeInTheDocument();
        });
        await waitFor(() => {
            expect(screen.getByText("Tablet")).toBeInTheDocument();
        });
    })

    it("handles Products API error gracefully", async () => {
        axios.get.mockRejectedValueOnce(new Error("API Error"));

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByRole("Smartphone")).not.toBeInTheDocument();
        });
    });

    it("handles price filter selection", async () => {
        axios.get.mockResolvedValueOnce({
            data: { success: true, category: [] },
        });
        axios.post.mockResolvedValueOnce({
            data: { success: true, products: [{category: "67bbf984fc0354cf2d1f32d0", 
                createdAt: "2024-09-06T17:57:19.978Z",
                description: "A good read",
                name: "Book",
                price: 29.99,
                quantity: 50,
                shipping: false,
                slug: "Book",
                updatedAt: "2025-03-09T03:57:50.399Z",
                __v: 0,
                _id: "1"}] },
        });
        axios.post.mockResolvedValueOnce({
            data: { success: true, products: [] },
        });

        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(await screen.findByText("Filter By Price")).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText("$20 to 39"));

        await waitFor(() => {
            expect(screen.getByText("Book")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText("$0 to 19"));

        await waitFor(() => {
            expect(screen.queryByText("Book")).not.toBeInTheDocument();
        });
    })

    it("adds a product to cart", async () => {
        axios.get.mockResolvedValue({
            data: {
                success: true,
                products: [
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
                    _id: "1"},
                ],
            },
        });


        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.getByText("Smartphone")).toBeInTheDocument();
        });

        fireEvent.click(await screen.findByRole("button", { name: /ADD TO CART/i }));


        expect(setCartMock).toHaveBeenCalledTimes(1);
        expect(setCartMock).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({category: "67bbf984fc0354cf2d1f32d0", 
                    createdAt: "2024-09-06T17:57:19.978Z",
                    description: "A high-end smartphone",
                    name: "Smartphone",
                    price: 999.99,
                    quantity: 50,
                    shipping: false,
                    slug: "Smartphone",
                    updatedAt: "2025-03-09T03:57:50.399Z",
                    __v: 0,
                    _id: "1"})
            ])
        );
        
    });

});