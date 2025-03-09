import React from "react";
import { render, screen, act } from "@testing-library/react";
import { unmountComponentAtNode } from "react-dom";
import "@testing-library/jest-dom/extend-expect";
import { MemoryRouter } from "react-router-dom";
import Spinner from "./Spinner";

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
    useLocation: jest.fn(() => ({ pathname: '/current' })),
  }));

describe("Spinner Component", () => {

    it("renders Spinner component", () => {
        render(
            <MemoryRouter>
                <Spinner />
            </MemoryRouter>
        );

        expect(screen.getByRole("heading")).toHaveTextContent("redirecting you in");
        expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("countdown decreases every second", () => {
        jest.useFakeTimers();
        render(
            <MemoryRouter>
                <Spinner />
            </MemoryRouter>
        );

        expect(screen.getByRole("heading")).toHaveTextContent("redirecting you in");
        expect(screen.getByRole("status")).toBeInTheDocument();

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByRole("heading")).toHaveTextContent("2");

        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(screen.getByRole("heading")).toHaveTextContent("1");
        jest.useRealTimers();
    });

    it('navigates to specified path when countdown ends', async () => {
        const navigate = jest.fn();
        jest.useFakeTimers();
        require("react-router-dom").useNavigate.mockReturnValue(navigate);
    
        render(
          <MemoryRouter>
            <Spinner path="test-path" />
          </MemoryRouter>
        );

        act(() => {
            jest.advanceTimersByTime(3000);
        });
    
        expect(navigate).toHaveBeenCalledWith('/test-path', { state: '/current' });
        jest.useRealTimers();
    });

    it("cleans up interval on unmount", () => {
        jest.useFakeTimers();
        const div = document.createElement("div");
        render(
            <MemoryRouter>
            <Spinner />
            </MemoryRouter>,
            div
        );

        unmountComponentAtNode(div);

        // No errors should occur since interval was cleared
        expect(() => {
            act(() => {
                jest.advanceTimersByTime(1000); // Simulate time passing
            });
        }).not.toThrow();
    });
});