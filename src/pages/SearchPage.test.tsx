import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SearchPage } from './SearchPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderSearchPage = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <SearchPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('SearchPage Component', () => {
  it('renders heading and ingredient search bar pre-populated with pantry items', () => {
    renderSearchPage();

    expect(screen.getByText(/What's in your kitchen today\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Find Matching Recipes/i)).toBeInTheDocument();
  });

  it('allows selecting meal categories and quick filters', () => {
    renderSearchPage();

    const breakfastBtn = screen.getByText('Breakfast');
    fireEvent.click(breakfastBtn);

    const vegFilter = screen.getByText(/Vegetarian/i);
    fireEvent.click(vegFilter);

    expect(screen.getByText(/Reset Filters/i)).toBeInTheDocument();
  });

  it('navigates to results page on clicking Find Matching Recipes button', () => {
    renderSearchPage();

    const input = screen.getByPlaceholderText(/Search or add ingredients/i);
    fireEvent.change(input, { target: { value: 'Eggs' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    const findBtn = screen.getByText(/Find Matching Recipes/i);
    fireEvent.click(findBtn);

    expect(window.location.hash).toContain('/results');
  });
});
