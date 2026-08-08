import { describe, it, expect } from 'vitest';
import { findPantrySubstitutions, getAllRecipePantrySubstitutions, isPantryItemMatch } from './substitutions';

describe('Pantry Substitutions Utility', () => {
  it('correctly detects matching pantry items for missing ingredients', () => {
    const pantry = ['Olive Oil', 'Garlic Powder', 'Eggs', 'Onion'];
    
    // Testing missing Butter with Olive Oil in pantry
    const butterSubs = findPantrySubstitutions('Butter', pantry);
    expect(butterSubs.hasPantryMatch).toBe(true);
    expect(butterSubs.pantryMatches.length).toBeGreaterThan(0);
    expect(butterSubs.pantryMatches[0].pantryItem).toBe('Olive Oil');

    // Testing missing Garlic with Garlic Powder in pantry
    const garlicSubs = findPantrySubstitutions('Garlic', pantry);
    expect(garlicSubs.hasPantryMatch).toBe(true);
    expect(garlicSubs.pantryMatches[0].pantryItem).toBe('Garlic Powder');
  });

  it('handles ingredients where no pantry substitute is available', () => {
    const pantry = ['Salt', 'Black Pepper'];
    
    const milkSubs = findPantrySubstitutions('Milk', pantry);
    expect(milkSubs.hasPantryMatch).toBe(false);
    expect(milkSubs.pantryMatches).toHaveLength(0);
    expect(milkSubs.otherSuggestions.length).toBeGreaterThan(0);
  });

  it('aggregates pantry substitutions for multiple missing ingredients', () => {
    const pantry = ['Olive Oil', 'Lime Juice', 'Cheddar Cheese'];
    const missing = [
      { ingredientName: 'Butter' },
      { ingredientName: 'Lemon' },
      { ingredientName: 'Parmesan' }
    ];

    const allSubs = getAllRecipePantrySubstitutions(missing, pantry);
    expect(allSubs.length).toBeGreaterThan(0);
    
    const missingIngredientNames = allSubs.map(s => s.ingredientName);
    expect(missingIngredientNames).toContain('Butter');
  });

  it('correctly matches token variations in isPantryItemMatch', () => {
    expect(isPantryItemMatch('Olive Oil', 'Extra virgin olive oil (3/4 tbsp per 1 tbsp butter)')).toBe(true);
    expect(isPantryItemMatch('Almond Milk', 'Oat milk or Almond milk (1:1)')).toBe(true);
    expect(isPantryItemMatch('Ketchup', 'Unsweetened applesauce')).toBe(false);
  });
});
