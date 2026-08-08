import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { RecipeDetailPage } from './RecipeDetailPage';
import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';

const renderRecipeDetail = () => {
  return render(
    <AuthProvider>
      <AppProvider>
        <RecipeDetailPage />
      </AppProvider>
    </AuthProvider>
  );
};

describe('RecipeDetailPage Component', () => {
  it('renders recipe title and ingredients section', () => {
    renderRecipeDetail();

    expect(screen.getByText('Ingredients Needed')).toBeInTheDocument();
    expect(screen.getByText('Cooking Instructions')).toBeInTheDocument();
  });

  it('allows scaling servings multiplier (1x, 1.5x, 2x)', () => {
    renderRecipeDetail();

    const scale2xBtn = screen.getByText('2x');
    fireEvent.click(scale2xBtn);

    expect(screen.getByText(/Scaled for/i)).toBeInTheDocument();
  });

  it('toggles step completion when clicking an instruction step', () => {
    renderRecipeDetail();

    const instructionSteps = screen.getAllByText(/Melt butter|Add minced garlic|Crack the eggs/i);
    if (instructionSteps.length > 0) {
      fireEvent.click(instructionSteps[0]);
      expect(screen.getByText(/1 of \d+ steps completed/i)).toBeInTheDocument();
    }
  });

  it('displays default "How was this recipe?" card and does not show "Your Saved Cooking Feedback"', () => {
    renderRecipeDetail();

    expect(screen.getByText('How was this recipe?')).toBeInTheDocument();
    expect(screen.getByText('Write a Review')).toBeInTheDocument();
    expect(screen.queryByText('Your Saved Cooking Feedback')).not.toBeInTheDocument();
    expect(screen.queryByText('Edit Feedback')).not.toBeInTheDocument();
  });

  it('allows toggling recipe favorites status', () => {
    renderRecipeDetail();

    const saveBtn = screen.getByText('Save');
    expect(saveBtn).toBeInTheDocument();

    fireEvent.click(saveBtn);
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});
