import React, { useState } from 'react';
import { UserProfile, getUserInitial } from '../../context/AuthContext';
import { getAvatarDefinition, BUILTIN_AVATARS } from '../../data/avatars';
import {
  ChefHat,
  Cake,
  Flame,
  Wheat,
  Wine,
  Sparkles,
  Soup,
  Pizza,
  Vegan,
  Coffee,
  Fish,
  Utensils,
  Star,
  UserCheck,
  Compass,
  Dog,
  Bird,
  Heart,
  Cat,
  Crown,
  UtensilsCrossed,
  Trophy,
} from 'lucide-react';

export interface AvatarProps {
  user?: UserProfile | null;
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px] rounded-lg',
  sm: 'w-8 h-8 text-xs rounded-xl',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-14 h-14 text-xl rounded-2xl',
  xl: 'w-20 h-20 text-3xl rounded-2xl',
  '2xl': 'w-28 h-28 text-4xl rounded-3xl',
};

const ICON_SIZES = {
  xs: 'w-3.5 h-3.5',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
  xl: 'w-10 h-10',
  '2xl': 'w-14 h-14',
};

export const AvatarIconRenderer: React.FC<{ iconName: string; sizeClass: string; color?: string }> = ({
  iconName,
  sizeClass,
  color,
}) => {
  const style = color ? { color } : undefined;

  switch (iconName) {
    case 'ChefHat':
      return <ChefHat className={sizeClass} style={style} />;
    case 'Cake':
      return <Cake className={sizeClass} style={style} />;
    case 'Flame':
      return <Flame className={sizeClass} style={style} />;
    case 'Wheat':
      return <Wheat className={sizeClass} style={style} />;
    case 'Wine':
      return <Wine className={sizeClass} style={style} />;
    case 'Sparkles':
      return <Sparkles className={sizeClass} style={style} />;
    case 'Soup':
      return <Soup className={sizeClass} style={style} />;
    case 'Pizza':
      return <Pizza className={sizeClass} style={style} />;
    case 'Vegan':
      return <Vegan className={sizeClass} style={style} />;
    case 'Coffee':
      return <Coffee className={sizeClass} style={style} />;
    case 'Fish':
      return <Fish className={sizeClass} style={style} />;
    case 'Utensils':
      return <Utensils className={sizeClass} style={style} />;
    case 'Star':
      return <Star className={sizeClass} style={style} />;
    case 'UserCheck':
      return <UserCheck className={sizeClass} style={style} />;
    case 'Compass':
      return <Compass className={sizeClass} style={style} />;
    case 'Dog':
      return <Dog className={sizeClass} style={style} />;
    case 'Bird':
      return <Bird className={sizeClass} style={style} />;
    case 'Heart':
      return <Heart className={sizeClass} style={style} />;
    case 'Cat':
      return <Cat className={sizeClass} style={style} />;
    case 'Crown':
      return <Crown className={sizeClass} style={style} />;
    case 'UtensilsCrossed':
      return <UtensilsCrossed className={sizeClass} style={style} />;
    case 'Trophy':
      return <Trophy className={sizeClass} style={style} />;
    default:
      return <ChefHat className={sizeClass} style={style} />;
  }
};

export const Avatar: React.FC<AvatarProps> = ({
  user,
  avatarId: explicitAvatarId,
  size = 'md',
  className = '',
  showBorder = true,
}) => {
  const [imgError, setImgError] = useState(false);

  // Resolve identifier priority
  const effectiveId = explicitAvatarId || user?.avatarId || user?.photoURL || user?.avatarUrl || 'initial';

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const iconSizeClass = ICON_SIZES[size] || ICON_SIZES.md;

  // Check if effectiveId is a URL (http/https/data)
  const isUrl = (effectiveId.startsWith('http://') || effectiveId.startsWith('https://') || effectiveId.startsWith('data:')) && !imgError;

  if (isUrl) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden flex items-center justify-center bg-[#1A1918] ${sizeClass} ${
          showBorder ? 'border border-[#D4AF37]/50 shadow-md' : ''
        } ${className}`}
      >
        <img
          src={effectiveId}
          alt={user?.name || 'User Avatar'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Handle Initial or default fallback
  if (effectiveId === 'initial' || !BUILTIN_AVATARS.some(a => a.id === effectiveId)) {
    const initial = getUserInitial(user || null);
    return (
      <div
        className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-serif font-extrabold shadow-md ${sizeClass} ${
          showBorder ? 'border border-[#D4AF37]' : ''
        } ${className}`}
      >
        <span>{initial}</span>
      </div>
    );
  }

  // Handle Built-in Avatar
  const avatarDef = getAvatarDefinition(effectiveId);

  return (
    <div
      className={`relative shrink-0 flex items-center justify-center bg-gradient-to-br ${avatarDef.bgGradient} shadow-md overflow-hidden ${sizeClass} ${
        showBorder ? avatarDef.borderColor || 'border border-[#D4AF37]/40' : ''
      } ${className}`}
    >
      <AvatarIconRenderer iconName={avatarDef.iconName} sizeClass={iconSizeClass} color={avatarDef.accentColor} />
    </div>
  );
};
