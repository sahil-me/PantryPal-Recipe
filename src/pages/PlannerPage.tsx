import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SAMPLE_RECIPES } from '../data/recipes';
import { matchSingleRecipe } from '../utils/matcher';
import { getRecipeFallbackImage } from '../utils/imageUtils';
import { getWeeklyMealPlan, saveWeeklyMealPlan } from '../services/db';
import { Recipe, MatchResult } from '../types';
import {
  Calendar,
  Plus,
  Trash2,
  Sparkles,
  ShoppingBag,
  ChefHat,
  Heart,
  X,
  Check,
  Clock,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Info
} from 'lucide-react';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

type DayName = typeof DAYS_OF_WEEK[number];

export const PlannerPage: React.FC = () => {
  const { favoriteIds, pantryItems, navigateTo, addToShoppingList, showToast, allRecipes } = useApp();
  const { user, requireAuth, openAuthModal } = useAuth();
  const userId = user?.id || 'guest-session';

  const [mealPlan, setMealPlan] = useState<Record<string, string[]>>({
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [selectedDayForAssign, setSelectedDayForAssign] = useState<DayName | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load initial meal plan from storage
  useEffect(() => {
    getWeeklyMealPlan(userId).then((plan) => {
      setMealPlan(plan);
      setIsLoading(false);
    });
  }, [userId]);

  // Persist meal plan when changed
  const updatePlan = (newPlan: Record<string, string[]>) => {
    setMealPlan(newPlan);
    saveWeeklyMealPlan(userId, newPlan);
  };

  const recipesPool = allRecipes.length > 0 ? allRecipes : SAMPLE_RECIPES;

  // Saved favorite recipes matched against active pantry
  const favoriteMatchedRecipes = useMemo(() => {
    const favRecipes = recipesPool.filter((r) => favoriteIds.includes(r.id));
    return favRecipes.map((r) => matchSingleRecipe(pantryItems, r));
  }, [favoriteIds, pantryItems, recipesPool]);

  // Fallback recipes if user has no favorites yet
  const fallbackMatchedRecipes = useMemo(() => {
    return recipesPool.slice(0, 8).map((r) => matchSingleRecipe(pantryItems, r));
  }, [pantryItems, recipesPool]);

  const assignableRecipes = favoriteMatchedRecipes.length > 0
    ? favoriteMatchedRecipes
    : fallbackMatchedRecipes;

  // Filtered assignable recipes in modal
  const filteredAssignable = useMemo(() => {
    if (!searchQuery.trim()) return assignableRecipes;
    const q = searchQuery.toLowerCase();
    return assignableRecipes.filter(
      (m) =>
        m.recipe.title.toLowerCase().includes(q) ||
        m.recipe.category.toLowerCase().includes(q) ||
        m.recipe.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [assignableRecipes, searchQuery]);

  // Assign a recipe to a day with Auth Gate
  const handleAssignRecipe = (day: DayName, recipeId: string) => {
    if (!user) {
      requireAuth(() => {
        handleAssignRecipe(day, recipeId);
      }, "Sign up for a free PantryPal account to assign and save weekly meal schedules!");
      return;
    }

    const current = mealPlan[day] || [];
    if (current.includes(recipeId)) {
      showToast(`This recipe is already assigned to ${day}!`, 'info');
      return;
    }
    const updated = {
      ...mealPlan,
      [day]: [...current, recipeId],
    };
    updatePlan(updated);
    const recipeObj = recipesPool.find((r) => r.id === recipeId);
    showToast(`Assigned "${recipeObj?.title || 'Recipe'}" to ${day}!`, 'success');
    setSelectedDayForAssign(null);
  };

  // Auto-Plan Week with highest matching recipes
  const handleAutoPlanWeek = () => {
    if (!user) {
      requireAuth(() => {
        handleAutoPlanWeek();
      }, "Sign up for a free PantryPal account to auto-generate and save your weekly meal plan!");
      return;
    }

    const sortedRecipes = [...recipesPool]
      .map((r) => matchSingleRecipe(pantryItems, r))
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    if (sortedRecipes.length === 0) {
      showToast('No recipes found to auto-plan.', 'info');
      return;
    }

    const newPlan: Record<string, string[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };

    DAYS_OF_WEEK.forEach((day, idx) => {
      const matchObj = sortedRecipes[idx % sortedRecipes.length];
      if (matchObj) {
        newPlan[day] = [matchObj.recipe.id];
      }
    });

    updatePlan(newPlan);
    showToast('Auto-generated a meal plan using your best pantry-matched recipes!', 'success');
  };

  // Remove a recipe from a day
  const handleRemoveFromDay = (day: DayName, recipeId: string) => {
    const current = mealPlan[day] || [];
    const updated = {
      ...mealPlan,
      [day]: current.filter((id) => id !== recipeId),
    };
    updatePlan(updated);
    showToast(`Removed recipe from ${day}.`, 'info');
  };

  // Clear entire week
  const handleClearWeek = () => {
    if (!user) {
      requireAuth(() => {
        handleClearWeek();
      }, "Sign up for a free PantryPal account to customize and save your weekly meal schedule!");
      return;
    }

    const emptyPlan = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    updatePlan(emptyPlan);
    showToast('Weekly meal plan cleared!', 'info');
  };

  const todayName = useMemo(() => {
    return new Date().toLocaleDateString('en-US', { weekday: 'long' });
  }, []);

  // Total planned meals count across the week
  const totalPlannedMeals = useMemo(() => {
    return Object.values(mealPlan).reduce((acc: number, list: string[]) => acc + list.length, 0);
  }, [mealPlan]);

  // Number of active days with at least 1 meal planned
  const daysWithMealsCount = useMemo(() => {
    return DAYS_OF_WEEK.filter((day) => (mealPlan[day] || []).length > 0).length;
  }, [mealPlan]);

  // Calculate missing ingredients for all planned recipes in the week
  const missingIngredientsSummary = useMemo(() => {
    const allPlannedRecipeIds = Array.from(new Set(Object.values(mealPlan).flat()));
    const missingSet = new Set<string>();

    allPlannedRecipeIds.forEach((id) => {
      const rec = recipesPool.find((r) => r.id === id);
      if (rec) {
        const match = matchSingleRecipe(pantryItems, rec);
        match.missingIngredients.forEach((ing) => {
          missingSet.add(ing.ingredientName);
        });
      }
    });

    return Array.from(missingSet);
  }, [mealPlan, pantryItems, recipesPool]);

  // Add all missing ingredients to shopping list
  const handleAddAllMissingToShopping = () => {
    if (!user) {
      requireAuth(() => {
        handleAddAllMissingToShopping();
      }, "Sign up for a free PantryPal account to save and sync missing grocery items!");
      return;
    }

    if (missingIngredientsSummary.length === 0) {
      showToast('You already have all required ingredients in your pantry!', 'success');
      return;
    }

    addToShoppingList(missingIngredientsSummary);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 selection:bg-[#D4AF37]/30"
    >
      {/* Guest Sign-Up Callout Banner */}
      {!user && (
        <div className="relative overflow-hidden bg-[#1A1918] border border-[#D4AF37]/40 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#F3C64F]" />
              Free Membership Feature
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F2EB]">
              Save & Sync Your Weekly Meal Plan Free
            </h2>
            <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
              Create a free PantryPal account to organize your weekly meals, sync pantry availability, and generate one-click grocery lists across all your devices.
            </p>
          </div>

          <div className="flex items-center w-full md:w-auto shrink-0">
            <button
              onClick={() => openAuthModal("Sign up for a free PantryPal account to save and sync your weekly meal plan!")}
              className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-2xl transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2A2724] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
            Weekly Meal Planner
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB] transition-all duration-200">
            {totalPlannedMeals > 0 ? "This Week's Meal Plan" : "My Weekly Cooking Schedule"}
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCB2]">
            Assign your saved favorite recipes to specific days, check pantry preparedness, and auto-populate your grocery list.
          </p>
        </div>

        {/* Action Controls Header */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative group">
            <button
              onClick={() => {
                if (favoriteIds.length > 0) {
                  handleAutoPlanWeek();
                }
              }}
              disabled={favoriteIds.length === 0}
              className={`px-4 py-2.5 bg-[#23211E] border border-[#D4AF37]/40 font-bold text-xs rounded-xl transition-all duration-200 flex items-center gap-1.5 shadow-sm ${
                favoriteIds.length > 0
                  ? 'hover:bg-[#2A2724] text-[#D4AF37] hover:text-[#E5C158] cursor-pointer hover:-translate-y-0.5'
                  : 'opacity-50 cursor-not-allowed border-[#2A2724] text-[#8A8275]'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${favoriteIds.length > 0 ? 'text-[#F3C64F]' : 'text-[#8A8275]'}`} />
              <span>Auto-Plan Week</span>
            </button>
            {favoriteIds.length === 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-3 py-1.5 bg-[#161513] border border-[#2A2724] text-[#C2BCB2] text-[11px] font-medium rounded-xl whitespace-nowrap shadow-xl z-20 pointer-events-none animate-in fade-in duration-200">
                Save favorite recipes first to generate a weekly plan.
              </div>
            )}
          </div>

          {totalPlannedMeals > 0 && (
            <button
              onClick={handleClearWeek}
              className="px-4 py-2.5 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#C2BCB2] hover:text-[#E6A135] font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
              title="Clear entire week plan"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Plan</span>
            </button>
          )}

          <button
            onClick={() => navigateTo('/favorites')}
            className="px-4 py-2.5 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/50 text-[#F5F2EB] font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>My Favorites ({favoriteIds.length})</span>
          </button>

          {missingIngredientsSummary.length > 0 && (
            <button
              onClick={handleAddAllMissingToShopping}
              className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-xl transition-all duration-200 cursor-pointer shadow-md hover:brightness-110 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
              <span>Add {missingIngredientsSummary.length} Missing to Groceries</span>
            </button>
          )}
        </div>
      </div>

      {/* Week Completion State Banner */}
      {daysWithMealsCount === 7 && (
        <div className="p-4 bg-gradient-to-r from-[#1E1D1B] via-[#23211E] to-[#1E1D1B] border border-[#D4AF37] rounded-2xl flex items-center justify-between gap-4 text-xs font-bold text-[#D4AF37] shadow-xl shadow-[#D4AF37]/10 animate-in fade-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#F3C64F] animate-bounce" />
            <span>✨ Week Complete! All 7 days have meals scheduled.</span>
          </div>
          <span className="text-[11px] text-[#C2BCB2] font-medium hidden sm:inline">You're ready for an organized week of delicious meals!</span>
        </div>
      )}

      {/* Week Plan Overview Stats Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-[#1A1918] border border-[#2A2724] rounded-2xl flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-serif font-bold text-[#F5F2EB]">{totalPlannedMeals} Meals</div>
              <p className="text-[11px] text-[#A39C90]">Planned across 7 days</p>
            </div>
          </div>

          <div className="p-4 bg-[#1A1918] border border-[#2A2724] rounded-2xl flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#E5C158]/10 text-[#E5C158] border border-[#E5C158]/30 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-serif font-bold text-[#F5F2EB]">
                {favoriteIds.length} Saved
              </div>
              <p className="text-[11px] text-[#A39C90]">Favorite recipes available to schedule</p>
            </div>
          </div>

          <div className="p-4 bg-[#1A1918] border border-[#2A2724] rounded-2xl flex items-center gap-3 shadow-md">
            <div className="w-10 h-10 rounded-xl bg-[#E6A135]/10 text-[#E6A135] border border-[#E6A135]/30 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-serif font-bold text-[#F5F2EB]">
                {missingIngredientsSummary.length} Missing
              </div>
              <p className="text-[11px] text-[#A39C90]">Unique ingredients needed for planned meals</p>
            </div>
          </div>
        </div>

        {/* Weekly Progress Indicator */}
        <div className="flex items-center justify-between text-xs font-medium text-[#A39C90] px-1.5 pt-1">
          <span>Weekly Progress: <strong className="text-[#F5F2EB] font-bold">{totalPlannedMeals}</strong> of 21 meals planned</span>
          <span><strong className="text-[#F5F2EB] font-bold">{daysWithMealsCount}</strong> of 7 days planned</span>
        </div>
      </div>

      {/* Weekly Days Grid (Monday - Sunday) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === todayName;
          const plannedRecipeIds = mealPlan[day] || [];
          const plannedRecipes = plannedRecipeIds
            .map((id) => recipesPool.find((r) => r.id === id))
            .filter((r): r is Recipe => Boolean(r));

          return (
            <div
              key={day}
              className={`rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#D4AF37]/5 ${
                isToday
                  ? 'bg-[#1E1D1B] border-2 border-[#D4AF37] shadow-md shadow-[#D4AF37]/10'
                  : 'bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37]/50'
              }`}
            >
              <div className="space-y-3">
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#2A2724]">
                  <h3 className="font-serif font-bold text-base text-[#F5F2EB] flex items-center gap-2">
                    <span>{day}</span>
                    {isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37] text-black tracking-wider uppercase shadow-xs">
                        Today
                      </span>
                    )}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                    isToday ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/50' : 'bg-[#23211E] text-[#D4AF37] border-[#2A2724]'
                  }`}>
                    {plannedRecipes.length} {plannedRecipes.length === 1 ? 'Meal' : 'Meals'}
                  </span>
                </div>

                {/* Assigned Recipes List */}
                {plannedRecipes.length > 0 ? (
                  <div className="space-y-2.5">
                    {plannedRecipes.map((recipe) => {
                      const matchResult = matchSingleRecipe(pantryItems, recipe);
                      const is100Match = matchResult.matchPercentage === 100;

                      return (
                        <div
                          key={recipe.id}
                          className="p-2.5 bg-[#1E1D1B] border border-[#2A2724] rounded-xl flex items-center justify-between gap-2.5 group hover:border-[#D4AF37]/60 transition-all"
                        >
                          <div
                            onClick={() => navigateTo('/recipe', { id: recipe.id })}
                            className="flex items-center gap-2.5 min-w-0 cursor-pointer flex-1"
                          >
                            <img
                              src={recipe.imageUrl || getRecipeFallbackImage(recipe.category)}
                              alt={recipe.title}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#2A2724]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = getRecipeFallbackImage(recipe.category);
                              }}
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-serif font-bold text-[#F5F2EB] truncate group-hover:text-[#D4AF37] transition-colors">
                                {recipe.title}
                              </h4>
                              <div className="flex items-center gap-2 text-[10px] text-[#A39C90] mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                                  {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
                                </span>
                                <span>•</span>
                                <span
                                  className={
                                    is100Match
                                      ? 'text-[#D4AF37] font-bold'
                                      : 'text-[#E6A135] font-semibold'
                                  }
                                >
                                  {is100Match ? '100% Ready' : `${matchResult.missingIngredients.length} Missing`}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveFromDay(day, recipe.id)}
                            className="p-1.5 rounded-lg text-[#A39C90] hover:text-[#E6A135] hover:bg-[#23211E] transition-colors cursor-pointer shrink-0"
                            title={`Remove from ${day}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-6 px-3 text-center border border-dashed border-[#2A2724] rounded-xl space-y-1">
                    <p className="text-xs text-[#A39C90] font-medium">No meal planned yet</p>
                    <p className="text-[10px] text-[#8A8275]">Tap below to assign a recipe</p>
                  </div>
                )}
              </div>

              {/* Assign Recipe Button (Smarter Empty State) */}
              {favoriteIds.length > 0 ? (
                <button
                  onClick={() => {
                    if (!user) {
                      requireAuth(() => {
                        setSearchQuery('');
                        setSelectedDayForAssign(day);
                      }, "Sign up for a free PantryPal account to assign and save weekly meal schedules!");
                      return;
                    }
                    setSearchQuery('');
                    setSelectedDayForAssign(day);
                  }}
                  className="w-full py-2 px-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Assign Recipe</span>
                </button>
              ) : (
                <button
                  onClick={() => navigateTo('/search')}
                  className="w-full py-2 px-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Browse Recipes</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Favorite Recipe Modal */}
      {selectedDayForAssign && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedDayForAssign(null)}
          id="assign-recipe-modal-backdrop"
        >
          <div
            className="w-full max-w-lg bg-[#1A1918] border border-[#2A2724] rounded-[28px] p-6 shadow-2xl space-y-5 text-[#F5F2EB] max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#2A2724] shrink-0">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#F5F2EB]">
                  Assign Meal for {selectedDayForAssign}
                </h3>
                <p className="text-xs text-[#A39C90]">
                  Select from your saved favorite recipes or popular collection dishes.
                </p>
              </div>

              <button
                onClick={() => setSelectedDayForAssign(null)}
                className="p-2 rounded-xl bg-[#23211E] hover:bg-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes by name or category..."
                className="w-full p-3 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            {/* Recipe Selection List */}
            <div className="overflow-y-auto space-y-2.5 pr-1 flex-1">
              {favoriteMatchedRecipes.length === 0 && (
                <div className="p-3 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-xl text-xs text-[#C2BCB2] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#D4AF37] shrink-0" />
                  <span>
                    Showing top recipes! Bookmark recipes with the heart icon to customize your personal favorite list.
                  </span>
                </div>
              )}

              {filteredAssignable.length > 0 ? (
                filteredAssignable.map(({ recipe, matchPercentage, missingIngredients }) => {
                  const isAssignedToDay = (mealPlan[selectedDayForAssign] || []).includes(recipe.id);

                  return (
                    <div
                      key={recipe.id}
                      className="p-3 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={recipe.imageUrl || getRecipeFallbackImage(recipe.category)}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#2A2724]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getRecipeFallbackImage(recipe.category);
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-serif font-bold text-[#F5F2EB] truncate">
                            {recipe.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-[#A39C90] mt-0.5">
                            <span className="text-[#D4AF37] font-semibold">{recipe.category}</span>
                            <span>•</span>
                            <span>{recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins</span>
                            <span>•</span>
                            <span className={matchPercentage === 100 ? 'text-[#D4AF37] font-bold' : 'text-[#E6A135]'}>
                              {matchPercentage === 100 ? '100% Match' : `${missingIngredients.length} Missing`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        disabled={isAssignedToDay}
                        onClick={() => handleAssignRecipe(selectedDayForAssign, recipe.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                          isAssignedToDay
                            ? 'bg-[#2A2724] text-[#8A8275] cursor-not-allowed'
                            : 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black hover:brightness-110 shadow-sm'
                        }`}
                      >
                        {isAssignedToDay ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Assigned</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Assign</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-xs text-[#A39C90] py-6">
                  No recipes matched your search.
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-[#2A2724] flex items-center justify-between shrink-0 text-xs">
              <span className="text-[#A39C90]">
                {favoriteMatchedRecipes.length} saved favorite{favoriteMatchedRecipes.length !== 1 ? 's' : ''}
              </span>
              <button
                onClick={() => setSelectedDayForAssign(null)}
                className="px-4 py-2 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
