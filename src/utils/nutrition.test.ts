import { describe, it, expect } from 'vitest';
import { getRecipeNutrition, DAILY_VALUES } from './nutrition';
import { Recipe } from '../types';

const mockRecipe: Recipe = {
  id: 'test-1',
  title: 'Test Dish',
  description: 'A test dish',
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  servings: 2,
  difficulty: 'Easy',
  category: 'Dinner',
  cuisine: 'American',
  imageUrl: 'https://example.com/image.jpg',
  ingredients: [],
  instructions: ['Step 1'],
  tags: ['High Protein'],
  dietary: ['Gluten-Free'],
  calories: 500,
  nutrition: {
    calories: 500,
    protein: 30,
    carbs: 50,
    fats: 20,
    fiber: 5,
    sodium: 600
  }
};

describe('Nutrition Utility', () => {
  it('calculates accurate values for 1x serving multiplier', () => {
    const nutrition = getRecipeNutrition(mockRecipe, 1);
    expect(nutrition.calories).toBe(500);
    expect(nutrition.protein).toBe(30);
    expect(nutrition.carbs).toBe(50);
    expect(nutrition.fats).toBe(20);
    expect(nutrition.caloriesPct).toBe(25); // 500 / 2000 = 25%
    expect(nutrition.proteinPct).toBe(60);  // 30 / 50 = 60%
    expect(nutrition.carbsPct).toBe(18);    // 50 / 275 = 18.18%
    expect(nutrition.fatsPct).toBe(26);     // 20 / 78 = 25.64% -> 26%
  });

  it('scales values proportionally when serving multiplier is changed', () => {
    const nutrition = getRecipeNutrition(mockRecipe, 2);
    expect(nutrition.calories).toBe(1000);
    expect(nutrition.protein).toBe(60);
    expect(nutrition.carbs).toBe(100);
    expect(nutrition.fats).toBe(40);
    expect(nutrition.caloriesPct).toBe(50);
  });

  it('computes realistic estimates if nutrition field is missing', () => {
    const recipeWithoutNutrition: Recipe = {
      ...mockRecipe,
      nutrition: undefined,
      calories: 400
    };

    const nutrition = getRecipeNutrition(recipeWithoutNutrition, 1);
    expect(nutrition.calories).toBe(400);
    expect(nutrition.protein).toBeGreaterThan(0);
    expect(nutrition.carbs).toBeGreaterThan(0);
    expect(nutrition.fats).toBeGreaterThan(0);
  });
});
