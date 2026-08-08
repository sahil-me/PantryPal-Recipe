import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getAppMetrics, AppMetrics, getTestimonials, Testimonial, INITIAL_TESTIMONIALS, getCommunityRatingStats, CommunityRatingStats } from '../services/db';
import { searchRecipesApi } from '../services/recipeApi';
import { SAMPLE_RECIPES } from '../data/recipes';
import { Recipe } from '../types';
import { getRecipeFallbackImage } from '../utils/imageUtils';
import { 
  ChefHat, Search, UtensilsCrossed, Heart, CheckCircle2, ArrowRight, Sparkles, 
  ShoppingBag, ShieldCheck, Zap, Star, Flame, Award, Clock, Quote, Check, 
  ChevronDown, Users, Utensils, PackageCheck, TrendingUp, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { Footer } from '../components/Footer';
import heroFoodImg from '../assets/images/pantrypal_pantry_hero_1784791730709.jpg';

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  fallbackText?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  target, 
  suffix = '+', 
  fallbackText = 'Growing Daily' 
}) => {
  const [count, setCount] = useState(0);
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setHasTriggered(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasTriggered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasTriggered || target <= 0) return;

    // Respect reduced motion accessibility
    const prefersReducedMotion = typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    let frame = 0;
    const duration = 1600;
    const fps = 60;
    const totalFrames = Math.round((duration / 1000) * fps);

    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.floor(easeOut * target);

      setCount(current);

      if (frame >= totalFrames) {
        setCount(target);
        clearInterval(timer);
      }
    }, 1000 / fps);

    return () => clearInterval(timer);
  }, [hasTriggered, target]);

  if (target <= 0) {
    return (
      <span ref={containerRef} className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#D4AF37] italic tracking-normal block">
        {fallbackText}
      </span>
    );
  }

  return (
    <span ref={containerRef} className="tabular-nums">
      {hasTriggered ? count.toLocaleString() : 0}
      {suffix}
    </span>
  );
};

