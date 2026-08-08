import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookmarkCheck, 
  Trash2, 
  Check, 
  ShoppingBag, 
  Copy, 
  Plus, 
  ShoppingCart, 
  ArrowRight, 
  CheckCircle2, 
  ExternalLink, 
  Sparkles,
  UtensilsCrossed,
  Filter,
  PackageCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface GroceryModalProps {
  isOpen: boolean;
  onClose: () => void;
  groceryList: string[];
  onRemoveGroceryItem: (name: string) => void;
  onClearGroceryList: () => void;
}

const QUICK_SUGGESTIONS = [
  'Milk', 'Eggs', 'Butter', 'Chicken Breast', 'Olive Oil', 
  'Garlic', 'Avocado', 'Lemon', 'Parmesan', 'Fresh Basil'
];

// Helper to categorize ingredients
const getItemCategory = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes('milk') || lower.includes('cheese') || lower.includes('butter') || lower.includes('cream') || lower.includes('yogurt') || lower.includes('egg')) {
    return 'Dairy & Eggs';
  }
  if (lower.includes('chicken') || lower.includes('beef') || lower.includes('pork') || lower.includes('shrimp') || lower.includes('fish') || lower.includes('bacon') || lower.includes('salmon')) {
    return 'Meat & Seafood';
  }
  if (lower.includes('apple') || lower.includes('lemon') || lower.includes('lime') || lower.includes('garlic') || lower.includes('onion') || lower.includes('tomato') || lower.includes('avocado') || lower.includes('basil') || lower.includes('spinach') || lower.includes('potato')) {
    return 'Produce';
  }
  if (lower.includes('oil') || lower.includes('pepper') || lower.includes('salt') || lower.includes('flour') || lower.includes('sugar') || lower.includes('rice') || lower.includes('pasta') || lower.includes('sauce')) {
    return 'Pantry Staples';
  }
  return 'Groceries';
};

