import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Header from "./Header";

// Mock context hooks
jest.mock("../context/auth", () => ({
  useAuth: jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [[{}, {}, {}]]),
}));

jest.mock("../hooks/useCategory", () => jest.fn(() => [{ name: "Electronics", slug: "electronics" }]));

jest.mock("../context/search", () => ({
    useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));


describe("Header component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Header component without crashing", () => {
    const { useAuth } = require("../context/auth");
    useAuth.mockReturnValue([null, jest.fn()]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("🛒 Virtual Vault")).toBeInTheDocument();
  });

  it("displays Register and Login links when user is not logged in", () => {
    const { useAuth } = require("../context/auth");
    useAuth.mockReturnValue([null, jest.fn()]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Register")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("displays user Dashboard and Logout when logged in", () => {
    const { useAuth } = require("../context/auth");
    useAuth.mockReturnValue([{ user: { name: "John Doe", role: 0 } }, jest.fn()]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("displays correct admin Dashboard link when logged in as admin", () => {
    const { useAuth } = require("../context/auth");
    useAuth.mockReturnValue([{ user: { name: "John Doe", role: 1 } }, jest.fn()]);

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const dashboardLink = screen.getByRole("link", {name:"Dashboard"});
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink).toHaveAttribute("href", "/dashboard/admin");
  });

  it("calls handleLogout when Logout is clicked", async () => {
    const mockSetAuth = jest.fn();
    require("../context/auth").useAuth.mockReturnValue([
        { user: { name: "John Doe" } }, 
        mockSetAuth
    ]);

    render(
        <MemoryRouter>
        <Header />
        </MemoryRouter>
    );

    const userButton = screen.getByText("John Doe")
    fireEvent.click(userButton)
    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    await waitFor(() => expect(mockSetAuth).toHaveBeenCalledWith({
        user: null,
        token: "",
    }));
  });

  it("displays correct cart count", () => {

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders Categories dropdown", () => {

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText("Categories")).toBeInTheDocument();
    expect(screen.getByText("Electronics")).toBeInTheDocument();
  });
});