export const LandingPage: React.FC = () => {
  const { navigateTo, addFetchedRecipes } = useApp();
  const { isAuthenticated, openAuthModal } = useAuth();
  
  const [metrics, setMetrics] = useState<AppMetrics>({
    registeredUsers: 0,
    recipesDiscovered: SAMPLE_RECIPES.length,
    pantryItemsSaved: 0,
    ingredientMatches: 124,
    isLive: false
  });

  // Popular Recipes state
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [isPopularLoading, setIsPopularLoading] = useState<boolean>(true);

  // Testimonials & Community Rating state
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);
  const [ratingStats, setRatingStats] = useState<CommunityRatingStats>({ totalReviews: 0, averageRating: 5.0 });
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState<number>(0);
  const [isTestimonialsPaused, setIsTestimonialsPaused] = useState<boolean>(false);

  useEffect(() => {
    getAppMetrics().then(data => {
      setMetrics(data);
    }).catch(err => {
      console.info('Using dynamic metrics state:', err);
    });
  }, []);

  // Fetch popular recipes via Spoonacular API or fallback dataset
  useEffect(() => {
    let isMounted = true;
    setIsPopularLoading(true);
    searchRecipesApi({ number: 4 })
      .then((res) => {
        if (isMounted) {
          if (res.recipes && res.recipes.length > 0) {
            setPopularRecipes(res.recipes.slice(0, 4));
          } else {
            setPopularRecipes(SAMPLE_RECIPES.slice(0, 4));
          }
          setIsPopularLoading(false);
        }
      })
      .catch((err) => {
        console.warn('Popular recipes fetch failed:', err);
        if (isMounted) {
          setPopularRecipes(SAMPLE_RECIPES.slice(0, 4));
          setIsPopularLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Testimonials & Community Rating stats from Firestore or fallback
  useEffect(() => {
    getTestimonials().then((data) => {
      if (data && data.length > 0) {
        setTestimonials(data);
      }
    }).catch(err => {
      console.info('Testimonials fetch active:', err);
    });

    getCommunityRatingStats().then((stats) => {
      if (stats) {
        setRatingStats(stats);
      }
    }).catch(err => {
      console.info('Community rating stats fetch active:', err);
    });
  }, []);

  // Auto-slide Testimonials Carousel every 5.5s
  useEffect(() => {
    if (isTestimonialsPaused || testimonials.length <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isTestimonialsPaused, testimonials.length]);

  const handleRecipeClick = (recipe: Recipe) => {
    addFetchedRecipes([recipe]);
    navigateTo('/recipe', { id: recipe.id });
  };

  const scrollToPopularRecipes = () => {
    const elem = document.getElementById('popular-recipes');
    if (elem) {
      const rect = elem.getBoundingClientRect();
      if (Math.abs(rect.top) > 50) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleStart = () => {
    if (isAuthenticated) {
      navigateTo('/search');
    } else {
      openAuthModal('signup');
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F2EB] flex flex-col font-sans selection:bg-[#D4AF37]/30">
      
      {/* Top Navbar */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-[#2A2724]/80 z-20">
        <button
          onClick={() => navigateTo('/')}
          className="flex items-center gap-3 group text-left focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 rounded-2xl p-1 -ml-1 transition-all"
          aria-label="PantryPal Home"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] flex items-center justify-center text-black shadow-lg shadow-[#D4AF37]/10 group-hover:scale-105 transition-transform duration-200">
            <ChefHat className="w-6 h-6 text-black" />
          </div>
          <div>
            <span className="font-serif font-bold text-2xl text-[#F5F2EB] tracking-wide group-hover:text-[#D4AF37] transition-colors">PantryPal</span>
            <span className="text-[10px] text-[#D4AF37] block font-semibold uppercase tracking-widest -mt-1">Recipe Discovery</span>
          </div>
        </button>

        <div className="flex items-center gap-5 sm:gap-6">
          {isAuthenticated ? (
            <button
              onClick={() => navigateTo('/search')}
              className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 active:scale-[0.97] text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-[#D4AF37]/10 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
            >
              <span>Explore Recipes</span> <ArrowRight className="w-4 h-4 text-black" />
            </button>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('signin')}
                className="px-4 py-2 text-xs font-bold text-[#C2BCB2] hover:text-[#F5F2EB] hover:bg-[#1E1D1B] rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40"
              >
                Sign In
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 active:scale-[0.97] hover:scale-[1.02] text-black font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-[#D4AF37]/10 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
              >
                Sign Up Free
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section with Full-Width Background Image & Dark Linear Gradient Overlay */}
      <section className="relative w-full overflow-hidden border-b border-[#2A2724] animate-in fade-in duration-500">
        {/* Full-width Food Photography Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroFoodImg}
            alt="Delicious home cooked gourmet meal"
            className="w-full h-full object-cover object-[center_72%] sm:object-[center_75%] filter brightness-105 contrast-105 opacity-95 transition-all duration-500"
          />
          {/* Enhanced Dark Linear Gradient Overlay for High Contrast Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-[#121212]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-[#121212]/40 to-[#121212]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center space-y-7">
          
          {/* Upscale Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-[#1E1D1B]/90 border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 text-[#D4AF37] text-[11px] sm:text-xs font-bold tracking-wider uppercase backdrop-blur-md shadow-lg shadow-black/40 hover:scale-[1.03] transition-all duration-300 cursor-default">
            <Sparkles className="w-3.5 h-3.5 text-[#F3C64F] shrink-0" />
            <span>Find Recipes • Reduce Waste • Cook Better</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[4.75rem] font-serif font-bold text-[#F5F2EB] leading-[1.12] sm:leading-[1.15] max-w-4xl mx-auto tracking-tight">
            Cook smarter with the ingredients you <span className="text-[#D4AF37] italic font-serif">already have.</span>
          </h1>

          {/* Refined Hero Description */}
          <p className="text-base sm:text-lg text-[#C2BCB2] max-w-2xl mx-auto font-normal leading-relaxed text-center">
            Discover recipes using ingredients you already have, save your pantry, and reduce food waste with AI-powered recipe recommendations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 pt-2">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 active:scale-[0.98] text-black text-sm sm:text-base font-extrabold rounded-2xl transition-all duration-200 cursor-pointer shadow-lg shadow-[#D4AF37]/15 hover:shadow-xl hover:shadow-[#D4AF37]/25 flex items-center justify-center gap-2.5 group focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-black" />
            </button>
            <button
              onClick={scrollToPopularRecipes}
              className="w-full sm:w-auto h-14 px-8 bg-[#1E1D1B]/90 border border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#23211E] active:scale-[0.98] text-[#F5F2EB] hover:text-[#D4AF37] text-sm sm:text-base font-bold rounded-2xl transition-all duration-200 cursor-pointer backdrop-blur-md shadow-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 focus:ring-offset-2 focus:ring-offset-[#121212]"
            >
              Explore Recipes
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2.5 pt-3 text-xs text-[#A39C90] font-medium">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Free Forever</span>
            </div>
            <span className="hidden sm:inline text-[#2A2724]">•</span>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>AI Powered</span>
            </div>
            <span className="hidden sm:inline text-[#2A2724]">•</span>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>No Credit Card Required</span>
            </div>
          </div>

          {/* Hero Interactive Mock Preview Card */}
          <div className="pt-6 max-w-3xl mx-auto transform translate-y-1 sm:translate-y-2 -mb-2 sm:-mb-4">
            <div className="p-6 sm:p-7 bg-[#1A1918]/95 border border-[#D4AF37]/30 rounded-3xl shadow-2xl text-left space-y-5 relative overflow-hidden backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center justify-between border-b border-[#2A2724] pb-3">
                <span className="text-xs font-bold text-[#D4AF37] flex items-center gap-2 uppercase tracking-widest">
                  <UtensilsCrossed className="w-4 h-4 text-[#D4AF37]" /> Available Ingredients
                </span>
                <span className="text-xs font-extrabold text-black bg-[#D4AF37] px-3 py-1 rounded-full shadow-xs">
                  8 staples loaded
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs">
                {['Spaghetti', 'Garlic', 'Tomatoes', 'Olive Oil', 'Parmesan', 'Basil', 'Black Pepper', 'Butter'].map((ing) => (
                  <span key={ing} className="px-3.5 py-1.5 bg-[#23211E] border border-[#D4AF37]/20 text-[#F5F2EB] font-semibold rounded-xl flex items-center gap-1.5 hover:border-[#D4AF37]/40 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /> {ing}
                  </span>
                ))}
              </div>

              <div className="p-4 bg-[#23211E] rounded-2xl border border-[#D4AF37]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black font-extrabold flex items-center justify-center text-xs shadow-md">
                    100%
                  </div>
                  <div>
                    <p className="font-bold text-[#F5F2EB] font-serif text-sm">Creamy Garlic & Tomato Pasta</p>
                    <p className="text-[11px] text-[#C2BCB2]">⭐ 4.9 • ⏱ 15 mins • 🍝 8 ingredients</p>
                  </div>
                </div>
                <button
                  onClick={() => navigateTo('/search')}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#C5A028] hover:brightness-110 active:scale-95 text-black text-xs font-extrabold rounded-xl shadow-xs cursor-pointer transition-all"
                >
                  Cook Now
                </button>
              </div>
            </div>
          </div>

          {/* Scroll to Explore Downward Indicator */}
          <div className="pt-8 flex flex-col items-center justify-center">
            <button
              onClick={() => {
                document.getElementById('stats-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center gap-1.5 text-xs text-[#A39C90] hover:text-[#D4AF37] transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/40 rounded-xl px-3 py-1.5"
              aria-label="Scroll to explore features"
            >
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#A39C90] group-hover:text-[#D4AF37] transition-colors">
                Scroll to explore
              </span>
              <ChevronDown className="w-4 h-4 text-[#D4AF37] animate-bounce" />
            </button>
          </div>

        </div>
      </section>

      {/* Animated Statistics Section */}
      <section id="stats-section" className="bg-gradient-to-b from-[#121212] via-[#161513] to-[#121212] border-b border-[#2A2724] py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-[#2A2724]/80">
            
            {/* Registered Users */}
            <div className="pt-4 md:pt-0 space-y-2 px-3 flex flex-col justify-between group transition-all">
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <Users className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span>Registered Users</span>
              </div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#D4AF37] tracking-tight py-1 group-hover:text-[#E5C158] transition-colors">
                <AnimatedCounter target={metrics.registeredUsers} suffix="+" fallbackText="Growing Daily" />
              </p>
              <p className="text-[11px] text-[#A39C90] font-medium">
                {metrics.registeredUsers > 0 ? 'Verified accounts' : 'Active community growth'}
              </p>
            </div>

            {/* Featured Recipes */}
            <div className="pt-6 md:pt-0 space-y-2 px-3 flex flex-col justify-between group transition-all">
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <Utensils className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span>Featured Recipes</span>
              </div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#D4AF37] tracking-tight py-1 group-hover:text-[#E5C158] transition-colors">
                <AnimatedCounter target={metrics.recipesDiscovered} suffix="+" fallbackText={`${metrics.recipesDiscovered}+ Curated`} />
              </p>
              <p className="text-[11px] text-[#A39C90] font-medium">
                Curated Recipe Library
              </p>
            </div>

            {/* Pantry Items Saved */}
            <div className="pt-6 md:pt-0 space-y-2 px-3 flex flex-col justify-between group transition-all">
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span>Pantry Items Saved</span>
              </div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#D4AF37] tracking-tight py-1 group-hover:text-[#E5C158] transition-colors">
                <AnimatedCounter target={metrics.pantryItemsSaved} suffix="+" fallbackText="Live Soon" />
              </p>
              <p className="text-[11px] text-[#A39C90] font-medium">
                Will update as users save ingredients
              </p>
            </div>

            {/* AI Recipe Matching */}
            <div className="pt-6 md:pt-0 space-y-2 px-3 flex flex-col justify-between group transition-all">
              <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                <span>AI Recipe Matching</span>
              </div>
              <p className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-[#D4AF37] tracking-tight py-1 group-hover:text-[#E5C158] transition-colors">
                <AnimatedCounter target={metrics.ingredientMatches} suffix="+" fallbackText="Real-Time" />
              </p>
              <p className="text-[11px] text-[#A39C90] font-medium">
                Smart ingredient matching engine
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#161513] border-b border-[#2A2724] py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-6 space-y-16">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">Simple Steps</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">How PantryPal Works</h2>
            <p className="text-xs sm:text-sm text-[#C2BCB2]">Turn everyday ingredients into delicious home-cooked meals with AI-powered recipe recommendations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-7 sm:p-8 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-3xl space-y-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 group cursor-default relative overflow-hidden focus-within:ring-2 focus-within:ring-[#D4AF37]/50">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black font-serif font-bold text-xl flex items-center justify-center border border-[#D4AF37]/30 transition-all duration-300 shadow-md">
                  01
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#23211E] text-[#D4AF37] group-hover:text-[#E5C158] flex items-center justify-center border border-[#2A2724] group-hover:border-[#D4AF37]/40 transition-colors">
                  <PackageCheck className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                  Build Your Pantry
                </h3>
                <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
                  Save the ingredients you already have. PantryPal remembers them across your devices.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-7 sm:p-8 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-3xl space-y-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 group cursor-default relative overflow-hidden focus-within:ring-2 focus-within:ring-[#D4AF37]/50">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black font-serif font-bold text-xl flex items-center justify-center border border-[#D4AF37]/30 transition-all duration-300 shadow-md">
                  02
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#23211E] text-[#D4AF37] group-hover:text-[#E5C158] flex items-center justify-center border border-[#2A2724] group-hover:border-[#D4AF37]/40 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                  Find Matching Recipes
                </h3>
                <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
                  Discover recipes ranked by how many ingredients you already own using AI-powered matching.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-7 sm:p-8 bg-[#1E1D1B] border border-[#2A2724] hover:border-[#D4AF37]/60 rounded-3xl space-y-5 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 group cursor-default relative overflow-hidden focus-within:ring-2 focus-within:ring-[#D4AF37]/50">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-black font-serif font-bold text-xl flex items-center justify-center border border-[#D4AF37]/30 transition-all duration-300 shadow-md">
                  03
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#23211E] text-[#D4AF37] group-hover:text-[#E5C158] flex items-center justify-center border border-[#2A2724] group-hover:border-[#D4AF37]/40 transition-colors">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-xl text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">
                  Cook With Confidence
                </h3>
                <p className="text-xs sm:text-sm text-[#C2BCB2] leading-relaxed">
                  Follow easy step-by-step recipes and only shop for what's missing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Today / Trending Recipes Section */}
      <section id="popular-recipes" className="bg-[#121212] py-20 border-b border-[#2A2724] scroll-mt-6">
        <div className="max-w-6xl mx-auto px-6 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-[#D4AF37] mb-2">
                <Flame className="w-4 h-4 text-[#E6A135]" /> Popular Recipes
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">Popular Today</h2>
              <p className="text-xs sm:text-sm text-[#C2BCB2] mt-1">Discover what thousands of home chefs are cooking right now.</p>
            </div>
            <button
              onClick={() => navigateTo('/search')}
              className="px-5 py-2.5 bg-[#1E1D1B] border border-[#D4AF37]/40 hover:border-[#D4AF37] text-[#D4AF37] hover:text-[#E5C158] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto shadow-md"
            >
              <span>View All Matches</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Recipe Cards Grid with Skeleton Loading State */}
          {isPopularLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((idx) => (
                <div key={idx} className="bg-[#1E1D1B] rounded-2xl border border-[#2A2724] overflow-hidden flex flex-col h-[320px] animate-pulse">
                  <div className="h-44 bg-[#23211E] w-full" />
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="h-5 bg-[#23211E] rounded-md w-4/5" />
                      <div className="h-4 bg-[#23211E] rounded-md w-3/5" />
                      <div className="h-3 bg-[#23211E] rounded-md w-1/2 pt-1" />
                    </div>
                    <div className="pt-2 border-t border-[#2A2724] h-4 bg-[#23211E] rounded-md w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300">
              {popularRecipes.map((recipe, index) => {
                const cookTime = recipe.readyInMinutes || ((recipe.prepTimeMinutes || 0) + (recipe.cookTimeMinutes || 0)) || 25;
                const ingCount = recipe.ingredients?.length || 6;
                const categoryTag = recipe.category || recipe.cuisine || 'Popular';

                // Render dynamic rating badge or graceful fallback ("Trending", "Popular", "New")
                const renderRatingBadge = () => {
                  if (typeof recipe.rating === 'number' && recipe.rating > 0) {
                    const formattedRating = recipe.rating > 5 ? (recipe.rating / 20).toFixed(1) : recipe.rating.toFixed(1);
                    return (
                      <div className="absolute bottom-2 right-3 bg-black/80 backdrop-blur-md text-[#F3C64F] border border-[#F3C64F]/30 px-2.5 py-0.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md">
                        <Star className="w-3 h-3 fill-[#F3C64F] text-[#F3C64F]" />
                        <span>{formattedRating}</span>
                      </div>
                    );
                  }

                  // Graceful fallback badges when no rating is provided
                  const fallbackBadges = [
                    { label: 'Trending', icon: Flame, textClass: 'text-[#E6A135]', borderClass: 'border-[#E6A135]/40' },
                    { label: 'Popular', icon: TrendingUp, textClass: 'text-[#D4AF37]', borderClass: 'border-[#D4AF37]/40' },
                    { label: 'New', icon: Sparkles, textClass: 'text-[#F3C64F]', borderClass: 'border-[#F3C64F]/40' },
                  ];
                  const badge = fallbackBadges[index % fallbackBadges.length];
                  const BadgeIcon = badge.icon;

                  return (
                    <div className={`absolute bottom-2 right-3 bg-black/85 backdrop-blur-md ${badge.textClass} border ${badge.borderClass} px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold flex items-center gap-1 shadow-md`}>
                      <BadgeIcon className="w-3 h-3" />
                      <span>{badge.label}</span>
                    </div>
                  );
                };

                return (
                  <div
                    key={recipe.id}
                    onClick={() => handleRecipeClick(recipe)}
                    className="bg-[#1E1D1B] rounded-2xl border border-[#2A2724] hover:border-[#D4AF37] shadow-md hover:shadow-2xl hover:shadow-[#D4AF37]/15 hover:-translate-y-1.5 transition-all duration-300 ease-out overflow-hidden flex flex-col group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] h-full"
                    tabIndex={0}
                    aria-label={`View recipe details for ${recipe.title}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleRecipeClick(recipe);
                      }
                    }}
                  >
                    <div className="relative h-44 overflow-hidden bg-[#161513] shrink-0">
                      <img
                        src={recipe.imageUrl}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          const fallback = getRecipeFallbackImage(recipe.title, categoryTag);
                          if (img.src !== fallback) {
                            img.src = fallback;
                          }
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1D1B] via-transparent to-transparent opacity-80 pointer-events-none" />
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-[#D4AF37] border border-[#D4AF37]/30 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-md">
                        {categoryTag}
                      </span>
                      {renderRatingBadge()}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 
                          className="font-serif font-bold text-base text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors line-clamp-2 min-h-[2.8rem] leading-snug"
                          title={recipe.title}
                        >
                          {recipe.title}
                        </h3>
                        <p className="text-xs text-[#A39C90] mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3 text-[#D4AF37]" /> {cookTime} mins</span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1"><ShoppingBag className="w-3 h-3 text-[#D4AF37]" /> {ingCount} items</span>
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-[#2A2724] flex items-center justify-between text-xs text-[#D4AF37] font-semibold group-hover:translate-x-0.5 transition-transform">
                        <span>Discover Match</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Key Features List */}
      <section className="py-24 max-w-6xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">Why PantryPal?</span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">Built for Smarter Cooking</h2>
          <p className="text-xs sm:text-sm text-[#C2BCB2]">Designed for maximum kitchen efficiency, minimal waste, and exquisite meals.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          <div className="p-6 bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <Zap className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">Normalized Matching</h3>
              <p className="text-xs text-[#C2BCB2] leading-relaxed">Understands ingredient variations like "minced garlic" or "fresh eggs" seamlessly.</p>
            </div>
          </div>

          <div className="p-6 bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <UtensilsCrossed className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">Persistent Pantry</h3>
              <p className="text-xs text-[#C2BCB2] leading-relaxed">Stores your kitchen staples across sessions so you never re-type your pantry items.</p>
            </div>
          </div>

          <div className="p-6 bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <Heart className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">Cookable Favorites</h3>
              <p className="text-xs text-[#C2BCB2] leading-relaxed">Filter saved recipes instantly by "Ready to Cook" or "Missing 1 Ingredient".</p>
            </div>
          </div>

          <div className="p-6 bg-[#1A1918] border border-[#2A2724] hover:border-[#D4AF37] rounded-2xl flex flex-col justify-between h-full space-y-4 shadow-md hover:shadow-xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 transition-all duration-300 ease-out group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 group-hover:scale-105 transition-all duration-300 shadow-sm">
                <ShoppingBag className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#F5F2EB] group-hover:text-[#D4AF37] transition-colors">Instant Shopping List</h3>
              <p className="text-xs text-[#C2BCB2] leading-relaxed">Add missing recipe ingredients directly into your copyable grocery checklist.</p>
            </div>
          </div>
        </div>

        {/* Subtle Trust Statement */}
        <div className="pt-2 text-center">
          <p className="text-xs text-[#A39C90] flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0" />
            <span>Built for home cooks. Powered by intelligent recipe matching. Your pantry data stays private and secure.</span>
          </p>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section className="bg-[#161513] border-y border-[#2A2724] py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 space-y-10">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4AF37]">Community Love</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">Loved by Home Chefs</h2>
            <p className="text-xs sm:text-sm text-[#C2BCB2]">Real experiences from PantryPal users discovering smarter ways to cook.</p>

            {/* Dynamic Community Rating Badge - Displayed automatically when totalReviews >= 20 */}
            {ratingStats.totalReviews >= 20 && (
              <div className="pt-2 flex justify-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1E1D1B] border border-[#D4AF37]/40 text-[#D4AF37] text-xs font-extrabold shadow-md animate-in fade-in zoom-in-95 duration-200">
                  <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                  <span>{ratingStats.averageRating.toFixed(1)}/5 Average Rating</span>
                  <span className="text-[#8A8275]">•</span>
                  <span className="text-[#F5F2EB]">{ratingStats.totalReviews} Verified Reviews</span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Carousel Card */}
          <div
            onMouseEnter={() => setIsTestimonialsPaused(true)}
            onMouseLeave={() => setIsTestimonialsPaused(false)}
            className="relative bg-[#1E1D1B] rounded-3xl border border-[#2A2724] hover:border-[#D4AF37] p-8 sm:p-12 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 space-y-8 transition-all duration-300 ease-out group"
          >
            <div className="absolute top-6 right-8 text-[#D4AF37]/20 pointer-events-none group-hover:text-[#D4AF37]/30 transition-colors">
              <Quote className="w-16 h-16" />
            </div>

            {/* Active Testimonial Content */}
            {testimonials.length > 0 && (() => {
              const current = testimonials[activeTestimonialIdx] || testimonials[0];
              return (
                <div key={current.id} className="space-y-6 animate-in fade-in duration-300">
                  {/* Rating Stars */}
                  <div className="flex items-center gap-1 text-[#F3C64F]">
                    {[...Array(current.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-[#F3C64F] text-[#F3C64F]" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-base sm:text-xl text-[#F5F2EB] italic font-serif leading-relaxed min-h-[4.5rem]">
                    "{current.quote}"
                  </p>

                  {/* Author Meta */}
                  <div className="pt-6 border-t border-[#2A2724] flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      {current.avatarUrl ? (
                        <img
                          src={current.avatarUrl}
                          alt={current.author}
                          className="w-11 h-11 rounded-2xl object-cover border border-[#D4AF37]/40 shadow-md"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#E5C158] to-[#C5A028] text-black font-serif font-bold text-base flex items-center justify-center shrink-0 shadow-md">
                          {current.author.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-serif font-bold text-base sm:text-lg text-[#F5F2EB]">{current.author}</p>
                        <p className="text-xs text-[#A39C90] font-medium">{current.role} • {current.location}</p>
                      </div>
                    </div>

                    <div className="hidden sm:block text-[10px] text-[#A39C90] uppercase tracking-wider font-semibold">
                      {isTestimonialsPaused ? 'Auto-play Paused' : 'Hover to Pause'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Navigation Controls */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-2.5 rounded-xl bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                aria-label="Previous review"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Indicator Dots */}
              <div className="flex items-center gap-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonialIdx(idx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer focus:outline-none ${
                      idx === activeTestimonialIdx
                        ? 'w-8 bg-gradient-to-r from-[#D4AF37] to-[#C5A028]'
                        : 'w-2.5 bg-[#2A2724] hover:bg-[#D4AF37]/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveTestimonialIdx((prev) => (prev + 1) % testimonials.length)}
                className="p-2.5 rounded-xl bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37] text-[#C2BCB2] hover:text-[#D4AF37] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50"
                aria-label="Next review"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>


      {/* Bottom Golden CTA Banner */}
      <section className="bg-gradient-to-r from-[#1A1918] via-[#23211E] to-[#1A1918] border-y border-[#D4AF37]/30 py-20 sm:py-24 text-center space-y-7 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="space-y-3 max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#F5F2EB] leading-tight">
            Ready to start cooking smarter?
          </h2>
          <p className="text-xs sm:text-sm text-[#C2BCB2] max-w-lg mx-auto leading-relaxed">
            Create your pantry. Discover recipes. Reduce food waste.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 pt-1">
          {isAuthenticated ? (
            <>
              <button
                onClick={() => navigateTo('/pantry')}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 text-black text-xs sm:text-sm font-extrabold rounded-2xl transition-all duration-200 cursor-pointer shadow-xl shadow-[#D4AF37]/15 inline-flex items-center justify-center gap-2"
              >
                <span>Go to My Pantry</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={scrollToPopularRecipes}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-[#1E1D1B] hover:bg-[#23211E] text-[#F5F2EB] hover:text-[#D4AF37] border border-[#2A2724] hover:border-[#D4AF37] hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer shadow-lg inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span>Explore Recipes</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openAuthModal('signup')}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C5A028] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 text-black text-xs sm:text-sm font-extrabold rounded-2xl transition-all duration-200 cursor-pointer shadow-xl shadow-[#D4AF37]/15 inline-flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={scrollToPopularRecipes}
                className="w-full sm:w-auto px-8 py-3.5 sm:px-9 sm:py-4 bg-[#1E1D1B] hover:bg-[#23211E] text-[#F5F2EB] hover:text-[#D4AF37] border border-[#2A2724] hover:border-[#D4AF37] hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm font-bold rounded-2xl transition-all duration-200 cursor-pointer shadow-lg inline-flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4 text-[#D4AF37]" />
                <span>Explore Recipes</span>
              </button>
            </>
          )}
        </div>

        {/* Small Trust Line */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-[#A39C90] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Free Forever
          </span>
          <span className="hidden sm:inline text-[#2A2724]">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> Sign up with Google or Email
          </span>
          <span className="hidden sm:inline text-[#2A2724]">•</span>
          <span className="inline-flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-[#D4AF37]" /> No Credit Card Required
          </span>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
};
