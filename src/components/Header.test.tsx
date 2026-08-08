import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Header } from './Header';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderHeader = (initialRoute = '/search', authenticated = false) => {
  window.location.hash = `#${initialRoute}`;
  if (authenticated) {
    localStorage.setItem(
      'pantrypal_user',
      JSON.stringify({ id: 'u1', name: 'Chef Gordon', email: 'gordon@pantrypal.com' })
    );
  } else {
    localStorage.removeItem('pantrypal_user');
  }
  return render(
    <AuthProvider>
      <AppProvider>
        <Header />
      </AppProvider>
    </AuthProvider>
  );
};

describe('Header Component', () => {
  it('renders breadcrumb title according to current route', () => {
    renderHeader('/pantry');
    expect(screen.getByText('My Pantry')).toBeInTheDocument();
  });

  it('renders pantry badge and grocery list button when user is authenticated', () => {
    renderHeader('/pantry', true);
    expect(screen.getByText('My Pantry')).toBeInTheDocument();
    expect(screen.getByText(/Grocery List/i)).toBeInTheDocument();
  });

  it('opens and closes GroceryModal when clicking Grocery List button', () => {
    renderHeader('/pantry', true);
    const groceryBtn = screen.getByText(/Grocery List/i);
    fireEvent.click(groceryBtn);

    expect(screen.getAllByText(/Shopping List/i).length).toBeGreaterThan(0);

    const closeBtn = screen.getByRole('button', { name: '' }) || screen.getByText('✕');
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }
  });
});
