import React from 'react';
import { getByRole, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import Contact from "./Contact";

const testUser = {
  name: "John Smith",
  email: "johnsmith@email.com",
  address: "10 Apple Street"
};

jest.mock("../context/auth", () => ({
  useAuth: jest.fn(() => [{
    user: testUser,
  }, jest.fn()]),
}));
jest.mock("../context/cart", () => ({
  useCart: jest.fn(() => [null, jest.fn()]),
}));
jest.mock("../context/search", () => ({
  useSearch: jest.fn(() => [{ keyword: "" }, jest.fn()]),
}));

describe("Contact", () => {
  it("renders heading text", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const heading = screen.getByRole("heading", { name: "CONTACT US" });
    expect(heading).toBeInTheDocument();
  });
  it("renders heading styling", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const heading = screen.getByRole("heading", { name: "CONTACT US" });
    let classes = heading.getAttribute("class");
    expect(classes).toBe("bg-dark p-2 text-white text-center");
  })

  it("renders contact email", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const email = screen.getByTestId("contact-email");
    expect(email).toBeInTheDocument();
    expect(email.textContent).toEqual("www.help@ecommerceapp.com");
  });
  it("renders contact phone 1", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const phone1 = screen.getByTestId("contact-phone1");
    expect(phone1).toBeInTheDocument();
    expect(phone1.textContent).toEqual("012-3456789");
  });
  it("renders contact phone 2", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const phone2 = screen.getByTestId("contact-phone2");
    expect(phone2).toBeInTheDocument();
    expect(phone2.textContent).toEqual("1800-0000-0000 (toll free)");
  });

  it("renders image", () => {
    render(
      <MemoryRouter>
        <Contact/>
      </MemoryRouter>
    );
    const image = screen.getByRole("img");
    expect(image.src).toContain("/images/contactus.jpeg");
    expect(image.alt).toEqual("contactus");
  });
});
