import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { IngredientSearchBar } from '../components/IngredientSearchBar';
import { MealCategory, DietaryPreference } from '../types';
import { UtensilsCrossed, Sparkles, ArrowRight, RotateCcw, Sunrise, Sunset, Utensils, Zap, Leaf, Filter } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { pantryItems, navigateTo, showToast } = useApp();

  // Active temporary search ingredients (starts pre-populated with user's pantry)
  const [activeIngredients, setActiveIngredients] = useState<string[]>(pantryItems);

  // Category & Quick Filter State
  const [selectedCategory, setSelectedCategory] = useState<MealCategory>('All');
  const [selectedDietary, setSelectedDietary] = useState<DietaryPreference>('Any');
  const [selectedMaxTime, setSelectedMaxTime] = useState<number | null>(null);

  const handleAddIngredient = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!activeIngredients.some(i => i.toLowerCase() === trimmed.toLowerCase())) {
      setActiveIngredients(prev => [...prev, trimmed]);
    }
  };

  const handleRemoveIngredient = (name: string) => {
    setActiveIngredients(prev => prev.filter(i => i.toLowerCase() !== name.toLowerCase()));
  };

  const handleLoadPantry = () => {
    setActiveIngredients(pantryItems);
  };

  const handleClearAll = () => {
    setActiveIngredients([]);
  };

  const handleFindRecipes = () => {
    if (activeIngredients.length === 0) {
      showToast('Please select at least one ingredient to match recipes.', 'error');
      return;
    }
    const params: Record<string, string> = {
      ingredients: activeIngredients.join(',')
    };
    if (selectedCategory !== 'All') params.category = selectedCategory;
    if (selectedDietary !== 'Any') params.dietary = selectedDietary;
    if (selectedMaxTime) params.maxTime = selectedMaxTime.toString();

    navigateTo('/results', params);
  };

  const categoryOptions: { label: string; cat: MealCategory; icon: React.ReactNode }[] = [
    { label: 'All Meals', cat: 'All', icon: <Utensils className="w-4 h-4" /> },
    { label: 'Breakfast', cat: 'Breakfast', icon: <Sunrise className="w-4 h-4 text-[#E6A135]" /> },
    { label: 'Lunch', cat: 'Lunch', icon: <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" /> },
    { label: 'Dinner', cat: 'Dinner', icon: <Sunset className="w-4 h-4 text-[#F3C64F]" /> },
    { label: 'Snacks', cat: 'Snack', icon: <Sparkles className="w-4 h-4 text-[#E5C158]" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Header Banner */}
      <div className="space-y-2 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold shadow-xs">
          <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
          Pantry Auto-Loaded
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
          What's in your kitchen today?
        </h1>
        <p className="text-xs sm:text-sm text-[#C2BCB2]">
          We pre-loaded your saved pantry staples. Filter by meal category or dietary preferences to find matching gourmet recipes!
        </p>
      </div>

      {/* Categorization & Quick Filter Selector Bar */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#2A2724] pb-3">
          <span className="text-xs font-bold text-[#F5F2EB] flex items-center gap-1.5 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-[#D4AF37]" /> Select Recipe Category
          </span>
          {(selectedCategory !== 'All' || selectedDietary !== 'Any' || selectedMaxTime !== null) && (
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDietary('Any');
                setSelectedMaxTime(null);
              }}
              className="text-[11px] text-[#E6A135] font-bold hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Meal Category Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {categoryOptions.map((opt) => {
            const isActive = selectedCategory === opt.cat;
            return (
              <button
                key={opt.cat}
                onClick={() => setSelectedCategory(opt.cat)}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black border-[#D4AF37] shadow-md hover:-translate-y-0.5'
                    : 'bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB] border-[#2A2724] hover:border-[#D4AF37]/50 hover:-translate-y-0.5 hover:shadow-xs'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Attribute Badges (Quick <20m, Vegetarian, Gluten-Free) */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2A2724]">
          <span className="text-[11px] font-bold text-[#A39C90] mr-1">Quick Filters:</span>

          <button
            onClick={() => setSelectedMaxTime(selectedMaxTime === 20 ? null : 20)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              selectedMaxTime === 20
                ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37] shadow-xs hover:-translate-y-0.5'
                : 'bg-[#23211E] border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] hover:border-[#D4AF37]/40 hover:-translate-y-0.5'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-[#E5C158]" /> Quick (&lt;20 mins)
          </button>

          <button
            onClick={() => setSelectedDietary(selectedDietary === 'Vegetarian' ? 'Any' : 'Vegetarian')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              selectedDietary === 'Vegetarian'
                ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37] shadow-xs hover:-translate-y-0.5'
                : 'bg-[#23211E] border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] hover:border-[#D4AF37]/40 hover:-translate-y-0.5'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-400" /> Vegetarian
          </button>

          <button
            onClick={() => setSelectedDietary(selectedDietary === 'Gluten-Free' ? 'Any' : 'Gluten-Free')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
              selectedDietary === 'Gluten-Free'
                ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37] shadow-xs hover:-translate-y-0.5'
                : 'bg-[#23211E] border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] hover:border-[#D4AF37]/40 hover:-translate-y-0.5'
            }`}
          >
            🌾 Gluten-Free
          </button>
        </div>
      </div>

      {/* Main Ingredient Search Bar */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-6">
        <IngredientSearchBar
          selectedIngredients={activeIngredients}
          pantryItems={pantryItems}
          onAddIngredient={handleAddIngredient}
          onRemoveIngredient={handleRemoveIngredient}
          onClearAll={handleClearAll}
          onLoadPantry={handleLoadPantry}
          placeholder="Search or add ingredients (e.g. Garlic, Eggs, Tomatoes)..."
          autoFocus={true}
        />

        {/* Action Controls Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#2A2724]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadPantry}
              className="px-3.5 py-2 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 text-[#F5F2EB] text-xs font-bold rounded-xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" /> Restore Saved Pantry
            </button>
          </div>

          <div className="w-full sm:w-auto flex flex-col items-center gap-1.5">
            <button
              onClick={handleFindRecipes}
              className={`w-full sm:w-auto px-8 py-3.5 text-sm font-extrabold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                activeIngredients.length > 0
                  ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 shadow-[#D4AF37]/10 hover:-translate-y-0.5 cursor-pointer'
                  : 'bg-[#2A2724] text-[#8A8275] border border-[#2A2724] hover:border-[#E6A135] cursor-pointer shadow-none'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${activeIngredients.length > 0 ? 'text-black' : 'text-[#8A8275]'}`} />
              <span>Find Matching Recipes ({activeIngredients.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {activeIngredients.length === 0 && (
              <p className="text-[11px] text-[#A39C90] text-center font-medium animate-in fade-in duration-200">
                Add at least one ingredient to start finding recipes.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Helpful Tips Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-4 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl space-y-1">
          <p className="font-serif font-bold text-[#D4AF37] flex items-center gap-1.5 text-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#F3C64F]" /> Match Quality Ranking
          </p>
          <p className="text-[#C2BCB2] leading-relaxed">
            Recipes using 100% of your ingredients appear at the top. Missing 1 item? Add it directly to your instant grocery checklist!
          </p>
        </div>

        <div className="p-4 bg-[#1E1D1B] border border-[#E6A135]/30 rounded-2xl space-y-1">
          <p className="font-serif font-bold text-[#E6A135] flex items-center gap-1.5 text-sm">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#E6A135]" /> Persistent Pantry
          </p>
          <p className="text-[#C2BCB2] leading-relaxed">
            Want to update your permanent staples? Visit <span className="underline font-bold text-[#F5F2EB]">My Pantry</span> to save or manage items.
          </p>
        </div>
      </div>

    </div>
  );
};

