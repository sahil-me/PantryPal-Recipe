import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RecipeFeedbackModal } from './RecipeFeedbackModal';
import { SAMPLE_RECIPES } from '../data/recipes';

vi.mock('../services/db', () => ({
  saveRecipeFeedback: vi.fn().mockResolvedValue(undefined),
  getRecipeFeedback: vi.fn().mockResolvedValue(null),
  savePublicTestimonial: vi.fn().mockResolvedValue(undefined),
}));

describe('RecipeFeedbackModal Component', () => {
  const mockRecipe = SAMPLE_RECIPES[0];
  const mockOnClose = vi.fn();
  const mockShowToast = vi.fn();
  const mockOnSubmitted = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <RecipeFeedbackModal
        recipe={mockRecipe}
        isOpen={false}
        onClose={mockOnClose}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders recipe feedback modal elements when open', () => {
    render(
      <RecipeFeedbackModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    expect(screen.getByText('How was your meal?')).toBeTruthy();
    expect(screen.getByText(/Overall Meal Rating/i)).toBeTruthy();
    expect(screen.getByText('Potential Improvements & Tweaks')).toBeTruthy();
    expect(screen.getByText(/First Name/i)).toBeTruthy();
    expect(screen.getByText('Submit Review')).toBeTruthy();
  });

  it('allows selecting improvement tags and writing notes', async () => {
    render(
      <RecipeFeedbackModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
        onSubmitted={mockOnSubmitted}
      />
    );

    // Fill required First Name
    const firstNameInput = screen.getByPlaceholderText(/e\.g\. Priya/i);
    fireEvent.change(firstNameInput, { target: { value: 'Alex' } });

    // Toggle an improvement pill
    const tag = screen.getByText('Adjust Salt / Seasoning');
    fireEvent.click(tag);

    // Enter notes
    const textarea = screen.getByPlaceholderText(/Tell other home cooks/i);
    fireEvent.change(textarea, { target: { value: 'Great dish, added extra garlic!' } });

    // Click submit
    const submitBtn = screen.getByText('Submit Review');
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  it('closes modal when skip or x button is clicked', () => {
    render(
      <RecipeFeedbackModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
      />
    );

    const skipBtn = screen.getByText('Skip');
    fireEvent.click(skipBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
