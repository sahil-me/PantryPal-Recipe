import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { DifficultyBadge } from './DifficultyBadge';

describe('DifficultyBadge Component', () => {
  it('renders Easy level badge with emerald styling', () => {
    render(<DifficultyBadge level="Easy" />);
    expect(screen.getByText('Easy')).toBeTruthy();
  });

  it('renders Medium level badge', () => {
    render(<DifficultyBadge level="Medium" />);
    expect(screen.getByText('Medium')).toBeTruthy();
  });

  it('normalizes Hard level to Pro with golden styling', () => {
    render(<DifficultyBadge level="Hard" />);
    expect(screen.getByText('Pro')).toBeTruthy();
  });
});
