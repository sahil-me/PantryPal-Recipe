import { Recipe, MealCategory, DietaryPreference } from '../types';
import { SAMPLE_RECIPES } from '../data/recipes';
import { isBlockedRecipe } from '../utils/restrictionUtils';

export interface RecipeSearchOptions {
  ingredients?: string[];
  query?: string;
  category?: MealCategory;
  dietary?: DietaryPreference;
  number?: number;
}

export interface SearchApiResponse {
  success: boolean;
  source: 'spoonacular' | 'local';
  count?: number;
  recipes: Recipe[];
  notice?: string;
}

export interface SpoonacularStatusResponse {
  configured: boolean;
  message: string;
}

/**
 * Checks Spoonacular API status on backend
 */
export async function checkSpoonacularStatus(): Promise<SpoonacularStatusResponse> {
  try {
    const origin = typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
      ? window.location.origin
      : 'http://localhost:3000';
    const url = new URL('/api/spoonacular/status', origin).toString();
    const res = await fetch(url);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Recipe API] Failed to check Spoonacular status:', err);
  }
  return {
    configured: false,
    message: 'Could not communicate with backend service.'
  };
}

/**
 * Search recipes dynamically from Spoonacular API (via Express proxy)
 * or fallback to local curated recipes seamlessly.
 */
export async function searchRecipesApi(options: RecipeSearchOptions = {}): Promise<SearchApiResponse> {
  try {
    const params = new URLSearchParams();

    if (options.ingredients && options.ingredients.length > 0) {
      params.append('ingredients', options.ingredients.join(','));
    }
    if (options.query && options.query.trim()) {
      params.append('query', options.query.trim());
    }
    if (options.category && options.category !== 'All') {
      params.append('category', options.category);
    }
    if (options.dietary && options.dietary !== 'Any') {
      params.append('dietary', options.dietary);
    }
    if (options.number) {
      params.append('number', String(options.number));
    }

    const res = await fetch(`/api/recipes/search?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.recipes) && data.recipes.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('[Recipe API] Proxy search error, falling back to local dataset:', err);
  }

  const cleanSampleRecipes = SAMPLE_RECIPES.filter(r => !isBlockedRecipe(r));

  // Fallback to local recipes if API call fails or client is offline
  return {
    success: true,
    source: 'local',
    recipes: cleanSampleRecipes,
    notice: 'Local recipe dataset loaded'
  };
}

/**
 * Get single recipe details by ID
 */
export async function getRecipeByIdApi(recipeId: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`/api/recipes/${encodeURIComponent(recipeId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.recipe) {
        return data.recipe;
      }
    }
  } catch (err) {
    console.warn('[Recipe API] Recipe detail fetch error:', err);
  }

  // Local fallback
  return SAMPLE_RECIPES.find(r => r.id === recipeId) || null;
}
