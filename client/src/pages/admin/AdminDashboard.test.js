import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/auth";
import React from "react";
import AdminDashboard from "./AdminDashboard";
import "@testing-library/jest-dom";
import { afterEach } from "node:test";

jest.mock("../../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);

jest.mock("../../components/AdminMenu", () =>
  jest.fn(() => <div>Admin Menu</div>)
);

jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

describe("AdminDashboard Component", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders AdminDashboard component correctly", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText(/Admin Name/i)).toBeInTheDocument();
    expect(getByText(/Admin Email/i)).toBeInTheDocument();
    expect(getByText(/Admin Contact/i)).toBeInTheDocument();
  });

  it("renders AdminMenu inside AdminDashboard", () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );
    expect(getByText("Admin Menu")).toBeInTheDocument();
  });

  it("displays admin user details correctly", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "admin@example.com",
          phone: "123-456-7890",
        },
      },
    ]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Admin Name : John Doe")).toBeInTheDocument();
    expect(getByText("Admin Email : admin@example.com")).toBeInTheDocument();
    expect(getByText("Admin Contact : 123-456-7890")).toBeInTheDocument();
  });

  it("handles missing user data gracefully", () => {
    useAuth.mockReturnValue([{}]);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Admin Name :")).toBeInTheDocument();
    expect(getByText("Admin Email :")).toBeInTheDocument();
    expect(getByText("Admin Contact :")).toBeInTheDocument();
  });

  it("handles null auth data gracefully", () => {
    useAuth.mockReturnValue(null);

    const { getByText } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText("Admin Name :")).toBeInTheDocument();
    expect(getByText("Admin Email :")).toBeInTheDocument();
    expect(getByText("Admin Contact :")).toBeInTheDocument();
  });
});
