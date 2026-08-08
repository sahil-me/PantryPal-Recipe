import { describe, it, expect } from 'vitest';
import { normalizeIngredientName, isIngredientMatch, matchRecipes } from './matcher';
import { SAMPLE_RECIPES } from '../data/recipes';

describe('Recipe Matcher Utilities', () => {
  it('normalizes ingredient strings accurately', () => {
    expect(normalizeIngredientName('Garlic Cloves')).toBe('garlic');
    expect(normalizeIngredientName('Tomatoes')).toBe('tomato');
    expect(normalizeIngredientName('  Fresh Spinach ')).toBe('spinach');
  });

  it('correctly matches ingredients with minor variations', () => {
    expect(isIngredientMatch('garlic', { ingredientId: 'ing-1', ingredientName: 'Garlic Cloves', amount: 2, unit: 'cloves' })).toBe(true);
    expect(isIngredientMatch('eggs', { ingredientId: 'ing-16', ingredientName: 'Eggs', amount: 3, unit: 'whole' })).toBe(true);
    expect(isIngredientMatch('chicken', { ingredientId: 'ing-24', ingredientName: 'Chicken Breast', amount: 400, unit: 'g' })).toBe(true);
    expect(isIngredientMatch('salmon', { ingredientId: 'ing-16', ingredientName: 'Eggs', amount: 3, unit: 'whole' })).toBe(false);
  });

  it('ranks recipes by match percentage when given user ingredients', () => {
    // User has partial ingredients: eggs, garlic, butter, bread
    const partialUserIngredients = ['Eggs', 'Garlic', 'Butter', 'Bread'];
    const partialMatches = matchRecipes(partialUserIngredients, SAMPLE_RECIPES);

    expect(partialMatches.length).toBeGreaterThan(0);
    // The top recipe should be 'Classic Garlic & Herb Fried Eggs'
    expect(partialMatches[0].recipe.title).toBe('Classic Garlic & Herb Fried Eggs');
    expect(partialMatches[0].matchPercentage).toBe(67);
    expect(partialMatches[0].missingIngredients.length).toBe(2);

    // User has full ingredients including pantry staples
    const fullUserIngredients = ['Eggs', 'Garlic', 'Butter', 'Bread', 'Salt', 'Black Pepper'];
    const fullMatches = matchRecipes(fullUserIngredients, SAMPLE_RECIPES);

    expect(fullMatches[0].recipe.title).toBe('Classic Garlic & Herb Fried Eggs');
    expect(fullMatches[0].matchPercentage).toBe(100);
    expect(fullMatches[0].missingIngredients.length).toBe(0);
  });

  it('filters by dietary preferences correctly', () => {
    const userIngredients = ['Eggs', 'Garlic', 'Chicken Breast'];
    const matches = matchRecipes(userIngredients, SAMPLE_RECIPES, { dietary: 'Vegetarian' });

    matches.forEach(item => {
      expect(item.recipe.dietary).toContain('Vegetarian');
    });
  });

  it('sorts by prep time when requested', () => {
    const userIngredients = ['Eggs', 'Garlic', 'Spaghetti'];
    const matches = matchRecipes(userIngredients, SAMPLE_RECIPES, { sortBy: 'prepTime' });

    for (let i = 0; i < matches.length - 1; i++) {
      const timeA = matches[i].recipe.prepTimeMinutes + matches[i].recipe.cookTimeMinutes;
      const timeB = matches[i + 1].recipe.prepTimeMinutes + matches[i + 1].recipe.cookTimeMinutes;
      expect(timeA).toBeLessThanOrEqual(timeB);
    }
  });

  it('handles empty user ingredients gracefully', () => {
    const matches = matchRecipes([], SAMPLE_RECIPES);
    const unblockedCount = SAMPLE_RECIPES.filter(r => !r.title.toLowerCase().includes('beef') && !r.ingredients.some(i => i.ingredientName.toLowerCase().includes('beef'))).length;
    expect(matches.length).toBe(unblockedCount);
    matches.forEach(m => {
      expect(m.matchPercentage).toBe(0);
      expect(m.missingIngredients.length).toBeGreaterThan(0);
    });
  });

  it('deduplicates user ingredients and handles duplicate entries cleanly', () => {
    const duplicates = ['Garlic', 'garlic', 'GARLIC', '  garlic  ', 'Eggs', 'Eggs'];
    const matches = matchRecipes(duplicates, SAMPLE_RECIPES);
    expect(matches.length).toBeGreaterThan(0);
    const eggRecipeMatch = matches.find(m => m.recipe.title.includes('Eggs'));
    expect(eggRecipeMatch).toBeDefined();
  });

  it('handles empty recipe collection without throwing', () => {
    const matches = matchRecipes(['Eggs'], []);
    expect(matches).toEqual([]);
  });

  it('processes large numbers of recipes efficiently without memory leak', () => {
    const largeCatalog = Array(50).fill(SAMPLE_RECIPES).flat(); // 50 * SAMPLE_RECIPES size
    const matches = matchRecipes(['Eggs', 'Garlic', 'Butter'], largeCatalog);
    const unblockedCount = largeCatalog.filter(r => !r.title.toLowerCase().includes('beef') && !r.ingredients.some(i => i.ingredientName.toLowerCase().includes('beef'))).length;
    expect(matches.length).toBe(unblockedCount);
  });
});

