import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/auth";
import React from "react";
import AdminDashboard from "./AdminDashboard";
import "@testing-library/jest-dom";

// Mock Layout component
jest.mock("../../components/Layout", () =>
  jest.fn(({ children }) => <div>{children}</div>)
);

// Mock AdminMenu component
jest.mock("../../components/AdminMenu", () =>
  jest.fn(() => <div>Admin Menu</div>)
);

// Mock useAuth component
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

describe("AdminDashboard Component", () => {
  const mockAuth = {
    user: {
      name: "John Doe",
      email: "admin@example.com",
      phone: "123-456-7890",
    },
  };

  beforeEach(() => {
    useAuth.mockReturnValue([mockAuth]);
  });

  it("renders Layout component", () => {
    const { container } = render(
      <MemoryRouter>
        <AdminDashboard />
      </MemoryRouter>
    );

    // Check if Layout's class is in the document
    expect(container.querySelector(".container-fluid")).toBeInTheDocument();
  });

  it("renders AdminDashboard component correctly", () => {
    useAuth.mockReturnValue([
      {
        user: {
          name: "John Doe",
          email: "admin@example.com",
          phone: "123-456-7890",
        },
      },
    ]);

    const { container } = render(
      <MemoryRouter initialEntries={["/dashboard/admin"]}>
        <Routes>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(container).toMatchSnapshot(); // ✅ Snapshot test
  });

  it("renders AdminMenu inside AdminDashboard", () => {
    // Mock the auth state
    useAuth.mockReturnValue([
      {
        user: {},
      },
    ]);
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
    useAuth.mockReturnValue([{}]); // No user data

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
    useAuth.mockReturnValue(null); // Simulate missing auth context

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