export const GroceryModal: React.FC<GroceryModalProps> = ({
  isOpen = true,
  onClose,
  groceryList,
  onRemoveGroceryItem,
  onClearGroceryList,
}) => {
  if (!isOpen) return null;

  const { addToShoppingList, checkoutShoppingList, navigateTo, showToast } = useApp();

  // Selected items state for checkout (defaults to ALL items checked)
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'list' | 'confirm' | 'success'>('list');
  const [checkedOutSummary, setCheckedOutSummary] = useState<{ count: number; items: string[] }>({ count: 0, items: [] });
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  // Sync selectedItems when groceryList changes
  useEffect(() => {
    setSelectedItems(prev => {
      // Keep selected items that still exist in groceryList
      const next = prev.filter(item => groceryList.includes(item));
      // Add any new items added to groceryList
      groceryList.forEach(item => {
        if (!next.includes(item)) {
          next.push(item);
        }
      });
      return next;
    });
  }, [groceryList]);

  // Handle adding custom ingredient directly in modal
  const handleAddCustomItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    addToShoppingList(trimmed);
    setCustomInput('');
  };

  // Toggle item selection for checkout
  const toggleSelectItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  // Select / Deselect All
  const handleSelectAll = () => {
    if (selectedItems.length === groceryList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems([...groceryList]);
    }
  };

  // Copy list with checkmarks
  const handleCopyList = () => {
    const text = groceryList
      .map((item, idx) => {
        const isChecked = selectedItems.includes(item);
        return `${isChecked ? '[x]' : '[ ]'} ${idx + 1}. ${item}`;
      })
      .join('\n');

    navigator.clipboard.writeText(`🛒 PantryPal Shopping List:\n\n${text}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Execute Checkout Transfer
  const handleExecuteCheckout = () => {
    if (selectedItems.length === 0) {
      showToast('Please select at least one item to check out', 'info');
      return;
    }
    const res = checkoutShoppingList(selectedItems);
    setCheckedOutSummary({ count: res.addedCount, items: res.items });
    setCheckoutStep('success');
  };

  // Redirect to external online grocery search
  const openExternalStore = (storeName: string) => {
    const query = selectedItems.join(', ');
    let url = '';
    if (storeName === 'instacart') {
      url = `https://www.instacart.com/store/s?k=${encodeURIComponent(selectedItems[0] || 'groceries')}`;
    } else if (storeName === 'walmart') {
      url = `https://www.walmart.com/search?q=${encodeURIComponent(query)}`;
    } else if (storeName === 'amazon') {
      url = `https://www.amazon.com/s?k=${encodeURIComponent(query)}&i=grocery`;
    }
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter items by category
  const filteredList = activeCategoryFilter === 'All'
    ? groceryList
    : groceryList.filter(i => getItemCategory(i) === activeCategoryFilter);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-[#1A1918] rounded-[28px] shadow-2xl overflow-hidden flex flex-col border border-[#2A2724] my-auto animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#1E1D1B] border-b border-[#2A2724] text-[#F5F2EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] flex items-center justify-center shadow-md">
              <ShoppingCart className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif text-[#F5F2EB]">
                {checkoutStep === 'success' ? 'Checkout Complete 🎉' : `Shopping List (${groceryList.length})`}
              </h2>
              <p className="text-[11px] text-[#A39C90]">
                {checkoutStep === 'success' 
                  ? 'Items transferred to your Virtual Pantry' 
                  : 'Check off items as you shop & checkout to Pantry'}
              </p>
            </div>
          </div>
          <button
            id="close-grocery-modal-btn"
            onClick={onClose}
            className="p-1.5 text-[#A39C90] hover:text-[#F5F2EB] bg-[#23211E] border border-[#2A2724] hover:bg-[#2A2724] rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* STEP 1 & 2: Shopping List & Preparation */}
        {(checkoutStep === 'list' || checkoutStep === 'confirm') && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Quick Add Form */}
            <form onSubmit={handleAddCustomItem} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Add item (e.g., Heavy Cream, Olive Oil)..."
                  className="w-full pl-3.5 pr-3 py-2.5 bg-[#23211E] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <button
                type="submit"
                disabled={!customInput.trim()}
                className="px-3.5 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs rounded-xl flex items-center gap-1 hover:brightness-110 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Add</span>
              </button>
            </form>

            {/* Quick Suggestions Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-[#A39C90] tracking-wider">Quick Add Staples:</span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.map(sugg => {
                  const alreadyInList = groceryList.some(i => i.toLowerCase() === sugg.toLowerCase());
                  return (
                    <button
                      key={sugg}
                      type="button"
                      onClick={() => !alreadyInList && addToShoppingList(sugg)}
                      disabled={alreadyInList}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                        alreadyInList 
                          ? 'bg-[#1E1D1B] text-[#8A8275] border border-[#2A2724] cursor-default' 
                          : 'bg-[#23211E] hover:bg-[#2A2724] text-[#F5F2EB] hover:text-[#D4AF37] border border-[#2A2724] hover:border-[#D4AF37]/40'
                      }`}
                    >
                      <span>+ {sugg}</span>
                      {alreadyInList && <Check className="w-3 h-3 text-[#D4AF37]" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#2A2724]" />

            {/* List Controls */}
            {groceryList.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="text-[#D4AF37] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                      {selectedItems.length === groceryList.length ? 'Deselect All' : 'Select All'}
                    </button>
                    <span className="text-[#8A8275]">|</span>
                    <span className="text-[#C2BCB2] font-medium text-[11px]">
                      {selectedItems.length} of {groceryList.length} ready for checkout
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      id="copy-grocery-list-btn"
                      type="button"
                      onClick={handleCopyList}
                      className="flex items-center gap-1 text-[#D4AF37] font-bold hover:underline cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                    <button
                      id="clear-grocery-list-btn"
                      type="button"
                      onClick={onClearGroceryList}
                      className="text-[#E6A135] hover:underline font-medium cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {['All', 'Produce', 'Dairy & Eggs', 'Meat & Seafood', 'Pantry Staples', 'Groceries'].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        activeCategoryFilter === cat
                          ? 'bg-[#D4AF37] text-black font-extrabold'
                          : 'bg-[#23211E] text-[#C2BCB2] hover:text-[#F5F2EB] border border-[#2A2724]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Items List */}
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {filteredList.length === 0 ? (
                    <p className="text-center py-4 text-xs text-[#8A8275]">No items in this category.</p>
                  ) : (
                    filteredList.map((item) => {
                      const isSelected = selectedItems.includes(item);
                      const catLabel = getItemCategory(item);
                      return (
                        <div
                          key={item}
                          onClick={() => toggleSelectItem(item)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                            isSelected 
                              ? 'bg-[#23211E] border-[#D4AF37]/50 text-[#F5F2EB] shadow-xs' 
                              : 'bg-[#1E1D1B] border-[#2A2724] text-[#A39C90] opacity-75'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent onClick
                              className="w-4 h-4 accent-[#D4AF37] rounded-md cursor-pointer"
                            />
                            <div>
                              <span className={isSelected ? 'text-[#F5F2EB] font-bold' : 'line-through text-[#8A8275]'}>
                                {item}
                              </span>
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-md bg-[#161513] text-[#A39C90] border border-[#2A2724]">
                                {catLabel}
                              </span>
                            </div>
                          </div>

                          <button
                            id={`remove-grocery-${item.toLowerCase().replace(/\s+/g, '-')}`}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveGroceryItem(item);
                            }}
                            className="p-1 text-[#A39C90] hover:text-[#E6A135] transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Online Store Delivery Links Banner */}
                <div className="p-3 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#C2BCB2]">
                    <span>Order Online for Delivery:</span>
                    <span className="text-[10px] text-[#A39C90]">1-Click Search</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => openExternalStore('instacart')}
                      className="p-2 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-xl text-[11px] text-[#F5F2EB] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Instacart</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternalStore('walmart')}
                      className="p-2 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-xl text-[11px] text-[#F5F2EB] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Walmart</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openExternalStore('amazon')}
                      className="p-2 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-xl text-[11px] text-[#F5F2EB] font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <span>Amazon Fresh</span>
                      <ExternalLink className="w-3 h-3 text-[#D4AF37]" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#23211E] border border-[#2A2724] flex items-center justify-center mx-auto text-[#8A8275]">
                  <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F5F2EB]">Your shopping list is empty</p>
                  <p className="text-xs text-[#A39C90] max-w-xs mx-auto mt-1">
                    When viewing recipes, click the '+' next to missing ingredients, or type items above to build your grocery run list!
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: SUCCESS CHECKOUT SCREEN */}
        {checkoutStep === 'success' && (
          <div className="p-6 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center mx-auto shadow-xl shadow-[#D4AF37]/20">
              <PackageCheck className="w-9 h-9 text-black" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-serif font-bold text-[#F5F2EB]">Checkout Complete!</h3>
              <p className="text-xs text-[#C2BCB2] max-w-sm mx-auto">
                <span className="text-[#D4AF37] font-bold">{checkedOutSummary.count} ingredient(s)</span> have been automatically added to your Virtual Pantry and removed from your shopping list.
              </p>
            </div>

            {checkedOutSummary.items.length > 0 && (
              <div className="p-3 bg-[#23211E] border border-[#2A2724] rounded-2xl text-left max-h-36 overflow-y-auto space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#A39C90]">Added to Pantry:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {checkedOutSummary.items.map(item => (
                    <span key={item} className="px-2 py-0.5 bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#F5F2EB] rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Check className="w-3 h-3 text-[#D4AF37]" /> {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigateTo('/results');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-sm rounded-2xl hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/15 flex items-center justify-center gap-2"
              >
                <UtensilsCrossed className="w-4 h-4 text-black" />
                <span>Find Matching Recipes Now</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCheckoutStep('list');
                }}
                className="w-full py-2.5 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB] font-bold text-xs rounded-xl border border-[#2A2724] transition-all cursor-pointer"
              >
                Back to Shopping List
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions (for Step 1) */}
        {checkoutStep === 'list' && (
          <div className="p-4 bg-[#1E1D1B] border-t border-[#2A2724] flex items-center justify-between gap-3">
            <button
              id="done-grocery-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-[#23211E] hover:bg-[#2A2724] text-[#C2BCB2] font-bold text-xs rounded-xl border border-[#2A2724] transition-all cursor-pointer"
            >
              Close
            </button>

            {groceryList.length > 0 && (
              <button
                id="checkout-grocery-btn"
                type="button"
                onClick={handleExecuteCheckout}
                disabled={selectedItems.length === 0}
                className="px-5 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold text-xs rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[#D4AF37]/15 flex items-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-black" />
                <span>Checkout ({selectedItems.length}) & Transfer to Pantry</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
