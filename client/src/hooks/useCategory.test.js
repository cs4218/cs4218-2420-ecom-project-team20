import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import useCategory from "./useCategory";
import "@testing-library/jest-dom/extend-expect";

jest.mock("axios");

const mockCategories = [
  { _id: "1", name: "Electronics", slug: "electronics" },
  { _id: "2", name: "Furniture", slug: "furniture" },
];

const TestComponent = () => {
  const categories = useCategory();
  return (
    <div>
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category._id}>{category.name}</div>
        ))
      ) : (
        <p>No categories found</p>
      )}
    </div>
  );
};

describe("useCategory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories after a successful API call", async () => {
    axios.get.mockResolvedValue({ data: { category: mockCategories } });

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("Electronics")).toBeInTheDocument();
    });
    await waitFor(() => {
        expect(screen.getByText("Furniture")).toBeInTheDocument();
      });
  });

  it("should handle API errors gracefully", async () => {
    axios.get.mockRejectedValue(new Error("Failed to fetch"));

    render(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText("No categories found")).toBeInTheDocument();
    });
  });

  it("should call the API once when the hook is first used", async () => {
    axios.get.mockResolvedValue({ data: { category: mockCategories } });

    render(<TestComponent />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledTimes(1);
    });
  });
});
