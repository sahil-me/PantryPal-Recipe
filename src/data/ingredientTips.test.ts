import { describe, it, expect } from 'vitest';
import { getIngredientTip, INGREDIENT_TIPS_CATALOG } from './ingredientTips';

describe('Ingredient Tips Utility', () => {
  it('returns catalog tips for exact and partial ingredient matches', () => {
    const garlicTip = getIngredientTip('Garlic cloves');
    expect(garlicTip.ingredientName).toBe('Garlic');
    expect(garlicTip.substitutions.length).toBeGreaterThan(0);
    expect(garlicTip.storageTip).toContain('cool, dark, dry');

    const butterTip = getIngredientTip('Unsalted Butter');
    expect(butterTip.ingredientName).toBe('Butter');
    expect(butterTip.substitutions).toContain('Coconut oil (1:1 swap in baking)');
  });

  it('generates category tips for unlisted dairy, herbs, or spices', () => {
    const herbTip = getIngredientTip('Fresh Rosemary');
    expect(herbTip.storageTip).toContain('water');
    expect(herbTip.substitutions).toBeDefined();

    const cheeseTip = getIngredientTip('Sharp Cheddar');
    expect(cheeseTip.storageTip).toContain('wax paper');
  });

  it('provides a safe fallback tip for unknown ingredients', () => {
    const mysteryTip = getIngredientTip('Exotic Dragon Fruit Extract');
    expect(mysteryTip.substitutions.length).toBeGreaterThan(0);
    expect(mysteryTip.storageTip).toContain('airtight container');
  });
});
