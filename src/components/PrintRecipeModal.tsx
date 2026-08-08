import React, { useState } from 'react';
import { X, Printer, Download, Copy, Check, AlertCircle, FileText, ExternalLink, Sparkles, Clock, Users, Flame } from 'lucide-react';
import { Recipe } from '../types';
import { DifficultyBadge } from './DifficultyBadge';

interface PrintRecipeModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  servingMultiplier?: number;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const PrintRecipeModal: React.FC<PrintRecipeModalProps> = ({
  recipe,
  isOpen,
  onClose,
  servingMultiplier = 1,
  showToast,
}) => {
  if (!isOpen || !recipe) return null;

  const [copied, setCopied] = useState(false);

  const scaledServings = recipe.servings * servingMultiplier;

  const scaleAmount = (amount: number | string) => {
    if (typeof amount === 'number') {
      const scaled = amount * servingMultiplier;
      return Number.isInteger(scaled) ? scaled : scaled.toFixed(1);
    }
    return amount;
  };

  const handlePrintClick = () => {
    try {
      window.print();
      if (showToast) {
        showToast('Print dialog triggered. Select printer or Save as PDF.', 'info');
      }
    } catch (err) {
      if (showToast) {
        showToast('Browser blocked iframe print. Please click Download Printable Sheet.', 'error');
      }
    }
  };

  const generatePrintableText = (): string => {
    const ingredients = recipe.ingredients
      .map(i => `[ ] ${scaleAmount(i.amount)} ${i.unit || ''} ${i.ingredientName || (i as any).name}`.trim())
      .join('\n');

    const instructions = recipe.instructions
      .map((step, idx) => `Step ${idx + 1}:\n${step}`)
      .join('\n\n');

    return `==================================================
${recipe.title.toUpperCase()}
==================================================
Category: ${recipe.category} | Cuisine: ${recipe.cuisine} | Difficulty: ${recipe.difficulty}
Prep Time: ${recipe.prepTimeMinutes} mins | Cook Time: ${recipe.cookTimeMinutes} mins
Servings: ${scaledServings} | Calories: ~${recipe.calories || 420} kcal

INGREDIENTS:
${ingredients}

INSTRUCTIONS:
${instructions}

--------------------------------------------------
PantryPal Recipe Assistant • ${window.location.href}
==================================================`;
  };

  const handleCopyText = async () => {
    const text = generatePrintableText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (showToast) showToast('Printable text copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        if (showToast) showToast('Printable text copied!', 'success');
        setTimeout(() => setCopied(false), 2500);
      } catch {
        if (showToast) showToast('Failed to copy text', 'error');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleDownloadHtml = () => {
    const ingredientsHtml = recipe.ingredients
      .map(i => `<li><input type="checkbox" /> <strong>${scaleAmount(i.amount)} ${i.unit || ''}</strong> ${i.ingredientName || (i as any).name}</li>`)
      .join('\n');

    const instructionsHtml = recipe.instructions
      .map((step, idx) => `
        <div class="step">
          <div class="step-num">${idx + 1}</div>
          <div class="step-text">${step}</div>
        </div>
      `)
      .join('\n');

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${recipe.title} - Printable Recipe Sheet</title>
  <style>
    @page { margin: 15mm; size: portrait; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111;
      background: #fff;
      margin: 0;
      padding: 20px;
      line-height: 1.5;
    }
    .header {
      border-bottom: 2px solid #D4AF37;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    h1 { margin: 0 0 6px 0; font-size: 26px; color: #111; }
    .meta { font-size: 13px; color: #555; }
    .grid { display: grid; grid-template-columns: 1fr 2fr; gap: 24px; }
    h2 { font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-top: 0; text-transform: uppercase; letter-spacing: 1px; color: #8a6d14; }
    ul { list-style: none; padding: 0; margin: 0; font-size: 14px; }
    li { margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    input[type="checkbox"] { transform: scale(1.2); }
    .step { display: flex; gap: 12px; margin-bottom: 14px; page-break-inside: avoid; }
    .step-num { width: 24px; height: 24px; background: #111; color: #fff; border-radius: 50%; display: flex; align-items: justify; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; shrink: 0; }
    .step-text { font-size: 14px; flex: 1; }
    .footer { margin-top: 30px; border-top: 1px solid #eee; pt: 10px; font-size: 11px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${recipe.title}</h1>
    <div class="meta">
      Category: <strong>${recipe.category}</strong> | Cuisine: <strong>${recipe.cuisine}</strong> | Servings: <strong>${scaledServings}</strong><br>
      Prep Time: <strong>${recipe.prepTimeMinutes} mins</strong> | Cook Time: <strong>${recipe.cookTimeMinutes} mins</strong> | Difficulty: <strong>${recipe.difficulty}</strong>
    </div>
  </div>

  <div class="grid">
    <div>
      <h2>Ingredients</h2>
      <ul>
        ${ingredientsHtml}
      </ul>
    </div>
    <div>
      <h2>Instructions</h2>
      ${instructionsHtml}
    </div>
  </div>

  <div class="footer">
    Printed from PantryPal Recipe Assistant • ${new Date().toLocaleDateString()}
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-printable.html`;
    a.click();
    URL.revokeObjectURL(url);

    if (showToast) showToast('Printable HTML file downloaded! Double-click to print.', 'success');
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 no-print"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#1A1918] border border-[#2A2724] rounded-3xl p-6 shadow-2xl space-y-6 text-[#F5F2EB] max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
        id={`print-recipe-modal-${recipe.id}`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-md">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
                <span>Print Recipe Sheet</span>
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              </h3>
              <p className="text-xs text-[#A39C90]">
                Clean, high-contrast layout optimized for paper printing & kitchen clipboards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] transition-all cursor-pointer"
            title="Close modal"
            id="close-print-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info Banner for Iframe Sandbox awareness */}
        <div className="p-3.5 rounded-2xl bg-[#161513] border border-[#D4AF37]/30 flex items-start gap-3 text-xs text-[#C2BCB2]">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[#F5F2EB]">Kitchen Print Assistant</p>
            <p>
              Click <strong className="text-[#D4AF37]">Print Page</strong> to invoke system printer. If running inside a sandboxed preview frame, click <strong className="text-[#D4AF37]">Download Printable File</strong> for an auto-printing HTML sheet!
            </p>
          </div>
        </div>

        {/* Printable White Paper Sheet Live Preview */}
        <div className="bg-white text-gray-900 p-6 rounded-2xl border-2 border-[#D4AF37] shadow-inner space-y-5 font-sans">
          <div className="border-b-2 border-[#D4AF37] pb-3 flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#9A7B1C]">
                PantryPal Recipe Sheet
              </span>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-900 leading-tight">
                {recipe.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mt-1 font-medium">
                <span>Category: <strong>{recipe.category}</strong></span>
                <span>•</span>
                <span>Cuisine: <strong>{recipe.cuisine}</strong></span>
                <span>•</span>
                <span>Servings: <strong>{scaledServings}</strong></span>
              </div>
            </div>

            <div className="text-right text-xs text-gray-600 space-y-1 shrink-0">
              <div className="flex items-center justify-end gap-1 font-bold text-gray-800">
                <Clock className="w-3.5 h-3.5 text-[#9A7B1C]" />
                <span>Prep: {recipe.prepTimeMinutes}m | Cook: {recipe.cookTimeMinutes}m</span>
              </div>
              <div>Difficulty: <strong>{recipe.difficulty}</strong></div>
              <div>Calories: <strong>~{recipe.calories || 420} kcal</strong></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-gray-800">
            {/* Ingredients Column */}
            <div className="sm:col-span-1 space-y-2.5 border-r-0 sm:border-r border-gray-200 pr-0 sm:pr-4">
              <h2 className="font-serif font-bold text-sm text-[#8a6d14] uppercase tracking-wider border-b border-gray-200 pb-1">
                Ingredients Needed
              </h2>
              <ul className="space-y-1.5 leading-snug">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="font-bold text-gray-900">•</span>
                    <span>
                      <strong className="text-gray-900">{scaleAmount(ing.amount)} {ing.unit || ''}</strong> {ing.ingredientName || (ing as any).name || ''}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions Column */}
            <div className="sm:col-span-2 space-y-2.5">
              <h2 className="font-serif font-bold text-sm text-[#8a6d14] uppercase tracking-wider border-b border-gray-200 pb-1">
                Preparation Instructions
              </h2>
              <div className="space-y-3">
                {recipe.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-gray-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-gray-800 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#2A2724]">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadHtml}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#D4AF37]/40 text-[#D4AF37] font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Printable Sheet</span>
            </button>
          </div>

          <button
            onClick={handlePrintClick}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs rounded-xl hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4 text-black" />
            <span>Print Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
