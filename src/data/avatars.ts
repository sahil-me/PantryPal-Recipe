export type AvatarCategory = 'all' | 'default' | 'chefs' | 'food' | 'characters' | 'animals' | 'minimal';

export interface AvatarDefinition {
  id: string;
  name: string;
  category: 'default' | 'chefs' | 'food' | 'characters' | 'animals' | 'minimal';
  description: string;
  bgGradient: string; // Tailwind gradient background
  iconName: string; // Lucide icon identifier or vector type
  borderColor?: string;
  accentColor?: string;
}

export const AVATAR_CATEGORIES: { id: AvatarCategory; label: string }[] = [
  { id: 'all', label: 'All Avatars' },
  { id: 'default', label: 'Default' },
  { id: 'chefs', label: 'Chefs' },
  { id: 'food', label: 'Food & Drinks' },
  { id: 'characters', label: 'Characters' },
  { id: 'animals', label: 'Animals' },
  { id: 'minimal', label: 'Minimal Luxury' },
];

export const BUILTIN_AVATARS: AvatarDefinition[] = [
  // Default Initial
  {
    id: 'initial',
    name: 'Golden Initial',
    category: 'default',
    description: 'Your personal initial badge crafted in signature PantryPal champagne gold.',
    bgGradient: 'from-[#D4AF37] via-[#E5C158] to-[#C5A028]',
    iconName: 'Initial',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#000000',
  },

  // Chefs Category
  {
    id: 'chef-executive',
    name: 'Executive Chef',
    category: 'chefs',
    description: 'Head of the kitchen, distinguished with a classic chef toque.',
    bgGradient: 'from-[#1A1918] via-[#2A2724] to-[#121212]',
    iconName: 'ChefHat',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#D4AF37',
  },
  {
    id: 'chef-pastry',
    name: 'Pastry Artisan',
    category: 'chefs',
    description: 'Master of delicate desserts, sugar work, and viennoiserie.',
    bgGradient: 'from-[#3B1F2B] via-[#2A1721] to-[#161513]',
    iconName: 'Cake',
    borderColor: 'border-[#E5C158]',
    accentColor: '#F3C64F',
  },
  {
    id: 'chef-grill',
    name: 'Grill Master',
    category: 'chefs',
    description: 'Expert in open-flame sear, smoking, and artisanal roasts.',
    bgGradient: 'from-[#4A1A0F] via-[#2E100A] to-[#121212]',
    iconName: 'Flame',
    borderColor: 'border-[#E6A135]',
    accentColor: '#E6A135',
  },
  {
    id: 'chef-baker',
    name: 'Master Baker',
    category: 'chefs',
    description: 'Crafting sourdough, ancient grains, and crispy golden crusts.',
    bgGradient: 'from-[#3D2C1D] via-[#261B12] to-[#121212]',
    iconName: 'Wheat',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#E5C158',
  },
  {
    id: 'chef-sommelier',
    name: 'Sommelier',
    category: 'chefs',
    description: 'Curating vintage pairings and fine wine reserve lists.',
    bgGradient: 'from-[#38121B] via-[#210B10] to-[#121212]',
    iconName: 'Wine',
    borderColor: 'border-[#D4AF37]/80',
    accentColor: '#D4AF37',
  },
  {
    id: 'chef-gourmet',
    name: 'Gourmet Innovator',
    category: 'chefs',
    description: 'Pioneering avant-garde gastronomy and delicate plating.',
    bgGradient: 'from-[#1E1D1B] via-[#2B2823] to-[#1A1918]',
    iconName: 'Sparkles',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#D4AF37',
  },

  // Food & Drinks Category
  {
    id: 'food-ramen',
    name: 'Ramen Master',
    category: 'food',
    description: 'Rich tonkotsu broth, handmade noodles, and ajitsuke tamago.',
    bgGradient: 'from-[#192E2E] via-[#101E1E] to-[#121212]',
    iconName: 'Soup',
    borderColor: 'border-[#4ADE80]',
    accentColor: '#2DD4BF',
  },
  {
    id: 'food-pizza',
    name: 'Neapolitan Pizza',
    category: 'food',
    description: 'Wood-fired crust, San Marzano tomato, and fresh mozzarella.',
    bgGradient: 'from-[#421D12] via-[#28110B] to-[#121212]',
    iconName: 'Pizza',
    borderColor: 'border-[#E6A135]',
    accentColor: '#F59E0B',
  },
  {
    id: 'food-avocado',
    name: 'Fresh Avocado',
    category: 'food',
    description: 'Organic avocado, extra virgin olive oil, and sea salt flakes.',
    bgGradient: 'from-[#1C3322] via-[#122116] to-[#121212]',
    iconName: 'Vegan',
    borderColor: 'border-[#86EFAC]',
    accentColor: '#4ADE80',
  },
  {
    id: 'food-coffee',
    name: 'Barista Espresso',
    category: 'food',
    description: 'Single-origin roast, velvety microfoam, and rich crema.',
    bgGradient: 'from-[#302118] via-[#1E140F] to-[#121212]',
    iconName: 'Coffee',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#E5C158',
  },
  {
    id: 'food-sushi',
    name: 'Sushi Omakase',
    category: 'food',
    description: 'Fresh bluefin, seasoned shari rice, and freshly grated wasabi.',
    bgGradient: 'from-[#122A38] via-[#0B1A24] to-[#121212]',
    iconName: 'Fish',
    borderColor: 'border-[#38BDF8]',
    accentColor: '#60A5FA',
  },
  {
    id: 'food-burger',
    name: 'Wagyu Burger',
    category: 'food',
    description: 'Seared Wagyu beef patty, aged cheddar, and brioche bun.',
    bgGradient: 'from-[#3B2012] via-[#24130A] to-[#121212]',
    iconName: 'Utensils',
    borderColor: 'border-[#E6A135]',
    accentColor: '#F59E0B',
  },

  // Characters Category
  {
    id: 'char-culinary-star',
    name: 'Culinary Star',
    category: 'characters',
    description: 'Celebrated home chef sharing passion for great cooking.',
    bgGradient: 'from-[#332A13] via-[#211B0C] to-[#121212]',
    iconName: 'Star',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#F3C64F',
  },
  {
    id: 'char-home-chef',
    name: 'Home Chef',
    category: 'characters',
    description: 'Passionate cook transforming daily ingredients into magic.',
    bgGradient: 'from-[#1E293B] via-[#0F172A] to-[#121212]',
    iconName: 'UserCheck',
    borderColor: 'border-[#94A3B8]',
    accentColor: '#E2E8F0',
  },
  {
    id: 'char-foodie',
    name: 'Foodie Explorer',
    category: 'characters',
    description: 'Constant seeker of new flavors, spices, and global dishes.',
    bgGradient: 'from-[#311B3B] via-[#1E0F24] to-[#121212]',
    iconName: 'Compass',
    borderColor: 'border-[#C084FC]',
    accentColor: '#E879F9',
  },

  // Animals Category
  {
    id: 'animal-fox',
    name: 'Clever Fox Chef',
    category: 'animals',
    description: 'Resourceful culinary fox who wastes no ingredient.',
    bgGradient: 'from-[#432010] via-[#291309] to-[#121212]',
    iconName: 'Dog',
    borderColor: 'border-[#FB923C]',
    accentColor: '#F97316',
  },
  {
    id: 'animal-owl',
    name: 'Wise Owl Gourmet',
    category: 'animals',
    description: 'Thoughtful night chef crafting late-night delicacies.',
    bgGradient: 'from-[#182138] via-[#0D1322] to-[#121212]',
    iconName: 'Bird',
    borderColor: 'border-[#818CF8]',
    accentColor: '#A5B4FC',
  },
  {
    id: 'animal-panda',
    name: 'Panda Noodle Cook',
    category: 'animals',
    description: 'Gentle noodle artisan specializing in bamboo-steamed dumplings.',
    bgGradient: 'from-[#27272A] via-[#18181B] to-[#121212]',
    iconName: 'Heart',
    borderColor: 'border-[#E4E4E7]',
    accentColor: '#F4F4F5',
  },
  {
    id: 'animal-cat',
    name: 'Sous Chef Whiskers',
    category: 'animals',
    description: 'Meticulous taster inspecting every dish with precision.',
    bgGradient: 'from-[#332517] via-[#1F160C] to-[#121212]',
    iconName: 'Cat',
    borderColor: 'border-[#FDBA74]',
    accentColor: '#FB923C',
  },

  // Minimal Luxury Category
  {
    id: 'minimal-crown',
    name: 'Royal Crown',
    category: 'minimal',
    description: 'Emblem of Michelin-grade culinary royalty.',
    bgGradient: 'from-[#D4AF37] via-[#1A1918] to-[#121212]',
    iconName: 'Crown',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#D4AF37',
  },
  {
    id: 'minimal-flame',
    name: 'Culinary Ember',
    category: 'minimal',
    description: 'Minimalist golden flame signifying culinary passion.',
    bgGradient: 'from-[#23211E] via-[#1A1918] to-[#121212]',
    iconName: 'Flame',
    borderColor: 'border-[#E6A135]',
    accentColor: '#E6A135',
  },
  {
    id: 'minimal-cutlery',
    name: 'Haute Cutlery',
    category: 'minimal',
    description: 'Sleek crossed silver and gold dining instruments.',
    bgGradient: 'from-[#1A1918] via-[#23211E] to-[#161513]',
    iconName: 'UtensilsCrossed',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#F5F2EB',
  },
  {
    id: 'minimal-trophy',
    name: 'Golden Apron Trophy',
    category: 'minimal',
    description: 'Symbol of master kitchen achievements and zero food waste.',
    bgGradient: 'from-[#2A2413] via-[#1A170B] to-[#121212]',
    iconName: 'Trophy',
    borderColor: 'border-[#D4AF37]',
    accentColor: '#F3C64F',
  },
];

export function getAvatarDefinition(avatarId?: string): AvatarDefinition {
  if (!avatarId || avatarId === 'initial') {
    return BUILTIN_AVATARS[0]; // Default initial
  }
  const found = BUILTIN_AVATARS.find(a => a.id === avatarId);
  if (found) return found;

  // If avatarId is unknown or a URL, return default initial
  return BUILTIN_AVATARS[0];
}
