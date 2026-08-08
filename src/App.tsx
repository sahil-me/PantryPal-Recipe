import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ToastContainer } from './components/ToastContainer';

import { LandingPage } from './pages/LandingPage';
import { SearchPage } from './pages/SearchPage';
import { ResultsPage } from './pages/ResultsPage';
import { RecipeDetailPage } from './pages/RecipeDetailPage';
import { PantryPage } from './pages/PantryPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PlannerPage } from './pages/PlannerPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { AccountPage } from './pages/AccountPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';
import { AboutPage } from './pages/AboutPage';
import { CookieConsentBanner } from './components/CookieConsentBanner';
import { ScrollToTop } from './components/ScrollToTop';

const RouterContent: React.FC = () => {
  const { currentRoute } = useApp();

  const renderPage = () => {
    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/search':
        return <SearchPage />;
      case '/results':
        return <ResultsPage />;
      case '/recipe':
        return <RecipeDetailPage />;
      case '/pantry':
        return <PantryPage />;
      case '/favorites':
        return <FavoritesPage />;
      case '/planner':
        return <PlannerPage />;
      case '/account':
        return <AccountPage />;
      case '/settings':
        return <SettingsPage />;
      case '/about':
        return <AboutPage />;
      case '/legal/privacy':
        return <LegalPage type="privacy" />;
      case '/legal/terms':
        return <LegalPage type="terms" />;
      case '/legal/cookies':
        return <LegalPage type="cookies" />;
      case '/auth/signin':
        return <SignInPage />;
      case '/auth/signup':
        return <SignUpPage />;
      default:
        return <LandingPage />;
    }
  };

  const isLandingOrAuth = currentRoute === '/' || currentRoute === '/auth/signin' || currentRoute === '/auth/signup';

  if (currentRoute === '/') {
    return (
      <div className="min-h-screen bg-[#121212] text-[#F5F2EB] font-sans selection:bg-[#D4AF37]/30 selection:text-white">
        <ScrollToTop />
        <LandingPage />
        <ToastContainer />
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#F5F2EB] flex flex-col md:flex-row antialiased selection:bg-[#D4AF37]/30 selection:text-white">
      <ScrollToTop />
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
        <Header />
        <main key={currentRoute} className="flex-1 animate-in fade-in duration-300">
          {renderPage()}
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <BottomNav />

      {/* Floating Toasts */}
      <ToastContainer />

      {/* Cookie Consent Banner for first-time visitors */}
      <CookieConsentBanner />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
