import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Footer from "./Footer";

describe("Footer Component", () => {
    it("renders Footer component", () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText("All Rights Reserved © TestingComp")).toBeInTheDocument();
        expect(screen.getByText("About")).toBeInTheDocument();
        expect(screen.getByText("Contact")).toBeInTheDocument();
        expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    });
});