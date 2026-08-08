import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const ProblemChild = ({ shouldThrow = true }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test culinary engine explosion');
  }
  return <div>Normal Content Rendered</div>;
};

describe('ErrorBoundary Component', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Normal Content Rendered')).toBeDefined();
  });

  it('catches render errors and displays dark luxury error UI', () => {
    // Suppress console.error output during deliberate test error throw
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Culinary Engine Interrupted')).toBeDefined();
    expect(screen.getByText(/your pantry ingredients and saved recipes remain safely preserved/i)).toBeDefined();
    expect(screen.getByText('Try Again')).toBeDefined();

    consoleSpy.mockRestore();
  });

  it('does not display technical error diagnostics to the user', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Technical Error Diagnostics')).toBeNull();
    expect(screen.queryByText(/Test culinary engine explosion/i)).toBeNull();

    consoleSpy.mockRestore();
  });
});
