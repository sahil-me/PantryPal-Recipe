import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PantryPage } from './PantryPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderPantryPage = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <PantryPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('PantryPage Component', () => {
  it('renders heading and saved pantry items', () => {
    renderPantryPage();

    expect(screen.getByText('My Saved Pantry')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search pantry items or add your own/i)).toBeInTheDocument();
  });

  it('allows adding a custom pantry item', () => {
    renderPantryPage();

    const input = screen.getByPlaceholderText(/Search pantry items or add your own/i);
    fireEvent.change(input, { target: { value: 'Saffron' } });

    const addBtn = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Saffron')).toBeInTheDocument();
  });

  it('allows applying starter pantry bundles when pantry is empty', () => {
    renderPantryPage();

    // Remove any default pantry items if present to show empty state starter bundles
    const removeButtons = screen.queryAllByTitle(/Remove from pantry/i);
    removeButtons.forEach(btn => fireEvent.click(btn));

    const italianBundle = screen.getByText(/Italian Staples/i);
    fireEvent.click(italianBundle);

    expect(screen.getAllByText('Olive Oil').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Garlic').length).toBeGreaterThan(0);
  });

  it('filters catalog items by category buttons', () => {
    renderPantryPage();

    const dairyBtn = screen.getByRole('button', { name: /Dairy & Eggs/i });
    fireEvent.click(dairyBtn);

    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);
  });
});
