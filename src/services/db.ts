import { Recipe, RecipeFeedback, ThemeMode } from '../types';
import { SAMPLE_RECIPES } from '../data/recipes';
import { getStorageItem, setStorageItem } from '../utils/storageHelpers';
import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, addDoc } from 'firebase/firestore';
import { updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { firestore, auth, handleFirestoreError, OperationType } from '../lib/firebase';

export interface AppMetrics {
  registeredUsers: number;
  recipesDiscovered: number;
  pantryItemsSaved: number;
  ingredientMatches: number;
  isLive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarId?: string;
  avatarUrl?: string;
  photoURL?: string;
  membership: 'Guest' | 'Member' | 'VIP';
  createdAt: string;
  dietaryPreference?: string;
  theme?: ThemeMode;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UserPantryRecord {
  userId: string;
  items: string[];
  updatedAt: string;
}

export interface UserFavoritesRecord {
  userId: string;
  recipeIds: string[];
  updatedAt: string;
}

export interface UserShoppingListRecord {
  userId: string;
  items: string[];
  updatedAt: string;
}

const DEFAULT_PANTRY: string[] = [];

const DEFAULT_FAVORITES: string[] = [];

// Local Warehouse storage keys helper
const getKey = (prefix: string, id: string) => `pantrypal_${prefix}_${id}`;

/**
 * Clear user local caches and reset guest storage on sign-out
 */
export function clearAllUserLocalCaches(userId?: string): void {
  try {
    if (userId) {
      localStorage.removeItem(getKey('pantry', userId));
      localStorage.removeItem(getKey('favorites', userId));
      localStorage.removeItem(getKey('shopping', userId));
      localStorage.removeItem(getKey('profile', userId));
      localStorage.removeItem(getKey('meal_plan', userId));
      localStorage.removeItem(`pantrypal_theme_${userId}`);
    }
    localStorage.removeItem('pantrypal_user');
    localStorage.removeItem('pantrypal_theme');
    localStorage.removeItem(getKey('pantry', 'guest-session'));
    localStorage.removeItem(getKey('favorites', 'guest-session'));
    localStorage.removeItem(getKey('shopping', 'guest-session'));
    localStorage.removeItem(getKey('meal_plan', 'guest-session'));

    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('pantrypal_shopping_') || key.startsWith('pantrypal_pantry_') || key.startsWith('pantrypal_favorites_'))) {
        localStorage.removeItem(key);
      }
    }
  } catch (err) {
    console.warn('[Warehouse DB] Failed clearing local caches:', err);
  }
}

