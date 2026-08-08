import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { SAMPLE_RECIPES } from '../data/recipes';
import { matchSingleRecipe } from '../utils/matcher';
import { RecipeCard } from '../components/RecipeCard';
import { Heart, Sparkles, Check, AlertCircle, ArrowRight, BookOpen, Compass, ChefHat, Calendar, SlidersHorizontal } from 'lucide-react';

export const FavoritesPage: React.FC = () => {
  const { favoriteIds, pantryItems, navigateTo, allRecipes } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'ready' | 'missing1'>('all');
  const [sortBy, setSortBy] = useState<'bestMatch' | 'recentlySaved' | 'highestRated' | 'quickest'>('bestMatch');

  // Match all saved favorite recipes against active pantry
  const favoriteResults = useMemo(() => {
    const recipesPool = allRecipes.length > 0 ? allRecipes : SAMPLE_RECIPES;
    const favoriteRecipes = recipesPool.filter(r => favoriteIds.includes(r.id));
    return favoriteRecipes.map(r => matchSingleRecipe(pantryItems, r));
  }, [favoriteIds, pantryItems, allRecipes]);

  // Filter based on active tab
  const filteredResults = useMemo(() => {
    if (activeTab === 'ready') {
      return favoriteResults.filter(f => f.matchPercentage === 100);
    }
    if (activeTab === 'missing1') {
      return favoriteResults.filter(f => f.missingIngredients.length === 1);
    }
    return favoriteResults;
  }, [favoriteResults, activeTab]);

  // Sort filtered results
  const sortedFilteredResults = useMemo(() => {
    let list = [...filteredResults];
    if (sortBy === 'recentlySaved') {
      list.sort((a, b) => {
        const idxA = favoriteIds.indexOf(a.recipe.id);
        const idxB = favoriteIds.indexOf(b.recipe.id);
        return idxB - idxA;
      });
    } else if (sortBy === 'highestRated') {
      list.sort((a, b) => b.recipe.rating - a.recipe.rating);
    } else if (sortBy === 'quickest') {
      list.sort((a, b) => (a.recipe.prepTimeMinutes + a.recipe.cookTimeMinutes) - (b.recipe.prepTimeMinutes + b.recipe.cookTimeMinutes));
    } else {
      list.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
    return list;
  }, [filteredResults, sortBy, favoriteIds]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 selection:bg-[#D4AF37]/30"
    >
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2724] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold transition-all duration-200">
            <Heart className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span>Saved Recipes (</span>
            <span key={favoriteIds.length} className="animate-in fade-in duration-200">{favoriteIds.length}</span>
            <span>)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
            My Saved Favorites
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCB2]">
            All your bookmarked recipes ranked by how close you are to cooking them today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative group">
            <button
              onClick={() => {
                if (favoriteIds.length > 0) {
                  navigateTo('/planner');
                }
              }}
              disabled={favoriteIds.length === 0}
              className={`px-4 py-3 bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 ${
                favoriteIds.length > 0
                  ? 'hover:bg-[#23211E] cursor-pointer shadow-md hover:-translate-y-0.5'
                  : 'opacity-50 cursor-not-allowed border-[#2A2724] text-[#8A8275]'
              }`}
            >
              <Calendar className={`w-4 h-4 ${favoriteIds.length > 0 ? 'text-[#D4AF37]' : 'text-[#8A8275]'}`} />
              <span>Weekly Planner</span>
            </button>
            {favoriteIds.length === 0 && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-3 py-1.5 bg-[#161513] border border-[#2A2724] text-[#C2BCB2] text-[11px] font-medium rounded-xl whitespace-nowrap shadow-xl z-20 pointer-events-none animate-in fade-in duration-200">
                Save recipes first to build your weekly meal plan.
              </div>
            )}
          </div>

          <button
            onClick={() => navigateTo(favoriteIds.length > 0 ? '/results' : '/search')}
            className="px-5 py-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-2xl transition-all duration-200 cursor-pointer shadow-md hover:brightness-110 hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-black" />
            <span>{favoriteIds.length > 0 ? 'Cook Tonight' : 'Discover Recipes'}</span>
          </button>
        </div>
      </div>

      {/* Filter Cookability Tabs & Sorting Options */}
      {favoriteResults.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:items-center justify-between gap-3"
        >
          <div className="flex flex-wrap items-center gap-2 bg-[#1A1918] p-2 rounded-2xl border border-[#2A2724] w-fit shadow-xl">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold shadow-xs'
                  : 'text-[#C2BCB2] hover:bg-[#23211E] hover:text-[#F5F2EB]'
              }`}
            >
              All Favorites ({favoriteResults.length})
            </button>

            <button
              onClick={() => setActiveTab('ready')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ready'
                  ? 'bg-[#1E1D1B] text-[#D4AF37] border border-[#D4AF37] shadow-xs'
                  : 'text-[#D4AF37] hover:bg-[#23211E]'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              Ready to Cook ({favoriteResults.filter(f => f.matchPercentage === 100).length})
            </button>

            <button
              onClick={() => setActiveTab('missing1')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'missing1'
                  ? 'bg-[#1E1D1B] text-[#E6A135] border border-[#E6A135] shadow-xs'
                  : 'text-[#E6A135] hover:bg-[#23211E]'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              Missing 1 Ingredient ({favoriteResults.filter(f => f.missingIngredients.length === 1).length})
            </button>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-1.5 bg-[#1A1918] p-1.5 rounded-2xl border border-[#2A2724] text-xs w-fit shadow-xl overflow-x-auto scrollbar-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#A39C90] ml-2 mr-0.5 shrink-0" />
            <span className="text-[11px] text-[#A39C90] font-medium mr-1 shrink-0">Sort:</span>
            {[
              { id: 'bestMatch', label: 'Best Match' },
              { id: 'recentlySaved', label: 'Recently Saved' },
              { id: 'highestRated', label: 'Highest Rated' },
              { id: 'quickest', label: 'Quickest Meals' },
            ].map(opt => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  sortBy === opt.id
                    ? 'bg-[#23211E] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                    : 'text-[#A39C90] hover:text-[#F5F2EB]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Grid or Empty State */}
      {sortedFilteredResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedFilteredResults.map((item, idx) => (
            <RecipeCard key={item.recipe.id} matchResult={item} index={idx} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="relative overflow-hidden bg-[#1A1918] rounded-[28px] border border-[#2A2724] p-8 sm:p-12 text-center space-y-6 shadow-2xl max-w-xl mx-auto"
        >
          {/* Subtle Golden Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

          {/* Animated Illustration Graphic */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            {/* Outer Pulsing Ring */}
            <motion.div
              animate={{ scale: [1, 1.12, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30"
            />
            {/* Floating Sparkles Accent Left */}
            <motion.div
              animate={{ y: [-4, 4, -4], rotate: [-10, 10, -10] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-1 -left-1 p-1.5 rounded-xl bg-[#23211E] border border-[#D4AF37]/40 text-[#D4AF37] shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
            {/* Floating Chef Hat Accent Right */}
            <motion.div
              animate={{ y: [4, -4, 4], rotate: [10, -10, 10] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-[#23211E] border border-[#E5C158]/40 text-[#E5C158] shadow-lg"
            >
              <ChefHat className="w-4 h-4" />
            </motion.div>
            {/* Central Heart Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center shadow-xl shadow-[#D4AF37]/20"
            >
              <Heart className="w-8 h-8 fill-black text-black" />
            </motion.div>
          </div>

          {/* Content Headings */}
          <div className="space-y-2 relative z-10">
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#F5F2EB]">
              {favoriteResults.length === 0
                ? 'Your Cookbook is Empty'
                : 'No Favorites Match This Filter'}
            </h3>
            <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-md mx-auto leading-relaxed">
              {favoriteResults.length === 0
                ? 'Keep track of dishes you love! Tap the heart icon on any recipe card to save it directly to your personal culinary vault.'
                : 'Try switching your filter or adding ingredients to your pantry to make your saved recipes cookable right now.'}
            </p>
            {favoriteResults.length === 0 && (
              <p className="text-xs text-[#A39C90] max-w-md mx-auto font-medium pt-1">
                Save recipes while browsing and they'll always be here for quick access.
              </p>
            )}
          </div>

          {/* Onboarding Suggestion Badges */}
          {favoriteResults.length === 0 && (
            <div className="pt-2 border-t border-[#2A2724] space-y-2 relative z-10">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#A39C90]">Quick Recipe Ideas:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { label: '🍝 Italian Pasta Classics', params: { category: 'Dinner', ingredients: pantryItems.length > 0 ? pantryItems.join(',') : 'Pasta,Garlic,Olive Oil' } },
                  { label: '🍗 Quick 20-Min Meals', params: { maxTime: '20', ingredients: pantryItems.length > 0 ? pantryItems.join(',') : 'Chicken,Eggs,Garlic' } },
                  { label: '🥗 Healthy Salads & Bowls', params: { category: 'Lunch', ingredients: pantryItems.length > 0 ? pantryItems.join(',') : 'Spinach,Tomatoes,Lemon' } }
                ].map((tag, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigateTo('/results', tag.params)}
                    className="px-3 py-1.5 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/60 text-[#F5F2EB] text-xs font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 relative z-10">
            <button
              onClick={() => navigateTo('/search')}
              className="px-7 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs sm:text-sm rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-[#D4AF37]/15 inline-flex items-center gap-2 hover:brightness-110 hover:scale-[1.02] active:scale-95"
            >
              <span>Discover Recipes</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          </div>
        </motion.div>
      )}

    </motion.div>
  );
};


