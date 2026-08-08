import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShareRecipeModal } from './ShareRecipeModal';
import { SAMPLE_RECIPES } from '../data/recipes';

describe('ShareRecipeModal Component', () => {
  const mockRecipe = SAMPLE_RECIPES[0];
  const mockOnClose = vi.fn();
  const mockShowToast = vi.fn();

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <ShareRecipeModal recipe={mockRecipe} isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with social summary and platform buttons when open', () => {
    render(
      <ShareRecipeModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    expect(screen.getByText('Share Recipe Summary')).toBeTruthy();
    expect(screen.getByText('Formatted text and visual cards optimized for social media posts')).toBeTruthy();
    expect(screen.getByText('WhatsApp')).toBeTruthy();
    expect(screen.getByText('X / Twitter')).toBeTruthy();
    expect(screen.getByText('Download Image Card')).toBeTruthy();
  });

  it('switches format tabs correctly', () => {
    render(
      <ShareRecipeModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    const tweetTab = screen.getByText('🐦 Tweet / Short');
    fireEvent.click(tweetTab);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toContain(`Making ${mockRecipe.title}`);
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ShareRecipeModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    const closeBtn = screen.getByTitle('Close modal');
    fireEvent.click(closeBtn);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