// Helper to safely sync with Firestore in background/fallback
async function syncFirestoreDoc(userId: string, data: Record<string, any>): Promise<void> {
  if (!userId) return;
  const path = `users/${userId}`;
  try {
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

/**
 * Warehouse API Clerk Methods (Database Service Layer with Firebase Firestore Sync)
 */

export async function getUserPantry(userId: string): Promise<string[]> {
  try {
    if (userId && userId !== 'guest-session' && userId !== 'guest') {
      try {
        const userSnap = await getDoc(doc(firestore, 'users', userId));
        if (userSnap.exists()) {
          const firestoreItems = Array.isArray(userSnap.data().pantryItems)
            ? (userSnap.data().pantryItems as string[])
            : DEFAULT_PANTRY;
          setStorageItem(getKey('pantry', userId), firestoreItems);
          return firestoreItems;
        }
      } catch (_) {}
      const local = getStorageItem<string[] | null>(getKey('pantry', userId), null);
      if (local !== null) {
        return local;
      }
      return DEFAULT_PANTRY;
    }
    const local = getStorageItem<string[] | null>(getKey('pantry', userId), null);
    if (local !== null) {
      return local;
    }
    setStorageItem(getKey('pantry', userId), DEFAULT_PANTRY);
    return DEFAULT_PANTRY;
  } catch (error) {
    console.error('[Warehouse DB] Failed to fetch pantry for user:', userId, error);
    return DEFAULT_PANTRY;
  }
}

export async function saveUserPantry(userId: string, items: string[]): Promise<string[]> {
  try {
    const cleanItems = Array.from(new Set(items.map(i => i.trim()).filter(Boolean)));
    setStorageItem(getKey('pantry', userId), cleanItems);
    syncFirestoreDoc(userId, { pantryItems: cleanItems });
    return cleanItems;
  } catch (error) {
    console.error('[Warehouse DB] Failed to save pantry for user:', userId, error);
    return items;
  }
}

export async function getUserFavorites(userId: string): Promise<string[]> {
  try {
    if (userId && userId !== 'guest-session' && userId !== 'guest') {
      try {
        const userSnap = await getDoc(doc(firestore, 'users', userId));
        if (userSnap.exists()) {
          const favs = Array.isArray(userSnap.data().favoriteIds)
            ? (userSnap.data().favoriteIds as string[])
            : DEFAULT_FAVORITES;
          setStorageItem(getKey('favorites', userId), favs);
          return favs;
        }
      } catch (_) {}
      const local = getStorageItem<string[] | null>(getKey('favorites', userId), null);
      if (local !== null) return local;
      return DEFAULT_FAVORITES;
    }
    const local = getStorageItem<string[] | null>(getKey('favorites', userId), null);
    if (local !== null) {
      return local;
    }

    setStorageItem(getKey('favorites', userId), DEFAULT_FAVORITES);
    return DEFAULT_FAVORITES;
  } catch (error) {
    console.error('[Warehouse DB] Failed to fetch favorites for user:', userId, error);
    return DEFAULT_FAVORITES;
  }
}

export async function toggleUserFavorite(userId: string, recipeId: string): Promise<string[]> {
  try {
    const current = await getUserFavorites(userId);
    let updated: string[];
    if (current.includes(recipeId)) {
      updated = current.filter(id => id !== recipeId);
    } else {
      updated = [...current, recipeId];
    }
    setStorageItem(getKey('favorites', userId), updated);
    syncFirestoreDoc(userId, { favoriteIds: updated });
    return updated;
  } catch (error) {
    console.error('[Warehouse DB] Failed to toggle favorite:', recipeId, error);
    return [];
  }
}

export async function getShoppingList(userId: string): Promise<string[]> {
  try {
    if (userId && userId !== 'guest-session' && userId !== 'guest') {
      try {
        const userSnap = await getDoc(doc(firestore, 'users', userId));
        if (userSnap.exists()) {
          const data = userSnap.data();
          const list = Array.isArray(data.shoppingList) ? (data.shoppingList as string[]) : [];
          setStorageItem(getKey('shopping', userId), list);
          console.log('[Debug Log] Grocery list loaded from Firestore:', { userId, count: list.length, items: list });
          return list;
        } else {
          setStorageItem(getKey('shopping', userId), []);
          console.log('[Debug Log] Grocery list loaded from Firestore (default empty):', { userId });
          return [];
        }
      } catch (fsErr) {
        console.warn('[Debug Log] Firestore fetch failed for shopping list, fallback to local cache:', fsErr);
        const local = getStorageItem<string[] | null>(getKey('shopping', userId), null);
        if (local !== null) {
          console.log('[Debug Log] Grocery list loaded from cache:', { userId, count: local.length, items: local });
          return local;
        }
        return [];
      }
    } else {
      const local = getStorageItem<string[] | null>(getKey('shopping', userId), null);
      if (local !== null) {
        console.log('[Debug Log] Grocery list loaded from cache (guest):', { count: local.length, items: local });
        return local;
      }
      return [];
    }
  } catch (error) {
    console.error('[Warehouse DB] Failed to fetch shopping list:', userId, error);
    return [];
  }
}

export async function saveShoppingList(userId: string, items: string[]): Promise<string[]> {
  try {
    const cleanItems = Array.from(new Set(items.map(i => i.trim()).filter(Boolean)));
    setStorageItem(getKey('shopping', userId), cleanItems);

    if (userId && userId !== 'guest-session' && userId !== 'guest') {
      try {
        const userRef = doc(firestore, 'users', userId);
        await setDoc(userRef, { shoppingList: cleanItems, updatedAt: new Date().toISOString() }, { merge: true });
        console.log('[Debug Log] Grocery list written to Firestore:', { userId, count: cleanItems.length, items: cleanItems });
        if (cleanItems.length === 0) {
          console.log('[Debug Log] Grocery list cleared in Firestore:', { userId });
        }
      } catch (fsErr) {
        console.error('[Debug Log] Failed writing grocery list to Firestore:', fsErr);
        handleFirestoreError(fsErr, OperationType.WRITE, `users/${userId}`);
        throw fsErr;
      }
    } else {
      if (cleanItems.length === 0) {
        console.log('[Debug Log] Grocery list cleared (guest)');
      } else {
        console.log('[Debug Log] Grocery list written to cache (guest):', { count: cleanItems.length, items: cleanItems });
      }
    }
    return cleanItems;
  } catch (error) {
    console.error('[Warehouse DB] Failed to save shopping list:', userId, error);
    return items;
  }
}

export async function getUserProfile(userId: string, defaultName?: string, defaultEmail?: string): Promise<UserProfile> {
  try {
    const key = getKey('profile', userId);
    const existing = getStorageItem<UserProfile | null>(key, null);
    const savedUserTheme = (localStorage.getItem(`pantrypal_theme_${userId}`) as ThemeMode) || undefined;
    if (existing) {
      const avatarId = existing.avatarId || existing.photoURL || existing.avatarUrl || 'initial';
      existing.avatarId = avatarId;
      existing.avatarUrl = avatarId;
      existing.photoURL = avatarId;
      if (!existing.theme && savedUserTheme) {
        existing.theme = savedUserTheme;
      }
      return existing;
    }

    try {
      const userSnap = await getDoc(doc(firestore, 'users', userId));
      if (userSnap.exists()) {
        const d = userSnap.data();
        const avatarId = d.avatarId || d.photoURL || d.avatarUrl || 'initial';
        const userTheme: ThemeMode = d.theme || d.themeMode || savedUserTheme || 'dark';
        const profile: UserProfile = {
          id: userId,
          name: d.name || defaultName || 'Home Chef',
          email: d.email || defaultEmail || `${userId}@pantrypal.app`,
          avatarId: avatarId,
          avatarUrl: avatarId,
          photoURL: avatarId,
          membership: d.membership || (userId.startsWith('guest') ? 'Guest' : 'Member'),
          createdAt: d.createdAt || new Date().toISOString(),
          theme: userTheme
        };
        setStorageItem(key, profile);
        return profile;
      }
    } catch (_) {}

    const newProfile: UserProfile = {
      id: userId,
      name: defaultName || 'Home Chef',
      email: defaultEmail || `${userId}@pantrypal.app`,
      avatarId: 'initial',
      avatarUrl: 'initial',
      photoURL: 'initial',
      membership: userId.startsWith('guest') ? 'Guest' : 'Member',
      createdAt: new Date().toISOString(),
      theme: savedUserTheme || 'dark'
    };
    setStorageItem(key, newProfile);
    syncFirestoreDoc(userId, newProfile);
    return newProfile;
  } catch (error) {
    return {
      id: userId,
      name: defaultName || 'Home Chef',
      email: defaultEmail || 'chef@pantrypal.app',
      avatarId: 'initial',
      avatarUrl: 'initial',
      photoURL: 'initial',
      membership: 'Member',
      createdAt: new Date().toISOString(),
      theme: 'dark'
    };
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const current = await getUserProfile(userId);
    const avatarId = updates.avatarId || updates.photoURL || updates.avatarUrl || current.avatarId || current.photoURL || current.avatarUrl || 'initial';
    const updated: UserProfile = {
      ...current,
      ...updates,
      avatarId: avatarId,
      photoURL: avatarId,
      avatarUrl: avatarId,
    };
    setStorageItem(getKey('profile', userId), updated);
    syncFirestoreDoc(userId, updated);
    return updated;
  } catch (error) {
    console.error('[Warehouse DB] Failed to update user profile:', userId, error);
    const current = await getUserProfile(userId);
    return { ...current, ...updates };
  }
}

export async function deleteUserAccount(userId: string): Promise<boolean> {
  console.log('[Warehouse DB] Starting permanent account deletion for user:', userId);
  if (!userId) {
    throw new Error('Cannot delete account: missing userId');
  }

  try {
    // 1. Delete user subcollection documents (e.g., users/{userId}/recipe_feedback)
    try {
      const feedbackRef = collection(firestore, 'users', userId, 'recipe_feedback');
      const feedbackSnap = await getDocs(feedbackRef);
      console.log(`[Warehouse DB] Found ${feedbackSnap.docs.length} recipe_feedback subcollection docs for user ${userId}`);
      for (const fDoc of feedbackSnap.docs) {
        const docPath = `users/${userId}/recipe_feedback/${fDoc.id}`;
        try {
          await deleteDoc(doc(firestore, 'users', userId, 'recipe_feedback', fDoc.id));
          console.log(`[Warehouse DB] Deleted subcollection document: ${docPath}`);
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.DELETE, docPath);
        }
      }
    } catch (subErr) {
      console.warn('[Warehouse DB] Subcollection deletion warning:', subErr);
    }

    // 2. Delete main user document in Firestore: users/{userId}
    const userDocPath = `users/${userId}`;
    try {
      await deleteDoc(doc(firestore, 'users', userId));
      console.log(`[Warehouse DB] Deleted Firestore user document: ${userDocPath}`);
    } catch (docErr) {
      handleFirestoreError(docErr, OperationType.DELETE, userDocPath);
    }

    // 3. Clear all local storage, session storage, and caches
    clearAllUserLocalCaches(userId);
    try {
      sessionStorage.clear();
    } catch (_) {}

    console.log(`[Warehouse DB] Permanent data deletion complete for user: ${userId}`);
    return true;
  } catch (error) {
    console.error('[Warehouse DB] Failed during Firestore account deletion for user:', userId, error);
    throw error;
  }
}

export async function saveRecipeFeedback(userId: string, feedback: RecipeFeedback): Promise<void> {
  try {
    // Guest feedback is non-persistent across browser reloads / sessions per requirement 4.
    // Only persist in storage for authenticated users.
    if (userId && userId !== 'guest' && userId !== 'guest_user') {
      const key = getKey(`feedback_${feedback.recipeId}`, userId);
      const data: RecipeFeedback = {
        ...feedback,
        cookedAt: feedback.cookedAt || new Date().toISOString()
      };
      setStorageItem(key, data);

      try {
        await setDoc(doc(firestore, `users/${userId}/recipe_feedback`, feedback.recipeId), data);
      } catch (_) {}
    }
  } catch (error) {
    console.error('[Warehouse DB] Failed to save recipe feedback:', error);
  }
}

export async function getRecipeFeedback(userId: string, recipeId: string): Promise<RecipeFeedback | null> {
  try {
    // Guest feedback is strictly session-only in React component state, return null on reload/fetch
    if (!userId || userId === 'guest' || userId === 'guest_user') {
      return null;
    }
    const key = getKey(`feedback_${recipeId}`, userId);
    return getStorageItem<RecipeFeedback | null>(key, null);
  } catch (error) {
    console.error('[Warehouse DB] Failed to get recipe feedback:', error);
    return null;
  }
}

export async function savePublicTestimonial(feedback: RecipeFeedback): Promise<void> {
  try {
    const reviewContent = (feedback.reviewText || feedback.notes || '').trim();
    const title = (feedback.title || '').trim();
    const fullQuote = title ? (reviewContent ? `${title} — "${reviewContent}"` : title) : reviewContent;

    // Requirements for eligible testimonials (Requirement 6):
    // 1. 5-star rating
    // 2. User checked the permission checkbox (publicPermission === true)
    // 3. Review contains meaningful text
    if (feedback.rating !== 5 || !feedback.publicPermission || fullQuote.length < 5) {
      return;
    }

    // Format author: First Name + Last Initial (e.g. Priya S.)
    // Never expose full personal information.
    const firstName = (feedback.firstName || 'Home').trim();
    let lastInitial = 'S.';
    if (feedback.lastName && feedback.lastName.trim()) {
      lastInitial = feedback.lastName.trim()[0].toUpperCase() + '.';
    }
    const author = `${firstName} ${lastInitial}`;

    // Format Location: City, State/Country
    let location = 'Home Cook';
    if (feedback.city && feedback.stateCountry) {
      location = `${feedback.city.trim()}, ${feedback.stateCountry.trim()}`;
    } else if (feedback.city) {
      location = feedback.city.trim();
    } else if (feedback.stateCountry) {
      location = feedback.stateCountry.trim();
    }

    const testimonialId = `t-user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newTestimonial: Testimonial = {
      id: testimonialId,
      author,
      role: 'Home Cook',
      location,
      quote: fullQuote,
      rating: 5,
      createdAt: new Date().toISOString()
    };

    // Store in local storage for instant homepage carousel update
    const existing: Testimonial[] = getStorageItem('pantrypal_approved_testimonials', []);
    const updated = [newTestimonial, ...existing.filter(t => t.quote !== fullQuote)];
    setStorageItem('pantrypal_approved_testimonials', updated);

    // Sync to Firestore testimonials collection
    try {
      await addDoc(collection(firestore, 'testimonials'), {
        ...newTestimonial,
        status: 'approved',
        recipeId: feedback.recipeId
      });
    } catch (_) {}
  } catch (err) {
    console.warn('[Warehouse DB] Failed to save public testimonial:', err);
  }
}

export async function getWeeklyMealPlan(userId: string): Promise<Record<string, string[]>> {
  const defaultPlan: Record<string, string[]> = {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  };
  try {
    const key = getKey('meal_plan', userId);
    const stored = getStorageItem<Record<string, string[]> | null>(key, null);
    return stored ? { ...defaultPlan, ...stored } : defaultPlan;
  } catch (error) {
    console.error('[Warehouse DB] Failed to get meal plan:', error);
    return defaultPlan;
  }
}

export async function saveWeeklyMealPlan(userId: string, plan: Record<string, string[]>): Promise<void> {
  try {
    const key = getKey('meal_plan', userId);
    setStorageItem(key, plan);
  } catch (error) {
    console.error('[Warehouse DB] Failed to save meal plan:', error);
  }
}

/**
 * Merge Walk-in Guest Mailbox into Authenticated Key Member Mailbox upon Sign In
 */
export async function syncGuestToUserAccount(guestId: string, memberId: string): Promise<string[]> {
  try {
    const guestPantry = await getUserPantry(guestId);
    const memberPantry = await getUserPantry(memberId);
    const mergedPantry = Array.from(new Set([...memberPantry, ...guestPantry]));
    await saveUserPantry(memberId, mergedPantry);

    const guestFavs = await getUserFavorites(guestId);
    const memberFavs = await getUserFavorites(memberId);
    const mergedFavs = Array.from(new Set([...memberFavs, ...guestFavs]));
    setStorageItem(getKey('favorites', memberId), mergedFavs);
    await syncFirestoreDoc(memberId, { favoriteIds: mergedFavs });

    const guestShopping = await getShoppingList(guestId);
    const memberShopping = await getShoppingList(memberId);
    const mergedShopping = Array.from(new Set([...memberShopping, ...guestShopping]));
    await saveShoppingList(memberId, mergedShopping);

    return mergedPantry;
  } catch (error) {
    console.error('[Warehouse DB] Failed during syncGuestToUserAccount:', error);
    return await getUserPantry(memberId);
  }
}

/**
 * Fetch application statistics dynamically from Firestore or local metrics state
 */
export async function getAppMetrics(): Promise<AppMetrics> {
  try {
    const usersSnap = await getDocs(collection(firestore, 'users'));
    const userCount = usersSnap.size;

    let totalPantryItems = 0;
    usersSnap.forEach((docSnap) => {
      const data = docSnap.data();
      if (Array.isArray(data?.pantryItems)) {
        totalPantryItems += data.pantryItems.length;
      }
    });

    return {
      registeredUsers: userCount,
      recipesDiscovered: SAMPLE_RECIPES.length,
      pantryItemsSaved: totalPantryItems,
      ingredientMatches: totalPantryItems > 0 ? totalPantryItems * 12 : 124,
      isLive: true
    };
  } catch (error) {
    console.info('[Warehouse DB] Metric sync active via dynamic state fallback');
    return {
      registeredUsers: 0,
      recipesDiscovered: SAMPLE_RECIPES.length,
      pantryItemsSaved: 0,
      ingredientMatches: 0,
      isLive: false
    };
  }
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  location: string;
  quote: string;
  rating: number;
  avatarUrl?: string;
  createdAt?: string;
}

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    author: 'Priya S.',
    role: 'Home Cook',
    location: 'San Francisco, CA',
    quote: 'I used to open my fridge full of random ingredients and end up ordering takeout out of frustration. PantryPal changed that on night one—I made a delicious garlic lemon pasta with items I already had!',
    rating: 5
  },
  {
    id: 't-2',
    author: 'Marcus K.',
    role: 'Culinary Enthusiast',
    location: 'New York, NY',
    quote: 'The ingredient matching is spot-on. It recognized I had spinach, eggs, and feta, and gave me a 100% match recipe in under three seconds. It\'s saved me so much money on groceries.',
    rating: 5
  },
  {
    id: 't-3',
    author: 'Elena R.',
    role: 'Busy Parent',
    location: 'Austin, TX',
    quote: 'As a parent cooking for picky eaters after work, being able to filter recipes by "Missing 1 Ingredient" makes dinner prep effortless. I just add the missing item to my list with one tap.',
    rating: 5
  },
  {
    id: 't-4',
    author: 'David L.',
    role: 'Meal Prepper',
    location: 'Seattle, WA',
    quote: 'I love how my staple pantry items like olive oil and spices stay saved across visits. Now I actually use up fresh produce before it goes bad instead of throwing it away!',
    rating: 5
  }
];

export async function getTestimonials(): Promise<Testimonial[]> {
  const firestoreList: Testimonial[] = [];
  try {
    const snap = await getDocs(collection(firestore, 'testimonials'));
    if (!snap.empty) {
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const isApproved = data.status ? data.status === 'approved' : data.approved !== false;
        const isFiveStar = typeof data.rating === 'number' ? data.rating === 5 : true;

        if (isApproved && isFiveStar && (data.quote || data.review)) {
          firestoreList.push({
            id: docSnap.id,
            author: data.author || data.displayName || 'Anonymous Cook',
            role: data.role || 'Home Cook',
            location: data.location || 'PantryPal Member',
            quote: data.quote || data.review || '',
            rating: 5,
            avatarUrl: data.avatarUrl || data.photoURL,
            createdAt: data.createdAt
          });
        }
      });
    }
  } catch (error) {
    console.info('[db] Testimonials Firestore sync inactive, loading local testimonials');
  }

  const localList: Testimonial[] = getStorageItem('pantrypal_approved_testimonials', []);

  // Merge INITIAL_TESTIMONIALS, localList, and firestoreList without duplicates
  const map = new Map<string, Testimonial>();
  INITIAL_TESTIMONIALS.forEach(t => map.set(t.quote, t));
  localList.forEach(t => map.set(t.quote, t));
  firestoreList.forEach(t => map.set(t.quote, t));

  return Array.from(map.values());
}

export interface CommunityRatingStats {
  totalReviews: number;
  averageRating: number;
}

export async function getCommunityRatingStats(): Promise<CommunityRatingStats> {
  try {
    const snap = await getDocs(collection(firestore, 'testimonials'));
    let count = 0;
    let sum = 0;
    if (!snap.empty) {
      snap.forEach(docSnap => {
        const data = docSnap.data();
        const isApproved = data.status ? data.status === 'approved' : data.approved !== false;
        if (isApproved) {
          const rating = typeof data.rating === 'number' ? data.rating : 5;
          count++;
          sum += rating;
        }
      });
    }

    try {
      const revSnap = await getDocs(collection(firestore, 'recipe_reviews'));
      if (!revSnap.empty) {
        revSnap.forEach(docSnap => {
          const data = docSnap.data();
          const isApproved = data.status ? data.status === 'approved' : data.approved !== false;
          if (isApproved) {
            const rating = typeof data.rating === 'number' ? data.rating : 5;
            count++;
            sum += rating;
          }
        });
      }
    } catch (e) {
      // Recipe reviews collection might not exist yet
    }

    if (count > 0) {
      return {
        totalReviews: count,
        averageRating: Number((sum / count).toFixed(1))
      };
    }
  } catch (err) {
    console.info('[db] Community rating stats fallback:', err);
  }
  return { totalReviews: 0, averageRating: 5.0 };
}

