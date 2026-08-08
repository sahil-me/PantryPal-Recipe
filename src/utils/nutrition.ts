import { Recipe, NutritionInfo } from '../types';

// Standard Reference Daily Values (based on FDA 2,000 calorie daily diet)
export const DAILY_VALUES = {
  calories: 2000, // kcal
  protein: 50,    // g
  carbs: 275,     // g
  fats: 78,       // g
  fiber: 28,      // g
  sodium: 2300    // mg
};

/**
 * Calculates or retrieves nutrition info scaled by the requested serving multiplier.
 */
export function getRecipeNutrition(recipe: Recipe, multiplier: number = 1): NutritionInfo & {
  proteinPct: number;
  carbsPct: number;
  fatsPct: number;
  caloriesPct: number;
  macroCaloriesRatio: { proteinRatio: number; carbsRatio: number; fatsRatio: number };
} {
  let base: NutritionInfo;

  if (recipe.nutrition) {
    base = { ...recipe.nutrition };
  } else {
    // Generate realistic estimation based on calories and recipe tags/dietary
    const cals = recipe.calories || 450;
    
    // Estimate macros based on tags/category
    let proteinG = Math.round((cals * 0.25) / 4); // 25% calories from protein
    let carbsG = Math.round((cals * 0.50) / 4);   // 50% calories from carbs
    let fatsG = Math.round((cals * 0.25) / 9);    // 25% calories from fat

    if (recipe.tags.includes('High Protein') || recipe.dietary.includes('Keto')) {
      proteinG = Math.round((cals * 0.35) / 4);
      carbsG = recipe.dietary.includes('Keto') ? Math.round((cals * 0.10) / 4) : Math.round((cals * 0.35) / 4);
      fatsG = Math.round((cals * 0.40) / 9);
    }

    base = {
      calories: cals,
      protein: proteinG,
      carbs: carbsG,
      fats: fatsG,
      fiber: Math.round(carbsG * 0.15),
      sodium: Math.round(cals * 1.2)
    };
  }

  // Apply multiplier
  const scaledCalories = Math.round(base.calories * multiplier);
  const scaledProtein = Math.round(base.protein * multiplier);
  const scaledCarbs = Math.round(base.carbs * multiplier);
  const scaledFats = Math.round(base.fats * multiplier);
  const scaledFiber = base.fiber ? Math.round(base.fiber * multiplier) : undefined;
  const scaledSodium = base.sodium ? Math.round(base.sodium * multiplier) : undefined;

  // % of Daily Values
  const caloriesPct = Math.min(100, Math.round((scaledCalories / DAILY_VALUES.calories) * 100));
  const proteinPct = Math.min(100, Math.round((scaledProtein / DAILY_VALUES.protein) * 100));
  const carbsPct = Math.min(100, Math.round((scaledCarbs / DAILY_VALUES.carbs) * 100));
  const fatsPct = Math.min(100, Math.round((scaledFats / DAILY_VALUES.fats) * 100));

  // Calculate Macro Energy Ratios (% of total calories from each macro)
  const proteinCals = scaledProtein * 4;
  const carbsCals = scaledCarbs * 4;
  const fatsCals = scaledFats * 9;
  const totalMacroCals = Math.max(1, proteinCals + carbsCals + fatsCals);

  const proteinRatio = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsRatio = Math.round((carbsCals / totalMacroCals) * 100);
  const fatsRatio = Math.max(0, 100 - proteinRatio - carbsRatio);

  return {
    calories: scaledCalories,
    protein: scaledProtein,
    carbs: scaledCarbs,
    fats: scaledFats,
    fiber: scaledFiber,
    sodium: scaledSodium,
    caloriesPct,
    proteinPct,
    carbsPct,
    fatsPct,
    macroCaloriesRatio: {
      proteinRatio,
      carbsRatio,
      fatsRatio
    }
  };
}
