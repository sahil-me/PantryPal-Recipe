import React, { useState, useEffect } from 'react';
import { MessageSquare, AlertTriangle, X, CheckCircle, Send, Loader2, AlertCircle, Mail } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../lib/firebase';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'feedback' | 'issue';
}

const CATEGORY_OPTIONS = [
  'General Feedback',
  'Feature Request',
  'Bug Report',
  'Recipe Issue',
  'Account Issue',
  'Other'
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'feedback'
}) => {
  const [mode, setMode] = useState<'feedback' | 'issue'>(initialMode);
  const [category, setCategory] = useState<string>('General Feedback');
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setCategory(initialMode === 'issue' ? 'Bug Report' : 'General Feedback');
      setEmail('');
      setMessage('');
      setIsSubmitting(false);
      setIsSuccess(false);
      setErrorMsg(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleModeChange = (newMode: 'feedback' | 'issue') => {
    setMode(newMode);
    if (newMode === 'issue' && category === 'General Feedback') {
      setCategory('Bug Report');
    } else if (newMode === 'feedback' && category === 'Bug Report') {
      setCategory('General Feedback');
    }
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const submissionData = {
      type: mode,
      category,
      email: email.trim() || null,
      message: message.trim(),
      recipientEmail: 'contact.eshop.sahil@gmail.com',
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    try {
      // 1. Store submission in Firestore
      await addDoc(collection(firestore, 'feedback_submissions'), {
        ...submissionData,
        timestamp: serverTimestamp()
      });

      // 2. Also notify backend API endpoint for delivery
      try {
        await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });
      } catch (err) {
        // Backend logging attempt fails silent if offline
        console.warn('[Feedback API notice]:', err);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error('[Feedback Submission Error]:', err);
      setIsSubmitting(false);
      // Friendly error message without technical details
      setErrorMsg("We couldn't send your message right now. Please try again in a few minutes.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#1A1918] border border-[#2A2724] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5 text-[#F5F2EB]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A39C90] hover:text-[#F5F2EB] p-1.5 rounded-xl bg-[#23211E] hover:bg-[#2A2724] transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/40 flex items-center justify-center mx-auto text-[#D4AF37]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-xl text-[#F5F2EB]">Submission Received!</h3>
              <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-md mx-auto leading-relaxed">
                Thank you! Your message has been received. We appreciate your feedback and will review it as soon as possible.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="w-full py-3 bg-[#23211E] hover:bg-[#2A2724] border border-[#2A2724] hover:border-[#D4AF37] text-[#F5F2EB] font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-[#2A2724] pb-4 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center shrink-0">
                {mode === 'issue' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <MessageSquare className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB]">
                  {mode === 'feedback' ? 'Send Feedback' : 'Report an Issue'}
                </h3>
                <p className="text-xs text-[#A39C90]">
                  {mode === 'feedback'
                    ? 'Tell us what you love or how we can improve PantryPal.'
                    : 'Help us improve by reporting bugs or unexpected behavior.'}
                </p>
              </div>
            </div>

            {/* Mode Segmented Control / Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#161513] border border-[#2A2724] rounded-2xl">
              <button
                type="button"
                onClick={() => handleModeChange('feedback')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'feedback'
                    ? 'bg-[#1E1D1B] border border-[#D4AF37]/50 text-[#D4AF37] shadow-xs'
                    : 'text-[#A39C90] hover:text-[#F5F2EB]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Feedback</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('issue')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'issue'
                    ? 'bg-[#1E1D1B] border border-[#D4AF37]/50 text-[#D4AF37] shadow-xs'
                    : 'text-[#A39C90] hover:text-[#F5F2EB]'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Report Issue</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-500/30 text-red-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#A39C90] mb-1.5">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 bg-[#23211E] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] cursor-pointer"
                >
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt} className="bg-[#1A1918] text-[#F5F2EB]">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              {/* Optional Email Address */}
              <div>
                <label className="block text-xs font-semibold text-[#A39C90] mb-1.5">
                  Email Address <span className="text-[#8A8275] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full p-3 pl-9 bg-[#23211E] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                  />
                  <Mail className="w-4 h-4 text-[#8A8275] absolute left-3 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#8A8275] mt-1">
                  We'll only use this if we need to contact you about your submission.
                </p>
              </div>

              {/* Message / Details with Live Character Counter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#A39C90]">
                    {mode === 'feedback' ? 'Your Feedback' : 'Issue Details'}
                  </label>
                  <span className={`text-[11px] ${message.length >= 950 ? 'text-[#E6A135]' : 'text-[#8A8275]'}`}>
                    {message.length} / 1000
                  </span>
                </div>
                <textarea
                  required
                  rows={4}
                  maxLength={1000}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    mode === 'feedback'
                      ? 'Share your ideas, suggestions, or overall experience...'
                      : 'Describe what happened, what you expected, and how to reproduce the issue...'
                  }
                  className="w-full p-3 bg-[#23211E] border border-[#2A2724] rounded-2xl text-xs text-[#F5F2EB] placeholder-[#8A8275] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] leading-relaxed resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!message.trim() || isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-extrabold text-xs sm:text-sm rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>{mode === 'feedback' ? 'Submit Feedback' : 'Submit Report'}</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
