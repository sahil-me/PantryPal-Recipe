import React from 'react';
import { useApp } from '../context/AppContext';
import { NAV_ITEMS } from '../utils/navigation';

export const BottomNav: React.FC = () => {
  const { currentRoute, navigateTo, pantryItems, favoriteIds } = useApp();

  const getBadgeCount = (badgeType?: 'pantry' | 'favorites' | null) => {
    if (badgeType === 'pantry') return pantryItems.length;
    if (badgeType === 'favorites') return favoriteIds.length;
    return null;
  };

  // Exclude root home item from bottom navigation bar
  const bottomNavItems = NAV_ITEMS.filter((item) => item.id !== '/');

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#161513]/95 backdrop-blur-md border-t border-[#2A2724] px-3 py-2 z-40 flex items-center justify-around shadow-2xl">
      {bottomNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentRoute === item.id || (item.id === '/search' && currentRoute === '/results');
        const badgeCount = getBadgeCount(item.badgeType);

        return (
          <button
            key={item.id}
            onClick={() => navigateTo(item.id)}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all relative cursor-pointer ${
              isActive ? 'text-[#D4AF37] font-bold' : 'text-[#A39C90] hover:text-[#F5F2EB]'
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {badgeCount !== null && badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#D4AF37] text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#161513]">
                  {badgeCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{item.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
};
