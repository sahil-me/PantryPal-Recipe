import React, { useState, useEffect } from 'react';
import { Star, X, Sparkles, Check, MessageSquare, ThumbsUp, ChefHat, User, MapPin } from 'lucide-react';
import { Recipe, RecipeFeedback } from '../types';
import { saveRecipeFeedback, getRecipeFeedback, savePublicTestimonial } from '../services/db';

interface RecipeFeedbackModalProps {
  recipe: Recipe;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  initialRating?: number;
  initialFeedback?: RecipeFeedback | null;
  showToast?: (message: string) => void;
  onSubmitted?: (feedback: RecipeFeedback) => void;
}

const RATING_LABELS: Record<number, { title: string; subtitle: string }> = {
  1: { title: 'Needs Work', subtitle: 'Not quite what I expected' },
  2: { title: 'Okay', subtitle: 'Decent, but needs some tweaks' },
  3: { title: 'Tasty!', subtitle: 'Solid, enjoyable meal' },
  4: { title: 'Delicious!', subtitle: 'Really great flavor and texture' },
  5: { title: "Chef's Kiss! 👨‍🍳✨", subtitle: 'Absolute perfection, loved it!' },
};

const SUGGESTED_IMPROVEMENTS = [
  'Adjust Salt / Seasoning',
  'Cook Time Too Long',
  'Cook Time Too Short',
  'More Spice Needed',
  'Reduce Spice / Heat',
  'Need More Sauce / Liquid',
  'Pantry Swap Worked Great',
  'Will Definitely Make Again!',
];

