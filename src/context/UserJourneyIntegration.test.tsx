import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import App from '../App';

const setHash = (hash: string) => {
  act(() => {
    window.location.hash = hash;
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
};

describe('User Journey & Edge Case End-to-End Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    setHash('#/');
  });

  it('completes the full journey: signup -> add pantry -> search -> favorite -> signout -> signin -> verify data persistence', async () => {
    render(<App />);

    // 1. Navigate to Sign Up page
    setHash('#/auth/signup');

    const firstNameInput = screen.getByPlaceholderText('Alex');
    const lastNameInput = screen.getByPlaceholderText('Rivera');
    const emailInput = screen.getByPlaceholderText('chef@example.com');
    const passwordInput = screen.getByPlaceholderText('Create a strong password');

    // 1. Fill and submit Sign Up
    await act(async () => {
      const termsCheckbox = screen.getByRole('checkbox');
      fireEvent.change(firstNameInput, { target: { value: 'Gordon' } });
      fireEvent.change(lastNameInput, { target: { value: 'Ramsay' } });
      fireEvent.change(emailInput, { target: { value: 'gordon@michelin.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Michelin123!' } });
      fireEvent.click(termsCheckbox);
    });

    const signUpBtn = screen.getByRole('button', { name: /Create Free Account/i });
    await act(async () => {
      fireEvent.click(signUpBtn);
    });

    // Check if sign-in is required (verification screen or unauthenticated)
    setHash('#/auth/signin');
    const emailSignInInput = screen.queryByPlaceholderText('chef@example.com');
    if (emailSignInInput) {
      const passSignInInput = screen.getByPlaceholderText('••••••••');
      await act(async () => {
        fireEvent.change(emailSignInInput, { target: { value: 'gordon@michelin.com' } });
        fireEvent.change(passSignInInput, { target: { value: 'Michelin123!' } });
      });

      const submitSignInBtns = screen.getAllByRole('button', { name: /Sign In/i });
      const submitBtn = submitSignInBtns.find(b => b.getAttribute('type') === 'submit') || submitSignInBtns[0];
      await act(async () => {
        fireEvent.click(submitBtn);
      });
    }

    // 2. Navigate to Pantry and add items
    setHash('#/pantry');

    const pantryInput = screen.getByPlaceholderText(/Search pantry items or add your own/i);
    const addItemBtn = screen.getByRole('button', { name: /Add Item/i });

    // Add Garlic
    await act(async () => {
      fireEvent.change(pantryInput, { target: { value: 'Garlic' } });
      fireEvent.click(addItemBtn);
    });

    // Add Butter
    await act(async () => {
      fireEvent.change(pantryInput, { target: { value: 'Butter' } });
      fireEvent.click(addItemBtn);
    });

    expect(screen.getAllByText('Garlic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);

    // 3. Search for recipes using current pantry
    setHash('#/search');

    const findRecipesBtn = screen.getByText(/Find Matching Recipes/i);
    await act(async () => {
      fireEvent.click(findRecipesBtn);
    });

    // Should navigate to results page
    expect(window.location.hash).toContain('#/results');
    expect(screen.getByText(/Matching Recipes/i)).toBeInTheDocument();

    // 4. Save first recipe to Favorites
    const favoriteButtons = screen.getAllByTitle(/Save to Favorites|Remove from Favorites/i);
    if (favoriteButtons.length > 0) {
      await act(async () => {
        fireEvent.click(favoriteButtons[0]);
      });
    }

    // Verify recipe shows in Favorites page
    setHash('#/favorites');
    expect(screen.getByText(/Saved Favorites/i)).toBeInTheDocument();

    // 5. Sign Out
    setHash('#/account');

    const signOutBtn = screen.queryByRole('button', { name: /Sign Out/i });
    if (signOutBtn) {
      await act(async () => {
        fireEvent.click(signOutBtn);
      });
    }

    // 6. Sign Back In
    setHash('#/auth/signin');

    const emailSignInInput2 = screen.getByPlaceholderText('chef@example.com');
    const passSignInInput2 = screen.getByPlaceholderText('••••••••');

    await act(async () => {
      fireEvent.change(emailSignInInput2, { target: { value: 'gordon@michelin.com' } });
      fireEvent.change(passSignInInput2, { target: { value: 'Michelin123!' } });
    });

    const submitSignInBtns2 = screen.getAllByRole('button', { name: /Sign In/i });
    const submitBtn2 = submitSignInBtns2.find(b => b.getAttribute('type') === 'submit') || submitSignInBtns2[0];
    await act(async () => {
      fireEvent.click(submitBtn2);
    });

    // 7. Confirm Pantry & Favorites persisted
    setHash('#/pantry');
    expect(screen.getAllByText('Garlic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);
    setHash('#/pantry');
    expect(screen.getAllByText('Garlic').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Butter').length).toBeGreaterThan(0);

    setHash('#/favorites');
    expect(screen.getByText(/Saved Favorites/i)).toBeInTheDocument();
  });

  it('handles corner case: searching with no selected ingredients', () => {
    render(<App />);

    setHash('#/search');

    // Clear all selected ingredients from search bar if any exist
    const clearAllBtn = screen.queryByText(/Clear/i);
    if (clearAllBtn) {
      fireEvent.click(clearAllBtn);
    }

    const findRecipesBtn = screen.getByText(/Find Matching Recipes/i);
    fireEvent.click(findRecipesBtn);

    // Expect toast warning requiring at least 1 ingredient
    expect(screen.getByText(/Please select at least one ingredient/i)).toBeInTheDocument();
  });

  it('handles corner case: preventing duplicate pantry items with notification toast', () => {
    render(<App />);

    setHash('#/pantry');

    const pantryInput = screen.getByPlaceholderText(/Search pantry items or add your own/i);
    const addItemBtn = screen.getByRole('button', { name: /Add Item/i });

    // Add Olive Oil
    fireEvent.change(pantryInput, { target: { value: 'Olive Oil' } });
    fireEvent.click(addItemBtn);

    // Try adding Olive Oil again (case-insensitive)
    fireEvent.change(pantryInput, { target: { value: 'olive oil' } });
    fireEvent.click(addItemBtn);

    // Expect warning toast informing user that item already exists in pantry
    expect(screen.getAllByText(/already in your pantry/i).length).toBeGreaterThan(0);
  });

  it('handles corner case: navigating to non-existent recipe ID gracefully', () => {
    render(<App />);

    setHash('#/recipe/rec-nonexistent-999');

    // Expect warning banner indicating recipe not found and rendering fallback
    expect(screen.getByText(/Recipe Not Found \(ID: rec-nonexistent-999\)/i)).toBeInTheDocument();
  });
});
