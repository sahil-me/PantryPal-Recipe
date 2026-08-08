import { Recipe, MatchResult, FilterOptions, RecipeIngredient } from '../types';
import { isBlockedRecipe } from './restrictionUtils';

/**
 * Normalizes an ingredient string to facilitate flexible string matching.
 * e.g., "Garlic Cloves" -> "garlic", "Tomatoes" -> "tomato"
 */
export function normalizeIngredientName(name: string): string {
  if (!name) return '';
  let clean = name.trim().toLowerCase();
  
  // Remove common descriptors
  clean = clean.replace(/\b(cloves?|minced|sliced|chopped|fresh|whole|grated|shredded|ripe|peeled|diced|tbsp|tsp|cups?|g|ml|kg)\b/g, '');
  clean = clean.replace(/[^a-z0-9\s]/g, '').trim();

  // Simple singularization for common words
  if (clean.endsWith('oes')) {
    clean = clean.slice(0, -2); // e.g. tomatoes -> tomato
  } else if (clean.endsWith('s') && !clean.endsWith('ss')) {
    clean = clean.slice(0, -1);
  }

  return clean;
}

/**
 * Checks if a user ingredient matches a recipe ingredient name.
 */
export function isIngredientMatch(userIng: string | { raw: string; normalized: string }, recipeIng: RecipeIngredient): boolean {
  const normUser = typeof userIng === 'string' ? normalizeIngredientName(userIng) : userIng.normalized;
  const normRecipeName = normalizeIngredientName(recipeIng.ingredientName);
  
  if (!normUser || !normRecipeName) return false;

  return (
    normUser === normRecipeName ||
    normRecipeName.includes(normUser) ||
    normUser.includes(normRecipeName)
  );
}

/**
 * Matches a single recipe against user ingredients
 */
export function matchSingleRecipe(
  userIngredients: (string | { raw: string; normalized: string })[],
  recipe: Recipe
): MatchResult {
  const requiredIngredients = recipe.ingredients.filter(ing => !ing.optional);
  const totalRequired = requiredIngredients.length;

  const matchedIngredients: RecipeIngredient[] = [];
  const missingIngredients: RecipeIngredient[] = [];

  // Pre-normalize user ingredients if raw strings are passed
  const normalizedUserList = userIngredients.map(item =>
    typeof item === 'string' ? { raw: item, normalized: normalizeIngredientName(item) } : item
  );

  requiredIngredients.forEach(recipeIng => {
    const isMatched = normalizedUserList.some(userIng =>
      isIngredientMatch(userIng, recipeIng)
    );

    if (isMatched) {
      matchedIngredients.push(recipeIng);
    } else {
      missingIngredients.push(recipeIng);
    }
  });

  const matchedCount = matchedIngredients.length;
  const matchPercentage = totalRequired > 0 
    ? Math.round((matchedCount / totalRequired) * 100) 
    : 100;

  return {
    recipe,
    matchPercentage,
    matchedIngredients,
    missingIngredients,
    totalRequired,
    matchedCount
  };
}

export function matchRecipes(
  userIngredients: string[],
  recipes: Recipe[],
  filters?: FilterOptions
): MatchResult[] {
  // Always filter out blocked recipes across the application
  const allowedRecipes = (recipes || []).filter(recipe => !isBlockedRecipe(recipe));

  if (!userIngredients || userIngredients.length === 0) {
    // Return all allowed recipes with 0% match if no ingredients supplied
    return filterAndSortResults(
      allowedRecipes.map(recipe => matchSingleRecipe([], recipe)),
      filters
    );
  }

  // Pre-normalize user ingredients once for O(N) efficiency across all recipes
  const normalizedUserList = userIngredients.map(name => ({
    raw: name,
    normalized: normalizeIngredientName(name),
  }));

  const results: MatchResult[] = allowedRecipes.map(recipe =>
    matchSingleRecipe(normalizedUserList, recipe)
  );

  return filterAndSortResults(results, filters);
}

function filterAndSortResults(results: MatchResult[], filters?: FilterOptions): MatchResult[] {
  let filtered = [...results];

  if (!filters) {
    return sortResults(filtered, 'bestMatch');
  }

  // Dietary filter
  if (filters.dietary && filters.dietary !== 'Any') {
    filtered = filtered.filter(item =>
      item.recipe.dietary.includes(filters.dietary!)
    );
  }

  // Category filter
  if (filters.category && filters.category !== 'All') {
    filtered = filtered.filter(item =>
      item.recipe.category === filters.category
    );
  }

  // Difficulty filter
  if (filters.difficulty && filters.difficulty !== 'All') {
    filtered = filtered.filter(item => {
      const diff = item.recipe.difficulty;
      if (filters.difficulty === 'Hard' || (filters.difficulty as string) === 'Pro') {
        return diff === 'Hard' || (diff as string) === 'Pro';
      }
      return diff === filters.difficulty;
    });
  }

  // Max total cook/prep time filter
  if (filters.maxTotalTimeMinutes && filters.maxTotalTimeMinutes > 0) {
    filtered = filtered.filter(
      item => (item.recipe.prepTimeMinutes + item.recipe.cookTimeMinutes) <= filters.maxTotalTimeMinutes!
    );
  }

  // Text search query filter
  if (filters.query && filters.query.trim().length > 0) {
    const q = filters.query.trim().toLowerCase();
    filtered = filtered.filter(item =>
      item.recipe.title.toLowerCase().includes(q) ||
      item.recipe.description.toLowerCase().includes(q) ||
      item.recipe.cuisine.toLowerCase().includes(q) ||
      item.recipe.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  return sortResults(filtered, filters.sortBy || 'bestMatch');
}

function sortResults(results: MatchResult[], sortBy: 'bestMatch' | 'fewestMissing' | 'prepTime'): MatchResult[] {
  return results.sort((a, b) => {
    if (sortBy === 'fewestMissing') {
      if (a.missingIngredients.length !== b.missingIngredients.length) {
        return a.missingIngredients.length - b.missingIngredients.length;
      }
      return b.matchPercentage - a.matchPercentage;
    }

    if (sortBy === 'prepTime') {
      const timeA = a.recipe.prepTimeMinutes + a.recipe.cookTimeMinutes;
      const timeB = b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return b.matchPercentage - a.matchPercentage;
    }

    // Default: 'bestMatch'
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    // Tie-breaker: total matched count
    if (b.matchedCount !== a.matchedCount) {
      return b.matchedCount - a.matchedCount;
    }
    // Tie-breaker 2: shortest cook time
    const timeA = a.recipe.prepTimeMinutes + a.recipe.cookTimeMinutes;
    const timeB = b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes;
    return timeA - timeB;
  });
}
