import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import CreateProduct from "./CreateProduct";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import toast from "react-hot-toast";
import React from "react";
import { useState, useEffect } from "react";
import { Select, Option } from "antd";

jest.mock("axios");
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("../../components/Layout", () => ({ children }) => (
  <div>{children}</div>
));
// jest.mock("antd", () => {
//   const antd = jest.requireActual("antd");

//   const Select = ({ children, onChange, ...props }) => {
//     return (
//       <select {...props} onChange={(e) => onChange(e.target.value)}>
//         {children}
//       </select>
//     );
//   };

//   Select.Option = ({ children, ...otherProps }) => {
//     return <option {...otherProps}>{children}</option>;
//   };

//   return {
//     ...antd,
//     Select,
//   };
// });

describe("CreateProduct Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the form fields correctly", () => {
    render(
      <MemoryRouter>
        <CreateProduct />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText("write a name")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("write a description")
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a Price")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("write a quantity")).toBeInTheDocument();
    expect(screen.getByTestId("category-select")).toBeInTheDocument();
    expect(screen.getByTestId("shipping-select")).toBeInTheDocument();
  });
});
