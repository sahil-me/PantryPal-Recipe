import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PrintRecipeModal } from './PrintRecipeModal';
import { SAMPLE_RECIPES } from '../data/recipes';

describe('PrintRecipeModal Component', () => {
  const mockRecipe = SAMPLE_RECIPES[0];
  const mockOnClose = vi.fn();
  const mockShowToast = vi.fn();

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <PrintRecipeModal recipe={mockRecipe} isOpen={false} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders printable sheet modal with action buttons when open', () => {
    render(
      <PrintRecipeModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    expect(screen.getByText('Print Recipe Sheet')).toBeTruthy();
    expect(screen.getByText('Download Printable Sheet')).toBeTruthy();
    expect(screen.getByText('Copy Text')).toBeTruthy();
  });

  it('triggers window.print when Print Page is clicked', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    render(
      <PrintRecipeModal
        recipe={mockRecipe}
        isOpen={true}
        onClose={mockOnClose}
        showToast={mockShowToast}
      />
    );

    const printBtn = screen.getByRole('button', { name: /Print Page/i });
    fireEvent.click(printBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <PrintRecipeModal
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
