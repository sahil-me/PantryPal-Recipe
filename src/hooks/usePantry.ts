import { useMemo } from 'react';
import { useApp } from '../context/AppContext';

export interface PantryCategoryGroup {
  category: string;
  items: string[];
}

export interface UsePantryReturn {
  pantryItems: string[];
  addToPantry: (name: string) => void;
  removeFromPantry: (name: string) => void;
  setPantryItems: (items: string[]) => void;
  clearPantry: () => void;
  totalCount: number;
  categorizedItems: PantryCategoryGroup[];
  hasIngredient: (name: string) => boolean;
}

const CATEGORY_MAP: Record<string, string[]> = {
  'Proteins & Meats': ['chicken', 'beef', 'pork', 'eggs', 'salmon', 'tuna', 'shrimp', 'tofu', 'turkey', 'bacon'],
  'Dairy & Refrigerated': ['milk', 'butter', 'cheddar cheese', 'mozzarella', 'parmesan', 'heavy cream', 'greek yogurt', 'cream cheese', 'sour cream'],
  'Produce & Herbs': ['garlic', 'onion', 'tomatoes', 'basil', 'lemon', 'spinach', 'carrots', 'bell pepper', 'potatoes', 'avocado', 'parsley'],
  'Grains & Bakery': ['bread', 'spaghetti', 'rice', 'pasta', 'flour', 'tortillas', 'oats', 'quinoa', 'breadcrumbs'],
  'Pantry & Oils': ['olive oil', 'vegetable oil', 'salt', 'black pepper', 'soy sauce', 'honey', 'sugar', 'baking powder', 'baking soda', 'vinegar', 'mustard']
};

export function usePantry(): UsePantryReturn {
  const { pantryItems, addToPantry, removeFromPantry, setPantryItems, showToast } = useApp();

  const clearPantry = () => {
    const previous = [...pantryItems];
    setPantryItems([]);
    showToast('Pantry cleared', 'info', () => {
      setPantryItems(previous);
    });
  };

  const hasIngredient = (name: string): boolean => {
    return pantryItems.some(item => item.toLowerCase() === name.toLowerCase());
  };

  const categorizedItems = useMemo(() => {
    const groups: Record<string, string[]> = {
      'Proteins & Meats': [],
      'Dairy & Refrigerated': [],
      'Produce & Herbs': [],
      'Grains & Bakery': [],
      'Pantry & Oils': [],
      'Other Ingredients': []
    };

    pantryItems.forEach(item => {
      const lower = item.toLowerCase();
      let matchedCategory = 'Other Ingredients';

      for (const [catName, keywords] of Object.entries(CATEGORY_MAP)) {
        if (keywords.some(k => lower.includes(k) || k.includes(lower))) {
          matchedCategory = catName;
          break;
        }
      }

      groups[matchedCategory].push(item);
    });

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([category, items]) => ({ category, items }));
  }, [pantryItems]);

  return {
    pantryItems,
    addToPantry,
    removeFromPantry,
    setPantryItems,
    clearPantry,
    totalCount: pantryItems.length,
    categorizedItems,
    hasIngredient,
  };
}
