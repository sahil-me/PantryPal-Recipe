import { Recipe, RecipeIngredient, DifficultyLevel, MealCategory, DietaryPreference } from '../types';

export interface SpoonacularRecipeRaw {
  id: number;
  title: string;
  image?: string;
  summary?: string;
  readyInMinutes?: number;
  servings?: number;
  dishTypes?: string[];
  diets?: string[];
  cuisines?: string[];
  extendedIngredients?: {
    id: number;
    name: string;
    original?: string;
    amount?: number;
    unit?: string;
  }[];
  analyzedInstructions?: {
    name?: string;
    steps: { number: number; step: string }[];
  }[];
  instructions?: string;
  spoonacularScore?: number;
  aggregateLikes?: number;
  healthScore?: number;
  nutrition?: {
    nutrients?: { name: string; amount: number; unit: string }[];
  };
}

function stripHtml(html: string = ''): string {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

function determineDifficulty(readyInMinutes: number = 20, stepCount: number = 4): DifficultyLevel {
  if (readyInMinutes <= 15 && stepCount <= 5) return 'Easy';
  if (readyInMinutes <= 35 && stepCount <= 8) return 'Medium';
  if (readyInMinutes <= 60) return 'Hard';
  return 'Pro';
}

function mapCategory(dishTypes: string[] = []): MealCategory {
  const dtLower = dishTypes.map(d => d.toLowerCase());
  if (dtLower.some(d => d.includes('breakfast') || d.includes('brunch') || d.includes('morning'))) return 'Breakfast';
  if (dtLower.some(d => d.includes('dessert') || d.includes('sweet') || d.includes('cake'))) return 'Dessert';
  if (dtLower.some(d => d.includes('snack') || d.includes('appetizer') || d.includes('dip'))) return 'Snack';
  if (dtLower.some(d => d.includes('lunch'))) return 'Lunch';
  if (dtLower.some(d => d.includes('dinner') || d.includes('main course') || d.includes('main dish'))) return 'Dinner';
  return 'Dinner';
}

function mapDietary(diets: string[] = []): DietaryPreference[] {
  const result: DietaryPreference[] = [];
  const dietsLower = diets.map(d => d.toLowerCase());
  if (dietsLower.some(d => d.includes('vegetarian'))) result.push('Vegetarian');
  if (dietsLower.some(d => d.includes('vegan'))) result.push('Vegan');
  if (dietsLower.some(d => d.includes('gluten free') || d.includes('gluten-free'))) result.push('Gluten-Free');
  if (dietsLower.some(d => d.includes('dairy free') || d.includes('dairy-free'))) result.push('Dairy-Free');
  if (dietsLower.some(d => d.includes('ketogenic') || d.includes('keto'))) result.push('Keto');
  return result;
}

export function transformSpoonacularRecipe(raw: SpoonacularRecipeRaw): Recipe {
  const readyTime = raw.readyInMinutes || 20;
  const prepTime = Math.max(5, Math.floor(readyTime * 0.3));
  const cookTime = Math.max(5, Math.ceil(readyTime * 0.7));

  // Instructions
  let instructions: string[] = [];
  if (raw.analyzedInstructions && raw.analyzedInstructions.length > 0) {
    instructions = raw.analyzedInstructions.flatMap(block =>
      block.steps.map(s => s.step.trim()).filter(Boolean)
    );
  } else if (raw.instructions) {
    const cleanInst = stripHtml(raw.instructions);
    instructions = cleanInst.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 3);
  }
  if (instructions.length === 0) {
    instructions = [
      `Prepare ingredients as listed for ${raw.title}.`,
      'Follow standard cooking procedures to combine and heat ingredients.',
      'Season to taste and serve warm.'
    ];
  }

  // Ingredients
  const ingredients: RecipeIngredient[] = (raw.extendedIngredients || []).map(ing => {
    const name = ing.name ? (ing.name.charAt(0).toUpperCase() + ing.name.slice(1)) : (ing.original || 'Ingredient');
    return {
      ingredientId: `ing-sp-${ing.id || name.toLowerCase().replace(/\s+/g, '-')}`,
      ingredientName: name,
      amount: ing.amount ? Math.round(ing.amount * 100) / 100 : 1,
      unit: ing.unit || 'unit',
      optional: false
    };
  });

  // Nutrition
  let nutritionInfo = { calories: 400, protein: 18, carbs: 45, fats: 16, fiber: 4, sodium: 420 };
  if (raw.nutrition?.nutrients) {
    const findN = (n: string) => raw.nutrition?.nutrients?.find(item => item.name.toLowerCase().includes(n.toLowerCase()))?.amount || 0;
    nutritionInfo = {
      calories: Math.round(findN('calories')) || 400,
      protein: Math.round(findN('protein')) || 18,
      carbs: Math.round(findN('carbohydrates')) || 45,
      fats: Math.round(findN('fat')) || 16,
      fiber: Math.round(findN('fiber')) || 4,
      sodium: Math.round(findN('sodium')) || 420,
    };
  }

  const cleanDescription = raw.summary ? stripHtml(raw.summary).slice(0, 180) + '...' : `Delicious ${raw.title} recipe crafted for your pantry ingredients.`;

  let calculatedRating: number | undefined;
  if (typeof raw.spoonacularScore === 'number' && raw.spoonacularScore > 0) {
    calculatedRating = Math.min(5, Math.max(1, Math.round((raw.spoonacularScore / 20) * 10) / 10));
  }

  return {
    id: `sp-${raw.id}`,
    title: raw.title,
    description: cleanDescription,
    prepTimeMinutes: prepTime,
    cookTimeMinutes: cookTime,
    readyInMinutes: readyTime,
    rating: calculatedRating,
    servings: raw.servings || 2,
    difficulty: determineDifficulty(readyTime, instructions.length),
    category: mapCategory(raw.dishTypes),
    cuisine: (raw.cuisines && raw.cuisines.length > 0) ? raw.cuisines[0] : 'International',
    imageUrl: raw.image || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80',
    ingredients,
    instructions,
    tags: ['Featured', ...(raw.dishTypes || []).slice(0, 2), ...(raw.cuisines || []).slice(0, 1)],
    dietary: mapDietary(raw.diets),
    calories: nutritionInfo.calories,
    nutrition: nutritionInfo
  };
}
