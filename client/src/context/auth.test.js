import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    const authData = { user: { name: "Jane Doe" }, token: "fakeToken" };
    localStorage.setItem("auth", JSON.stringify(authData));

    // Render the component inside the AuthProvider
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Verify that the user name is loaded from localStorage
    const userName = await screen.findByText("User: Jane Doe");
    expect(userName).toBeInTheDocument();

    // Check that the Authorization token is set in axios headers
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

    // Check that the user name is null
    const userName = await screen.findByText("User: null");
    expect(userName).toBeInTheDocument();

    // Check that the Authorization token is not set in axios headers
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
    fireEvent.click(screen.getByText("Login"));

    // Wait for state update and check new user name
    const userName = await screen.findByText("User: Jane Doe");
    expect(userName).toBeInTheDocument();

    // check if axios authorization header is updated
    expect(axios.defaults.headers.common["Authorization"]).toBe("newFakeToken");
  });

  it("should set auth data in localStorage on update", async () => {
    const setItemMock = jest.spyOn(Storage.prototype, "setItem");
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Check initial state
    expect(screen.getByText("User: null")).toBeInTheDocument();

    // New auth data to be set
    const newAuthData = {
      user: { name: "Jane Doe" },
      token: "newFakeToken",
    };

    // Click the button to update state
    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      // Check if auth data is set in localStorage
      expect(setItemMock).toHaveBeenCalledWith(
        "auth",
        JSON.stringify(newAuthData)
      );
    });

    // Check if user name is updated
    const userName = await screen.findByText("User: Jane Doe");
    expect(userName).toBeInTheDocument();

    setItemMock.mockRestore();
  });

  it("should remove auth data upon logout", async () => {
    const removeItemMock = jest.spyOn(Storage.prototype, "removeItem");

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    // Login
    fireEvent.click(screen.getByText("Login"));

    // Wait for state update
    const userName = await screen.findByText("User: Jane Doe");
    expect(userName).toBeInTheDocument();

    // Logout
    fireEvent.click(screen.getByText("Logout"));

    // Wait for state update
    await waitFor(() => {
      expect(
        screen.getByText((content) => content.includes("User: null"))
      ).toBeInTheDocument();
    });

    removeItemMock.mockRestore();
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
        Login
      </button>
      <button onClick={() => setAuth({ user: null, token: "" })}>Logout</button>
    </div>
  );
};
