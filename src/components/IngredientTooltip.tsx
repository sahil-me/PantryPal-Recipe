import React, { useState, useRef, useEffect } from 'react';
import { getIngredientTip } from '../data/ingredientTips';
import { findPantrySubstitutions } from '../utils/substitutions';
import { useApp } from '../context/AppContext';
import { Lightbulb, RefreshCw, Archive, Clock, X, Sparkles, Check, ArrowRightLeft } from 'lucide-react';

interface IngredientTooltipProps {
  ingredientName: string;
  amount: number | string;
  unit: string;
  optional?: boolean;
  inKitchen?: boolean;
  addedToShoppingList?: boolean;
  onToggleShoppingList?: () => void;
  pantryItems?: string[];
  className?: string;
}

export const IngredientTooltip: React.FC<IngredientTooltipProps> = ({
  ingredientName,
  amount,
  unit,
  optional = false,
  inKitchen = false,
  addedToShoppingList = false,
  onToggleShoppingList,
  pantryItems: customPantryItems,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Attempt to use app context for pantry items if not provided explicitly as prop
  let contextPantryItems: string[] = [];
  try {
    const app = useApp();
    contextPantryItems = app.pantryItems || [];
  } catch {
    // If rendered outside provider (e.g. in standalone tests)
  }

  const cleanIngredientTitle = (name: string) => {
    if (!name) return 'Ingredient';
    const parts = name.split(':');
    const raw = parts.length > 1 ? parts[1].trim() : parts[0].trim();
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  };

  const pantryList = customPantryItems || contextPantryItems;
  const tip = getIngredientTip(ingredientName);
  const subResult = findPantrySubstitutions(ingredientName, pantryList);
  const displayTitle = cleanIngredientTitle(ingredientName);

  // Close tooltip on outside click or escape press
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* Interactive Ingredient Row Container */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 bg-[#23211E] rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
          isOpen
            ? 'border-[#D4AF37] bg-[#23211E] shadow-md shadow-[#D4AF37]/10'
            : subResult.hasPantryMatch && !inKitchen
            ? 'border-[#D4AF37]/70 bg-[#1E1D1B] hover:border-[#D4AF37]'
            : 'border-[#2A2724] hover:border-[#D4AF37]/50 hover:bg-[#2A2724]/70'
        }`}
        title="Tap or click to reveal cooking substitutions and storage tips"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="flex items-center gap-2 overflow-hidden pr-2">
          {/* Ingredient Title & Amount */}
          <div className="flex flex-col">
            <span className="font-semibold text-xs text-[#F5F2EB] flex items-center gap-1.5 flex-wrap">
              {ingredientName}
              {optional && (
                <span className="text-[10px] text-[#A39C90] font-normal italic">(optional)</span>
              )}
              {subResult.hasPantryMatch && !inKitchen && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                  <ArrowRightLeft className="w-2.5 h-2.5" />
                  Swap: {subResult.pantryMatches[0].pantryItem}
                </span>
              )}
            </span>
            <span className="text-[#A39C90] text-[11px] font-sans">
              {amount} {unit}
            </span>
          </div>
        </div>

        {/* Right Action & Info Indicator */}
        <div className="flex items-center gap-2 shrink-0">
          {onToggleShoppingList && !inKitchen && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleShoppingList();
              }}
              className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1 ${
                addedToShoppingList
                  ? 'bg-[#2A2724] text-[#D4AF37] border border-[#D4AF37]/50 shadow-xs'
                  : 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black font-extrabold hover:brightness-110 shadow-xs'
              }`}
            >
              {addedToShoppingList ? (
                <span className="flex items-center gap-1 animate-in zoom-in-75 duration-150">
                  <Check className="w-3 h-3 text-[#D4AF37]" /> ✓ Added
                </span>
              ) : (
                '+ Add'
              )}
            </button>
          )}

          {/* Sparkles / Lightbulb hint icon - Secondary Outlined Button */}
          <span
            className={`px-2.5 py-1 rounded-lg transition-all duration-150 flex items-center gap-1 text-[10px] font-medium cursor-pointer ${
              isOpen
                ? 'bg-[#2A2724] text-[#F5F2EB] border border-[#D4AF37]'
                : subResult.hasPantryMatch && !inKitchen
                ? 'bg-[#161513] text-[#D4AF37] border border-[#D4AF37]/50 hover:border-[#D4AF37]'
                : 'bg-[#161513] text-[#A39C90] border border-[#2A2724] hover:text-[#D4AF37] hover:border-[#D4AF37]/40'
            }`}
          >
            {subResult.hasPantryMatch && !inKitchen ? (
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
            ) : (
              <Lightbulb className="w-3 h-3 text-[#A39C90] group-hover:text-[#D4AF37] transition-colors" />
            )}
            <span className="hidden sm:inline">
              {subResult.hasPantryMatch && !inKitchen ? 'Pantry Swap' : 'Tips'}
            </span>
          </span>
        </div>
      </div>

      {/* Popover / Tooltip Window */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 p-4 bg-[#1A1918] border border-[#D4AF37]/60 rounded-2xl shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A2724] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#D4AF37]/15 text-[#D4AF37]">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </span>
              <div>
                <h4 className="text-xs font-serif font-bold text-[#F5F2EB]">
                  Kitchen Insights — {displayTitle}
                </h4>
                <p className="text-[10px] text-[#A39C90]">Substitutions & Storage Guide</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg text-[#A39C90] hover:text-[#F5F2EB] hover:bg-[#23211E] transition-colors cursor-pointer"
              title="Close tips"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Pantry Match Highlight */}
          {subResult.hasPantryMatch && (
            <div className="p-2.5 bg-[#161513] border border-[#D4AF37] rounded-xl space-y-2">
              <div className="text-[11px] font-extrabold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                In Your Pantry (Ready to Substitute):
              </div>
              <div className="space-y-1.5">
                {subResult.pantryMatches.map((sub, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-[#23211E] border border-[#D4AF37]/30 flex items-start justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-[#F5F2EB] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> {sub.pantryItem}
                      </span>
                      <p className="text-[11px] text-[#C2BCB2] mt-0.5">{sub.substitutionNote}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37] text-black shrink-0">
                      Pantry Match
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Other Substitutions Section */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1 uppercase tracking-wider">
              <RefreshCw className="w-3 h-3 text-[#D4AF37]" />
              {subResult.hasPantryMatch ? 'Other General Substitutions' : 'Common Substitutions'}
            </div>
            <ul className="space-y-1 pl-1">
              {tip.substitutions.map((sub, idx) => (
                <li key={idx} className="text-xs text-[#F5F2EB] flex items-start gap-1.5">
                  <span className="text-[#D4AF37] font-bold">•</span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Storage & Shelf Life Section */}
          <div className="space-y-1 pt-1 border-t border-[#2A2724]">
            <div className="text-[11px] font-bold text-[#E6A135] flex items-center gap-1 uppercase tracking-wider">
              <Archive className="w-3 h-3 text-[#E6A135]" /> Storage Guidance
            </div>
            <p className="text-xs text-[#C2BCB2] leading-relaxed">
              {tip.storageTip}
            </p>
            {tip.shelfLife && (
              <div className="flex items-center gap-1 text-[11px] text-[#A39C90] pt-0.5">
                <Clock className="w-3 h-3 text-[#D4AF37]" />
                <span>Estimated shelf life: <strong className="text-[#F5F2EB]">{tip.shelfLife}</strong></span>
              </div>
            )}
          </div>

          {/* Chef Pro Tip */}
          {tip.proTip && (
            <div className="p-2.5 bg-[#23211E] border border-[#D4AF37]/20 rounded-xl text-[11px] text-[#D4AF37] flex items-start gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-[#E5C158] shrink-0 mt-0.5" />
              <span><strong>Chef's Tip:</strong> {tip.proTip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

