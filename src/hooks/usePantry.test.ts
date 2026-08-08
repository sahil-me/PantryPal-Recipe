import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { AppProvider } from '../context/AppContext';
import { usePantry } from './usePantry';

const wrapper = ({ children }: { children: React.ReactNode }) =>
  React.createElement(AuthProvider, null, React.createElement(AppProvider, null, children));

describe('usePantry custom hook', () => {
  it('returns pantry items and categories correctly', () => {
    const { result } = renderHook(() => usePantry(), { wrapper });

    act(() => {
      result.current.addToPantry('Garlic');
    });

    expect(Array.isArray(result.current.pantryItems)).toBe(true);
    expect(result.current.totalCount).toBeGreaterThan(0);
    expect(result.current.categorizedItems.length).toBeGreaterThan(0);
  });

  it('checks if an ingredient exists in pantry case-insensitively', () => {
    const { result } = renderHook(() => usePantry(), { wrapper });

    act(() => {
      result.current.addToPantry('garlic');
    });

    expect(result.current.hasIngredient('garlic')).toBe(true);
    expect(result.current.hasIngredient('GARLIC')).toBe(true);
    expect(result.current.hasIngredient('UnicornDust123')).toBe(false);
  });

  it('adds and removes ingredients from pantry state', () => {
    const { result } = renderHook(() => usePantry(), { wrapper });

    act(() => {
      result.current.addToPantry('Saffron');
    });

    expect(result.current.hasIngredient('Saffron')).toBe(true);

    act(() => {
      result.current.removeFromPantry('Saffron');
    });

    expect(result.current.hasIngredient('Saffron')).toBe(false);
  });
});
