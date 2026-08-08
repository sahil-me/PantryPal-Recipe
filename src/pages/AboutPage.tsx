import React from 'react';
import { useApp } from '../context/AppContext';
import { GITHUB_REPO_URL, GITHUB_PROFILE_URL, LINKEDIN_PROFILE_URL } from '../utils/constants';
import {
  ArrowLeft,
  ChefHat,
  Target,
  Sparkles,
  Layers,
  Code2,
  ShieldCheck,
  Github,
  Linkedin,
  CheckCircle2,
  UtensilsCrossed,
  Clock,
  DollarSign,
  Leaf,
  Lock,
  ExternalLink
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20 space-y-10 sm:space-y-12 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      {/* Top Back Navigation & Hero Header */}
      <div className="space-y-5 border-b border-[#2A2724] pb-8">
        <button
          onClick={() => navigateTo('/')}
          className="px-3.5 py-1.5 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 inline-flex"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-start gap-4 pt-1">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[#D4AF37]/15 font-bold">
            <ChefHat className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">
              About PantryPal
            </h1>
            <p className="text-xs sm:text-base text-[#D4AF37] font-semibold">
              Helping home cooks reduce food waste through AI-powered recipe discovery.
            </p>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 sm:p-10 shadow-xl text-xs sm:text-sm text-[#C2BCB2] space-y-10 sm:space-y-12 leading-relaxed">
        
        {/* 1. Our Mission */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Our Mission
            </h2>
          </div>
          
          <div className="space-y-3 pl-1">
            <p className="text-[#C2BCB2] leading-relaxed">
              PantryPal was created to solve a universal kitchen challenge: <strong className="text-[#F5F2EB]">&quot;I have ingredients in my fridge, but no idea what to cook right now.&quot;</strong>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-xs text-[#C2BCB2]">
                  <strong className="text-[#F5F2EB] font-semibold block mb-0.5">Eliminate Indecision</strong>
                  Find instant recipe recommendations matched to your existing kitchen stock.
                </p>
              </div>
              <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <p className="text-xs text-[#C2BCB2]">
                  <strong className="text-[#F5F2EB] font-semibold block mb-0.5">Promote Sustainability</strong>
                  Turn perishables near expiration into gourmet meals to cut down food waste.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Why PantryPal */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Why PantryPal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/5 h-full flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#F5F2EB] text-sm sm:text-base">Save Time</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Instant ingredient-to-recipe ranking gets dinner on the table faster without endless recipe blog scrolling.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/5 h-full flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#F5F2EB] text-sm sm:text-base">Save Money</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Reduce impulse grocery store trips and takeout orders by cooking with ingredients you&apos;ve already purchased.
                </p>
              </div>
            </div>

            <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#D4AF37]/5 h-full flex flex-col justify-between space-y-3">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#23211E] border border-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center">
                  <Leaf className="w-4 h-4" />
                </div>
                <h3 className="font-serif font-bold text-[#F5F2EB] text-sm sm:text-base">Reduce Waste</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Use ingredients before they spoil, fostering a conscious and eco-friendly home kitchen workflow.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. How PantryPal Works */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              How PantryPal Works
            </h2>
          </div>

          <div className="relative pl-3 sm:pl-4 border-l-2 border-[#2A2724] space-y-4 ml-3 my-2">
            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-2xl flex items-start gap-3.5 transition-all duration-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs shadow-md flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#F5F2EB] text-xs sm:text-sm">Add Your Ingredients</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Type ingredients into lightning-fast autocomplete or quick-select common pantry staples like eggs, pasta, or olive oil.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-2xl flex items-start gap-3.5 transition-all duration-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs shadow-md flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#F5F2EB] text-xs sm:text-sm">Discover Ranked Matches</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  PantryPal instantly matches your inventory against thousands of recipes, displaying match percentages and highlighting missing items.
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/40 rounded-2xl flex items-start gap-3.5 transition-all duration-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black font-extrabold text-xs shadow-md flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-[#F5F2EB] text-xs sm:text-sm">Cook &amp; Scale Easily</h3>
                <p className="text-xs text-[#A39C90] leading-relaxed">
                  Follow clear culinary steps, adjust scale multipliers (1x, 2x, 3x), and save favorite recipes with custom notes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Key Features */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Key Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 h-full">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-[#F5F2EB] block text-xs sm:text-sm">Ingredient Match Engine</strong>
                <span className="text-xs text-[#A39C90] leading-relaxed">Calculates real-time match percentage based on available pantry items.</span>
              </div>
            </div>

            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 h-full">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-[#F5F2EB] block text-xs sm:text-sm">Virtual Pantry Sync</strong>
                <span className="text-xs text-[#A39C90] leading-relaxed">Persists your ingredient stock securely across mobile and desktop devices.</span>
              </div>
            </div>

            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 h-full">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-[#F5F2EB] block text-xs sm:text-sm">Dynamic Recipe Scaling</strong>
                <span className="text-xs text-[#A39C90] leading-relaxed">Scale ingredient portions automatically for single meals or dinner parties.</span>
              </div>
            </div>

            <div className="p-4 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/50 rounded-2xl flex items-start gap-3 transition-all duration-300 hover:-translate-y-0.5 h-full">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <strong className="text-[#F5F2EB] block text-xs sm:text-sm">Weekly Meal Planner</strong>
                <span className="text-xs text-[#A39C90] leading-relaxed">Plan meals ahead and generate automated missing ingredient lists.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Technology Stack */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Code2 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Technology Stack
            </h2>
          </div>

          <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                React 18+
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                TypeScript (Strict Mode)
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                Tailwind CSS
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                Firebase Firestore &amp; Auth
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                Culinary Database
              </span>
              <span className="px-3 py-1 rounded-xl bg-[#23211E] border border-[#2A2724] text-[#D4AF37] text-xs font-semibold">
                Vite &amp; Cloud Run
              </span>
            </div>
            <p className="text-xs text-[#C2BCB2] leading-relaxed">
              Built using modern web technologies with a focus on performance, accessibility, scalability, and security.
            </p>
          </div>
        </section>

        {/* 6. Privacy & Security */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Privacy &amp; Security
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F2EB] block text-xs">Privacy-First Design</strong>
                <span className="text-xs text-[#A39C90]">Zero advertising trackers and no third-party data monetization.</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F2EB] block text-xs">Full Compliance</strong>
                <span className="text-xs text-[#A39C90]">Built under strict GDPR and CCPA privacy standards.</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F2EB] block text-xs">Secure Authentication</strong>
                <span className="text-xs text-[#A39C90]">Encrypted session management powered by Firebase Auth.</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="text-[#F5F2EB] block text-xs">Complete User Control</strong>
                <span className="text-xs text-[#A39C90]">Maintain 100% data ownership with instant 1-click erasure.</span>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Open Source / GitHub */}
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#23211E] border border-[#D4AF37]/30 text-[#D4AF37] flex items-center justify-center shrink-0">
              <Github className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-serif font-bold text-[#F5F2EB]">
              Open Source &amp; Code Quality
            </h2>
          </div>

          <div className="p-5 bg-[#1E1D1B] border border-[#2A2724] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs sm:text-sm text-[#F5F2EB] font-semibold leading-relaxed">
                PantryPal is open source. View the source code, report issues, suggest improvements, or contribute on GitHub.
              </p>
              <p className="text-xs text-[#A39C90]">Strict TypeScript typing, modular architecture, and automated test coverage.</p>
            </div>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black text-xs font-extrabold rounded-xl hover:brightness-110 transition-all cursor-pointer shadow-md shadow-[#D4AF37]/15 inline-flex items-center gap-2 shrink-0"
            >
              <Github className="w-4 h-4 text-black" />
              <span>View Repository</span>
              <ExternalLink className="w-3.5 h-3.5 text-black" />
            </a>
          </div>
        </section>

        {/* 8. Designed & Developed by Sahil Sharma */}
        <section className="pt-6 border-t border-[#2A2724]">
          <div className="p-4 sm:p-5 bg-gradient-to-r from-[#1E1D1B] via-[#23211E] to-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <p className="text-[11px] text-[#A39C90] uppercase tracking-wider font-semibold">Designed &amp; Developed</p>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F2EB]">
                Designed &amp; Developed by <span className="text-[#D4AF37]">Sahil Sharma</span>
              </h3>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <a
                href={LINKEDIN_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer shadow-sm"
                title="LinkedIn Profile"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={GITHUB_PROFILE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer shadow-sm"
                title="GitHub Profile"
              >
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
