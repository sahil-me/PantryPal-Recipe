import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Cookie, X } from 'lucide-react';

export const CookieConsentBanner: React.FC = () => {
  const { navigateTo } = useApp();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('pantrypal_cookie_consent');
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    try {
      localStorage.setItem('pantrypal_cookie_consent', 'accepted');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('pantrypal_cookie_consent', 'declined');
    } catch {
      // ignore
    }
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-[#161513]/95 backdrop-blur-md border-t border-[#2A2724] shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="flex items-start gap-3.5 text-xs sm:text-sm text-[#C2BCB2]">
          <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 flex items-center justify-center shrink-0 mt-0.5">
            <Cookie className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="space-y-0.5">
            <p className="font-semibold text-[#F5F2EB]">
              Cookie & Data Privacy Notice
            </p>
            <p className="leading-snug">
              We use cookies to keep you logged in and improve your experience. Read our{' '}
              <button
                onClick={() => navigateTo('/legal/cookies')}
                className="text-[#D4AF37] hover:underline font-bold cursor-pointer"
              >
                Cookie Policy
              </button>
              .
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto justify-end">
          <button
            onClick={handleDecline}
            className="px-4 py-2 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#A39C90] text-[#C2BCB2] hover:text-[#F5F2EB] text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Decline
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 text-black text-xs font-extrabold rounded-xl transition-all cursor-pointer shadow-md"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="p-2 text-[#A39C90] hover:text-[#F5F2EB] rounded-lg transition-colors cursor-pointer md:hidden"
            title="Close banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
