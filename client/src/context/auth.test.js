import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  renderHook,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { AuthProvider, useAuth } from "./auth";
import axios from "axios";

// Mocking axios for testing purposes
jest.mock("axios");

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

describe("AuthProvider", () => {
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("initializes auth state correctly", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current[0].user).toBeNull();
    expect(result.current[0].token).toBe("");
  });

  it("loads auth state from localStorage", () => {
    const storedAuth = {
      user: { name: "John Doe" },
      token: "some-token",
    };

    localStorage.setItem("auth", JSON.stringify(storedAuth));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current[0].user).toEqual(storedAuth.user);
    expect(result.current[0].token).toBe(storedAuth.token);
  });

  it("sets auth data in localStorage and authorization token when user logs in", async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(getByText("User: null")).toBeInTheDocument();

    const newAuthData = {
      user: { name: "Jane Doe" },
      token: "newFakeToken",
    };

    fireEvent.click(screen.getByText("Login"));

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(
        "auth",
        JSON.stringify(newAuthData)
      );
    });

    setItemSpy.mockRestore();
  });

  it("sets the Authorization token in axios headers when user logs in", async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText("Login"));

    await waitFor(() => {
      expect(axios.defaults.headers.common["Authorization"]).toBe(
        "newFakeToken"
      );
    });
  });

  it("should clear auth data upon logout", async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");
    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText("Logout"));

    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith("auth");
    });

    removeItemSpy.mockRestore();
  });

  it("should reset axios Authorization header upon logout", async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    fireEvent.click(getByText("Logout"));

    await waitFor(() => {
      expect(axios.defaults.headers.common["Authorization"]).toBe("");
    });
  });

  it("should clear auth state upon logout", async () => {
    const { getByText } = render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(getByText("User: null")).toBeInTheDocument();

    fireEvent.click(getByText("Logout"));

    await waitFor(() => {
      expect(getByText("User: null")).toBeInTheDocument();
    });
  });
});
