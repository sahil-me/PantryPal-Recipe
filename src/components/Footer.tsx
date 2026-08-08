import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from '../utils/constants';
import { ChefHat, ChevronDown, Github, Linkedin, Twitter, Mail, HelpCircle, Shield, FileText, MessageSquare, ExternalLink, CheckCircle, X, Send } from 'lucide-react';
import { FeedbackModal } from './FeedbackModal';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    question: 'What is PantryPal?',
    answer: 'PantryPal is an ingredient-first recipe matching platform designed to help home cooks discover delicious meals using ingredients already in their kitchen, reducing food waste and making cooking effortless.'
  },
  {
    question: 'Is PantryPal free to use?',
    answer: 'Yes! PantryPal is 100% free to use for all home cooks without hidden fees or subscription requirements.'
  },
  {
    question: 'Do I need to create an account?',
    answer: 'No account is required to search and explore recipes. However, creating a free account allows you to save pantry items across devices, bookmark your favorite recipes, and generate grocery lists.'
  },
  {
    question: 'Can I search recipes by ingredients?',
    answer: 'Yes! You can enter ingredients using our fast autocomplete search bar, select staple pantry chips, or filter by dietary preferences, meal categories, and preparation time.'
  },
  {
    question: 'How does PantryPal recommend recipes?',
    answer: 'PantryPal compares your active pantry items or entered ingredients against our recipe database. It calculates an exact match percentage (e.g., 100% Chef Match) and highlights ingredients you have vs. what extra items you might need.'
  },
  {
    question: 'Can I save my favorite recipes?',
    answer: 'Yes! Simply click the heart icon on any recipe card to instantly bookmark it to your Favorites collection for quick access whenever you are ready to cook.'
  },
  {
    question: 'Is my pantry data private?',
    answer: 'Yes, your pantry data and preferences stay private and secure. We only store your data to personalize your recipe recommendations and never share it with third parties.'
  },
  {
    question: 'Which sign-in methods are supported?',
    answer: 'PantryPal supports fast, secure sign-in via Google One-Tap / OAuth as well as standard Email and Password authentication.'
  },
  {
    question: 'Why are some recipes unavailable?',
    answer: 'Beef recipes are intentionally excluded from PantryPal\'s recipe catalog to align with our culinary guidelines and dietary inclusions. All other major cuisine and ingredient combinations are supported.'
  },
  {
    question: 'Where do the recipes come from?',
    answer: 'PantryPal is powered by an extensive culinary database, combined with our custom ingredient-normalization engine for accurate ingredient matching and recipe search.'
  }
];

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0); // First item open by default
  const [activeModal, setActiveModal] = useState<'feedback' | 'issue' | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleFaqClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('faq-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigateTo('/');
      setTimeout(() => {
        document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <footer className="bg-[#121212] border-t border-[#2A2724] text-[#C2BCB2] font-sans selection:bg-[#D4AF37]/30">
      {/* SECTION 1 — Frequently Asked Questions */}
      <section id="faq-section" className="py-16 md:py-20 px-6 max-w-5xl mx-auto border-b border-[#2A2724]">
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold uppercase tracking-wider shadow-xs">
            <HelpCircle className="w-3.5 h-3.5 text-[#D4AF37]" /> FAQ & Guide
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif font-bold text-[#F5F2EB] tracking-tight">
            Questions? We've got answers.
          </h2>
          <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-xl mx-auto leading-relaxed">
            Learn how PantryPal works, how your pantry is saved, and how recipe matching helps you cook with ingredients you already have.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-3.5 max-w-3xl mx-auto">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'bg-[#1E1D1B] border-[#D4AF37]/60 shadow-lg shadow-[#D4AF37]/5'
                    : 'bg-[#161513] border-[#2A2724] hover:border-[#D4AF37]/40'
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 rounded-2xl group"
                  aria-expanded={isOpen}
                >
                  <span className={`font-serif font-semibold text-sm sm:text-base transition-colors ${
                    isOpen ? 'text-[#D4AF37]' : 'text-[#F5F2EB] group-hover:text-[#D4AF37]'
                  }`}>
                    {item.question}
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 bg-[#D4AF37] text-black shadow-md' : 'bg-[#23211E] text-[#A39C90] group-hover:text-[#D4AF37] group-hover:bg-[#2A2724]'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#C2BCB2] font-normal leading-relaxed border-t border-[#2A2724]/60 animate-in fade-in slide-in-from-top-1 duration-200">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* FAQ list ends smoothly */}
      </section>

      {/* SECTION 2 — 5-Column Responsive Footer */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4 lg:col-span-1 sm:col-span-2 lg:sm:col-span-1">
            <div
              onClick={() => navigateTo('/')}
              className="flex items-center gap-3 cursor-pointer group inline-flex"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] flex items-center justify-center text-black shadow-md group-hover:scale-105 transition-transform">
                <ChefHat className="w-5 h-5 text-black" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                  PantryPal
                </h3>
                <p className="text-[10px] text-[#D4AF37] font-semibold tracking-wide uppercase">
                  Cook • Save • Discover
                </p>
              </div>
            </div>
            <p className="text-xs text-[#A39C90] leading-relaxed pr-2">
              Helping you discover delicious recipes using ingredients already in your kitchen.
            </p>
          </div>

          {/* Column 2: Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2EB] font-serif border-b border-[#2A2724] pb-2">
              PRODUCT
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => navigateTo('/search')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Discover Recipes
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/pantry')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  My Pantry
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/favorites')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Favorites
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/search')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Recipe Categories
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2EB] font-serif border-b border-[#2A2724] pb-2">
              Resources
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => navigateTo('/about')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  About
                </button>
              </li>
              <li>
                <button
                  onClick={handleFaqClick}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  FAQ
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/legal/privacy')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/legal/terms')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('/legal/cookies')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer text-left"
                >
                  Cookie Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2EB] font-serif border-b border-[#2A2724] pb-2">
              SUPPORT
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button
                  onClick={() => setActiveModal('issue')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Report Issue
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('feedback')}
                  className="hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  Feedback
                </button>
              </li>
            </ul>
          </div>

          {/* Column 5: Stay Connected */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2EB] font-serif border-b border-[#2A2724] pb-2">
              Stay Connected
            </h4>
            <div className="space-y-3">
              <div className="text-xs font-medium space-y-1">
                <span className="text-[#8A8275] block text-[11px]">Email Support:</span>
                <a
                  href="mailto:contact.eshop.sahil@gmail.com"
                  className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5 shrink-0" />
                  <span>contact.eshop.sahil@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 3 — Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-[#2A2724] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A39C90]">
          <p>© 2026 PantryPal. All rights reserved.</p>
          
          <p className="font-medium text-[#C2BCB2]">
            Designed &amp; Developed by <span className="text-[#F5F2EB] font-bold">Sahil Sharma</span>
          </p>

          <div className="flex items-center gap-2.5">
            <a
              href={LINKEDIN_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] hover:bg-[#23211E] transition-all cursor-pointer group flex items-center gap-2 text-xs font-semibold shadow-xs"
              title="LinkedIn Profile"
            >
              <Linkedin className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
              <span>LinkedIn</span>
            </a>

            <a
              href={GITHUB_PROFILE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] hover:bg-[#23211E] transition-all cursor-pointer group flex items-center gap-2 text-xs font-semibold shadow-xs"
              title="GitHub Profile"
            >
              <Github className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-[#D4AF37]" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Interactive Feedback & Report Issue Modal */}
      <FeedbackModal
        isOpen={activeModal === 'feedback' || activeModal === 'issue'}
        onClose={() => setActiveModal(null)}
        initialMode={activeModal === 'issue' ? 'issue' : 'feedback'}
      />
    </footer>
  );
};
