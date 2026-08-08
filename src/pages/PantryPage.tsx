import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import { COMMON_INGREDIENTS } from '../data/ingredients';
import { UtensilsCrossed, Plus, X, Search, Sparkles, Check, ArrowRight, Wand2, ShoppingBag } from 'lucide-react';
import { useIngredientAutocomplete } from '../hooks/useIngredientAutocomplete';
import { pageTransitionVariants } from '../utils/animations';

export const PantryPage: React.FC = () => {
  const { pantryItems, addToPantry, removeFromPantry, navigateTo, showToast } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');

  const {
    query: inputValue,
    setQuery: setInputValue,
    suggestions,
    handleSelectSuggestion: selectSuggestion,
    clearQuery,
  } = useIngredientAutocomplete({
    maxSuggestions: 6,
    onSelect: (name) => addToPantry(name),
  });

  const categories = ['All', 'Produce', 'Dairy & Eggs', 'Meat & Poultry', 'Seafood', 'Grains & Pasta', 'Oils & Condiments', 'Pantry & Spices'];

  // Quick 1-Click Starter Pantry Kits
  const STARTER_KITS = [
    {
      name: '🍝 Italian Staples',
      items: ['Olive Oil', 'Garlic', 'Tomatoes', 'Parmesan Cheese', 'Pasta']
    },
    {
      name: '🍳 Breakfast Basics',
      items: ['Eggs', 'Butter', 'Milk', 'Bread', 'Cheddar Cheese']
    },
    {
      name: '🥢 Asian Flavors',
      items: ['Soy Sauce', 'Rice', 'Garlic', 'Sesame Oil', 'Ginger']
    }
  ];

  const handleApplyStarterKit = (items: string[]) => {
    addToPantry(items);
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      addToPantry(inputValue.trim());
      clearQuery();
    }
  };

  // Filter common catalog ingredients by active category
  const filteredCatalog = COMMON_INGREDIENTS.filter(ing => {
    if (activeCategory === 'All') return true;
    return ing.category === activeCategory;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 selection:bg-[#D4AF37]/30"
    >
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2724] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-bold transition-all duration-200">
            <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>My Kitchen Staples (</span>
            <span key={pantryItems.length} className="animate-in fade-in duration-200">{pantryItems.length}</span>
            <span>)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
            My Saved Pantry
          </h1>
          <p className="text-xs sm:text-sm text-[#C2BCB2]">
            Keep your staples saved here so they are auto-loaded whenever you search for recipes!
          </p>
        </div>

        <button
          onClick={() => navigateTo('/results', { ingredients: pantryItems.join(',') })}
          disabled={pantryItems.length === 0}
          className={`px-6 py-3.5 text-xs font-extrabold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
            pantryItems.length > 0
              ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black hover:brightness-110 hover:-translate-y-0.5 shadow-[#D4AF37]/10 cursor-pointer'
              : 'bg-[#2A2724] text-[#8A8275] border border-[#2A2724] cursor-not-allowed shadow-none opacity-80'
          }`}
        >
          <Sparkles className={`w-4 h-4 ${pantryItems.length > 0 ? 'text-black' : 'text-[#8A8275]'}`} />
          <span className="transition-all duration-200">
            {pantryItems.length > 0
              ? `Find Recipes with My Pantry (${pantryItems.length})`
              : 'Add ingredients to unlock recipe matching'}
          </span>
          <ArrowRight className={`w-4 h-4 ${pantryItems.length > 0 ? 'text-black' : 'text-[#8A8275]'}`} />
        </button>
      </div>

      {/* Add New Pantry Ingredient Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-4"
      >
        <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Add Staples to Your Pantry</h3>
        
        <form onSubmit={handleAddCustom} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#A39C90] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search pantry items or add your own..."
              className="w-full pl-10 pr-4 py-3 bg-[#23211E] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:border-[#D4AF37] transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-3 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black text-xs font-extrabold rounded-2xl transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex items-center gap-1 shrink-0 shadow-md hover:brightness-110"
          >
            <Plus className="w-4 h-4 text-black" /> Add Item
          </button>
        </form>

        {/* Autocomplete Popup */}
        {suggestions.length > 0 && (
          <div className="p-3 bg-[#23211E] rounded-2xl border border-[#2A2724] space-y-2 animate-in fade-in duration-150">
            <p className="text-[10px] font-bold text-[#A39C90] uppercase tracking-wider">Catalog Suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {suggestions.map((item) => {
                const isSaved = pantryItems.some(p => p.toLowerCase() === item.name.toLowerCase());
                return (
                  <button
                    key={item.id}
                    onClick={() => selectSuggestion(item.name)}
                    disabled={isSaved}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                      isSaved
                        ? 'bg-[#2A2724] text-[#8A8275] border border-transparent'
                        : 'bg-[#1E1D1B] hover:bg-[#2A2724] text-[#F5F2EB] border border-[#2A2724] hover:border-[#D4AF37]'
                    }`}
                  >
                    <span>{item.name}</span>
                    {isSaved ? <Check className="w-3 h-3 text-[#D4AF37]" /> : <Plus className="w-3 h-3 text-[#D4AF37]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>

      {/* Saved Pantry Items View */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Your Saved Staples</h3>
          <span className="text-xs text-[#A39C90] font-medium transition-all duration-200">
            {pantryItems.length} items in pantry
          </span>
        </div>

        {pantryItems.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            <AnimatePresence>
              {pantryItems.map((item) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 py-2 bg-[#1E1D1B] border border-[#D4AF37]/40 rounded-2xl text-xs font-bold text-[#F5F2EB] flex items-center gap-2 shadow-sm hover:border-[#D4AF37] hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#D4AF37]/5 transition-all duration-200"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => removeFromPantry(item)}
                    className="p-1 text-[#A39C90] hover:text-[#E6A135] rounded-full transition-colors cursor-pointer"
                    title="Remove from pantry"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden p-8 text-center border border-dashed border-[#2A2724] rounded-2xl space-y-5 bg-[#161513]/50"
          >
            {/* Ambient Gold Radial Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/5 via-transparent to-transparent pointer-events-none" />

            {/* Floating Animated Graphic */}
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30"
              />
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center shadow-lg shadow-[#D4AF37]/15"
              >
                <UtensilsCrossed className="w-7 h-7 text-black" />
              </motion.div>
            </div>

            <div className="space-y-1 relative z-10 max-w-sm mx-auto">
              <h4 className="font-serif font-bold text-lg text-[#F5F2EB]">Your Pantry is Empty</h4>
              <p className="text-xs text-[#C2BCB2]">
                Save your fridge and pantry staples once, and they will automatically rank every recipe by match quality!
              </p>
            </div>

            {/* Quick 1-Click Starter Kits */}
            <div className="pt-2 space-y-2 relative z-10 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider">
                <Wand2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Start with a Pantry Bundle:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {STARTER_KITS.map((kit, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyStarterKit(kit.items)}
                    className="p-2.5 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37] rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer group"
                  >
                    <div className="text-xs font-bold text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                      {kit.name}
                    </div>
                    <div className="text-[10px] text-[#A39C90] truncate mt-0.5">
                      {kit.items.join(', ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Catalog Quick Toggle Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-5"
      >
        <div>
          <h3 className="font-serif font-bold text-base text-[#F5F2EB]">Browse Catalog by Category</h3>
          <p className="text-xs text-[#C2BCB2]">Click any item to toggle it in or out of your saved pantry.</p>
        </div>

        {/* Sticky Category Tabs */}
        <div className="sticky top-0 bg-[#1A1918]/95 backdrop-blur-md z-10 py-2.5 -mx-6 px-6 border-b border-[#2A2724]/40 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {categories.map((cat) => {
            const count = cat === 'All'
              ? COMMON_INGREDIENTS.length
              : COMMON_INGREDIENTS.filter(ing => ing.category === cat).length;
            const isCatActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isCatActive
                    ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold shadow-sm hover:-translate-y-0.5'
                    : 'bg-[#23211E] text-[#C2BCB2] border border-[#2A2724] hover:bg-[#2A2724] hover:text-[#F5F2EB] hover:border-[#D4AF37]/40 hover:-translate-y-0.5'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>

        {/* Ingredient Quick Toggle Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
          {filteredCatalog.map((ing) => {
            const inPantry = pantryItems.some(p => p.toLowerCase() === ing.name.toLowerCase());
            return (
              <button
                key={ing.id}
                onClick={() => {
                  if (inPantry) {
                    removeFromPantry(ing.name);
                  } else {
                    addToPantry(ing.name);
                  }
                }}
                className={`p-3 rounded-2xl border text-xs font-medium flex items-center justify-between text-left transition-all duration-200 hover:-translate-y-0.5 cursor-pointer ${
                  inPantry
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F5F2EB] font-bold shadow-md shadow-[#D4AF37]/5 hover:border-[#D4AF37] hover:shadow-lg'
                    : 'bg-[#23211E] border-[#2A2724] text-[#C2BCB2] hover:border-[#D4AF37]/50 hover:text-[#F5F2EB] hover:shadow-md hover:shadow-[#D4AF37]/5'
                }`}
              >
                <span className="truncate pr-1">{ing.name}</span>
                {inPantry ? (
                  <Check className="w-4 h-4 text-[#D4AF37] shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-[#8A8275] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </motion.div>

    </motion.div>
  );
};

