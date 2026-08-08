export type DietaryPreference = 'Vegetarian' | 'Vegan' | 'Gluten-Free' | 'Dairy-Free' | 'Keto' | 'Any';
export type MealCategory = 'All' | 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack' | 'Dessert';
export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Pro';
export type ThemeMode = 'dark' | 'hc-dark' | 'hc-light' | 'hc-cobalt';

export interface Ingredient {
  id: string;
  name: string;
  category: 'Produce' | 'Dairy & Eggs' | 'Pantry & Spices' | 'Meat & Poultry' | 'Seafood' | 'Grains & Pasta' | 'Oils & Condiments';
  commonUnit?: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  amount: number | string;
  unit: string;
  optional?: boolean;
}

export interface NutritionInfo {
  calories: number; // kcal per serving
  protein: number;  // grams per serving
  carbs: number;    // grams per serving
  fats: number;     // grams per serving
  fiber?: number;   // grams per serving
  sodium?: number;  // mg per serving
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: DifficultyLevel;
  category: MealCategory;
  cuisine: string;
  imageUrl: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];
  dietary: DietaryPreference[];
  readyInMinutes?: number;
  rating?: number;
  calories?: number;
  nutrition?: NutritionInfo;
}

export interface MatchResult {
  recipe: Recipe;
  matchPercentage: number;
  matchedIngredients: RecipeIngredient[];
  missingIngredients: RecipeIngredient[];
  totalRequired: number;
  matchedCount: number;
}

export interface FilterOptions {
  dietary?: DietaryPreference;
  category?: MealCategory;
  difficulty?: DifficultyLevel | 'All';
  maxTotalTimeMinutes?: number;
  sortBy?: 'bestMatch' | 'fewestMissing' | 'prepTime';
  query?: string;
}

export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface WeeklyMealPlan {
  Monday: string[];
  Tuesday: string[];
  Wednesday: string[];
  Thursday: string[];
  Friday: string[];
  Saturday: string[];
  Sunday: string[];
  [key: string]: string[];
}

export interface RecipeFeedback {
  recipeId: string;
  rating: number; // 1 to 5
  firstName?: string;
  lastName?: string;
  city?: string;
  stateCountry?: string;
  title?: string;
  reviewText?: string;
  notes?: string;
  recommend?: boolean;
  publicPermission?: boolean;
  improvements?: string[];
  cookedAt?: string;
  status?: 'pending' | 'approved' | 'rejected';
}

// User & Role Shapes
export type UserRole = 'guest' | 'member' | 'vip';

export interface UserSession {
  userId: string;
  role: UserRole;
  email?: string;
  name?: string;
  isAuthenticated: boolean;
}

export interface DbOperationResult<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Web Speech API Types
export interface ISpeechRecognitionResult {
  readonly length: number;
  [index: number]: {
    readonly transcript: string;
    readonly confidence: number;
  };
}

export interface ISpeechRecognitionResultList {
  readonly length: number;
  [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: ISpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent {
  readonly error: string;
  readonly message?: string;
}

export interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognitionInstance;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}


