import React, { useState, useEffect, useMemo, useRef } from 'react';

import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { SAMPLE_RECIPES } from '../data/recipes';
import { matchSingleRecipe } from '../utils/matcher';
import { getAllRecipePantrySubstitutions } from '../utils/substitutions';
import { getRecipeFallbackImage } from '../utils/imageUtils';
import { Recipe, RecipeFeedback } from '../types';
import { ArrowLeft, Heart, Clock, Users, Check, ShoppingBag, CheckCircle2, AlertCircle, ChefHat, Flame, Sparkles, Timer, Share2, Copy, Printer, ArrowRightLeft, Star, ThumbsUp, Globe } from 'lucide-react';
import { CookingTimer } from '../components/CookingTimer';
import { NutritionCard } from '../components/NutritionCard';
import { IngredientTooltip } from '../components/IngredientTooltip';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { HandsFreeMode } from '../components/HandsFreeMode';
import { ShareRecipeModal } from '../components/ShareRecipeModal';
import { PrintRecipeModal } from '../components/PrintRecipeModal';
import { RecipeFeedbackModal } from '../components/RecipeFeedbackModal';
import { AIRecipeAssistantModal } from '../components/AIRecipeAssistantModal';
import { getRecipeFeedback } from '../services/db';
import { getRecipeByIdApi } from '../services/recipeApi';

