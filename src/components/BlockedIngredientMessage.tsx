import React from 'react';
import { UtensilsCrossed, ArrowRight, Sparkles } from 'lucide-react';

interface BlockedIngredientMessageProps {
  blockedItem?: string;
  onExplore: () => void;
}

export const BlockedIngredientMessage: React.FC<BlockedIngredientMessageProps> = ({
  blockedItem = 'Beef',
  onExplore
}) => {
  const formattedItem = blockedItem.charAt(0).toUpperCase() + blockedItem.slice(1);

  return (
    <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 selection:bg-[#D4AF37]/30">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4AF37]/20 to-[#E6A135]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37] shadow-lg">
        <UtensilsCrossed className="w-8 h-8" />
      </div>

      <div className="space-y-3">
        <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#F5F2EB]">
          {formattedItem} recipes are currently not available in PantryPal.
        </h2>
        <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed max-w-xl mx-auto">
          We currently support recipes made with chicken, vegetables, seafood, eggs, pasta, rice, legumes, and many other ingredients.
        </p>
      </div>

      <div className="pt-2 flex justify-center">
        <button
          onClick={onExplore}
          className="px-8 py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Explore Available Recipes</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>
    </div>
  );
};
