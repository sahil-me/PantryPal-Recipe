import { Search, UtensilsCrossed, Heart, Calendar, User, Home, LucideIcon } from 'lucide-react';

export interface NavItemConfig {
  id: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  badgeType?: 'pantry' | 'favorites' | null;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    id: '/search',
    label: 'Discover Recipes',
    shortLabel: 'Discover',
    icon: Search,
    badgeType: null,
  },
  {
    id: '/pantry',
    label: 'My Pantry',
    shortLabel: 'Pantry',
    icon: UtensilsCrossed,
    badgeType: 'pantry',
  },
  {
    id: '/favorites',
    label: 'Favorites',
    shortLabel: 'Favorites',
    icon: Heart,
    badgeType: 'favorites',
  },
  {
    id: '/planner',
    label: 'Weekly Planner',
    shortLabel: 'Planner',
    icon: Calendar,
    badgeType: null,
  },
  {
    id: '/account',
    label: 'Profile',
    shortLabel: 'Profile',
    icon: User,
    badgeType: null,
  },
  {
    id: '/',
    label: 'Home',
    shortLabel: 'Home',
    icon: Home,
    badgeType: null,
  },
];

export const ROUTE_TITLE_MAP: Record<string, string> = {
  '/search': 'Discover Recipes',
  '/results': 'Matching Recipes',
  '/recipe': 'Recipe Overview',
  '/pantry': 'My Pantry',
  '/favorites': 'Favorites',
  '/planner': 'Weekly Planner',
  '/account': 'Profile',
  '/settings': 'Settings',
  '/about': 'About',
  '/legal/privacy': 'Privacy Policy',
  '/legal/terms': 'Terms of Service',
  '/legal/cookies': 'Cookie Policy',
  '/auth/signin': 'Sign In',
  '/auth/signup': 'Create Account',
  '/': 'Home',
};

export const DEFAULT_POST_AUTH_ROUTE = '/search';

export function navigateToPostAuth(navigateTo: (route: string) => void, customRoute?: string): void {
  const destination = customRoute || DEFAULT_POST_AUTH_ROUTE;
  navigateTo(destination);
}

export function getPageTitle(route: string): string {
  return ROUTE_TITLE_MAP[route] || 'PantryPal';
}
