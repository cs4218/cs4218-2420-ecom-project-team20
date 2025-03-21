import { render, screen, waitFor } from "@testing-library/react";
import PrivateRoute from "./Private";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useAuth } from "../../context/auth";
import "@testing-library/jest-dom";
import React from "react";
import axios from "axios";
import { beforeEach } from "node:test";
import { useNavigate } from "react-router-dom";

jest.mock("axios");
jest.mock("../../context/auth", () => ({
  useAuth: jest.fn(),
}));

describe("PrivateRoute", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render <Spinner /> if user is not authenticated", async () => {
    useAuth.mockReturnValue([{ token: null }, jest.fn()]);

    axios.get.mockResolvedValue({ data: { ok: false } });

    const { getByRole } = render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(getByRole("status")).toBeInTheDocument());
  });

  it("should render <Spinner /> if the token is invalid", async () => {
    useAuth.mockReturnValue([{ token: "invalid-token" }, jest.fn()]);

    axios.get.mockResolvedValue({ data: { ok: false } });

    const { getByRole } = render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(getByRole("status")).toBeInTheDocument());
  });

  it("should render <Spinner /> when there is a network error", async () => {
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);

    axios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { getByRole } = render(
      <MemoryRouter>
        <PrivateRoute />
      </MemoryRouter>
    );

    await waitFor(() => expect(getByRole("status")).toBeInTheDocument());

    expect(axios.get).toHaveBeenCalled();
  });

  it("should render the Outlet if user is authenticated", async () => {
    useAuth.mockReturnValue([{ token: "mock-token" }, jest.fn()]);

    axios.get.mockResolvedValue({ data: { ok: true } });

    const { getByText } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/protected" element={<div>Protected Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() =>
      expect(getByText("Protected Page")).toBeInTheDocument()
    );
  });
});
