import React from 'react';
import { useApp } from '../context/AppContext';
import { useAuth, formatTitleCase } from '../context/AuthContext';
import { Avatar } from './avatar/Avatar';
import { ChefHat, LogOut, Sparkles, Linkedin, Github, Settings } from 'lucide-react';
import { NAV_ITEMS } from '../utils/navigation';
import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from '../utils/constants';

export const Sidebar: React.FC = () => {
  const { currentRoute, navigateTo, pantryItems, favoriteIds } = useApp();
  const { user, isAuthenticated, signOut, openAuthModal } = useAuth();

  const getBadgeCount = (badgeType?: 'pantry' | 'favorites' | null) => {
    if (badgeType === 'pantry') return pantryItems.length;
    if (badgeType === 'favorites') return favoriteIds.length;
    return null;
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-gradient-to-b from-[#1b1b1b] to-[#111111] border-r border-[#2A2724] h-screen sticky top-0 p-5 justify-between shrink-0 z-30 selection:bg-[#D4AF37]/30">
      <div className="space-y-4 overflow-y-auto pr-0.5 no-scrollbar">
        {/* Brand Logo */}
        <div
          onClick={() => navigateTo(isAuthenticated ? '/search' : '/')}
          className="flex items-center gap-3 cursor-pointer group px-2 py-1"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] flex items-center justify-center text-black font-bold shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform">
            <ChefHat className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-[#F5F2EB] tracking-wide group-hover:text-[#D4AF37] transition-colors">
              PantryPal
            </h1>
            <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wide">
              Cook • Save • Discover
            </p>
          </div>
        </div>

        {/* Quick Pantry Active Banner */}
        {isAuthenticated && (
          <div
            onClick={() => navigateTo('/pantry')}
            className="p-3 bg-[#1E1D1B] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-2xl cursor-pointer transition-all group shadow-sm"
          >
            <div className="flex items-center justify-between text-xs font-bold mb-1">
              <span className="flex items-center gap-1.5 text-[#D4AF37]">
                <Sparkles className="w-3.5 h-3.5 text-[#F3C64F]" />
                Pantry Active
              </span>
              <span className="bg-[#D4AF37] text-black px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                {pantryItems.length} items
              </span>
            </div>
            <p className="text-[11px] text-[#C2BCB2] font-medium line-clamp-1 group-hover:text-[#F5F2EB] transition-colors">
              {pantryItems.length > 0 ? pantryItems.slice(0, 3).join(', ') + (pantryItems.length > 3 ? '...' : '') : 'Add ingredients to match recipes'}
            </p>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-1">
          <div className="px-3 text-[11px] font-bold text-[#A39C90] uppercase tracking-wider mb-2">
            Browse
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id || (item.id === '/search' && currentRoute === '/results');
            const badgeCount = getBadgeCount(item.badgeType);

            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`group relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-[#D4AF37]/15 border-[#D4AF37]/50 text-[#F5F2EB] font-bold shadow-sm shadow-[#D4AF37]/5'
                    : 'border-transparent text-[#C2BCB2] hover:bg-[#23211E] hover:text-[#F5F2EB] hover:border-[#2A2724]'
                }`}
              >
                {/* Gold left indicator bar on active/hover */}
                <span
                  className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full transition-all duration-200 ${
                    isActive
                      ? 'bg-[#D4AF37] opacity-100 scale-y-100 shadow-xs shadow-[#D4AF37]'
                      : 'bg-[#D4AF37]/60 opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100'
                  }`}
                />

                <div className="flex items-center gap-3 pl-1">
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:translate-x-[2px] ${
                      isActive ? 'text-[#D4AF37]' : 'text-[#A39C90] group-hover:text-[#D4AF37]'
                    }`}
                  />
                  <span className={`transition-all duration-200 ${isActive ? 'font-bold text-[#F5F2EB]' : 'group-hover:text-[#F5F2EB]'}`}>
                    {item.label}
                  </span>
                </div>

                {badgeCount !== null && badgeCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-[#D4AF37] text-black font-extrabold' : 'bg-[#2A2724] text-[#D4AF37] border border-[#D4AF37]/20'
                    }`}
                  >
                    {badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: User Info + Pinned Sidebar Footer */}
      <div className="pt-3 space-y-3 shrink-0 mt-auto border-t border-[#2A2724]/60">
        {/* User Footer Account Card / Auth Buttons */}
        {isAuthenticated && user ? (
          <div className="bg-[#1E1D1B] border border-[#2A2724] p-2.5 rounded-2xl flex items-center justify-between gap-2">
            <div
              onClick={() => navigateTo('/account')}
              className="flex items-center gap-2 min-w-0 cursor-pointer hover:opacity-90 transition-opacity"
            >
              <Avatar user={user} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#F5F2EB] truncate">{formatTitleCase(user.name)}</p>
                <p className="text-[10px] text-[#A39C90] truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => navigateTo('/settings')}
                title="Settings"
                className="p-1.5 text-[#A39C90] hover:text-[#D4AF37] hover:bg-[#23211E] rounded-lg transition-colors cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  signOut();
                  navigateTo('/');
                }}
                title="Sign Out"
                className="p-1.5 text-[#A39C90] hover:text-[#E6A135] hover:bg-[#23211E] rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => openAuthModal('signin')}
              className="w-full py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[#D4AF37]/15"
            >
              Sign In
            </button>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-2.5 bg-[#1E1D1B] border border-[#2A2724] text-[#F5F2EB] font-bold text-xs rounded-xl hover:bg-[#23211E] hover:border-[#D4AF37]/50 hover:text-[#D4AF37] transition-all cursor-pointer"
            >
              Create Account
            </button>
          </div>
        )}

        {/* Persistent Sidebar Footer */}
        <div className="pt-2 border-t border-[#2A2724] space-y-2">
          <div className="flex items-center justify-between text-[11px] px-0.5">
            <span className="font-semibold text-[#D4AF37]">Version 1.0</span>
            <span className="text-[10px] text-[#8A8275]">© 2026</span>
          </div>
          <div className="text-center">
            <span className="text-[#A39C90] text-[10px] block font-medium">Developed by</span>
            <span className="text-[#F5F2EB] font-bold text-xs tracking-wide block mt-0.5">Sahil Sharma</span>
          </div>
          <div className="flex items-center justify-center gap-2 pt-0.5">
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-[#1E1D1B] border border-[#2A2724] text-[#A39C90] hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#23211E] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#D4AF37]/10 cursor-pointer group flex items-center gap-1.5 text-[11px] font-semibold"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
              <span>LinkedIn</span>
            </a>
            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-[#1E1D1B] border border-[#2A2724] text-[#A39C90] hover:text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#23211E] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#D4AF37]/10 cursor-pointer group flex items-center gap-1.5 text-[11px] font-semibold"
              title="GitHub Profile"
            >
              <Github className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

