import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'motion/react';

import { useApp } from '../context/AppContext';
import { SAMPLE_RECIPES } from '../data/recipes';
import { matchRecipes } from '../utils/matcher';
import { Recipe, FilterOptions, DietaryPreference, MealCategory, DifficultyLevel } from '../types';
import { RecipeCard } from '../components/RecipeCard';
import { RecipeSkeletonCard } from '../components/RecipeSkeletonCard';
import { IngredientSearchBar } from '../components/IngredientSearchBar';
import { EmptyState } from '../components/EmptyState';
import { BlockedIngredientMessage } from '../components/BlockedIngredientMessage';
import { containsBlockedIngredient, hasBlockedIngredientInList, isBlockedRecipe } from '../utils/restrictionUtils';
import { ArrowLeft, Sparkles, Filter, SlidersHorizontal, RefreshCw, AlertCircle, Zap, Leaf, Sunrise, Sunset, Utensils, UtensilsCrossed } from 'lucide-react';
import { searchRecipesApi } from '../services/recipeApi';

export const ResultsPage: React.FC = () => {
  const { routeParams, pantryItems, navigateTo, addFetchedRecipes, showToast } = useApp();

  // Parse ingredients from URL params e.g. ?ingredients=Eggs,Garlic
  const initialIngredients = useMemo(() => {
    if (routeParams.ingredients) {
      return routeParams.ingredients.split(',').map(s => s.trim()).filter(Boolean);
    }
    return pantryItems;
  }, [routeParams.ingredients, pantryItems]);

  const [activeIngredients, setActiveIngredients] = useState<string[]>(initialIngredients);
  const [isSearching, setIsSearching] = useState<boolean>(true);
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [recipePool, setRecipePool] = useState<Recipe[]>([]);
  const [apiSource, setApiSource] = useState<'spoonacular' | 'local'>('local');

  // Parse initial filters from URL params
  const [filters, setFilters] = useState<FilterOptions>(() => ({
    category: (routeParams.category as MealCategory) || 'All',
    dietary: (routeParams.dietary as DietaryPreference) || 'Any',
    maxTotalTimeMinutes: routeParams.maxTime ? parseInt(routeParams.maxTime, 10) : undefined,
    sortBy: 'bestMatch',
    query: ''
  }));

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const searchIdRef = useRef<number>(0);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Spoonacular live recipes when ingredients or filters change
  useEffect(() => {
    const currentSearchId = ++searchIdRef.current;
    let hasFallbackTriggered = false;

    // Clear any pending fallback timer from previous search
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    // Set loading state immediately (skeleton appears immediately, no mock recipes)
    setIsSearching(true);

    if (activeIngredients.length === 0) {
      setRecipePool([]);
      setIsSearching(false);
      return;
    }

    // Set 2-second fallback timer
    fallbackTimerRef.current = setTimeout(() => {
      // If this search is still active and hasn't completed yet
      if (searchIdRef.current === currentSearchId) {
        hasFallbackTriggered = true;
        const cleanSample = SAMPLE_RECIPES.filter(r => !isBlockedRecipe(r));
        setRecipePool(cleanSample);
        setApiSource('local');
        setIsSearching(false);
      }
    }, 2000);

    searchRecipesApi({
      ingredients: activeIngredients,
      query: filters.query,
      category: filters.category,
      dietary: filters.dietary,
      number: 30
    }).then(res => {
      // Prevent race conditions: ignore if a newer search has been started
      if (searchIdRef.current !== currentSearchId) {
        return;
      }

      // Clear the 2-second fallback timer
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      // CRITICAL: If 2s fallback timer already fired and displayed mock recipes,
      // ignore late Spoonacular response! Keep mock recipes displayed stably.
      if (hasFallbackTriggered) {
        return;
      }

      if (res.source === 'spoonacular' && Array.isArray(res.recipes) && res.recipes.length > 0) {
        setRecipePool(res.recipes);
        addFetchedRecipes(res.recipes);
        setApiSource('spoonacular');
      } else {
        // Fallback immediately (e.g. quota error, local fallback, or 500 error)
        const cleanSample = SAMPLE_RECIPES.filter(r => !isBlockedRecipe(r));
        setRecipePool(cleanSample);
        setApiSource('local');
      }

      setIsSearching(false);
    }).catch(err => {
      if (searchIdRef.current !== currentSearchId) return;

      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }

      if (!hasFallbackTriggered) {
        console.warn('[ResultsPage] API search error fallback:', err);
        const cleanSample = SAMPLE_RECIPES.filter(r => !isBlockedRecipe(r));
        setRecipePool(cleanSample);
        setApiSource('local');
        setIsSearching(false);
      }
    });

    return () => {
      if (fallbackTimerRef.current) {
        clearTimeout(fallbackTimerRef.current);
        fallbackTimerRef.current = null;
      }
    };
  }, [activeIngredients, filters.query, filters.category, filters.dietary]);

  // Sync state if URL routeParams change externally
  useEffect(() => {
    if (routeParams.ingredients) {
      const parsed = routeParams.ingredients.split(',').map(s => s.trim()).filter(Boolean);
      if (parsed.join(',') !== activeIngredients.join(',')) {
        setActiveIngredients(parsed);
      }
    }
    if (routeParams.category || routeParams.dietary || routeParams.maxTime) {
      setFilters(prev => ({
        ...prev,
        category: (routeParams.category as MealCategory) || prev.category || 'All',
        dietary: (routeParams.dietary as DietaryPreference) || prev.dietary || 'Any',
        maxTotalTimeMinutes: routeParams.maxTime ? parseInt(routeParams.maxTime, 10) : prev.maxTotalTimeMinutes
      }));
    }
  }, [routeParams.ingredients, routeParams.category, routeParams.dietary, routeParams.maxTime]);

  // Handle ingredient addition/removal with 500ms debounce
  const triggerDebouncedSearch = (newIngredients: string[]) => {
    setActiveIngredients(newIngredients);
    setIsSearching(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      setIsSearching(false);
      // Update route hash params without hard page refresh
      const params: Record<string, string> = { ingredients: newIngredients.join(',') };
      if (filters.category && filters.category !== 'All') params.category = filters.category;
      if (filters.dietary && filters.dietary !== 'Any') params.dietary = filters.dietary;
      if (filters.maxTotalTimeMinutes) params.maxTime = filters.maxTotalTimeMinutes.toString();

      navigateTo('/results', params);
    }, 500);
  };

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!activeIngredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...activeIngredients, trimmed];
      triggerDebouncedSearch(updated);
    }
  };

  const handleRemoveIngredient = (name: string) => {
    const updated = activeIngredients.filter(i => i.toLowerCase() !== name.toLowerCase());
    triggerDebouncedSearch(updated);
  };

  const handleClearAll = () => {
    triggerDebouncedSearch([]);
  };

  const handleResetAll = () => {
    setFilters({
      category: 'All',
      dietary: 'Any',
      maxTotalTimeMinutes: undefined,
      sortBy: 'bestMatch',
      query: ''
    });
    triggerDebouncedSearch([]);
  };

  const handleLoadPantry = () => {
    triggerDebouncedSearch(pantryItems);
  };

  // Perform Matching logic
  const matchedResults = useMemo(() => {
    return matchRecipes(activeIngredients, recipePool, filters);
  }, [activeIngredients, recipePool, filters]);

  // Compute category match counts for live pill badges
  const categoryCounts = useMemo(() => {
    const allMatchesBase = matchRecipes(activeIngredients, recipePool, {
      ...filters,
      category: 'All',
      dietary: 'Any',
      maxTotalTimeMinutes: undefined
    });

    const counts: Record<string, number> = {
      All: allMatchesBase.length,
      Breakfast: 0,
      Lunch: 0,
      Dinner: 0,
      Snack: 0,
      Quick: 0,
      Vegetarian: 0
    };

    allMatchesBase.forEach(item => {
      const cat = item.recipe.category;
      if (counts[cat] !== undefined) counts[cat]++;
      if ((item.recipe.prepTimeMinutes + item.recipe.cookTimeMinutes) <= 20) counts.Quick++;
      if (item.recipe.dietary.includes('Vegetarian')) counts.Vegetarian++;
    });

    return counts;
  }, [activeIngredients, filters.query, filters.sortBy]);

  const visibleResults = matchedResults.slice(0, visibleCount);
  const hasMore = visibleCount < matchedResults.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2724] pb-4">
        <button
          onClick={() => navigateTo('/search')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A39C90] hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Modify Ingredients
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-[#A39C90]">
          {isSearching ? (
            <span className="flex items-center gap-1.5 text-[#D4AF37] font-bold animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Updating menu results...
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <span className="bg-[#1E1D1B] border border-[#D4AF37]/30 text-[#D4AF37] px-3 py-1 rounded-full font-bold">
                {matchedResults.length} recipes matched
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Persistent Sticky Ingredient Search Bar */}
      <div className="sticky top-14 z-20 bg-[#121212]/95 backdrop-blur-md p-3 sm:p-3.5 rounded-3xl border border-[#2A2724] shadow-xl transition-all">
        <IngredientSearchBar
          selectedIngredients={activeIngredients}
          pantryItems={pantryItems}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onClearAll={handleClearAll}
          onLoadPantry={handleLoadPantry}
          placeholder="Type to add or remove ingredients (Press Enter to search)..."
          collapsible={true}
          defaultCollapsed={true}
        />
      </div>

      {/* Main Results Layout: Sidebar Filters + Recipe Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Filter Controls Sidebar (Desktop) */}
        <aside className="hidden lg:block bg-[#1A1918] p-5 rounded-3xl border border-[#2A2724] space-y-5 sticky top-52 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#2A2724] pb-3">
            <h3 className="font-serif font-bold text-sm text-[#F5F2EB] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#D4AF37]" /> Filter Menu
            </h3>
            <button
              onClick={handleResetAll}
              className="text-[11px] text-[#E6A135] hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Search text query inside results */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Filter by Keyword</label>
            <input
              type="text"
              value={filters.query || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
              placeholder="Title, Italian, Taco..."
              className="w-full px-3 py-2 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {/* Meal Category Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Meal Category</label>
            <div className="space-y-1">
              {(['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat }))}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                    filters.category === cat
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-bold'
                      : 'hover:bg-[#23211E] text-[#C2BCB2]'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                    filters.category === cat ? 'bg-black/20 text-black' : 'bg-[#23211E] text-[#A39C90]'
                  }`}>
                    {categoryCounts[cat] || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary Preference Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Dietary Preference</label>
            <div className="space-y-1">
              {(['Any', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'] as DietaryPreference[]).map((diet) => (
                <button
                  key={diet}
                  onClick={() => setFilters(prev => ({ ...prev, dietary: diet }))}
                  className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center justify-between ${
                    filters.dietary === diet
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-bold'
                      : 'hover:bg-[#23211E] text-[#C2BCB2]'
                  }`}
                >
                  <span>{diet}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Difficulty Level</label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { label: 'All', value: 'All' },
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Pro', value: 'Hard' }
              ].map((lvl) => {
                const isActive = (filters.difficulty || 'All') === lvl.value;
                return (
                  <button
                    key={lvl.value}
                    onClick={() => setFilters(prev => ({ ...prev, difficulty: lvl.value as DifficultyLevel | 'All' }))}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      isActive
                        ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37]'
                        : 'bg-[#1A1918] border-[#2A2724] text-[#C2BCB2] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    {lvl.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Time Limit Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Max Cooking Time</label>
            <button
              onClick={() => setFilters(prev => ({
                ...prev,
                maxTotalTimeMinutes: prev.maxTotalTimeMinutes === 20 ? undefined : 20
              }))}
              className={`w-full px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-between ${
                filters.maxTotalTimeMinutes === 20
                  ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37]'
                  : 'bg-[#23211E] border-[#2A2724] text-[#C2BCB2] hover:border-[#D4AF37]/40'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#E5C158]" /> Under 20 mins
              </span>
              <span className="text-[10px] opacity-80">
                ({categoryCounts.Quick || 0})
              </span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#F5F2EB]">Sort Order</label>
            <select
              value={filters.sortBy || 'bestMatch'}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterOptions['sortBy'] }))}
              className="w-full px-3 py-2 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] font-medium"
            >
              <option value="bestMatch">Highest Match %</option>
              <option value="fewestMissing">Fewest Missing Ingredients</option>
              <option value="prepTime">Fastest Cook Time</option>
            </select>
          </div>
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between bg-[#1A1918] p-3.5 rounded-2xl border border-[#2A2724]">
          <span className="text-xs font-bold text-[#F5F2EB] flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-[#D4AF37]" /> Filters & Options
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetAll}
              className="text-xs text-[#E6A135] hover:underline font-bold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="px-3 py-1.5 bg-[#23211E] text-[#D4AF37] font-bold text-xs rounded-xl cursor-pointer border border-[#D4AF37]/30"
            >
              {showFiltersMobile ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {/* Mobile Expandable Filter Bar */}
        {showFiltersMobile && (
          <div className="lg:hidden bg-[#1A1918] p-4 rounded-2xl border border-[#2A2724] space-y-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="font-bold text-[#F5F2EB] block mb-1">Category</label>
                <select
                  value={filters.category || 'All'}
                  onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as MealCategory }))}
                  className="w-full p-2 bg-[#23211E] border border-[#2A2724] rounded-xl text-[#F5F2EB]"
                >
                  <option value="All">All Categories ({categoryCounts.All || 0})</option>
                  <option value="Breakfast">Breakfast ({categoryCounts.Breakfast || 0})</option>
                  <option value="Lunch">Lunch ({categoryCounts.Lunch || 0})</option>
                  <option value="Dinner">Dinner ({categoryCounts.Dinner || 0})</option>
                  <option value="Snack">Snack ({categoryCounts.Snack || 0})</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#F5F2EB] block mb-1">Dietary</label>
                <select
                  value={filters.dietary || 'Any'}
                  onChange={(e) => setFilters(prev => ({ ...prev, dietary: e.target.value as DietaryPreference }))}
                  className="w-full p-2 bg-[#23211E] border border-[#2A2724] rounded-xl text-[#F5F2EB]"
                >
                  <option value="Any">Any Dietary</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Vegan">Vegan</option>
                  <option value="Gluten-Free">Gluten-Free</option>
                  <option value="Dairy-Free">Dairy-Free</option>
                  <option value="Keto">Keto</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#F5F2EB] block mb-1">Difficulty</label>
                <select
                  value={filters.difficulty || 'All'}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value as DifficultyLevel | 'All' }))}
                  className="w-full p-2 bg-[#23211E] border border-[#2A2724] rounded-xl text-[#F5F2EB]"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Pro</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Main Recipe Cards Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Quick Category Filter Tab Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'All', label: 'All Recipes', count: categoryCounts.All, icon: <Utensils className="w-3.5 h-3.5" /> },
              { id: 'Breakfast', label: 'Breakfast', count: categoryCounts.Breakfast, icon: <Sunrise className="w-3.5 h-3.5 text-[#E6A135]" /> },
              { id: 'Lunch', label: 'Lunch', count: categoryCounts.Lunch, icon: <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" /> },
              { id: 'Dinner', label: 'Dinner', count: categoryCounts.Dinner, icon: <Sunset className="w-3.5 h-3.5 text-[#F3C64F]" /> },
              { id: 'Snack', label: 'Snacks', count: categoryCounts.Snack, icon: <Sparkles className="w-3.5 h-3.5 text-[#E5C158]" /> },
              { id: 'Quick', label: 'Quick (<20m)', count: categoryCounts.Quick, icon: <Zap className="w-3.5 h-3.5 text-[#E5C158]" /> },
              { id: 'Vegetarian', label: 'Vegetarian', count: categoryCounts.Vegetarian, icon: <Leaf className="w-3.5 h-3.5 text-emerald-400" /> },
            ].map((tab) => {
              const isSelected = tab.id === 'Quick' 
                ? filters.maxTotalTimeMinutes === 20 
                : tab.id === 'Vegetarian' 
                  ? filters.dietary === 'Vegetarian' 
                  : filters.category === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'Quick') {
                      setFilters(prev => ({ ...prev, maxTotalTimeMinutes: prev.maxTotalTimeMinutes === 20 ? undefined : 20 }));
                    } else if (tab.id === 'Vegetarian') {
                      setFilters(prev => ({ ...prev, dietary: prev.dietary === 'Vegetarian' ? 'Any' : 'Vegetarian' }));
                    } else {
                      setFilters(prev => ({ ...prev, category: tab.id as MealCategory }));
                    }
                  }}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border shrink-0 ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black border-[#D4AF37] shadow-md font-extrabold'
                      : 'bg-[#1E1D1B] hover:bg-[#23211E] text-[#C2BCB2] hover:text-[#F5F2EB] border-[#2A2724] hover:border-[#D4AF37]/40'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isSelected ? 'bg-black/20 text-black' : 'bg-[#23211E] text-[#A39C90]'
                  }`}>
                    {tab.count || 0}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Skeleton Loading State during 500ms debounce */}
          {isSearching ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <RecipeSkeletonCard key={idx} />
              ))}
            </div>
          ) : (hasBlockedIngredientInList(activeIngredients) || (filters.query && containsBlockedIngredient(filters.query))) ? (
            /* Friendly Blocked Ingredient Notice */
            <BlockedIngredientMessage
              blockedItem="Beef"
              onExplore={handleResetAll}
            />
          ) : activeIngredients.length === 0 ? (
            /* Empty State: All ingredients removed */
            <EmptyState
              icon={AlertCircle}
              title="Add ingredients to match recipes"
              description="Type an ingredient in the bar above or click 'Load Pantry' to instantly see delicious dishes you can cook!"
              actionLabel="Load Saved Pantry Ingredients"
              onAction={handleLoadPantry}
            />
          ) : matchedResults.length === 0 ? (
            /* Empty State: No recipe matches */
            <EmptyState
              icon={AlertCircle}
              title="No recipes match these exact criteria"
              description="Try removing one filter constraint or selecting 'All Recipes' to expand your gourmet matches!"
              retryLabel="Reset Filters & Ingredients"
              onRetry={handleResetAll}
            />
          ) : (
            /* Populated Recipe Cards Grid */
            <>
              <motion.div
                key={`${activeIngredients.join('-')}-${filters.category}-${filters.dietary}-${filters.sortBy}-${filters.difficulty}-${visibleCount}`}
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.03
                    }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {visibleResults.map((item, idx) => (
                  <RecipeCard key={item.recipe.id} matchResult={item} index={idx} />
                ))}
              </motion.div>

              {/* Show More Pagination Button */}
              {hasMore && (
                <div className="text-center pt-6">
                  <button
                    onClick={() => setVisibleCount(prev => prev + 9)}
                    className="px-8 py-3 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37] text-[#F5F2EB] hover:text-[#D4AF37] font-bold text-xs rounded-2xl transition-all cursor-pointer shadow-md"
                  >
                    Show More Recipes ({matchedResults.length - visibleCount} remaining)
                  </button>
                </div>
              )}
            </>
          )}

        </div>

      </div>

    </div>
  );
};

