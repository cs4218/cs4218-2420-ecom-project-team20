import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { CartProvider, useCart } from "../context/cart";
import { useEffect } from "react";
import "@testing-library/jest-dom/extend-expect";

// Helper component to test useCart
const TestComponent = () => {
  const [cart, setCart] = useCart();

  useEffect(() => {
    setCart([{ id: 1, name: "Test Product" }]);
  }, []);

  return (
    <div data-testid="cart-length">
        {cart.length}
    </div>
  );
};

describe("CartProvider", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with an empty cart if localStorage is empty", () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
  });

  it("loads cart from localStorage if data exists", () => {
    localStorage.setItem("cart", JSON.stringify([{ id: 1, name: "Saved Product" }]));

    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    expect(screen.getByTestId("cart-length")).toHaveTextContent("1");
  });

  it("allows updating the cart", async () => {
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );

    await waitFor(() =>
        expect(screen.getByTestId("cart-length")).toHaveTextContent("1")
    );

    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([{ id: 1, name: "Test Product" }]);
  });

  it("maintains cart state across renders", async () => {
    localStorage.setItem("cart", JSON.stringify([{ id: 23, name: "Saved Item" }]));
  
    render(
      <CartProvider>
        <TestComponent />
      </CartProvider>
    );
  
    await waitFor(() =>
      expect(screen.getByTestId("cart-length")).toHaveTextContent("1")
    );
  
    expect(JSON.parse(localStorage.getItem("cart"))).toEqual([{ id: 23, name: "Saved Item" }]);
  });
});
