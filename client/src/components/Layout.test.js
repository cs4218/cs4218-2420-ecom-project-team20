import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import Layout from "./Layout";
import { Helmet } from "react-helmet";
import toast from "react-hot-toast";

jest.mock("./Header", () => () => <header>Mock Header</header>);
jest.mock("./Footer", () => () => <footer>Mock Footer</footer>);
jest.mock('react-hot-toast', () => ({
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn(),
    custom: jest.fn(),
    dismiss: jest.fn(),
    Toaster: () => null,
  }));

describe("Layout Component", () => {
  it("renders children correctly", () => {
    render(
      <Layout>
        <p>Test Child</p>
      </Layout>
    );

    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders the Header and Footer components", () => {
    render(<Layout />);
    expect(screen.getByText("Mock Header")).toBeInTheDocument();
    expect(screen.getByText("Mock Footer")).toBeInTheDocument();
  });

  it("renders the Toaster component", async() => {
    render(<Layout />);
    toast.success("successful toast")
    
    expect(toast.success).toHaveBeenCalledWith(
        'successful toast'
      )
  });

  it("sets the correct Helmet meta tags and title", () => {
    render(<Layout title="Custom Title" description="Custom Desc" keywords="react,test" author="Test Author" />);
    
    const helmet = Helmet.peek();

    expect(helmet.title).toBe("Custom Title");

    expect(
      helmet.metaTags.find((tag) => tag.name === "description")?.content
    ).toBe("Custom Desc");
    expect(
      helmet.metaTags.find((tag) => tag.name === "keywords")?.content
    ).toBe("react,test");
    expect(
      helmet.metaTags.find((tag) => tag.name === "author")?.content
    ).toBe("Test Author");
  });

  it("uses default props when no props are provided", () => {
    render(<Layout />);

    const helmet = Helmet.peek();

    expect(helmet.title).toBe("Ecommerce app - shop now");
    expect(
      helmet.metaTags.find((tag) => tag.name === "description")?.content
    ).toBe("mern stack project");
    expect(
      helmet.metaTags.find((tag) => tag.name === "keywords")?.content
    ).toBe("mern,react,node,mongodb");
    expect(
      helmet.metaTags.find((tag) => tag.name === "author")?.content
    ).toBe("Techinfoyt");
  });
});