export const RecipeFeedbackModal: React.FC<RecipeFeedbackModalProps> = ({
  recipe,
  isOpen,
  onClose,
  userId = 'guest',
  initialRating = 5,
  initialFeedback = null,
  showToast,
  onSubmitted,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [stateCountry, setStateCountry] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [reviewText, setReviewText] = useState<string>('');
  const [recommend, setRecommend] = useState<boolean>(true);
  const [publicPermission, setPublicPermission] = useState<boolean>(true);
  const [selectedImprovements, setSelectedImprovements] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && recipe) {
      setValidationError(null);
      if (initialFeedback) {
        setRating(initialFeedback.rating || 5);
        setFirstName(initialFeedback.firstName || '');
        setLastName(initialFeedback.lastName || '');
        setCity(initialFeedback.city || '');
        setStateCountry(initialFeedback.stateCountry || '');
        setTitle(initialFeedback.title || '');
        setReviewText(initialFeedback.reviewText || initialFeedback.notes || '');
        setRecommend(initialFeedback.recommend !== false);
        setPublicPermission(initialFeedback.publicPermission !== false);
        setSelectedImprovements(initialFeedback.improvements || []);
        setHasExistingFeedback(true);
      } else {
        // Fetch if authenticated user has existing feedback
        getRecipeFeedback(userId, recipe.id).then((existing) => {
          if (existing) {
            setRating(existing.rating || initialRating);
            setFirstName(existing.firstName || '');
            setLastName(existing.lastName || '');
            setCity(existing.city || '');
            setStateCountry(existing.stateCountry || '');
            setTitle(existing.title || '');
            setReviewText(existing.reviewText || existing.notes || '');
            setRecommend(existing.recommend !== false);
            setPublicPermission(existing.publicPermission !== false);
            setSelectedImprovements(existing.improvements || []);
            setHasExistingFeedback(true);
          } else {
            setRating(initialRating || 5);
            setFirstName('');
            setLastName('');
            setCity('');
            setStateCountry('');
            setTitle('');
            setReviewText('');
            setRecommend(true);
            setPublicPermission(true);
            setSelectedImprovements([]);
            setHasExistingFeedback(false);
          }
        });
      }
    }
  }, [isOpen, recipe, userId, initialRating, initialFeedback]);

  if (!isOpen || !recipe) return null;

  const toggleImprovement = (item: string) => {
    setSelectedImprovements((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanFirstName = firstName.trim();
    if (!cleanFirstName) {
      setValidationError('First Name is required to submit a review.');
      return;
    }

    setIsSaving(true);

    try {
      const feedbackData: RecipeFeedback = {
        recipeId: recipe.id,
        rating,
        firstName: cleanFirstName,
        lastName: lastName.trim() || undefined,
        city: city.trim() || undefined,
        stateCountry: stateCountry.trim() || undefined,
        title: title.trim() || undefined,
        reviewText: reviewText.trim() || undefined,
        notes: reviewText.trim() || undefined,
        recommend,
        publicPermission,
        improvements: selectedImprovements,
        cookedAt: new Date().toISOString()
      };

      await saveRecipeFeedback(userId, feedbackData);
      await savePublicTestimonial(feedbackData);

      if (showToast) {
        showToast(
          userId !== 'guest' && userId !== 'guest_user'
            ? hasExistingFeedback
              ? `Updated feedback for ${recipe.title}!`
              : `Feedback saved! Your review for ${recipe.title} has been stored.`
            : `Thank you, ${cleanFirstName}! Your review for ${recipe.title} has been recorded for this session.`
        );
      }

      if (onSubmitted) {
        onSubmitted(feedbackData);
      }

      onClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      id="recipe-feedback-backdrop"
    >
      <div
        className="w-full max-w-lg bg-[#1A1918] border border-[#2A2724] rounded-[28px] p-6 shadow-2xl space-y-5 text-[#F5F2EB] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        id={`recipe-feedback-modal-${recipe.id}`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#2A2724]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center font-bold shadow-lg shrink-0">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-serif font-bold text-[#F5F2EB]">
                  How was your meal?
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Recipe Review
                </span>
              </div>
              <p className="text-xs text-[#A39C90] mt-0.5">
                Rate <strong className="text-[#F5F2EB] font-semibold">{recipe.title}</strong> to help other home cooks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#A39C90] hover:text-[#F5F2EB] transition-all cursor-pointer"
            title="Close modal"
            id="close-feedback-modal-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {validationError && (
          <div className="p-3 bg-red-950/60 border border-red-500/40 rounded-xl text-xs text-red-300 flex items-center gap-2">
            <span className="font-bold">Error:</span> {validationError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Info Fields */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#161513] border border-[#2A2724]">
            <div className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D4AF37]" /> Your Information
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-[#C2BCB2] block mb-1">
                  First Name <span className="text-[#D4AF37]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Priya"
                  className="w-full px-3 py-2 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#C2BCB2] block mb-1">
                  Last Name <span className="text-[#8A8275]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  className="w-full px-3 py-2 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-medium text-[#C2BCB2] block mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#A39C90]" /> City <span className="text-[#8A8275]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. San Francisco"
                  className="w-full px-3 py-2 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#C2BCB2] block mb-1">
                  State / Country <span className="text-[#8A8275]">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={stateCountry}
                  onChange={(e) => setStateCountry(e.target.value)}
                  placeholder="e.g. CA, USA"
                  className="w-full px-3 py-2 bg-[#1E1D1B] border border-[#2A2724] rounded-xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Rating Section */}
          <div className="p-4 rounded-2xl bg-[#161513] border border-[#2A2724] space-y-2 text-center">
            <label className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider block">
              Overall Meal Rating <span className="text-[#D4AF37]">*</span>
            </label>

            {/* Stars Selector */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                  title={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= activeRating
                        ? 'fill-[#D4AF37] text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                        : 'text-[#3A3632] fill-transparent'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Rating Label Indicator */}
            {RATING_LABELS[activeRating] && (
              <div className="space-y-0.5 animate-in fade-in duration-150">
                <div className="font-serif font-bold text-sm text-[#F5F2EB]">
                  {RATING_LABELS[activeRating].title}
                </div>
                <div className="text-[11px] text-[#A39C90]">
                  {RATING_LABELS[activeRating].subtitle}
                </div>
              </div>
            )}
          </div>

          {/* Review Details */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider block mb-1">
                Review Title <span className="text-[#8A8275] font-sans font-normal normal-case">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Quick, delicious weeknight dinner!"
                className="w-full px-3.5 py-2.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between mb-1">
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" /> Chef's Notes & Review
                </span>
              </label>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell other home cooks how it turned out, any ingredient swaps, or serving ideas..."
                className="w-full p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:border-[#D4AF37] focus:outline-none font-sans leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Would you recommend */}
          <div className="p-3 bg-[#161513] border border-[#2A2724] rounded-2xl flex items-center justify-between gap-3">
            <span className="text-xs font-serif font-bold text-[#F5F2EB]">
              Would you recommend this recipe?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRecommend(true)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  recommend
                    ? 'bg-[#D4AF37] text-black shadow-md'
                    : 'bg-[#23211E] text-[#C2BCB2] hover:text-[#F5F2EB]'
                }`}
              >
                👍 Yes
              </button>
              <button
                type="button"
                onClick={() => setRecommend(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  !recommend
                    ? 'bg-red-800 text-white shadow-md'
                    : 'bg-[#23211E] text-[#C2BCB2] hover:text-[#F5F2EB]'
                }`}
              >
                👎 No
              </button>
            </div>
          </div>

          {/* Public permission checkbox */}
          <div className="p-3 bg-[#161513] border border-[#2A2724] rounded-2xl">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={publicPermission}
                onChange={(e) => setPublicPermission(e.target.checked)}
                className="mt-0.5 rounded accent-[#D4AF37] w-4 h-4"
              />
              <span className="text-xs text-[#C2BCB2] leading-relaxed">
                I agree that PantryPal may display my review publicly on the homepage to inspire other home cooks.
              </span>
            </label>
          </div>

          {/* Cooking Tweaks & Improvement Tags */}
          <div className="space-y-2">
            <label className="text-xs font-serif font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between">
              <span>Potential Improvements & Tweaks</span>
              <span className="text-[10px] text-[#A39C90] normal-case font-sans">Optional</span>
            </label>

            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_IMPROVEMENTS.map((item) => {
                const isSelected = selectedImprovements.includes(item);
                return (
                  <button
                    type="button"
                    key={item}
                    onClick={() => toggleImprovement(item)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#23211E] border-[#D4AF37] text-[#D4AF37] shadow-sm font-bold'
                        : 'bg-[#1E1D1B] border-[#2A2724] text-[#C2BCB2] hover:border-[#D4AF37]/50 hover:text-[#F5F2EB]'
                    }`}
                  >
                    {isSelected ? <Check className="w-3 h-3 text-[#D4AF37]" /> : <Plus className="w-3 h-3 text-[#8A8275]" />}
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-2xl bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] text-[#C2BCB2] hover:text-[#F5F2EB] font-bold text-xs transition-all cursor-pointer"
            >
              Skip
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="flex-[2] py-3 px-6 rounded-2xl bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-[#D4AF37]/15 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <ThumbsUp className="w-4 h-4" />
                  <span>{hasExistingFeedback ? 'Update Review' : 'Submit Review'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Icon
function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
