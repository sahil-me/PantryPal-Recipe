import React from 'react';
import { AvatarDefinition } from '../../data/avatars';
import { AvatarIconRenderer } from './Avatar';
import { Check } from 'lucide-react';
import { UserProfile, getUserInitial } from '../../context/AuthContext';

interface AvatarCardProps {
  avatar: AvatarDefinition;
  isSelected: boolean;
  onSelect: (avatarId: string) => void;
  user?: UserProfile | null;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({ avatar, isSelected, onSelect, user }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(avatar.id)}
      className={`group relative flex flex-col items-center justify-between p-3.5 rounded-2xl transition-all duration-200 cursor-pointer text-left w-full h-full ${
        isSelected
          ? 'bg-[#23211E] border-2 border-[#D4AF37] ring-2 ring-[#D4AF37]/30 shadow-xl shadow-[#D4AF37]/20'
          : 'bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 hover:bg-[#23211E]'
      }`}
    >
      {/* Selected Indicator Checkmark Badge */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center shadow-md animate-in zoom-in-50 duration-150 z-10">
          <Check className="w-3 h-3 stroke-[3]" />
        </div>
      )}

      {/* Avatar Visual Preview */}
      <div className="relative my-1 flex items-center justify-center">
        {avatar.id === 'initial' ? (
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-serif font-extrabold text-2xl flex items-center justify-center shadow-md border border-[#D4AF37] group-hover:scale-105 transition-transform duration-200">
            {getUserInitial(user || null)}
          </div>
        ) : (
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center shadow-md border ${
              avatar.borderColor || 'border-[#2A2724]'
            } group-hover:scale-105 transition-transform duration-200`}
          >
            <AvatarIconRenderer iconName={avatar.iconName} sizeClass="w-7 h-7" color={avatar.accentColor} />
          </div>
        )}
      </div>

      {/* Avatar Label */}
      <div className="w-full text-center mt-2">
        <div
          className={`text-xs font-bold truncate transition-colors ${
            isSelected ? 'text-[#D4AF37]' : 'text-[#F5F2EB] group-hover:text-[#D4AF37]'
          }`}
        >
          {avatar.name}
        </div>
      </div>
    </button>
  );
};
