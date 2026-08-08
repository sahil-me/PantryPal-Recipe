import { getIngredientTip, IngredientTip } from '../data/ingredientTips';
import { normalizeIngredientName } from './matcher';

export interface PantrySubstitution {
  missingIngredient: string;
  pantryItem: string;
  substitutionNote: string;
  isPantryMatch: boolean;
}

export interface SubstitutionResult {
  ingredientName: string;
  hasPantryMatch: boolean;
  pantryMatches: PantrySubstitution[];
  otherSuggestions: PantrySubstitution[];
  storageTip?: string;
  proTip?: string;
}

/**
  * Matches candidate substitution text against a user's pantry item array.
  */
export function isPantryItemMatch(pantryItem: string, candidateNote: string): boolean {
  const normPantry = normalizeIngredientName(pantryItem);
  const normNote = candidateNote.toLowerCase();

  if (!normPantry || !normNote) return false;

  // Direct word or string inclusion
  if (normNote.includes(normPantry)) return true;

  // Keyword tokens check (e.g. "olive oil" in "extra virgin olive oil")
  const pantryTokens = normPantry.split(/\s+/).filter(t => t.length > 2);
  if (pantryTokens.length > 0) {
    const matchCount = pantryTokens.filter(token => normNote.includes(token)).length;
    if (matchCount === pantryTokens.length) return true;
  }

  return false;
}

/**
 * Finds substitution suggestions for a missing ingredient, cross-referencing user pantry contents.
 */
export function findPantrySubstitutions(
  missingIngredientName: string,
  pantryItems: string[] = []
): SubstitutionResult {
  const tip: IngredientTip = getIngredientTip(missingIngredientName);
  const pantryMatches: PantrySubstitution[] = [];
  const otherSuggestions: PantrySubstitution[] = [];

  const processedPantryMatches = new Set<string>();

  tip.substitutions.forEach((subNote) => {
    let matchedPantryItem: string | null = null;

    for (const pantryItem of pantryItems) {
      if (isPantryItemMatch(pantryItem, subNote)) {
        matchedPantryItem = pantryItem;
        break;
      }
    }

    if (matchedPantryItem) {
      pantryMatches.push({
        missingIngredient: missingIngredientName,
        pantryItem: matchedPantryItem,
        substitutionNote: subNote,
        isPantryMatch: true,
      });
      processedPantryMatches.add(matchedPantryItem);
    } else {
      // Extract a representative short name from the subNote
      const shortName = subNote.split('(')[0].trim();
      otherSuggestions.push({
        missingIngredient: missingIngredientName,
        pantryItem: shortName,
        substitutionNote: subNote,
        isPantryMatch: false,
      });
    }
  });

  return {
    ingredientName: tip.ingredientName || missingIngredientName,
    hasPantryMatch: pantryMatches.length > 0,
    pantryMatches,
    otherSuggestions,
    storageTip: tip.storageTip,
    proTip: tip.proTip,
  };
}

/**
 * Summarizes all available pantry substitutions across all missing ingredients in a recipe.
 */
export function getAllRecipePantrySubstitutions(
  missingIngredients: { ingredientName: string }[],
  pantryItems: string[]
): { ingredientName: string; substitution: PantrySubstitution }[] {
  const results: { ingredientName: string; substitution: PantrySubstitution }[] = [];

  missingIngredients.forEach((ing) => {
    const subResult = findPantrySubstitutions(ing.ingredientName, pantryItems);
    if (subResult.hasPantryMatch) {
      subResult.pantryMatches.forEach((pm) => {
        results.push({
          ingredientName: ing.ingredientName,
          substitution: pm,
        });
      });
    }
  });

  return results;
}
