import React from "react";
import { render, screen } from '@testing-library/react'
import UserMenu from "./UserMenu";
import { MemoryRouter, Route, Routes } from "react-router-dom";

describe ('UserMenu', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/user"]}>
        <Routes>
          <Route path="/dashboard/user" element={<UserMenu />} />
        </Routes>
      </MemoryRouter>
    );
    const heading = screen.getByRole('heading', { level: 4 });
    expect(heading).toBeInTheDocument();
  })
})
