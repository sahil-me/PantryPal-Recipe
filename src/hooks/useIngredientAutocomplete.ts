import { useState, useRef, useEffect, useCallback } from 'react';
import { Ingredient } from '../types';
import { searchIngredients } from '../data/ingredients';

interface UseIngredientAutocompleteOptions {
  maxSuggestions?: number;
  onSelect?: (ingredientName: string) => void;
}

export function useIngredientAutocomplete(options: UseIngredientAutocompleteOptions = {}) {
  const { maxSuggestions = 8, onSelect } = options;
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const results = searchIngredients(query, maxSuggestions);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else if (query.trim().length > 0) {
      const results = searchIngredients(query, maxSuggestions);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }, [query, maxSuggestions]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSuggestion = useCallback(
    (name: string) => {
      onSelect?.(name);
      setQuery('');
      setIsOpen(false);
      setHighlightedIndex(-1);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  const clearQuery = useCallback(() => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    dropdownRef,
    inputRef,
    handleSelectSuggestion,
    clearQuery,
  };
}
