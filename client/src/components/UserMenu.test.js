import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import "@testing-library/jest-dom/extend-expect";

import UserMenu from './UserMenu';

describe('UserMenu', () => {
  const renderComponent = () => {
    render(
      <MemoryRouter>
        <UserMenu/>
      </MemoryRouter>
    );
  };

  it('renders heading', () => {
    renderComponent();

    const heading = screen.getByRole('heading', { name: "Dashboard" })
    expect(heading).toBeInTheDocument();
  });

  it('renders link to Profile page', () => {
    renderComponent();

    const profileLink = screen.getByRole('link', { name: "Profile" });
    expect(profileLink).toBeInTheDocument();
    expect(profileLink).toHaveAttribute('href', '/dashboard/user/profile');
  });

  it('renders link to Orders page', () => {
    renderComponent();

    const ordersLink = screen.getByRole('link', { name: "Orders" });
    expect(ordersLink).toBeInTheDocument();
    expect(ordersLink).toHaveAttribute('href', '/dashboard/user/orders');
  });
});
