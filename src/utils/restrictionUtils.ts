/**
 * Centralized configuration for blocked ingredients across PantryPal.
 * Allows easy extension for additional restricted ingredients in the future.
 */
export const BLOCKED_INGREDIENTS: string[] = ['beef'];

/**
 * Common beef-related terms and keywords for robust detection.
 */
export const BLOCKED_KEYWORDS: string[] = [
  'beef',
  'steak',
  'ground beef',
  'minced beef',
  'beef mince',
  'roast beef',
  'beef curry',
  'beef burger',
  'beef stew',
  'beef taco',
  'beef ribs',
  'brisket',
  'sirloin',
  'tenderloin',
  'ribeye',
  'corned beef',
  'veal'
];

/**
 * Checks if a query, ingredient name, or string contains any blocked ingredient term.
 * Case-insensitive, singular/plural, handles extra spaces and compound words.
 */
export function containsBlockedIngredient(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  const clean = text.trim().toLowerCase();
  if (!clean) return false;

  return BLOCKED_INGREDIENTS.some(blocked => {
    const b = blocked.toLowerCase();
    // Match exact word, boundary, or compound term
    const regex = new RegExp(`\\b${b}(s|es)?\\b`, 'i');
    return regex.test(clean) || clean.includes(b);
  });
}

/**
 * Checks if an array of ingredients contains any blocked ingredient.
 */
export function hasBlockedIngredientInList(ingredients: (string | { ingredientName?: string; raw?: string })[]): boolean {
  if (!ingredients || ingredients.length === 0) return false;
  return ingredients.some(item => {
    if (typeof item === 'string') return containsBlockedIngredient(item);
    if (item.ingredientName) return containsBlockedIngredient(item.ingredientName);
    if (item.raw) return containsBlockedIngredient(item.raw);
    return false;
  });
}

/**
 * Checks if a recipe object contains any blocked ingredients in its title,
 * description, cuisine, tags, or ingredient list.
 */
export function isBlockedRecipe(recipe: {
  title: string;
  description?: string;
  cuisine?: string;
  tags?: string[];
  ingredients?: { ingredientName: string }[];
}): boolean {
  if (!recipe) return false;
  if (containsBlockedIngredient(recipe.title)) return true;
  if (recipe.description && containsBlockedIngredient(recipe.description)) return true;
  if (recipe.cuisine && containsBlockedIngredient(recipe.cuisine)) return true;
  if (recipe.tags && recipe.tags.some(tag => containsBlockedIngredient(tag))) return true;
  if (recipe.ingredients && recipe.ingredients.some(ing => containsBlockedIngredient(ing.ingredientName))) return true;
  return false;
}
