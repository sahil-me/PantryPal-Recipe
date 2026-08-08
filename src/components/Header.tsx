import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, UtensilsCrossed, ChefHat } from 'lucide-react';
import { GroceryModal } from './GroceryModal';
import { getPageTitle } from '../utils/navigation';

export const Header: React.FC = () => {
  const { currentRoute, navigateTo, pantryItems, shoppingList, removeFromShoppingList, clearShoppingList } = useApp();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [isGroceryOpen, setIsGroceryOpen] = useState(false);

  return (
    <>
      <header className="bg-[#161513]/90 backdrop-blur-md border-b border-[#2A2724] sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Mobile Header Brand & Title */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => navigateTo(isAuthenticated ? '/search' : '/')}
            className="md:hidden flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold">
              <ChefHat className="w-4 h-4 text-black" />
            </div>
            <span className="font-serif font-bold text-base text-[#F5F2EB]">PantryPal</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[#A39C90]">
            <button onClick={() => navigateTo('/')} className="hover:text-[#D4AF37] transition-colors cursor-pointer">
              Home
            </button>
            <span>/</span>
            <span className="text-[#D4AF37] font-bold font-serif text-sm">{getPageTitle(currentRoute)}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Quick Pantry Badge Button */}
          {isAuthenticated && (
            <button
              onClick={() => navigateTo('/pantry')}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#1E1D1B] border border-[#D4AF37]/30 hover:border-[#D4AF37] rounded-xl text-xs font-bold text-[#D4AF37] transition-all cursor-pointer shadow-xs"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="hidden sm:inline">Pantry:</span>
              <span className="bg-[#D4AF37] text-black px-1.5 py-0.2 rounded-md text-[10px] font-extrabold">
                {pantryItems.length}
              </span>
            </button>
          )}

          {/* Shopping List Button */}
          {isAuthenticated && (
            <button
              onClick={() => setIsGroceryOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 bg-[#1E1D1B] border border-[#E6A135]/40 hover:border-[#F3C64F] rounded-xl text-xs font-bold text-[#F3C64F] transition-all cursor-pointer shadow-xs"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#F3C64F]" />
              <span className="hidden sm:inline">Grocery List</span>
              {shoppingList.length > 0 && (
                <span className="bg-[#E6A135] text-black px-1.5 py-0.2 rounded-md text-[10px] font-extrabold">
                  {shoppingList.length}
                </span>
              )}
            </button>
          )}

          {/* Auth Button for Unauthenticated Header */}
          {!isAuthenticated && currentRoute !== '/auth/signin' && currentRoute !== '/auth/signup' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('signin')}
                className="px-3.5 py-1.5 text-xs font-bold text-[#C2BCB2] hover:text-[#D4AF37] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black text-xs font-bold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Grocery Modal */}
      {isGroceryOpen && (
        <GroceryModal
          isOpen={isGroceryOpen}
          groceryList={shoppingList}
          onRemoveGroceryItem={removeFromShoppingList}
          onClearGroceryList={clearShoppingList}
          onClose={() => setIsGroceryOpen(false)}
        />
      )}
    </>
  );
};
