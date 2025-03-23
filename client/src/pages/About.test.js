import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import About from "./About";
import { beforeEach } from "node:test";
import "@testing-library/jest-dom/extend-expect";

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


describe("About page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("renders About page without crashing", () => {
        render(<MemoryRouter initialEntries={["/about"]}>
                  <Routes>
                  <Route path="/about" element={<About />} />
                  </Routes>
              </MemoryRouter>);
        const layout = screen.getByTestId("layout");
        expect(layout).toHaveAttribute("data-title", "About us - Ecommerce app");
    });

    it("renders image with correct src and alt attributes", () => {
        render(<MemoryRouter initialEntries={["/about"]}>
            <Routes>
            <Route path="/about" element={<About />} />
            </Routes>
        </MemoryRouter>);
        const image = screen.getByAltText("contactus");
        expect(image).toHaveAttribute("src", "/images/about.jpeg");
        expect(image).toHaveAttribute("alt", "contactus");
    });

    it("renders the paragraph text correctly", () => {
        render(<MemoryRouter initialEntries={["/about"]}>
            <Routes>
            <Route path="/about" element={<About />} />
            </Routes>
        </MemoryRouter>);
        expect(screen.getByText("Buy something today!")).toBeInTheDocument();
    });
    
});