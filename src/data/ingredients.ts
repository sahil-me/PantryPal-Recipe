import { Ingredient } from '../types';
import { containsBlockedIngredient } from '../utils/restrictionUtils';

export const COMMON_INGREDIENTS: Ingredient[] = [
  // Produce (28 items)
  { id: 'ing-1', name: 'Garlic', category: 'Produce' },
  { id: 'ing-2', name: 'Onion', category: 'Produce' },
  { id: 'ing-3', name: 'Tomatoes', category: 'Produce' },
  { id: 'ing-4', name: 'Spinach', category: 'Produce' },
  { id: 'ing-5', name: 'Lemon', category: 'Produce' },
  { id: 'ing-6', name: 'Bell Pepper', category: 'Produce' },
  { id: 'ing-7', name: 'Potatoes', category: 'Produce' },
  { id: 'ing-8', name: 'Carrots', category: 'Produce' },
  { id: 'ing-9', name: 'Avocado', category: 'Produce' },
  { id: 'ing-10', name: 'Broccoli', category: 'Produce' },
  { id: 'ing-11', name: 'Ginger', category: 'Produce' },
  { id: 'ing-12', name: 'Coriander / Cilantro', category: 'Produce' },
  { id: 'ing-13', name: 'Basil', category: 'Produce' },
  { id: 'ing-14', name: 'Mushroom', category: 'Produce' },
  { id: 'ing-15', name: 'Zucchini', category: 'Produce' },
  { id: 'ing-15b', name: 'Lime', category: 'Produce' },
  { id: 'ing-15c', name: 'Cucumber', category: 'Produce' },
  { id: 'ing-15d', name: 'Sweet Potato', category: 'Produce' },
  { id: 'ing-15e', name: 'Spring Onion / Green Onion', category: 'Produce' },
  { id: 'ing-15f', name: 'Parsley', category: 'Produce' },
  { id: 'ing-15g', name: 'Jalapeño', category: 'Produce' },
  { id: 'ing-15h', name: 'Cauliflower', category: 'Produce' },
  { id: 'ing-15i', name: 'Kale', category: 'Produce' },
  { id: 'ing-15j', name: 'Eggplant', category: 'Produce' },
  { id: 'ing-15k', name: 'Asparagus', category: 'Produce' },
  { id: 'ing-15l', name: 'Celery', category: 'Produce' },
  { id: 'ing-15m', name: 'Lettuce', category: 'Produce' },
  { id: 'ing-15n', name: 'Green Beans', category: 'Produce' },

  // Dairy & Eggs (16 items)
  { id: 'ing-16', name: 'Eggs', category: 'Dairy & Eggs' },
  { id: 'ing-17', name: 'Butter', category: 'Dairy & Eggs' },
  { id: 'ing-18', name: 'Milk', category: 'Dairy & Eggs' },
  { id: 'ing-19', name: 'Cheddar Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-20', name: 'Parmesan Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-21', name: 'Mozzarella Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-22', name: 'Heavy Cream', category: 'Dairy & Eggs' },
  { id: 'ing-23', name: 'Greek Yogurt', category: 'Dairy & Eggs' },
  { id: 'ing-23b', name: 'Feta Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-23c', name: 'Sour Cream', category: 'Dairy & Eggs' },
  { id: 'ing-23d', name: 'Cream Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-23e', name: 'Ricotta Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-23f', name: 'Buttermilk', category: 'Dairy & Eggs' },
  { id: 'ing-23g', name: 'Brie Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-23h', name: 'Gouda Cheese', category: 'Dairy & Eggs' },
  { id: 'ing-23i', name: 'Condensed Milk', category: 'Dairy & Eggs' },

  // Meat & Poultry (12 items)
  { id: 'ing-24', name: 'Chicken Breast', category: 'Meat & Poultry' },
  { id: 'ing-25', name: 'Ground Beef', category: 'Meat & Poultry' },
  { id: 'ing-26', name: 'Bacon', category: 'Meat & Poultry' },
  { id: 'ing-27', name: 'Sausage', category: 'Meat & Poultry' },
  { id: 'ing-28', name: 'Chicken Thighs', category: 'Meat & Poultry' },
  { id: 'ing-28b', name: 'Turkey Ground', category: 'Meat & Poultry' },
  { id: 'ing-28c', name: 'Pork Chops', category: 'Meat & Poultry' },
  { id: 'ing-28d', name: 'Beef Steak', category: 'Meat & Poultry' },
  { id: 'ing-28e', name: 'Lamb Chops', category: 'Meat & Poultry' },
  { id: 'ing-28f', name: 'Duck Breast', category: 'Meat & Poultry' },
  { id: 'ing-28g', name: 'Prosciutto', category: 'Meat & Poultry' },
  { id: 'ing-28h', name: 'Pork Belly', category: 'Meat & Poultry' },

  // Seafood (18 items)
  { id: 'ing-29', name: 'Salmon', category: 'Seafood' },
  { id: 'ing-30', name: 'Shrimp', category: 'Seafood' },
  { id: 'ing-31', name: 'Canned Tuna', category: 'Seafood' },
  { id: 'ing-31b', name: 'Cod / White Fish', category: 'Seafood' },
  { id: 'ing-31c', name: 'Crab Meat', category: 'Seafood' },
  { id: 'ing-31d', name: 'Lobster Tail', category: 'Seafood' },
  { id: 'ing-31e', name: 'Scallops', category: 'Seafood' },
  { id: 'ing-31f', name: 'Clams', category: 'Seafood' },
  { id: 'ing-31g', name: 'Mussels', category: 'Seafood' },
  { id: 'ing-31h', name: 'Anchovies', category: 'Seafood' },
  { id: 'ing-31i', name: 'Squid / Calamari', category: 'Seafood' },
  { id: 'ing-31j', name: 'Halibut', category: 'Seafood' },
  { id: 'ing-31k', name: 'Trout', category: 'Seafood' },
  { id: 'ing-31l', name: 'Sardines', category: 'Seafood' },
  { id: 'ing-31m', name: 'Octopus', category: 'Seafood' },
  { id: 'ing-31n', name: 'Sea Bass', category: 'Seafood' },
  { id: 'ing-31o', name: 'Tilapia', category: 'Seafood' },
  { id: 'ing-31p', name: 'Caviar', category: 'Seafood' },

  // Grains & Pasta
  { id: 'ing-32', name: 'White Rice', category: 'Grains & Pasta' },
  { id: 'ing-33', name: 'Spaghetti', category: 'Grains & Pasta' },
  { id: 'ing-34', name: 'Penne Pasta', category: 'Grains & Pasta' },
  { id: 'ing-35', name: 'Bread', category: 'Grains & Pasta' },
  { id: 'ing-36', name: 'Tortillas', category: 'Grains & Pasta' },
  { id: 'ing-37', name: 'Oats', category: 'Grains & Pasta' },
  { id: 'ing-38', name: 'Quinoa', category: 'Grains & Pasta' },
  { id: 'ing-38b', name: 'Brown Rice', category: 'Grains & Pasta' },
  { id: 'ing-38c', name: 'Ramen Noodles', category: 'Grains & Pasta' },
  { id: 'ing-38d', name: 'Couscous', category: 'Grains & Pasta' },

  // Oils & Condiments
  { id: 'ing-39', name: 'Olive Oil', category: 'Oils & Condiments' },
  { id: 'ing-40', name: 'Soy Sauce', category: 'Oils & Condiments' },
  { id: 'ing-41', name: 'Mayonnaise', category: 'Oils & Condiments' },
  { id: 'ing-42', name: 'Mustard', category: 'Oils & Condiments' },
  { id: 'ing-43', name: 'Hot Sauce / Sriracha', category: 'Oils & Condiments' },
  { id: 'ing-44', name: 'Honey', category: 'Oils & Condiments' },
  { id: 'ing-45', name: 'Vinegar', category: 'Oils & Condiments' },
  { id: 'ing-45b', name: 'Sesame Oil', category: 'Oils & Condiments' },
  { id: 'ing-45c', name: 'Maple Syrup', category: 'Oils & Condiments' },
  { id: 'ing-45d', name: 'Balsamic Vinegar', category: 'Oils & Condiments' },
  { id: 'ing-45e', name: 'Peanut Butter', category: 'Oils & Condiments' },

  // Pantry & Spices
  { id: 'ing-46', name: 'Salt', category: 'Pantry & Spices' },
  { id: 'ing-47', name: 'Black Pepper', category: 'Pantry & Spices' },
  { id: 'ing-48', name: 'All-Purpose Flour', category: 'Pantry & Spices' },
  { id: 'ing-49', name: 'Sugar', category: 'Pantry & Spices' },
  { id: 'ing-50', name: 'Cumin', category: 'Pantry & Spices' },
  { id: 'ing-51', name: 'Paprika', category: 'Pantry & Spices' },
  { id: 'ing-52', name: 'Oregano', category: 'Pantry & Spices' },
  { id: 'ing-53', name: 'Chili Flakes', category: 'Pantry & Spices' },
  { id: 'ing-54', name: 'Black Beans', category: 'Pantry & Spices' },
  { id: 'ing-55', name: 'Chickpeas', category: 'Pantry & Spices' },
  { id: 'ing-56', name: 'Tomato Paste', category: 'Pantry & Spices' },
  { id: 'ing-57', name: 'Canned Tomatoes', category: 'Pantry & Spices' },
  { id: 'ing-58', name: 'Baking Powder', category: 'Pantry & Spices' },
  { id: 'ing-59', name: 'Cinnamon', category: 'Pantry & Spices' },
  { id: 'ing-60', name: 'Coconut Milk', category: 'Pantry & Spices' },
  { id: 'ing-61', name: 'Curry Powder', category: 'Pantry & Spices' },
  { id: 'ing-62', name: 'Nutmeg', category: 'Pantry & Spices' },
  { id: 'ing-63', name: 'Cornstarch', category: 'Pantry & Spices' },
  { id: 'ing-64', name: 'Garlic Powder', category: 'Pantry & Spices' },
  { id: 'ing-65', name: 'Onion Powder', category: 'Pantry & Spices' }
];

export const POPULAR_INGREDIENTS = [
  'Eggs',
  'Garlic',
  'Onion',
  'Tomatoes',
  'Chicken Breast',
  'Olive Oil',
  'Cheddar Cheese',
  'White Rice',
  'Spaghetti',
  'Spinach',
  'Butter',
  'Avocado',
];

export function searchIngredients(query: string, maxResults = 10): Ingredient[] {
  if (!query || query.trim().length === 0) return [];
  const cleanQuery = query.trim().toLowerCase();
  const searchKey = cleanQuery.length > 50 ? cleanQuery.split(' ')[0] : cleanQuery;

  return COMMON_INGREDIENTS.filter(item =>
    !containsBlockedIngredient(item.name) && (item.name.toLowerCase().includes(searchKey) || item.name.toLowerCase().includes(cleanQuery))
  ).slice(0, maxResults);
}
