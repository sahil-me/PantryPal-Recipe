import React, { useState } from 'react';
import { POPULAR_INGREDIENTS } from '../data/ingredients';
import { Plus, X, Search, Sparkles, UtensilsCrossed, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { useIngredientAutocomplete } from '../hooks/useIngredientAutocomplete';

interface IngredientSearchBarProps {
  selectedIngredients: string[];
  pantryItems?: string[];
  onAddIngredient: (name: string) => void;
  onRemoveIngredient: (name: string) => void;
  onClearAll?: () => void;
  onLoadPantry?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const IngredientSearchBar: React.FC<IngredientSearchBarProps> = ({
  selectedIngredients,
  pantryItems = [],
  onAddIngredient,
  onRemoveIngredient,
  onClearAll,
  onLoadPantry,
  placeholder = 'Search or add ingredients (e.g. Garlic, Eggs, Tomatoes)...',
  autoFocus = false,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);

  const {
    query: inputValue,
    setQuery: setInputValue,
    suggestions,
    isOpen,
    setIsOpen,
    highlightedIndex,
    setHighlightedIndex,
    dropdownRef,
    inputRef,
    handleSelectSuggestion: selectSuggestion,
  } = useIngredientAutocomplete({
    maxSuggestions: 8,
    onSelect: (name) => {
      onAddIngredient(name);
      if (collapsible) {
        setIsExpanded(false);
      }
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      if (isOpen && suggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev: number) => (prev + 1) % suggestions.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (isOpen && suggestions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev: number) => (prev - 1 + suggestions.length) % suggestions.length);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && suggestions[highlightedIndex]) {
        selectSuggestion(suggestions[highlightedIndex].name);
      } else if (inputValue.trim()) {
        onAddIngredient(inputValue.trim());
        setInputValue('');
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (collapsible) {
          setIsExpanded(false);
        }
      } else if (collapsible && isExpanded) {
        setIsExpanded(false);
      }
    }
  };

  const isPantryItem = (name: string) => {
    return pantryItems.some(p => p.toLowerCase() === name.toLowerCase());
  };

  const previewLimit = 4;
  const visiblePreviewChips = selectedIngredients.slice(0, previewLimit);
  const hiddenCount = selectedIngredients.length - previewLimit;

  return (
    <div className="space-y-2 w-full">
      {/* Input Box with Autocomplete and Toggle Pill */}
      <div className="relative w-full" ref={dropdownRef}>
        <div className="relative flex items-center gap-2">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-[#A39C90] absolute left-4 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => inputValue.trim() && setIsOpen(true)}
              placeholder={placeholder}
              autoFocus={autoFocus}
              className="w-full pl-11 pr-24 py-3 bg-[#1E1D1B] border border-[#2A2724] focus:border-[#D4AF37] rounded-2xl text-xs sm:text-sm text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/20 shadow-md transition-all font-medium"
            />
            {inputValue.trim() && (
              <button
                type="button"
                onClick={() => selectSuggestion(inputValue.trim())}
                className="absolute right-2 px-3 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 text-black text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-black" /> Add
              </button>
            )}
          </div>

          {collapsible && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3.5 py-3 rounded-2xl border text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md ${
                isExpanded
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black border-[#D4AF37]'
                  : 'bg-[#1E1D1B] hover:bg-[#23211E] text-[#D4AF37] border border-[#D4AF37]/40 hover:border-[#D4AF37]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Active</span>
              <span>({selectedIngredients.length})</span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[#1A1918] rounded-2xl border border-[#2A2724] shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">
            <div className="p-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider border-b border-[#2A2724] flex items-center justify-between">
              <span>Suggested Culinary Ingredients</span>
              <span className="text-[9px] text-[#8A8275] lowercase font-normal">↑↓ to navigate, enter to select</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#2A2724]">
              {suggestions.map((ing, idx) => {
                const isSelected = selectedIngredients.some(s => s.toLowerCase() === ing.name.toLowerCase());
                const isHighlighted = idx === highlightedIndex;
                return (
                  <button
                    key={ing.id}
                    onClick={() => selectSuggestion(ing.name)}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    disabled={isSelected}
                    className={`w-full px-4 py-2.5 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-[#161513] text-[#8A8275] cursor-default'
                        : isHighlighted
                        ? 'bg-[#23211E] text-[#D4AF37] border-l-2 border-[#D4AF37] cursor-pointer'
                        : 'hover:bg-[#23211E] text-[#F5F2EB] cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isHighlighted ? 'text-[#D4AF37]' : 'text-[#F5F2EB]'}`}>{ing.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2A2724] text-[#D4AF37]">
                        {ing.category}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] text-[#D4AF37] font-bold">Added</span>
                    ) : (
                      <Plus className={`w-3.5 h-3.5 ${isHighlighted ? 'text-[#D4AF37]' : 'text-[#A39C90]'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* COMPACT SINGLE ROW DISPLAY (when collapsible & collapsed) */}
      {collapsible && !isExpanded && selectedIngredients.length > 0 && (
        <div className="flex items-center justify-between gap-2 bg-[#1E1D1B]/80 backdrop-blur-xs border border-[#2A2724] px-3 py-1.5 rounded-xl text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#D4AF37] shrink-0 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" /> Applied:
            </span>
            {visiblePreviewChips.map((item) => (
              <div
                key={item}
                className="px-2.5 py-0.5 rounded-lg bg-[#23211E] border border-[#2A2724] text-[#F5F2EB] text-[11px] font-bold flex items-center gap-1.5 shrink-0"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => onRemoveIngredient(item)}
                  className="p-0.5 text-[#A39C90] hover:text-[#E6A135] rounded-full cursor-pointer"
                  title="Remove ingredient"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {hiddenCount > 0 && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="px-2 py-0.5 rounded-lg bg-[#2A2724] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black text-[11px] font-bold transition-all shrink-0 cursor-pointer"
              >
                +{hiddenCount} more...
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="text-[11px] text-[#D4AF37] hover:underline font-bold shrink-0 ml-1 cursor-pointer"
          >
            Edit All
          </button>
        </div>
      )}

      {/* FULL EXPANDED INGREDIENTS PANEL */}
      {(!collapsible || isExpanded) && (
        <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl space-y-3 shadow-md animate-in zoom-in-98 duration-150">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#F5F2EB] font-bold">
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>Active Kitchen Ingredients ({selectedIngredients.length})</span>
            </div>
            <div className="flex items-center gap-2">
              {onLoadPantry && pantryItems.length > 0 && (
                <button
                  type="button"
                  onClick={onLoadPantry}
                  className="text-[11px] font-bold text-[#D4AF37] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <UtensilsCrossed className="w-3 h-3 text-[#D4AF37]" /> Load Pantry
                </button>
              )}
              {onClearAll && selectedIngredients.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[11px] font-semibold text-[#E6A135] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>

          {selectedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
              {selectedIngredients.map((item) => {
                const inPantry = isPantryItem(item);
                return (
                  <div
                    key={item}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs ${
                      inPantry
                        ? 'bg-[#2A2724] border border-[#D4AF37]/50 text-[#F5F2EB] hover:border-[#D4AF37]'
                        : 'bg-[#23211E] border border-[#2A2724] text-[#F5F2EB] hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {inPantry && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" title="Saved in Pantry" />
                      )}
                      {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveIngredient(item)}
                      className="p-0.5 text-[#A39C90] hover:text-[#E6A135] rounded-full transition-colors cursor-pointer"
                      title="Remove ingredient"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-[#A39C90] font-medium border border-dashed border-[#2A2724] rounded-xl bg-[#161513]/50">
              Your kitchen is empty. Add ingredients above or tap a quick staple below to discover matching recipes.
            </div>
          )}

          {/* Quick Add Staples */}
          <div className="pt-2 border-t border-[#2A2724]">
            <span className="text-[11px] text-[#A39C90] font-semibold mr-2">Quick staples:</span>
            <div className="inline-flex flex-wrap gap-1.5 mt-1">
              {POPULAR_INGREDIENTS.slice(0, 6).map((staple) => {
                const isAdded = selectedIngredients.some(s => s.toLowerCase() === staple.toLowerCase());
                return (
                  <button
                    type="button"
                    key={staple}
                    onClick={() => {
                      if (isAdded) {
                        onRemoveIngredient(staple);
                      } else {
                        onAddIngredient(staple);
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer flex items-center gap-1 border ${
                      isAdded
                        ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#D4AF37] font-semibold shadow-xs'
                        : 'bg-[#23211E] hover:bg-[#2A2724] border-[#2A2724] hover:border-[#D4AF37]/50 text-[#F5F2EB] hover:text-[#D4AF37]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3 text-[#D4AF37]" />
                        <span>{staple}</span>
                      </>
                    ) : (
                      <>+ {staple}</>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapse / Done Button if collapsible */}
          {collapsible && (
            <div className="pt-2 border-t border-[#2A2724] flex justify-end">
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
              >
                <Check className="w-4 h-4 text-black" />
                <span>Apply & View Results</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

