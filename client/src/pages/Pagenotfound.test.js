import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Pagenotfound from "./Pagenotfound";
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
  

describe("Pagenotfound page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it("renders Pagenotfound page without crashing", () => {
        render(<MemoryRouter initialEntries={["/pnf"]}>
                  <Routes>
                  <Route path="/pnf" element={<Pagenotfound />} />
                  </Routes>
              </MemoryRouter>);
        
        const layout = screen.getByTestId("layout");
        expect(layout).toHaveAttribute("data-title", "go back - page not found");
    });

    it("displays page text correctly", () => {
        render(<MemoryRouter initialEntries={["/pnf"]}>
            <Routes>
            <Route path="/pnf" element={<Pagenotfound />} />
            </Routes>
        </MemoryRouter>);
        
        expect(screen.getByText("404")).toBeInTheDocument();
        expect(screen.getByText("Oops ! Page Not Found")).toBeInTheDocument();
    });
    
    it("renders Go Back Link with correct URL", () => {
        render(<MemoryRouter initialEntries={["/pnf"]}>
            <Routes>
            <Route path="/pnf" element={<Pagenotfound />} />
            </Routes>
        </MemoryRouter>);

        const link = screen.getByRole("link", { name: /go back/i });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute("href", "/login");
    })
});