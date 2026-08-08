import React, { useState } from 'react';

import { useAuth, formatTitleCase } from '../context/AuthContext';
import { useApp, ThemeMode } from '../context/AppContext';
import { Avatar } from '../components/avatar/Avatar';
import { AvatarPickerModal } from '../components/avatar/AvatarPickerModal';
import { User, Mail, UtensilsCrossed, Heart, Calendar, LogOut, Check, Sparkles, Edit2, Palette, Eye, Sun, Moon, UserRound, CheckCircle2 } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { user, signOut, updateProfile, openAuthModal, requireAuth } = useAuth();
  const { pantryItems, favoriteIds, navigateTo, showToast, theme, setTheme } = useApp();

  const [dietary, setDietary] = useState(user?.dietaryPreference || 'Any');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name ? formatTitleCase(user.name) : '');
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);

  const themeOptions: {
    id: ThemeMode;
    name: string;
    description: string;
    badge: string;
    previewBg: string;
    previewCard: string;
    previewText: string;
    previewAccent: string;
  }[] = [
    {
      id: 'dark',
      name: 'Haute Obsidian',
      description: 'Default espresso & champagne gold dark luxury',
      badge: 'Default',
      previewBg: '#121212',
      previewCard: '#1E1D1B',
      previewText: '#F5F2EB',
      previewAccent: '#D4AF37',
    },
    {
      id: 'hc-dark',
      name: 'OLED High-Contrast',
      description: 'Pure black canvas with vivid gold for maximum readability',
      badge: 'High Contrast',
      previewBg: '#000000',
      previewCard: '#141414',
      previewText: '#FFFFFF',
      previewAccent: '#FFD700',
    },
    {
      id: 'hc-light',
      name: 'High-Contrast Light',
      description: 'Pristine light background with crisp high-contrast text',
      badge: 'Light Mode',
      previewBg: '#FFFFFF',
      previewCard: '#F1F5F9',
      previewText: '#0F172A',
      previewAccent: '#B48A18',
    },
    {
      id: 'hc-cobalt',
      name: 'Cobalt & Amber',
      description: 'Vision-friendly midnight navy with electric amber highlights',
      badge: 'Color-Blind Safe',
      previewBg: '#0B132B',
      previewCard: '#1C2541',
      previewText: '#FFFFFF',
      previewAccent: '#FFB703',
    },
  ];

  const handleSavePreferences = () => {
    if (!user) {
      requireAuth(() => {
        updateProfile({ dietaryPreference: dietary });
        showToast('Dietary preferences updated!', 'success');
      }, "Sign in to save your dietary preferences.");
      return;
    }
    updateProfile({ dietaryPreference: dietary });
    showToast('Dietary preferences updated!', 'success');
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim()) return;
    if (!user) {
      requireAuth(() => {
        const formatted = formatTitleCase(editedName.trim());
        updateProfile({ name: formatted });
        setIsEditingName(false);
        showToast('Name updated successfully!', 'success');
      }, "Sign in to update your profile name.");
      return;
    }
    const formatted = formatTitleCase(editedName.trim());
    updateProfile({ name: formatted });
    setIsEditingName(false);
    showToast('Name updated successfully!', 'success');
  };

  const handleSaveAvatar = async (selectedAvatarId: string) => {
    if (!user) {
      requireAuth(() => {}, "Sign in to choose a custom avatar.");
      return;
    }
    try {
      await updateProfile({
        avatarId: selectedAvatarId,
        avatarUrl: selectedAvatarId,
        photoURL: selectedAvatarId,
      });
      showToast('✓ Avatar updated successfully', 'success');
    } catch (err) {
      console.error('[AccountPage] Failed to update avatar:', err);
      showToast('Failed to save avatar. Please try again.', 'error');
    }
  };

  const dietaryOptions = ['Any', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Keto'];

  const formattedUserName = user?.name ? formatTitleCase(user.name) : 'Chef Alex';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Header */}
      <div className="space-y-1 border-b border-[#2A2724] pb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#F5F2EB]">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-[#C2BCB2]">
          Manage your personal chef profile, dietary preferences, and saved kitchen stats.
        </p>
      </div>

      {/* User Info Card */}
      {user ? (
        <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A2724] pb-6">
            <div className="flex items-center gap-4">
              {/* Personal Avatar Container */}
              <div
                onClick={() => setIsAvatarPickerOpen(true)}
                className="relative group shrink-0 cursor-pointer"
                title="Change Avatar"
              >
                <Avatar user={user} size="xl" />

                {/* Change Avatar Hover Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-black/70 text-[#D4AF37] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity cursor-pointer backdrop-blur-xs">
                  <UserRound className="w-5 h-5 text-[#D4AF37]" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white">Avatar</span>
                </div>
              </div>

              <div className="space-y-1 min-w-0">
                {isEditingName ? (
                  <form onSubmit={handleSaveName} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-1 bg-[#23211E] border border-[#D4AF37] rounded-xl text-sm font-bold text-[#F5F2EB] focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3 py-1 bg-[#D4AF37] text-black font-extrabold text-xs rounded-xl hover:brightness-110 cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingName(false)}
                      className="px-2 py-1 text-xs text-[#A39C90] hover:text-[#F5F2EB]"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-serif font-bold text-[#F5F2EB]">{formattedUserName}</h2>
                    {user.isEmailVerified !== false && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold tracking-wide" title="Verified Account">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 stroke-[2.5]" />
                        Verified
                      </span>
                    )}
                    <button
                      onClick={() => {
                        setEditedName(formattedUserName);
                        setIsEditingName(true);
                      }}
                      className="p-1 text-[#A39C90] hover:text-[#D4AF37] transition-colors cursor-pointer"
                      title="Edit Name"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-[#C2BCB2] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D4AF37]" /> {user.email}
                </p>
                <p className="text-[11px] text-[#A39C90]">
                  Member since {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Avatar Action Button */}
            <div className="flex sm:flex-col items-center gap-2 self-start sm:self-auto">
              <button
                onClick={() => setIsAvatarPickerOpen(true)}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black text-xs font-extrabold rounded-xl hover:brightness-110 transition-all cursor-pointer flex items-center gap-2 shadow-md shadow-[#D4AF37]/10"
              >
                <Palette className="w-4 h-4 text-black stroke-[2.5]" />
                <span>Change Avatar</span>
              </button>
            </div>
          </div>

          {/* User Stats Grid (Capitalized Empty States) */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => navigateTo('/pantry')}
              className="p-4 bg-[#1E1D1B] rounded-2xl border border-[#D4AF37]/30 cursor-pointer hover:border-[#D4AF37] transition-all space-y-1"
            >
              <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-1.5">
                <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" /> Saved Pantry Staples
              </span>
              <p className="text-2xl font-serif font-bold text-[#F5F2EB]">
                {pantryItems.length} {pantryItems.length === 1 ? 'Item' : 'Items'}
              </p>
            </div>

            <div
              onClick={() => navigateTo('/favorites')}
              className="p-4 bg-[#1E1D1B] rounded-2xl border border-[#E6A135]/30 cursor-pointer hover:border-[#E6A135] transition-all space-y-1"
            >
              <span className="text-xs font-bold text-[#E6A135] flex items-center gap-1.5">
                <Heart className="w-4 h-4 fill-[#E6A135] text-[#E6A135]" /> Favorite Recipes
              </span>
              <p className="text-2xl font-serif font-bold text-[#F5F2EB]">
                {favoriteIds.length} {favoriteIds.length === 1 ? 'Recipe' : 'Recipes'}
              </p>
            </div>
          </div>

          {/* Dietary Preference Selector */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> Default Dietary Preference
              </label>
              <span className="text-[11px] text-[#A39C90]">Auto-filters search results</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dietaryOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDietary(opt)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                    dietary === opt
                      ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black border-[#D4AF37] font-extrabold shadow-sm'
                      : 'bg-[#23211E] text-[#C2BCB2] border-[#2A2724] hover:bg-[#2A2724]'
                  }`}
                >
                  <span>{opt}</span>
                  {dietary === opt && <Check className="w-4 h-4 text-black" />}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md"
              >
                Save Preference
              </button>
            </div>
          </div>

          {/* High-Contrast Accessibility Theme Settings */}
          <div className="space-y-4 pt-4 border-t border-[#2A2724]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-[#F5F2EB] flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-[#D4AF37]" /> Accessibility & High-Contrast Themes
                </label>
                <p className="text-[11px] text-[#A39C90]">
                  Switch between high-contrast themes optimized for enhanced readability and vision preferences.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-[#23211E] border border-[#D4AF37]/40 text-[#D4AF37] text-[10px] font-extrabold tracking-wider uppercase shrink-0 self-start sm:self-auto">
                {themeOptions.find(t => t.id === theme)?.badge || 'Active Theme'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {themeOptions.map((opt) => {
                const isActive = theme === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setTheme(opt.id);
                      showToast(`Theme updated to ${opt.name} 🎨`, 'success');
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer text-left space-y-3 relative overflow-hidden group ${
                      isActive
                        ? 'bg-[#23211E] border-[#D4AF37] shadow-lg shadow-[#D4AF37]/10'
                        : 'bg-[#1E1D1B] border-[#2A2724] hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {/* Header line with radio check */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-xs text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                          {opt.name}
                        </span>
                      </div>

                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          isActive
                            ? 'bg-[#D4AF37] border-[#D4AF37] text-black'
                            : 'border-[#2A2724] bg-[#161513]'
                        }`}
                      >
                        {isActive && <Check className="w-3 h-3 text-black font-extrabold" />}
                      </div>
                    </div>

                    <p className="text-[11px] text-[#A39C90] leading-snug">
                      {opt.description}
                    </p>

                    {/* Mini Visual Color Palette Preview Strip */}
                    <div className="p-2 rounded-xl border border-[#2A2724] flex items-center gap-2 justify-between" style={{ backgroundColor: opt.previewBg }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: opt.previewBg }} title="Canvas" />
                        <div className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: opt.previewCard }} title="Surface Card" />
                        <div className="w-3 h-3 rounded-full border border-black/20" style={{ backgroundColor: opt.previewText }} title="Text Color" />
                      </div>
                      <div className="px-2 py-0.5 rounded-md text-[10px] font-extrabold" style={{ backgroundColor: opt.previewAccent, color: '#000000' }}>
                        Accent
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sign Out Action */}
          <div className="pt-6 border-t border-[#2A2724]">
            <button
              onClick={() => {
                signOut();
                navigateTo('/');
              }}
              className="w-full py-3 bg-[#23211E] hover:bg-[#E6A135]/20 text-[#E6A135] border border-[#E6A135]/40 font-bold text-xs rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4 text-[#E6A135]" /> Sign Out of PantryPal
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-8 sm:p-10 text-center space-y-5 shadow-xl max-w-xl mx-auto">
          <div className="w-12 h-12 bg-[#23211E] border border-[#2A2724] rounded-2xl flex items-center justify-center mx-auto">
            <User className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F2EB]">Sign in to personalize PantryPal</h2>
            <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-md mx-auto leading-relaxed">
              Sign in to sync your pantry, save favorite recipes, build weekly meal plans, and access your profile across all your devices.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1 pb-1">
            <span className="px-3 py-1.5 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] font-semibold flex items-center gap-1.5">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sync Pantry</span>
            </span>
            <span className="px-3 py-1.5 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] font-semibold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Save Favorites</span>
            </span>
            <span className="px-3 py-1.5 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] font-semibold flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Weekly Planner</span>
            </span>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={() => openAuthModal('Sign in to sync your pantry, save favorite recipes, and build weekly meal plans.', 'sign-in')}
              className="px-8 py-3 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs sm:text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15"
            >
              Sign In
            </button>
          </div>

          {/* Secondary Action */}
          <p className="text-xs text-[#A39C90] pt-1">
            Don't have an account?{' '}
            <button
              onClick={() => openAuthModal('Create a free PantryPal account to personalize your experience across all your devices.', 'sign-up')}
              className="font-bold text-[#D4AF37] hover:underline cursor-pointer ml-0.5"
            >
              Create Free Account
            </button>
          </p>
        </div>
      )}

      {/* Avatar Selection Modal */}
      <AvatarPickerModal
        isOpen={isAvatarPickerOpen}
        onClose={() => setIsAvatarPickerOpen(false)}
        user={user}
        onSaveAvatar={handleSaveAvatar}
      />

    </div>
  );
};

