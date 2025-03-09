import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import "@testing-library/jest-dom";

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("AdminMenu Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("renders all admin links correctly", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminMenu />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Admin Panel")).toBeInTheDocument();
    expect(getByText("Create Category")).toBeInTheDocument();
    expect(getByText("Create Product")).toBeInTheDocument();
    expect(getByText("Products")).toBeInTheDocument();
    expect(getByText("Orders")).toBeInTheDocument();
  });

  it("ensures links point to correct routes", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminMenu />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Create Category").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-category"
    );
    expect(getByText("Create Product").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/create-product"
    );
    expect(getByText("Products").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/products"
    );
    expect(getByText("Orders").closest("a")).toHaveAttribute(
      "href",
      "/dashboard/admin/orders"
    );
  });

  it("navigates to Create Category page when it is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route
            path="/dashboard/admin/create-category"
            element={<div>Create Category Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const createCategoryLink = getByText(/Create Category/i);
    fireEvent.click(createCategoryLink);

    expect(getByText("Create Category Page")).toBeInTheDocument();
  });

  it("navigates to Create Product page when it is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route
            path="/dashboard/admin/create-product"
            element={<div>Create Product Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const createCategoryLink = getByText(/Create Product/i);
    fireEvent.click(createCategoryLink);

    expect(getByText("Create Product Page")).toBeInTheDocument();
  });

  it("navigates to Products page when it is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route
            path="/dashboard/admin/products"
            element={<div>Products Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const createCategoryLink = getByText(/Products/i);
    fireEvent.click(createCategoryLink);

    expect(getByText("Products Page")).toBeInTheDocument();
  });

  it("navigates to Order page when it is clicked", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<AdminMenu />} />
          <Route
            path="/dashboard/admin/orders"
            element={<div>Orders Page</div>}
          />
        </Routes>
      </MemoryRouter>
    );

    const createCategoryLink = getByText(/Orders/i);
    fireEvent.click(createCategoryLink);

    expect(getByText("Orders Page")).toBeInTheDocument();
  });
});
