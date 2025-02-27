import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import UserMenu from './UserMenu';

describe('UserMenu', () => {
  it('renders heading', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: "Dashboard" })).toBeInTheDocument();
  });

  it('renders link to Profile page', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
    const profileLink = screen.getByRole('link', { name: "Profile" });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/dashboard/user/profile');
  });

  it('renders link to Orders page', () => {
    render(
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    );
    const ordersLink = screen.getByRole('link', { name: "Orders" });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute('href', '/dashboard/user/orders');
  });
});
