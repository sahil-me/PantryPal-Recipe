import oatsImg from '../assets/images/cinnamon_apple_oats_1784910092019.jpg';
import aglioOlioImg from '../assets/images/spaghetti_aglio_olio_1784910113641.jpg';
import shrimpImg from '../assets/images/garlic_butter_shrimp_1784910130183.jpg';

export function getRecipeFallbackImage(title: string = '', category: string = ''): string {
  const lowerTitle = title.toLowerCase();
  const lowerCategory = category.toLowerCase();

  if (lowerTitle.includes('oat') || lowerTitle.includes('cinnamon') || lowerTitle.includes('apple') || lowerTitle.includes('porridge')) {
    return oatsImg;
  }

  if (lowerTitle.includes('spaghetti') || lowerTitle.includes('aglio') || lowerTitle.includes('pasta') || lowerTitle.includes('penne') || lowerTitle.includes('fettuccine')) {
    return aglioOlioImg;
  }

  if (lowerTitle.includes('shrimp') || lowerTitle.includes('seafood') || lowerTitle.includes('fish')) {
    return shrimpImg;
  }

  if (lowerTitle.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80';
  }

  if (lowerTitle.includes('chicken') || lowerTitle.includes('curry')) {
    return 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&auto=format&fit=crop&q=80';
  }

  if (lowerTitle.includes('egg') || lowerTitle.includes('omelet') || lowerTitle.includes('toast') || lowerCategory === 'breakfast') {
    return 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80';
  }

  if (lowerTitle.includes('taco') || lowerTitle.includes('beef') || lowerCategory === 'mexican') {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&auto=format&fit=crop&q=80';
  }

  if (lowerTitle.includes('potato') || lowerTitle.includes('fries')) {
    return 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=800&auto=format&fit=crop&q=80';
  }

  if (lowerTitle.includes('salad') || lowerTitle.includes('caesar')) {
    return 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800&auto=format&fit=crop&q=80';
  }

  // General appetizing gourmet cooked meal fallback
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
}
