import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import * as db from '../services/db';
import { Recipe, ThemeMode } from '../types';
import { SAMPLE_RECIPES } from '../data/recipes';
import { checkSpoonacularStatus } from '../services/recipeApi';

export type { ThemeMode } from '../types';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  undoAction?: () => void;
}

interface AppContextType {
  // Theme & Accessibility
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;

  // Pantry
  pantryItems: string[];
  addToPantry: (nameOrItems: string | string[], isUndo?: boolean) => void;
  removeFromPantry: (name: string, isUndo?: boolean) => void;
  setPantryItems: (items: string[]) => void;

  // Favorites
  favoriteIds: string[];
  toggleFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;

  // Shopping List
  shoppingList: string[];
  addToShoppingList: (nameOrItems: string | string[]) => void;
  removeFromShoppingList: (name: string) => void;
  clearShoppingList: () => void;
  isInShoppingList: (name: string) => boolean;
  checkoutShoppingList: (itemsToCheckout?: string[]) => { addedCount: number; items: string[] };

  // Recipes & Spoonacular API Integration
  allRecipes: Recipe[];
  addFetchedRecipes: (recipes: Recipe[]) => void;
  spoonacularConfigured: boolean;
  recipeSource: 'spoonacular' | 'local';
  setRecipeSource: (source: 'spoonacular' | 'local') => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', undoAction?: () => void) => void;
  removeToast: (id: string) => void;

  // Navigation / Routing
  currentRoute: string;
  routeParams: Record<string, string>;
  navigateTo: (route: string, params?: Record<string, string>) => void;
}

const DEFAULT_PANTRY: string[] = [];

const DEFAULT_FAVORITES: string[] = [];

const VALID_THEMES: ThemeMode[] = ['dark', 'hc-dark', 'hc-light', 'hc-cobalt'];

