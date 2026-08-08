import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useIngredientAutocomplete } from './useIngredientAutocomplete';

describe('useIngredientAutocomplete - Edge Cases & Validation', () => {
  it('returns empty suggestions for empty or whitespace-only queries', () => {
    const { result } = renderHook(() => useIngredientAutocomplete());

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.setQuery('     ');
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isOpen).toBe(false);
  });

  it('handles extremely long inputs gracefully without hanging', () => {
    const longString = 'garlic '.repeat(500); // 3500 chars
    const { result } = renderHook(() => useIngredientAutocomplete());

    act(() => {
      result.current.setQuery(longString);
    });

    expect(result.current.suggestions).toBeDefined();
    expect(result.current.isOpen).toBe(true);
  });

  it('safely handles special characters, script tags, and unicode emojis', () => {
    const { result } = renderHook(() => useIngredientAutocomplete());

    act(() => {
      result.current.setQuery("<script>alert('xss')</script> 🧄 %20");
    });

    expect(Array.isArray(result.current.suggestions)).toBe(true);
  });

  it('clears query and resets state on suggestion selection', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useIngredientAutocomplete({ onSelect }));

    act(() => {
      result.current.setQuery('garlic');
    });

    expect(result.current.suggestions.length).toBeGreaterThan(0);

    act(() => {
      result.current.handleSelectSuggestion('Garlic Powder');
    });

    expect(onSelect).toHaveBeenCalledWith('Garlic Powder');
    expect(result.current.query).toBe('');
    expect(result.current.isOpen).toBe(false);
  });
});
