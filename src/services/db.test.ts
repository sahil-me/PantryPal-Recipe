import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserPantry,
  saveUserPantry,
  getUserFavorites,
  toggleUserFavorite,
  getShoppingList,
  saveShoppingList,
  getUserProfile,
  updateUserProfile,
  syncGuestToUserAccount
} from './db';

describe('Warehouse Database Service Layer (Post Office Backend Adapter)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('fetches empty pantry for new guest user or default user', async () => {
    const pantry = await getUserPantry('guest-user');
    expect(Array.isArray(pantry)).toBe(true);
    expect(pantry.length).toBe(0);
  });

  it('persists and retrieves user-specific pantry items', async () => {
    const testUser = 'user-123';
    const newPantry = ['Garlic', 'Tomatoes', 'Olive Oil', 'Avocado'];
    
    await saveUserPantry(testUser, newPantry);
    const retrieved = await getUserPantry(testUser);
    
    expect(retrieved).toEqual(newPantry);
    expect(retrieved).not.toContain('Eggs');
  });

  it('manages saved user favorite recipes accurately', async () => {
    const userId = `user-fav-test-${Date.now()}`;
    const initialFavs = await getUserFavorites(userId);
    
    // Toggle a new recipe
    const updatedFavs = await toggleUserFavorite(userId, 'rec-99');
    expect(updatedFavs).toContain('rec-99');

    // Toggle off the same recipe
    const finalFavs = await toggleUserFavorite(userId, 'rec-99');
    expect(finalFavs).not.toContain('rec-99');
  });

  it('manages user shopping list items', async () => {
    const userId = 'user-789';
    const list = ['Fresh Basil', 'Parmesan Cheese'];
    
    await saveShoppingList(userId, list);
    const retrieved = await getShoppingList(userId);
    expect(retrieved).toEqual(list);
  });

  it('manages user profiles (Member key check)', async () => {
    const userId = `user-profile-test-${Date.now()}`;
    const profile = await getUserProfile(userId, 'Sous Chef', 'chef@pantrypal.com');
    
    expect(profile.id).toBe(userId);
    expect(profile.name).toBe('Sous Chef');
    expect(profile.membership).toBe('Member');

    const updated = await updateUserProfile(userId, { name: 'Head Chef Executive' });
    expect(updated.name).toBe('Head Chef Executive');
  });

  it('seamlessly merges guest walk-in mailbox items when signing into user account', async () => {
    const guestUser = 'guest-session';
    const authenticatedUser = 'user-202';

    // Guest adds unique ingredients
    await saveUserPantry(guestUser, ['Eggs', 'Dragon Fruit']);
    await toggleUserFavorite(guestUser, 'rec-guest-1');

    // Existing user has different ingredients
    await saveUserPantry(authenticatedUser, ['Garlic', 'Tomatoes']);

    // Merge guest session to authenticated member account
    const mergedPantry = await syncGuestToUserAccount(guestUser, authenticatedUser);
    
    expect(mergedPantry).toContain('Dragon Fruit');
    expect(mergedPantry).toContain('Garlic');
    expect(mergedPantry).toContain('Tomatoes');

    const userFavs = await getUserFavorites(authenticatedUser);
    expect(userFavs).toContain('rec-guest-1');
  });
});