const getInitialTheme = (currentUser: any): ThemeMode => {
  if (!currentUser) return 'dark';
  if (currentUser.theme && VALID_THEMES.includes(currentUser.theme)) {
    return currentUser.theme;
  }
  try {
    const saved = localStorage.getItem(`pantrypal_theme_${currentUser.id}`) as ThemeMode;
    if (saved && VALID_THEMES.includes(saved)) {
      return saved;
    }
  } catch (_) {}
  return 'dark';
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile, requireAuth } = useAuth();
  const userId = user?.id || 'guest-session';

  // 0. Theme & Accessibility State
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme(user));

  const setTheme = (newTheme: ThemeMode) => {
    if (!VALID_THEMES.includes(newTheme)) return;

    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);

    if (user) {
      try {
        localStorage.setItem(`pantrypal_theme_${user.id}`, newTheme);
        localStorage.removeItem('pantrypal_theme');
      } catch (_) {}

      updateProfile({ theme: newTheme });
      db.updateUserProfile(user.id, { theme: newTheme });
    } else {
      try {
        localStorage.removeItem('pantrypal_theme');
      } catch (_) {}
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!user) {
      // Unauthenticated / Guest mode: always reset to default PantryPal theme
      setThemeState('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      try {
        localStorage.removeItem('pantrypal_theme');
      } catch (_) {}
    } else {
      // Authenticated user mode: apply user's saved theme
      const savedUserTheme = (localStorage.getItem(`pantrypal_theme_${user.id}`) as ThemeMode) || user.theme || 'dark';
      const initialTarget = VALID_THEMES.includes(savedUserTheme) ? savedUserTheme : 'dark';

      setThemeState(initialTarget);
      document.documentElement.setAttribute('data-theme', initialTarget);

      db.getUserProfile(user.id).then(profile => {
        if (isMounted && profile.theme && VALID_THEMES.includes(profile.theme)) {
          setThemeState(profile.theme);
          document.documentElement.setAttribute('data-theme', profile.theme);
          try {
            localStorage.setItem(`pantrypal_theme_${user.id}`, profile.theme);
          } catch (_) {}
        }
      });

      try {
        localStorage.removeItem('pantrypal_theme');
      } catch (_) {}
    }

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // 1. Pantry State
  const [pantryItems, setPantryState] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`pantrypal_pantry_${userId}`);
      if (saved) return JSON.parse(saved);
      return DEFAULT_PANTRY;
    } catch {
      return DEFAULT_PANTRY;
    }
  });

  const pantryItemsRef = useRef<string[]>(pantryItems);
  useEffect(() => {
    pantryItemsRef.current = pantryItems;
  }, [pantryItems]);

  const updateAndSavePantry = (newItems: string[]) => {
    pantryItemsRef.current = newItems;
    setPantryState(newItems);
    db.saveUserPantry(userId, newItems);
  };

  // 2. Favorites State
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`pantrypal_favorites_${userId}`);
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const favoriteIdsRef = useRef<string[]>(favoriteIds);
  useEffect(() => {
    favoriteIdsRef.current = favoriteIds;
  }, [favoriteIds]);

  // 3. Shopping List State
  const [shoppingList, setShoppingList] = useState<string[]>(() => {
    try {
      if (!user) {
        const saved = localStorage.getItem('pantrypal_shopping_guest-session');
        if (saved) return JSON.parse(saved);
      }
      return [];
    } catch {
      return [];
    }
  });

  const shoppingListRef = useRef<string[]>(shoppingList);
  useEffect(() => {
    shoppingListRef.current = shoppingList;
  }, [shoppingList]);

  // Load from DB service when user changes or logs in/out
  useEffect(() => {
    let isMounted = true;
    const currentId = user?.id || 'guest-session';

    if (user) {
      console.log('[Debug Log] Grocery list restored after sign-in:', { userId: user.id });
    } else {
      console.log('[Debug Log] Grocery list reset on sign-out');
      pantryItemsRef.current = [];
      setPantryState([]);
      favoriteIdsRef.current = [];
      setFavoriteIds([]);
      shoppingListRef.current = [];
      setShoppingList([]);
    }

    db.getUserPantry(currentId).then(items => {
      if (isMounted) {
        pantryItemsRef.current = items;
        setPantryState(items);
      }
    });

    db.getUserFavorites(currentId).then(favs => {
      if (isMounted) {
        favoriteIdsRef.current = favs;
        setFavoriteIds(favs);
      }
    });

    db.getShoppingList(currentId).then(list => {
      if (isMounted) {
        shoppingListRef.current = list;
        setShoppingList(list);
      }
    });

    return () => { isMounted = false; };
  }, [user]);

  const updateAndSaveShoppingList = async (newList: string[]) => {
    if (!user) return;
    shoppingListRef.current = newList;
    setShoppingList(newList);
    try {
      await db.saveShoppingList(user.id, newList);
    } catch (err) {
      console.error('[Debug Log] Error saving grocery list:', err);
    }
  };

  // 4. Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info', undoAction?: () => void) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, message, type, undoAction };
    setToasts(prev => [...prev.slice(-2), newToast]); // max 3 active toasts

    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // 5. Router & Navigation State
  const parseHash = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || hash === '/') return { route: '/', params: {} };

    const [path, queryString] = hash.split('?');
    const params: Record<string, string> = {};

    if (queryString) {
      const searchParams = new URLSearchParams(queryString);
      searchParams.forEach((value, key) => {
        params[key] = value;
      });
    }

    // Handle /recipe/:id style routes in hash e.g. /recipe/rec-1
    if (path.startsWith('/recipe/')) {
      const recipeId = path.replace('/recipe/', '');
      return { route: '/recipe', params: { ...params, id: recipeId } };
    }

    return { route: path, params };
  };

  const [routeState, setRouteState] = useState(() => parseHash());

  useEffect(() => {
    const handleHashChange = () => {
      setRouteState(parseHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (route: string, params?: Record<string, string>) => {
    let targetHash = route;
    if (route === '/recipe' && params?.id) {
      targetHash = `/recipe/${params.id}`;
      delete params.id;
    }

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams(params);
      targetHash += `?${searchParams.toString()}`;
    }

    window.location.hash = targetHash;
    setRouteState({ route, params: params || {} });
  };

  // Actions
  const addToPantry = (nameOrItems: string | string[], isUndo = false) => {
    const items = Array.isArray(nameOrItems) ? nameOrItems : [nameOrItems];
    const validItems = items.map(i => i.trim()).filter(Boolean);
    if (validItems.length === 0) return;

    const current = pantryItemsRef.current;
    const itemsToAdd = validItems.filter(
      item => !current.some(existing => existing.toLowerCase() === item.toLowerCase())
    );

    if (itemsToAdd.length === 0) {
      if (!isUndo && validItems.length === 1) {
        showToast(`${validItems[0]} is already in your pantry!`, 'info');
      }
      return;
    }

    const next = [...current, ...itemsToAdd];
    updateAndSavePantry(next);

    if (isUndo) {
      showToast(`Restored ${itemsToAdd.join(', ')} to pantry`, 'success');
    } else if (itemsToAdd.length === 1) {
      showToast(`Added ${itemsToAdd[0]} to your pantry`, 'success', () => {
        removeFromPantry(itemsToAdd[0], true);
      });
    } else {
      showToast(`Added ${itemsToAdd.length} ingredients to your pantry`, 'success');
    }
  };

  const removeFromPantry = (name: string, isUndo = false) => {
    const current = pantryItemsRef.current;
    const itemToRemove = current.find(i => i.toLowerCase() === name.toLowerCase());
    if (!itemToRemove) return;

    const next = current.filter(i => i.toLowerCase() !== name.toLowerCase());
    updateAndSavePantry(next);

    if (isUndo) {
      showToast(`Removed ${itemToRemove} from pantry`, 'info');
    } else {
      showToast(`Removed ${itemToRemove} from pantry`, 'info', () => {
        addToPantry(itemToRemove, true);
      });
    }
  };

  const setPantryItems = (items: string[]) => {
    updateAndSavePantry(items);
  };

  const toggleFavorite = (recipeId: string) => {
    const current = favoriteIdsRef.current;
    const isFav = current.includes(recipeId);
    const updated = isFav
      ? current.filter(id => id !== recipeId)
      : [...current, recipeId];

    favoriteIdsRef.current = updated;
    setFavoriteIds(updated);
    db.toggleUserFavorite(userId, recipeId);

    if (isFav) {
      showToast('Removed recipe from favorites', 'info');
    } else {
      showToast('Saved recipe to favorites! ❤️', 'success');
    }
  };

  const isFavorite = (recipeId: string) => favoriteIds.includes(recipeId);

  const addToShoppingList = (nameOrItems: string | string[]) => {
    const items = Array.isArray(nameOrItems) ? nameOrItems : [nameOrItems];
    const validItems = items.map(i => i.trim()).filter(Boolean);
    if (validItems.length === 0) return;

    if (!user) {
      requireAuth(() => {
        addToShoppingList(nameOrItems);
      }, "Sign in to save ingredients to your shopping list.");
      return;
    }

    const current = shoppingListRef.current;
    const itemsToAdd = validItems.filter(
      item => !current.some(existing => existing.toLowerCase() === item.toLowerCase())
    );

    if (itemsToAdd.length === 0) {
      if (validItems.length === 1) {
        showToast(`${validItems[0]} is already in your shopping list`, 'info');
      }
      return;
    }

    const next = [...current, ...itemsToAdd];
    updateAndSaveShoppingList(next);
    if (itemsToAdd.length === 1) {
      showToast(`Added ${itemsToAdd[0]} to shopping list`, 'success');
    } else {
      showToast(`Added ${itemsToAdd.length} ingredients to shopping list`, 'success');
    }
  };

  const removeFromShoppingList = (name: string) => {
    if (!user) {
      requireAuth(() => {
        removeFromShoppingList(name);
      }, "Sign in to manage your shopping list.");
      return;
    }
    const current = shoppingListRef.current;
    const next = current.filter(i => i.toLowerCase() !== name.toLowerCase());
    updateAndSaveShoppingList(next);
    showToast(`Removed ${name} from shopping list`, 'info');
  };

  const clearShoppingList = async () => {
    if (!user) {
      requireAuth(() => {
        clearShoppingList();
      }, "Sign in to manage your shopping list.");
      return;
    }
    try {
      console.log('[Debug Log] Grocery list cleared - updating Firestore first...');
      const saved = await db.saveShoppingList(user.id, []);
      shoppingListRef.current = saved;
      setShoppingList(saved);
      showToast('Shopping list cleared', 'info');
    } catch (err) {
      console.error('[Debug Log] Error clearing grocery list in Firestore:', err);
      showToast('Failed to clear shopping list', 'error');
    }
  };

  const isInShoppingList = (name: string) => {
    if (!user) return false;
    return shoppingList.some(i => i.toLowerCase() === name.trim().toLowerCase());
  };

  const checkoutShoppingList = (itemsToCheckout?: string[]) => {
    if (!user) {
      requireAuth(() => {
        checkoutShoppingList(itemsToCheckout);
      }, "Sign in to checkout shopping list items to your pantry.");
      return { addedCount: 0, items: [] };
    }

    const currentShopping = shoppingListRef.current;
    const targetItems = itemsToCheckout && itemsToCheckout.length > 0 
      ? itemsToCheckout 
      : currentShopping;

    if (targetItems.length === 0) {
      return { addedCount: 0, items: [] };
    }

    const currentPantry = pantryItemsRef.current;
    const itemsToAdd = targetItems.filter(
      item => !currentPantry.some(p => p.toLowerCase() === item.toLowerCase())
    );

    // 1. Update Pantry
    const nextPantry = [...currentPantry, ...itemsToAdd];
    updateAndSavePantry(nextPantry);

    // 2. Remove checked out items from Shopping List
    const targetSet = new Set(targetItems.map(i => i.toLowerCase()));
    const nextShopping = currentShopping.filter(i => !targetSet.has(i.toLowerCase()));
    updateAndSaveShoppingList(nextShopping);

    if (itemsToAdd.length > 0) {
      showToast(`🎉 Checkout complete! ${itemsToAdd.length} ingredient${itemsToAdd.length === 1 ? '' : 's'} added to your Pantry.`, 'success');
    } else {
      showToast(`Checkout complete! Selected items removed from shopping list.`, 'info');
    }

    return { addedCount: itemsToAdd.length, items: itemsToAdd };
  };

  // 6. Recipe Library & Spoonacular Integration
  const [allRecipes, setAllRecipes] = useState<Recipe[]>(SAMPLE_RECIPES);
  const [spoonacularConfigured, setSpoonacularConfigured] = useState<boolean>(false);
  const [recipeSource, setRecipeSource] = useState<'spoonacular' | 'local'>('local');

  useEffect(() => {
    let isMounted = true;
    checkSpoonacularStatus().then(status => {
      if (isMounted) {
        setSpoonacularConfigured(status.configured);
        if (status.configured) {
          setRecipeSource('spoonacular');
        }
        if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
          console.log('[Recipe Service] Internal API status check:', status.configured ? 'Live API Active' : 'Curated Library Active');
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const addFetchedRecipes = (newRecipes: Recipe[]) => {
    if (!newRecipes || newRecipes.length === 0) return;
    setAllRecipes(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filteredNew = newRecipes.filter(r => !existingIds.has(r.id));
      if (filteredNew.length === 0) return prev;
      return [...prev, ...filteredNew];
    });
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        setTheme,

        pantryItems,
        addToPantry,
        removeFromPantry,
        setPantryItems,

        favoriteIds,
        toggleFavorite,
        isFavorite,

        shoppingList,
        addToShoppingList,
        removeFromShoppingList,
        clearShoppingList,
        isInShoppingList,
        checkoutShoppingList,

        allRecipes,
        addFetchedRecipes,
        spoonacularConfigured,
        recipeSource,
        setRecipeSource,

        toasts,
        showToast,
        removeToast,

        currentRoute: routeState.route,
        routeParams: routeState.params,
        navigateTo
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
