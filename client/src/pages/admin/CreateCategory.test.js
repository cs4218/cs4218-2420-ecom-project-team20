import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import axios from "axios";
import CreateCategory from "./CreateCategory";
import { MemoryRouter } from "react-router-dom";
import { ConfigProvider } from "antd";
import toast from "react-hot-toast";
import Layout from "../../components/Layout";
import AdminMenu from "../../components/AdminMenu";
import CategoryForm from "../../components/Form/CategoryForm";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));
jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
jest.mock("../../components/AdminMenu", () => () => <div>AdminMenu</div>);
jest.mock("../../components/Form/CategoryForm", () => () => (
  <form>CategoryForm</form>
));

describe("CreateCategory Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders CreateCategory component and loads categories", async () => {
    const mockCategories = [
      { _id: "1", name: "Books" },
      { _id: "2", name: "Electronics" },
    ];

    axios.get.mockResolvedValue({
      data: { success: true, category: mockCategories },
    });

    // renderComponent();
    const { getByText } = render(
      <MemoryRouter>
        <CreateCategory />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(getByText("Manage Category")).toBeInTheDocument();
      expect(getByText("Books")).toBeInTheDocument();
      expect(getByText("Electronics")).toBeInTheDocument();
    });
  });
});
