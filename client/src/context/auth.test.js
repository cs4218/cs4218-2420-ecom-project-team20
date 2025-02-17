import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

// Mocking axios for testing purposes
jest.mock("axios");

// Mock LocalStorage
const localStorageMock = (function () {
  let store = {};
  return {
    getItem: function (key) {
      return store[key] || null;
    },
    setItem: function (key, value) {
      store[key] = value.toString();
    },
    clear: function () {
      store = {};
    },
  };
})();
global.localStorage = localStorageMock;

describe("AuthProvider", () => {
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should load auth data from localStorage if available", async () => {
    // Simulate stored data in localStorage
    const authData = { user: { name: "John Doe" }, token: "fakeToken" };
    localStorage.setItem("auth", JSON.stringify(authData));

    // Test if auth context is initialized correctly
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const userName = await screen.findByText("User: John Doe");
    expect(userName).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe("fakeToken");
  });

  it("should not load auth data if not in localStorage", () => {
    // Ensure localStorage is empty
    localStorage.clear();

    // Test the component behavior when no auth data is in localStorage
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText("User: null")).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });
});

// Test Component to use useAuth hook in context
const TestComponent = () => {
  const [auth, setAuth] = useAuth();

  return (
    <div>
      <div>User: {auth.user ? auth.user.name : "null"}</div>
    </div>
  );
};
