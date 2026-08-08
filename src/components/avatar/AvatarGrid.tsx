import React, { useState, useMemo } from 'react';
import { BUILTIN_AVATARS, AVATAR_CATEGORIES, AvatarCategory } from '../../data/avatars';
import { AvatarCard } from './AvatarCard';
import { UserProfile } from '../../context/AuthContext';
import { Search } from 'lucide-react';

interface AvatarGridProps {
  selectedAvatarId: string;
  onSelectAvatar: (avatarId: string) => void;
  user?: UserProfile | null;
}

export const AvatarGrid: React.FC<AvatarGridProps> = ({ selectedAvatarId, onSelectAvatar, user }) => {
  const [activeCategory, setActiveCategory] = useState<AvatarCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAvatars = useMemo(() => {
    return BUILTIN_AVATARS.filter(avatar => {
      const matchesCategory = activeCategory === 'all' || avatar.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        avatar.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="space-y-4">
      {/* Search Input & Category Filter Tabs */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A39C90]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search avatars..."
            className="w-full pl-10 pr-4 py-2 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none transition-colors"
          />
        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {AVATAR_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black shadow-md'
                  : 'bg-[#1E1D1B] text-[#C2BCB2] hover:text-[#F5F2EB] hover:bg-[#23211E] border border-[#2A2724]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Avatar Grid Container */}
      {filteredAvatars.length === 0 ? (
        <div className="py-12 px-4 text-center text-xs text-[#A39C90] space-y-1 bg-[#1E1D1B]/60 border border-[#2A2724] rounded-2xl flex flex-col items-center justify-center min-h-[180px]">
          <p className="font-bold text-sm text-[#F5F2EB]">No avatars found</p>
          <p className="text-xs text-[#A39C90]">Try another keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredAvatars.map(avatar => (
            <AvatarCard
              key={avatar.id}
              avatar={avatar}
              isSelected={selectedAvatarId === avatar.id}
              onSelect={onSelectAvatar}
              user={user}
            />
          ))}
        </div>
      )}
    </div>
  );
};
