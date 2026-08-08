import React from 'react';
import { DifficultyLevel } from '../types';
import { ChefHat, Flame, Sparkles, Award } from 'lucide-react';

interface DifficultyBadgeProps {
  level: DifficultyLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  level,
  size = 'sm',
  showIcon = true,
  className = ''
}) => {
  // Normalize difficulty string (map 'Hard' -> 'Pro' for culinary flair)
  const normalizedLevel = (level || 'Easy').toString().trim();
  const displayLabel = normalizedLevel === 'Hard' ? 'Pro' : normalizedLevel;

  let colorClasses = '';
  let icon = <ChefHat className="w-3 h-3" />;

  switch (displayLabel.toLowerCase()) {
    case 'easy':
      colorClasses = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40 hover:border-emerald-400';
      icon = <ChefHat className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
      break;
    case 'medium':
      colorClasses = 'bg-[#23211E] text-[#D4AF37] border-[#D4AF37]/50 hover:border-[#D4AF37]';
      icon = <Flame className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />;
      break;
    case 'pro':
    case 'hard':
      colorClasses = 'bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold border border-[#D4AF37] shadow-sm';
      icon = <Award className={size === 'sm' ? 'w-3 h-3 text-black' : 'w-3.5 h-3.5 text-black'} />;
      break;
    default:
      colorClasses = 'bg-[#23211E] text-[#C2BCB2] border-[#2A2724]';
      icon = <ChefHat className="w-3 h-3" />;
  }

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] rounded-full font-bold',
    md: 'px-3 py-1 text-xs rounded-full font-extrabold',
    lg: 'px-3.5 py-1.5 text-sm rounded-2xl font-extrabold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border backdrop-blur-md uppercase tracking-wider ${sizeClasses} ${colorClasses} ${className}`}
      title={`Cooking Difficulty Level: ${displayLabel}`}
    >
      {showIcon && icon}
      <span>{displayLabel}</span>
    </span>
  );
};
