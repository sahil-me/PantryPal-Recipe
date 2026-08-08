import React from 'react';
import { motion } from 'motion/react';
import { MatchResult } from '../types';
import { useApp } from '../context/AppContext';
import { getRecipeFallbackImage } from '../utils/imageUtils';
import { DifficultyBadge } from './DifficultyBadge';
import { Clock, Users, Heart, ChefHat, Check, AlertCircle, ChevronRight } from 'lucide-react';

interface RecipeCardProps {
  matchResult: MatchResult;
  onSelectRecipe?: (recipeId: string) => void;
  index?: number;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ matchResult, onSelectRecipe, index = 0 }) => {
  const { recipe, matchPercentage, matchedIngredients, missingIngredients } = matchResult;
  const { isFavorite, toggleFavorite, navigateTo } = useApp();

  const isFav = isFavorite(recipe.id);
  const is100Percent = matchPercentage === 100;
  const isMissingOne = missingIngredients.length === 1;

  const handleCardClick = () => {
    if (onSelectRecipe) {
      onSelectRecipe(recipe.id);
    } else {
      navigateTo('/recipe', { id: recipe.id });
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.97 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.35,
        ease: 'easeOut' as const
      }
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      className="bg-[#1E1D1B] rounded-2xl border border-[#2A2724] hover:border-[#D4AF37] shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 overflow-hidden flex flex-col group h-full"
    >
      {/* Recipe Image & Overlay Badge */}
      <div className="relative h-48 w-full overflow-hidden bg-[#161513]">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            const fallback = getRecipeFallbackImage(recipe.title, recipe.category);
            if (img.src !== fallback) {
              img.src = fallback;
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1D1B] via-transparent to-black/40" />

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(recipe.id);
          }}
          className={`absolute top-3 right-3 p-2.5 rounded-full backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md active:scale-90 hover:-translate-y-0.5 ${
            isFav
              ? 'bg-[#1E1D1B]/90 text-[#E6A135] border border-[#D4AF37] scale-110 shadow-[#D4AF37]/10'
              : 'bg-black/60 text-[#C2BCB2] hover:bg-black hover:text-[#D4AF37] hover:scale-105'
          }`}
          title={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart className={`w-4 h-4 transition-all duration-200 ${isFav ? 'fill-[#D4AF37] text-[#D4AF37] scale-110 animate-in zoom-in-75' : 'hover:scale-110'}`} />
        </button>

        {/* Match Percentage Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <div
            className={`px-3 py-1 rounded-full text-xs font-bold font-sans flex items-center gap-1.5 shadow-lg ${
              is100Percent
                ? 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold border border-[#D4AF37]'
                : isMissingOne
                ? 'bg-[#2A2724]/90 text-[#F3C64F] border border-[#E6A135]/50 backdrop-blur-md'
                : 'bg-black/80 text-[#C2BCB2] border border-[#2A2724] backdrop-blur-md'
            }`}
          >
            {is100Percent ? (
              <>
                <Check className="w-3.5 h-3.5 text-black" />
                <span>100% Chef Match</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-[#F3C64F]" />
                <span>{matchPercentage}% Match ({matchedIngredients.length}/{matchResult.totalRequired})</span>
              </>
            )}
          </div>
        </div>

        {/* Category & Difficulty Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-[#D4AF37] border border-[#D4AF37]/30 backdrop-blur-md tracking-wider uppercase">
            {recipe.category}
          </span>
          <DifficultyBadge level={recipe.difficulty} size="sm" />
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#A39C90] mb-1 flex-wrap">
            <span className="text-[#D4AF37]">{recipe.cuisine}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#D4AF37]" />
              {recipe.prepTimeMinutes + recipe.cookTimeMinutes}m
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3 text-[#D4AF37]" />
              {recipe.servings} serv
            </span>
          </div>

          <h3
            onClick={handleCardClick}
            className="font-serif font-bold text-base text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1"
          >
            {recipe.title}
          </h3>

          <p className="text-xs text-[#C2BCB2] line-clamp-2 mt-1 leading-relaxed font-light">
            {recipe.description}
          </p>
        </div>

        {/* Missing Ingredients Preview */}
        <div className="pt-2 border-t border-[#2A2724] space-y-1.5">
          {missingIngredients.length > 0 ? (
            <div className="text-[11px]">
              <span className="font-bold text-[#E6A135]">Need ({missingIngredients.length}): </span>
              <span className="text-[#C2BCB2]">
                {missingIngredients.map(m => m.ingredientName).join(', ')}
              </span>
            </div>
          ) : (
            <div className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> All ingredients active in kitchen!
            </div>
          )}

          {/* Action CTA Button */}
          <button
            onClick={handleCardClick}
            className="w-full mt-2 py-2 bg-[#23211E] hover:bg-gradient-to-r hover:from-[#D4AF37] hover:to-[#C5A028] border border-[#2A2724] hover:border-[#D4AF37] text-[#F5F2EB] hover:text-black text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs group-hover:bg-[#D4AF37] group-hover:text-black"
          >
            <span>View Recipe & Steps</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
