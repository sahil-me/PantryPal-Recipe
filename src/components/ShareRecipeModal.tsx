import React, { useState, useRef } from 'react';
import { X, Share2, Copy, Check, Download, Sparkles, Clock, Users, Flame, ExternalLink, Image as ImageIcon, FileText, CheckCircle2 } from 'lucide-react';
import { Recipe } from '../types';
import { getRecipeFallbackImage } from '../utils/imageUtils';
import { DifficultyBadge } from './DifficultyBadge';

interface ShareRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const ShareRecipeModal: React.FC<ShareRecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  showToast,
}) => {
  if (!isOpen || !recipe) return null;

  const [activeTab, setActiveTab] = useState<'social' | 'short' | 'detailed'>('social');
  const [copiedType, setCopiedType] = useState<'text' | 'link' | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const shareableUrl = 'https://PantryPal-recipe.vercel.app';

  // Formatted summary variations
  const getSocialSummary = (): string => {
    const ingredientsList = recipe.ingredients
      .slice(0, 6)
      .map(i => `  • ${i.amount} ${i.unit || ''} ${i.ingredientName || (i as any).name || ''}`.trim())
      .join('\n');

    const instructionsHighlight = recipe.instructions
      .slice(0, 3)
      .map((inst, idx) => `  ${idx + 1}. ${inst}`)
      .join('\n');

    return `🍳 ${recipe.title.toUpperCase()}
⏱️ Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m | Servings: ${recipe.servings}
🔥 Difficulty: ${recipe.difficulty} | 🏷️ ${recipe.cuisine} • ${recipe.category}

🛒 KEY INGREDIENTS:
${ingredientsList}${recipe.ingredients.length > 6 ? `\n  • + ${recipe.ingredients.length - 6} more ingredients` : ''}

👨‍🍳 PREPARATION HIGHLIGHTS:
${instructionsHighlight}

✨ Discover full steps & match your pantry on PantryPal!
👉 ${shareableUrl}

#PantryPal #RecipeShare #HomeCooking #${recipe.cuisine.replace(/\s+/g, '')} #Foodie #CookingMadeEasy`;
  };

  const getShortSummary = (): string => {
    const topIngredients = recipe.ingredients.slice(0, 4).map(i => i.ingredientName || (i as any).name || '').filter(Boolean).join(', ');
    return `🍳 Making ${recipe.title}! ⏱️ ${recipe.prepTimeMinutes + recipe.cookTimeMinutes}m total | ${recipe.difficulty} level | ${recipe.servings} servings

Key ingredients: ${topIngredients}

Check out the full recipe on PantryPal: ${shareableUrl}
#PantryPal #HomeCooking #${recipe.cuisine.replace(/\s+/g, '')}`;
  };

  const getDetailedSummary = (): string => {
    const fullIngredients = recipe.ingredients
      .map(i => `• ${i.amount} ${i.unit || ''} ${i.ingredientName || (i as any).name || ''}`.trim())
      .join('\n');

    const fullInstructions = recipe.instructions
      .map((inst, idx) => `Step ${idx + 1}: ${inst}`)
      .join('\n\n');

    return `📖 RECIPE CARD: ${recipe.title}
Category: ${recipe.category} | Cuisine: ${recipe.cuisine}
Prep Time: ${recipe.prepTimeMinutes} mins | Cook Time: ${recipe.cookTimeMinutes} mins | Servings: ${recipe.servings}
Difficulty: ${recipe.difficulty} | Calories: ~${recipe.calories || 420} kcal

INGREDIENTS:
${fullIngredients}

INSTRUCTIONS:
${fullInstructions}

---
Matched & Prepared with PantryPal Recipe Assistant
Link: ${shareableUrl}`;
  };

  const getCurrentText = (): string => {
    switch (activeTab) {
      case 'short':
        return getShortSummary();
      case 'detailed':
        return getDetailedSummary();
      case 'social':
      default:
        return getSocialSummary();
    }
  };

  const copyToClipboard = async (text: string, type: 'text' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      if (showToast) {
        showToast(type === 'text' ? 'Formatted summary copied for social media!' : 'Recipe link copied to clipboard!', 'success');
      }
      setTimeout(() => setCopiedType(null), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedType(type);
        if (showToast) {
          showToast(type === 'text' ? 'Formatted summary copied!' : 'Recipe link copied!', 'success');
        }
        setTimeout(() => setCopiedType(null), 2500);
      } catch {
        if (showToast) showToast('Failed to copy to clipboard', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleNativeShare = async () => {
    const textToShare = getCurrentText();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${recipe.title} - PantryPal Recipe`,
          text: textToShare,
          url: shareableUrl,
        });
        if (showToast) showToast('Recipe shared successfully!', 'success');
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          copyToClipboard(textToShare, 'text');
        }
      }
    } else {
      copyToClipboard(textToShare, 'text');
    }
  };

  // Direct Platform URL Share Builders
  const currentText = getCurrentText();
  const encodedText = encodeURIComponent(currentText);
  const encodedUrl = encodeURIComponent(shareableUrl);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodedText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(recipe.imageUrl)}&description=${encodeURIComponent(`${recipe.title} - ${recipe.description}`)}`;

  // Download Social Media Banner Image using HTML5 Canvas
  const downloadSocialCardImage = () => {
    setIsGeneratingImage(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGeneratingImage(false);
      return;
    }

    // Load background image or fallback gradient
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      // 1. Dark Espresso Background
      ctx.fillStyle = '#161513';
      ctx.fillRect(0, 0, 1200, 630);

      // 2. Draw recipe image on left half with smooth scaling
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(40, 40, 520, 550, 24);
      ctx.clip();
      ctx.drawImage(img, 40, 40, 520, 550);

      // Gradient overlay over image
      const imgGrad = ctx.createLinearGradient(40, 40, 40, 590);
      imgGrad.addColorStop(0, 'rgba(0,0,0,0.1)');
      imgGrad.addColorStop(1, 'rgba(18,18,18,0.85)');
      ctx.fillStyle = imgGrad;
      ctx.fillRect(40, 40, 520, 550);
      ctx.restore();

      // 3. Right side card styling
      // Golden Accent Border Card container
      ctx.save();
      ctx.fillStyle = '#1A1918';
      ctx.strokeStyle = '#2A2724';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(580, 40, 580, 550, 24);
      ctx.fill();
      ctx.stroke();

      // Header Brand Pill
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('PANTRYPAL • CULINARY RESERVE', 610, 85);

      // Category / Cuisine Tag
      ctx.fillStyle = '#2A2724';
      ctx.beginPath();
      ctx.roundRect(610, 105, 120, 30, 15);
      ctx.fill();
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(recipe.category.toUpperCase(), 625, 125);

      // Recipe Title
      ctx.fillStyle = '#F5F2EB';
      ctx.font = 'bold 36px serif';
      const titleLines = wrapText(ctx, recipe.title, 520);
      let titleY = 180;
      titleLines.forEach(line => {
        ctx.fillText(line, 610, titleY);
        titleY += 44;
      });

      // Quick Stats Bar
      ctx.fillStyle = '#23211E';
      ctx.beginPath();
      ctx.roundRect(610, titleY + 10, 520, 60, 16);
      ctx.fill();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`⏱️ Prep: ${recipe.prepTimeMinutes}m | Cook: ${recipe.cookTimeMinutes}m`, 630, titleY + 46);
      ctx.fillText(`👥 ${recipe.servings} Servings`, 870, titleY + 46);
      ctx.fillText(`🔥 ${recipe.calories || 420} kcal`, 1010, titleY + 46);

      // Ingredients Box
      ctx.fillStyle = '#C2BCB2';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('Key Ingredients:', 610, titleY + 110);

      ctx.font = '15px sans-serif';
      ctx.fillStyle = '#A39C90';
      const topIngredients = recipe.ingredients.slice(0, 5);
      topIngredients.forEach((ing, idx) => {
        ctx.fillText(`• ${ing.amount} ${ing.unit || ''} ${ing.ingredientName || (ing as any).name}`, 620, titleY + 138 + (idx * 26));
      });

      if (recipe.ingredients.length > 5) {
        ctx.fillStyle = '#D4AF37';
        ctx.fillText(`+ ${recipe.ingredients.length - 5} additional ingredients`, 620, titleY + 138 + (5 * 26));
      }

      // Footer Callout
      ctx.fillStyle = '#D4AF37';
      ctx.font = 'italic 14px serif';
      ctx.fillText('Matched ingredient-first with PantryPal Recipe Assistant', 610, 560);

      ctx.restore();

      // Trigger Download
      const link = document.createElement('a');
      link.download = `${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-recipe-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGeneratingImage(false);
      if (showToast) showToast('Social media card downloaded!', 'success');
    };

    img.onerror = () => {
      // Fallback: draw card without custom image if cross-origin blocked
      ctx.fillStyle = '#161513';
      ctx.fillRect(0, 0, 1200, 630);

      ctx.fillStyle = '#1A1918';
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(60, 40, 1080, 550, 28);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 22px serif';
      ctx.fillText('PANTRYPAL CULINARY RESERVE', 100, 90);

      ctx.fillStyle = '#F5F2EB';
      ctx.font = 'bold 44px serif';
      ctx.fillText(recipe.title, 100, 160);

      ctx.fillStyle = '#C2BCB2';
      ctx.font = '20px sans-serif';
      ctx.fillText(`Category: ${recipe.category} • Prep: ${recipe.prepTimeMinutes}m • Cook: ${recipe.cookTimeMinutes}m • ${recipe.servings} Servings`, 100, 210);

      const link = document.createElement('a');
      link.download = `${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-card.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsGeneratingImage(false);
      if (showToast) showToast('Recipe summary card downloaded!', 'success');
    };

    img.src = recipe.imageUrl || getRecipeFallbackImage(recipe.title, recipe.category);
  };

  // Canvas text wrap helper
  function wrapText(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1A1918] border border-[#2A2724] rounded-3xl p-6 shadow-2xl space-y-6 text-[#F5F2EB] max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        id={`share-recipe-modal-${recipe.id}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
                <span>Share Recipe Summary</span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </h3>
              <p className="text-xs text-[#A39C90]">
                Formatted text and visual cards optimized for social media posts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] transition-all cursor-pointer"
            title="Close modal"
            id="close-share-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Visual Recipe Card Preview */}
        <div
          ref={cardRef}
          className="p-4 rounded-2xl bg-[#161513] border border-[#D4AF37]/40 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="w-full sm:w-28 h-28 object-cover rounded-xl border border-[#2A2724]"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.src = getRecipeFallbackImage(recipe.title, recipe.category);
              }}
            />
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D4AF37] text-black uppercase tracking-wider">
                  {recipe.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/80 text-[#D4AF37] border border-[#D4AF37]/30 uppercase tracking-wider">
                  {recipe.cuisine}
                </span>
                <DifficultyBadge level={recipe.difficulty} size="sm" />
              </div>

              <h4 className="text-base font-serif font-bold text-[#F5F2EB] leading-tight">
                {recipe.title}
              </h4>

              <div className="flex items-center gap-4 text-xs text-[#A39C90] flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#D4AF37]" /> {recipe.prepTimeMinutes + recipe.cookTimeMinutes} mins
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" /> {recipe.servings} Servings
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#E6A135]" /> {recipe.calories || 420} kcal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A39C90] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" /> Choose Format Style
            </span>
            <span className="text-[11px] text-[#A39C90]">
              Ready to paste into Instagram, WhatsApp or Twitter
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-[#23211E] p-1.5 rounded-2xl border border-[#2A2724]">
            <button
              onClick={() => setActiveTab('social')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                activeTab === 'social'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black shadow-md font-extrabold'
                  : 'text-[#C2BCB2] hover:bg-[#2A2724]'
              }`}
            >
              📱 Social Post
            </button>
            <button
              onClick={() => setActiveTab('short')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                activeTab === 'short'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black shadow-md font-extrabold'
                  : 'text-[#C2BCB2] hover:bg-[#2A2724]'
              }`}
            >
              🐦 Tweet / Short
            </button>
            <button
              onClick={() => setActiveTab('detailed')}
              className={`py-2 px-3 rounded-xl font-bold text-xs transition-all cursor-pointer text-center ${
                activeTab === 'detailed'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#C5A028] text-black shadow-md font-extrabold'
                  : 'text-[#C2BCB2] hover:bg-[#2A2724]'
              }`}
            >
              📖 Full Recipe Card
            </button>
          </div>
        </div>

        {/* Formatted Text Box */}
        <div className="relative group">
          <textarea
            readOnly
            value={getCurrentText()}
            className="w-full h-44 p-4 rounded-2xl bg-[#161513] border border-[#2A2724] text-xs font-mono text-[#F5F2EB] leading-relaxed resize-none focus:outline-none focus:border-[#D4AF37]/50"
          />
          <button
            onClick={() => copyToClipboard(getCurrentText(), 'text')}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
            title="Copy formatted text"
          >
            {copiedType === 'text' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>

        {/* Social Platform Shortcut Buttons */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-[#A39C90] uppercase tracking-wider">
            Quick Share Platforms
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-emerald-500/50 text-[#F5F2EB] hover:text-emerald-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5 fill-emerald-400 shrink-0" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.993L2 22l5.233-1.237a9.98 9.98 0 004.779 1.217h.004c5.505 0 9.988-4.478 9.989-9.984.001-2.669-1.033-5.177-2.917-7.062A9.92 9.92 0 0012.012 2zm5.72 14.28c-.242.682-1.2 1.298-1.954 1.464-.52.114-1.2.205-3.483-.739-2.92-1.206-4.802-4.173-4.949-4.368-.145-.194-1.189-1.583-1.189-3.02 0-1.436.75-2.143 1.018-2.433.268-.29.585-.363.78-.363.195 0 .39.002.56.01.181.007.423-.069.662.505.242.578.828 2.02.9 2.167.073.146.122.316.024.512-.097.195-.146.316-.292.487-.146.17-.308.38-.439.51-.146.146-.298.305-.128.597.17.292.756 1.248 1.623 2.018 1.115.992 2.057 1.3 2.349 1.446.292.146.463.122.634-.073.17-.195.731-.853.926-1.145.195-.292.39-.243.658-.146.268.097 1.706.804 2.00 1.0.292.195.487.292.56.414.073.122.073.707-.17 1.39z"/>
              </svg>
              <span>WhatsApp</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-sky-500/50 text-[#F5F2EB] hover:text-sky-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5 fill-sky-400 shrink-0" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              <span>X / Twitter</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-blue-500/50 text-[#F5F2EB] hover:text-blue-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5 fill-blue-400 shrink-0" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={pinterestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-rose-500/50 text-[#F5F2EB] hover:text-rose-400 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-3.5 h-3.5 fill-rose-400 shrink-0" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
              </svg>
              <span>Pinterest</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </div>
        </div>

        {/* Primary Action Buttons Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#2A2724]">
          <button
            onClick={downloadSocialCardImage}
            disabled={isGeneratingImage}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/50 text-[#D4AF37] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingImage ? 'Generating Image...' : 'Download Image Card'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => copyToClipboard(shareableUrl, 'link')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] text-[#F5F2EB] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {copiedType === 'link' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="flex-1 sm:flex-initial px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Share2 className="w-4 h-4 text-black" />
              <span>Share Recipe</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
