import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Categories from "./Categories";
import useCategory from "../hooks/useCategory";
import "@testing-library/jest-dom/extend-expect";

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

jest.mock("../components/Layout", () => ({ title, children }) => (
    <div data-testid="layout" data-title={title}>
        {children}
    </div>
));

const mockCategories = [
  { _id: "1", name: "Electronics", slug: "electronics" },
  { _id: "2", name: "Clothing", slug: "clothing" },
];

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("Categories page", () => {
  it("renders Categories page without crashing", () => {
    useCategory.mockReturnValue(mockCategories);
    renderWithRouter(<Categories />);

    const layout = screen.getByTestId("layout");
    expect(layout).toHaveAttribute("data-title", "All Categories");
  });

  it("displays correct number of category links", () => {
    useCategory.mockReturnValue(mockCategories);
    renderWithRouter(<Categories />);

    const categoryLinks = screen.getAllByRole("link");
    expect(categoryLinks.length).toBe(mockCategories.length);
  });

  it("renders category names and correct links", () => {
    useCategory.mockReturnValue(mockCategories);
    renderWithRouter(<Categories />);

    mockCategories.forEach((category) => {
      const link = screen.getByText(category.name);
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", `/category/${category.slug}`);
    });
  });

  it("handles empty category list gracefully", () => {
    useCategory.mockReturnValue([]);
    renderWithRouter(<Categories />);

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
