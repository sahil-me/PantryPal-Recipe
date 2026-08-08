import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { AppProvider, useApp } from './AppContext';
import * as db from '../services/db';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>
    <AppProvider>{children}</AppProvider>
  </AuthProvider>
);

describe('Phase B: Context Integration with Warehouse Service Layer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads user data from Warehouse DB on mount', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    expect(result.current.pantryItems).toBeDefined();
    expect(result.current.favoriteIds).toBeDefined();
    expect(result.current.shoppingList).toBeDefined();
  });

  it('persists pantry additions via db.saveUserPantry', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    act(() => {
      result.current.addToPantry('Avocado');
    });

    expect(result.current.pantryItems).toContain('Avocado');
  });

  it('persists favorite toggles via db.toggleUserFavorite', async () => {
    const { result } = renderHook(() => useApp(), { wrapper });

    const initialFavsCount = result.current.favoriteIds.length;

    act(() => {
      result.current.toggleFavorite('rec-999');
    });

    expect(result.current.favoriteIds).toContain('rec-999');
    expect(result.current.favoriteIds.length).toBe(initialFavsCount + 1);
  });

  it('syncs guest mailbox items to member mailbox upon sign in', async () => {
    const { result } = renderHook(() => ({ auth: useAuth(), app: useApp() }), { wrapper });

    // Guest adds ingredient
    act(() => {
      result.current.app.addToPantry('Saffron');
    });

    expect(result.current.app.pantryItems).toContain('Saffron');

    // Sign in as Member
    await act(async () => {
      await result.current.auth.signIn('member.chef@pantrypal.com', 'password123');
    });

    expect(result.current.auth.isAuthenticated).toBe(true);
    expect(result.current.auth.user?.email).toBe('member.chef@pantrypal.com');
  });
});
