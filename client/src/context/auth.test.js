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
        <TestAuthComponent />
      </AuthProvider>
    );

    const userName = await screen.findByText("User: John Doe");
    expect(userName).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe("fakeToken");
  });

  it("should not load auth data if not in localStorage", async () => {
    // Ensure localStorage is empty
    localStorage.clear();

    // Test the component behavior when no auth data is in localStorage
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    const userName = await screen.findByText("User: null");
    expect(userName).toBeInTheDocument();
    expect(axios.defaults.headers.common["Authorization"]).toBe("");
  });

  it("should update auth state when setAuth is called", async () => {
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Check initial state
    expect(screen.getByText("User: null")).toBeInTheDocument();

    // Click the button to update state
    fireEvent.click(screen.getByText("Update Auth"));

    // Wait for state update and check new user name
    const userName = await screen.findByText("User: Jane Doe");
    expect(userName).toBeInTheDocument();
  });
});

const TestAuthComponent = () => {
  const [auth, setAuth] = useAuth();

  return (
    <div>
      <p>User: {auth.user ? auth.user.name : "null"}</p>
      <button
        onClick={() =>
          setAuth({ user: { name: "Jane Doe" }, token: "newFakeToken" })
        }
      >
        Update Auth
      </button>
    </div>
  );
};