export const RecipeDetailPage: React.FC = () => {
  const { routeParams, pantryItems, isFavorite, toggleFavorite, addToShoppingList, removeFromShoppingList, isInShoppingList, navigateTo, showToast, allRecipes, addFetchedRecipes } = useApp();
  const { user, isAuthenticated } = useAuth();

  const recipeId = routeParams.id || 'rec-1';

  const [dynamicRecipe, setDynamicRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const existing = allRecipes.find(r => r.id === recipeId) || SAMPLE_RECIPES.find(r => r.id === recipeId);
    if (existing) {
      setDynamicRecipe(existing);
    } else {
      getRecipeByIdApi(recipeId).then(fetched => {
        if (!isCancelled && fetched) {
          setDynamicRecipe(fetched);
          addFetchedRecipes([fetched]);
        }
      });
    }
    return () => { isCancelled = true; };
  }, [recipeId, allRecipes]);

  const recipe = dynamicRecipe || allRecipes.find(r => r.id === recipeId) || SAMPLE_RECIPES.find(r => r.id === recipeId) || SAMPLE_RECIPES[0];
  const isFallbackRecipe = Boolean(routeParams.id) && !allRecipes.some(r => r.id === routeParams.id) && !dynamicRecipe;

  // Calculate match quality against current pantry
  const matchResult = useMemo(() => {
    return matchSingleRecipe(pantryItems, recipe);
  }, [pantryItems, recipe]);

  const recipePantrySubstitutions = useMemo(() => {
    return getAllRecipePantrySubstitutions(matchResult.missingIngredients, pantryItems);
  }, [matchResult.missingIngredients, pantryItems]);

  const isFav = isFavorite(recipe.id);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [selectedInitialRating, setSelectedInitialRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [savedFeedback, setSavedFeedback] = useState<RecipeFeedback | null>(null);

  // Fetch existing feedback if user is signed in
  const reloadFeedback = () => {
    if (isAuthenticated && user?.id) {
      getRecipeFeedback(user.id, recipe.id).then((fb) => {
        setSavedFeedback(fb);
      });
    } else {
      // Guest feedback is ephemeral for current session; default to null on fresh load
      setSavedFeedback(null);
    }
  };

  React.useEffect(() => {
    reloadFeedback();
  }, [recipe.id, user?.id, isAuthenticated]);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
    try {
      window.print();
    } catch (e) {
      console.warn('Browser window.print() suppressed:', e);
    }
  };

  const handleShare = () => {
    setIsShareModalOpen(true);
  };

  // Interactive Servings Multiplier (1x, 1.5x, 2x)
  const [servingMultiplier, setServingMultiplier] = useState(1);

  // Sticky Top Action Bar state
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Interactive step completion checkboxes state
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Active cooking timer preset state triggered from instruction steps
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | undefined>(undefined);
  const [activeTimerLabel, setActiveTimerLabel] = useState<string | undefined>(undefined);

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const isRemoving = prev.includes(index);
      const nextSteps = isRemoving ? prev.filter(i => i !== index) : [...prev, index];
      // If user completed step and not last step, gently scroll next active step into view
      if (!isRemoving) {
        if (nextSteps.length === recipe.instructions.length) {
          setIsFeedbackModalOpen(true);
        } else {
          const nextUncompleted = recipe.instructions.findIndex((_, i) => !nextSteps.includes(i));
          if (nextUncompleted !== -1 && stepRefs.current[nextUncompleted]) {
            setTimeout(() => {
              stepRefs.current[nextUncompleted]?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
              });
            }, 150);
          }
        }
      }
      return nextSteps;
    });
  };

  const getStepTimerInfo = (stepText: string) => {
    const minMatch = stepText.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(minute|min|m\b)/i);
    const secMatch = stepText.match(/(\d+)\s*(?:-|to)?\s*(\d+)?\s*(second|sec|s\b)/i);
    if (minMatch) {
      const mins = parseInt(minMatch[2] || minMatch[1], 10);
      return { seconds: mins * 60, label: `${mins}m` };
    }
    if (secMatch) {
      const secs = parseInt(secMatch[2] || secMatch[1], 10);
      return { seconds: secs, label: `${secs}s` };
    }
    return null;
  };

  const scaleAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      const scaled = amount * servingMultiplier;
      return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
    }
    return amount;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Compact Sticky Top Action Bar */}
      {showStickyBar && (
        <div className="sticky top-[57px] z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-1.5 sm:py-2 bg-[#161513]/95 backdrop-blur-md border-b border-[#2A2724] shadow-xl flex items-center justify-between gap-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 overflow-hidden pr-2 min-w-0 flex-1">
            <span className="font-serif font-bold text-xs sm:text-sm text-[#F5F2EB] truncate block max-w-full">
              {recipe.title}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0">
              {recipe.category}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Recipe Scale (1x / 1.5x / 2x) */}
            <div className="flex items-center gap-0.5 bg-[#23211E] p-1 rounded-xl border border-[#2A2724]">
              {[1, 1.5, 2].map((m) => (
                <button
                  key={m}
                  onClick={() => setServingMultiplier(m)}
                  className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all cursor-pointer ${
                    servingMultiplier === m
                      ? 'bg-[#D4AF37] text-black font-extrabold shadow-xs'
                      : 'text-[#C2BCB2] hover:bg-[#2A2724]'
                  }`}
                >
                  {m}x
                </button>
              ))}
            </div>

            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#1E1D1B] border border-[#2A2724] text-[#F5F2EB] hover:text-[#D4AF37] hover:border-[#D4AF37]"
              title="Print Recipe"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Print</span>
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#1E1D1B] border border-[#2A2724] text-[#F5F2EB] hover:text-[#D4AF37] hover:border-[#D4AF37]"
              title="Share Recipe"
            >
              <Share2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden md:inline">Share</span>
            </button>

            {/* Save */}
            <button
              onClick={() => toggleFavorite(recipe.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isFav
                  ? 'bg-[#1E1D1B] text-[#E6A135] border border-[#D4AF37]'
                  : 'bg-[#1E1D1B] border border-[#2A2724] text-[#F5F2EB] hover:border-[#D4AF37]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
              <span>{isFav ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Back Button & Top Actions */}
      <div className="flex items-center justify-between border-b border-[#2A2724] pb-4">
        <button
          onClick={() => navigateTo('/results')}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#A39C90] hover:text-[#D4AF37] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#D4AF37]" /> Back to Results
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id={`ask-ai-recipe-btn-${recipe.id}`}
            onClick={() => setIsAiAssistantOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 shadow-md shadow-[#D4AF37]/15"
            title="Ask AI Recipe Assistant anything about this recipe"
          >
            <Sparkles className="w-4 h-4 text-black animate-pulse" />
            <span>✨ Ask AI</span>
          </button>

          <button
            id={`print-recipe-btn-${recipe.id}`}
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#1A1918] border border-[#2A2724] text-[#F5F2EB] hover:text-[#D4AF37] hover:border-[#D4AF37]"
            title="Print Recipe for Kitchen Workspace"
          >
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span>Print</span>
          </button>

          <button
            id={`share-recipe-btn-${recipe.id}`}
            onClick={handleShare}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-[#1A1918] border border-[#2A2724] text-[#F5F2EB] hover:text-[#D4AF37] hover:border-[#D4AF37]"
            title="Share Recipe Summary & Social Card"
          >
            <Share2 className="w-4 h-4 text-[#D4AF37]" />
            <span>Share</span>
          </button>

          <button
            onClick={() => toggleFavorite(recipe.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isFav
                ? 'bg-[#1E1D1B] text-[#E6A135] border border-[#D4AF37]'
                : 'bg-[#1A1918] border border-[#2A2724] text-[#F5F2EB] hover:border-[#D4AF37]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
            <span>{isFav ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Non-existent Recipe Notice Banner */}
      {isFallbackRecipe && (
        <div className="p-4 bg-[#1E1D1B] border border-[#E6A135]/50 text-[#E6A135] rounded-2xl flex items-center gap-3 text-xs font-semibold shadow-md animate-in fade-in duration-200">
          <AlertCircle className="w-5 h-5 shrink-0 text-[#E6A135]" />
          <div>
            <p className="font-bold text-[#F5F2EB]">Recipe Not Found (ID: {routeParams.id})</p>
            <p className="text-[#C2BCB2] text-[11px]">The requested recipe could not be found in our collection. Displaying a featured classic recipe below instead.</p>
          </div>
        </div>
      )}

      {/* Hero Image & Headline */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] overflow-hidden shadow-2xl space-y-6">
        <div className="relative h-64 sm:h-80 w-full bg-[#161513]">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              const fallback = getRecipeFallbackImage(recipe.title, recipe.category);
              if (img.src !== fallback) {
                img.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1918] via-black/40 to-transparent" />

          {/* Overlaid Badges */}
          <div className="absolute bottom-6 left-6 right-6 space-y-2 text-white">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#D4AF37] text-black">
                {recipe.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-md">
                {recipe.cuisine}
              </span>
              <DifficultyBadge level={recipe.difficulty} size="md" />
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-black/80 text-[#C2BCB2] backdrop-blur-md flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#E6A135]" /> {recipe.calories || 420} cal
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#F5F2EB] leading-tight">
              {recipe.title}
            </h1>
          </div>
        </div>

        {/* Match Quality Banner */}
        <div className="px-6">
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-medium ${
              matchResult.matchPercentage === 100
                ? 'bg-[#1E1D1B] border-[#D4AF37] text-[#F5F2EB]'
                : 'bg-[#1E1D1B] border-[#E6A135]/40 text-[#F5F2EB]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl font-bold font-serif flex items-center justify-center text-black shrink-0 ${
                  matchResult.matchPercentage === 100 ? 'bg-gradient-to-br from-[#D4AF37] to-[#C5A028]' : 'bg-[#E6A135]'
                }`}
              >
                {matchResult.matchPercentage}%
              </div>
              <div>
                <p className="font-bold text-sm text-[#F5F2EB] font-serif">
                  {matchResult.matchPercentage === 100
                    ? '100% Chef Match — Ready to cook right now!'
                    : `Matched ${matchResult.matchedCount} of ${matchResult.totalRequired} required ingredients`}
                </p>

                {/* Thin progress bar */}
                <div className="w-full bg-[#2A2724] h-1.5 rounded-full overflow-hidden my-1.5">
                  <div
                    className="bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] h-full transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${matchResult.matchPercentage}%` }}
                  />
                </div>

                <p className="text-[#C2BCB2]">
                  {matchResult.missingIngredients.length > 0
                    ? `Missing: ${matchResult.missingIngredients.map(m => m.ingredientName).join(', ')}`
                    : 'You have all necessary ingredients in your pantry!'}
                </p>
              </div>
            </div>

            {matchResult.missingIngredients.length > 0 && (
              <button
                onClick={() => {
                  addToShoppingList(matchResult.missingIngredients.map(ing => ing.ingredientName));
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-black" /> Add Missing to Shopping List
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Bar & Servings Multiplier */}
        <div className="px-6 pb-6 pt-2 flex flex-wrap items-center justify-between gap-4 border-b border-[#2A2724] text-xs">
          <div className="flex items-center gap-6 text-[#A39C90] font-medium flex-wrap">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              Prep: {recipe.prepTimeMinutes}m • Cook: {recipe.cookTimeMinutes}m
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#D4AF37]" />
              {recipe.servings * servingMultiplier} servings
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#A39C90]">Difficulty:</span>
              <DifficultyBadge level={recipe.difficulty} size="sm" />
            </div>
          </div>

          {/* Servings Multiplier Buttons */}
          <div className="flex items-center gap-1 bg-[#23211E] p-1 rounded-xl border border-[#2A2724]">
            <span className="text-[11px] font-bold text-[#A39C90] px-2">Scale:</span>
            {[1, 1.5, 2].map((m) => (
              <button
                key={m}
                onClick={() => setServingMultiplier(m)}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  servingMultiplier === m
                    ? 'bg-[#D4AF37] text-black shadow-xs font-bold'
                    : 'text-[#C2BCB2] hover:bg-[#2A2724]'
                }`}
              >
                {m}x
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Nutritional Information Card with Circular Progress Metrics */}
      <NutritionCard recipe={recipe} servingMultiplier={servingMultiplier} />

      {/* Ingredients & Cooking Instructions Main Card */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] overflow-hidden shadow-2xl space-y-6">
        {/* Ingredients Section */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold text-[#F5F2EB]">Ingredients Needed</h2>
            <span className="text-xs text-[#A39C90]">
              Scaled for {recipe.servings * servingMultiplier} servings
            </span>
          </div>

          {/* Pantry Substitution Assistant Banner */}
          {recipePantrySubstitutions.length > 0 && (
            <div className="p-4 bg-[#161513] border border-[#D4AF37] rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-4 h-4 text-black" />
                  </div>
                  <div>
                    <h3 className="text-sm font-serif font-bold text-[#F5F2EB] flex items-center gap-2 flex-wrap">
                      Pantry Substitution Assistant
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37] text-black">
                        {recipePantrySubstitutions.length} Pantry Swap{recipePantrySubstitutions.length > 1 ? 's' : ''} Found
                      </span>
                    </h3>
                    <p className="text-xs text-[#C2BCB2]">
                      Great news! You have ingredients in your pantry that can substitute for missing items.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                {recipePantrySubstitutions.map(({ ingredientName, substitution }, i) => (
                  <div key={i} className="p-3 bg-[#1E1D1B] border border-[#D4AF37]/40 rounded-xl flex items-start gap-2.5 text-xs">
                    <ArrowRightLeft className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-[#F5F2EB]">
                        Missing <strong className="text-[#E6A135]">{ingredientName}</strong>?
                      </p>
                      <p className="text-[#D4AF37] font-bold">
                        Swap with <span className="underline underline-offset-2 font-extrabold">{substitution.pantryItem}</span> (In Pantry)
                      </p>
                      <p className="text-[11px] text-[#A39C90] mt-0.5">{substitution.substitutionNote}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            {/* In Pantry (Have) List */}
            <div className="p-4 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" /> In Your Kitchen ({matchResult.matchedIngredients.length})
                </span>
                <span className="text-[10px] text-[#A39C90] normal-case font-medium">Tap ingredient for tips</span>
              </div>
              {matchResult.matchedIngredients.length > 0 ? (
                <div className="space-y-2">
                  {matchResult.matchedIngredients.map((ing, idx) => (
                    <IngredientTooltip
                      key={idx}
                      ingredientName={ing.ingredientName}
                      amount={scaleAmount(ing.amount)}
                      unit={ing.unit}
                      inKitchen={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#161513]/60 border border-dashed border-[#2A2724] rounded-xl flex flex-col items-center justify-center text-center space-y-2 my-1">
                  <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#2A2724] flex items-center justify-center text-[#D4AF37]">
                    <ChefHat className="w-4 h-4 text-[#D4AF37]" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <p className="font-serif font-bold text-xs text-[#F5F2EB]">
                      No matching pantry ingredients yet.
                    </p>
                    <p className="text-[11px] text-[#A39C90] leading-relaxed">
                      Add ingredients to your pantry or use the + Add buttons to build your shopping list.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Missing (Need) List */}
            <div className="p-4 bg-[#1E1D1B] border border-[#E6A135]/30 rounded-2xl space-y-3">
              <div className="text-xs font-bold text-[#E6A135] uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#E6A135]" /> Missing / Need to Buy ({matchResult.missingIngredients.length})
                </span>
                <span className="text-[10px] text-[#A39C90] normal-case font-medium">Tap for substitutions</span>
              </div>
              {matchResult.missingIngredients.length > 0 ? (
                <div className="space-y-2">
                  {matchResult.missingIngredients.map((ing, idx) => {
                    const added = isInShoppingList(ing.ingredientName);
                    return (
                      <IngredientTooltip
                        key={idx}
                        ingredientName={ing.ingredientName}
                        amount={scaleAmount(ing.amount)}
                        unit={ing.unit}
                        optional={ing.optional}
                        inKitchen={false}
                        addedToShoppingList={added}
                        onToggleShoppingList={() => {
                          if (added) {
                            removeFromShoppingList(ing.ingredientName);
                          } else {
                            addToShoppingList(ing.ingredientName);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#A39C90] italic">No missing ingredients!</p>
              )}
            </div>
          </div>
        </div>

        {/* Built-in Cooking Timer Section */}
        <div className="px-6 pt-2">
          <CookingTimer
            instructions={recipe.instructions}
            prepTimeMinutes={recipe.prepTimeMinutes}
            cookTimeMinutes={recipe.cookTimeMinutes}
            activePresetSeconds={activeTimerSeconds}
            activeStepLabel={activeTimerLabel}
          />
        </div>

        {/* Cooking Instructions Section */}
        <div className="p-6 border-t border-[#2A2724] space-y-6">
          {/* Hands-Free Voice/Speech Assistant */}
          <HandsFreeMode
            instructions={recipe.instructions}
            recipeTitle={recipe.title}
            completedSteps={completedSteps}
            onToggleStep={toggleStep}
          />

          <div className="flex items-center justify-between pt-2">
            <h2 className="text-xl font-serif font-bold text-[#F5F2EB]">Cooking Instructions</h2>
            <span className="text-xs text-[#A39C90]">
              {completedSteps.length} of {recipe.instructions.length} steps completed
            </span>
          </div>

          <div className="space-y-3">
            {recipe.instructions.map((step, idx) => {
              const isDone = completedSteps.includes(idx);
              const timerInfo = getStepTimerInfo(step);

              return (
                <div
                  key={idx}
                  ref={(el) => { stepRefs.current[idx] = el; }}
                  onClick={() => toggleStep(idx)}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col sm:flex-row items-start justify-between gap-3.5 active:scale-[0.99] ${
                    isDone
                      ? 'bg-[#1E1D1B] border-[#2A2724] text-[#8A8275] line-through opacity-70 scale-[0.995]'
                      : 'bg-[#23211E] border-[#2A2724] hover:border-[#D4AF37] text-[#F5F2EB]'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <div
                      className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 transition-all duration-200 ${
                        isDone
                          ? 'bg-[#D4AF37] text-black font-extrabold shadow-xs scale-105'
                          : 'bg-[#2A2724] text-[#D4AF37]'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5 text-black stroke-[3] animate-in zoom-in-75 duration-150" /> : idx + 1}
                    </div>
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">
                      {step}
                    </p>
                  </div>

                  {timerInfo && !isDone && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTimerSeconds(timerInfo.seconds);
                        setActiveTimerLabel(`Step ${idx + 1}: ${timerInfo.label}`);
                      }}
                      className="px-2.5 py-1 bg-[#161513] hover:bg-[#2A2724] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] font-bold text-xs rounded-lg transition-all duration-150 active:scale-95 flex items-center gap-1 cursor-pointer shrink-0 sm:self-center"
                      title={`Start ${timerInfo.label} countdown timer for Step ${idx + 1}`}
                    >
                      <Timer className="w-3 h-3 text-[#D4AF37]" />
                      <span>{timerInfo.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Finish Cooking / Meal Rating Action Box */}
          <div className="pt-4 border-t border-[#2A2724] space-y-4">
            {savedFeedback ? (
              <div className="p-5 bg-[#161513] border border-[#D4AF37]/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg animate-in fade-in duration-200">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                      <Star className="w-4 h-4 fill-[#D4AF37] text-[#D4AF37]" />
                      {isAuthenticated && user?.id
                        ? 'Your Saved Cooking Feedback'
                        : 'Your Feedback'}
                    </span>
                    <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40">
                      <span className="text-[10px] font-extrabold text-[#D4AF37]">
                        Rated {savedFeedback.rating}/5
                      </span>
                      <div className="flex items-center gap-0.5 ml-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-3.5 h-3.5 ${
                              star <= savedFeedback.rating
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-[#8A8275]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {savedFeedback.recommend && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        ✓ Recommends
                      </span>
                    )}
                  </div>

                  {savedFeedback.title && (
                    <h4 className="text-xs font-bold text-[#F5F2EB]">{savedFeedback.title}</h4>
                  )}

                  {(savedFeedback.reviewText || savedFeedback.notes) && (
                    <p className="text-xs text-[#C2BCB2] italic leading-relaxed">
                      "{savedFeedback.reviewText || savedFeedback.notes}"
                    </p>
                  )}

                  {savedFeedback.firstName && (
                    <p className="text-[11px] text-[#A39C90]">
                      Reviewed by {savedFeedback.firstName}{' '}
                      {savedFeedback.lastName ? savedFeedback.lastName[0] + '.' : ''}{' '}
                      {savedFeedback.city ? `• ${savedFeedback.city}` : ''}
                    </p>
                  )}

                  {savedFeedback.improvements && savedFeedback.improvements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {savedFeedback.improvements.map((imp, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#23211E] border border-[#2A2724] text-[10px] text-[#D4AF37] font-semibold rounded-lg">
                          ✓ {imp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="px-4 py-2 bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  id="edit-feedback-btn"
                >
                  Edit Feedback
                </button>
              </div>
            ) : (
              <div className="p-6 bg-[#1A1918] border border-[#2A2724] rounded-2xl space-y-4 shadow-lg text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F2EB]">
                    How was this recipe?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
                    Your feedback helps other home cooks discover great recipes.
                  </p>

                  {/* Star Selector */}
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setSelectedInitialRating(star);
                          setIsFeedbackModalOpen(true);
                        }}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                        title={`Rate ${star} star${star > 1 ? 's' : ''} and write a review`}
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            star <= (hoverRating || 5)
                              ? 'fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]'
                              : 'text-[#3A3632] fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedInitialRating(5);
                    setIsFeedbackModalOpen(true);
                  }}
                  className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center gap-2 shrink-0"
                  id="write-a-review-btn"
                >
                  <Star className="w-4 h-4 fill-black text-black" />
                  <span>Write a Review</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Social Media Recipe Share Modal */}
      <ShareRecipeModal
        recipe={recipe}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        showToast={showToast}
      />

      {/* Kitchen Recipe Print Sheet Modal */}
      <PrintRecipeModal
        recipe={recipe}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        servingMultiplier={servingMultiplier}
        showToast={showToast}
      />

      {/* Recipe Feedback / Rating Modal */}
      <RecipeFeedbackModal
        recipe={recipe}
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        userId={user?.id || 'guest'}
        initialRating={selectedInitialRating}
        initialFeedback={savedFeedback}
        showToast={showToast}
        onSubmitted={(fb) => {
          setSavedFeedback(fb);
        }}
      />

      {/* Sticky Bottom Quick Action Dock */}
      {showStickyBar && (
        <div className="fixed bottom-20 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#161513]/95 backdrop-blur-md border border-[#D4AF37]/50 rounded-2xl p-2.5 px-4 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="text-xs font-serif font-bold text-[#F5F2EB] max-w-[140px] sm:max-w-[200px] truncate hidden sm:inline">
            {recipe.title}
          </span>
          <div className="h-4 w-px bg-[#2A2724] hidden sm:block" />
          <button
            onClick={() => setIsAiAssistantOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs hover:brightness-110 shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-black animate-pulse" />
            <span>✨ Ask AI</span>
          </button>
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className={`p-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              isFav ? 'bg-[#1E1D1B] border-[#D4AF37] text-[#D4AF37]' : 'border-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB]'
            }`}
            title="Save Recipe"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#D4AF37]' : ''}`} />
          </button>
        </div>
      )}

      {/* AI Recipe Assistant Modal */}
      <AIRecipeAssistantModal
        recipe={recipe}
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        showToast={showToast}
      />

    </div>
  );
};
