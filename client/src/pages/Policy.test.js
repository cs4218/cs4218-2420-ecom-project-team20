import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Policy from "../pages/Policy";
import { beforeEach } from "node:test";
import "@testing-library/jest-dom/extend-expect";

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [null, jest.fn()]), // Mock useAuth hook to return null state and a mock function for setAuth
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]), // Mock useCart hook to return null state and a mock function
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => []));

jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]), // Mock useSearch hook to return null state and a mock function
}));

describe("Register Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("renders Policy page without crashing", () => {
    render(<MemoryRouter initialEntries={["/policy"]}>
        <Routes>
        <Route path="/policy" element={<Policy />} />
        </Routes>
    </MemoryRouter>);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
});