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

jest.mock("../components/Layout", () => ({ title, children }) => (
  <div data-testid="layout" data-title={title}>
    {children}
  </div>
));

describe("Policy page", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    it("renders Policy page without crashing", () => {
      render(<MemoryRouter initialEntries={["/policy"]}>
          <Routes>
          <Route path="/policy" element={<Policy />} />
          </Routes>
      </MemoryRouter>);
      const layout = screen.getByTestId("layout");
      expect(layout).toHaveAttribute("data-title", "Privacy Policy");
    });

    it("renders the paragraph text correctly", () => {
      render(<MemoryRouter initialEntries={["/policy"]}>
          <Routes>
          <Route path="/policy" element={<Policy />} />
          </Routes>
      </MemoryRouter>);
      expect(screen.getByText("add privacy policy")).toBeInTheDocument();
    });
});