import React from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminMenu from "./AdminMenu";
import "@testing-library/jest-dom";

describe("AdminMenu Component", () => {
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
});
