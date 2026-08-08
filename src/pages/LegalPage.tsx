import React from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Shield, FileText, Cookie, Lock, CheckCircle2, Mail } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies';
}

export const LegalPage: React.FC<LegalPageProps> = ({ type }) => {
  const { navigateTo } = useApp();

  const getPageInfo = () => {
    switch (type) {
      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: Shield,
          subtitle: 'How PantryPal collects, uses, protects, and respects your personal data under GDPR & CCPA compliance.',
          date: 'July 29, 2026',
        };
      case 'terms':
        return {
          title: 'Terms of Service',
          icon: FileText,
          subtitle: 'The terms, conditions, and guidelines governing your use of the PantryPal web application.',
          date: 'July 29, 2026',
        };
      case 'cookies':
        return {
          title: 'Cookie Policy',
          icon: Cookie,
          subtitle: 'Understanding how PantryPal uses browser cookies and local storage technology.',
          date: 'July 29, 2026',
        };
    }
  };

  const info = getPageInfo();
  const Icon = info.icon;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200 selection:bg-[#D4AF37]/30">
      
      {/* Top Back Navigation & Header */}
      <div className="space-y-4 border-b border-[#2A2724] pb-6">
        <button
          onClick={() => navigateTo('/')}
          className="px-3.5 py-1.5 bg-[#1E1D1B] hover:bg-[#23211E] border border-[#2A2724] hover:border-[#D4AF37]/50 text-[#D4AF37] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 inline-flex"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-start gap-4 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#C5A028] text-black flex items-center justify-center shrink-0 shadow-lg shadow-[#D4AF37]/10">
            <Icon className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#F5F2EB]">
              {info.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#C2BCB2] mt-1">
              {info.subtitle}
            </p>
            <p className="text-[11px] text-[#A39C90] mt-1 font-mono">
              Last updated: {info.date}
            </p>
          </div>
        </div>
      </div>

      {/* Main Legal Document Content */}
      <div className="bg-[#1A1918] rounded-3xl border border-[#2A2724] p-6 sm:p-8 shadow-xl text-xs sm:text-sm text-[#C2BCB2] space-y-8 leading-relaxed">
        {type === 'privacy' && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                1. Overview & Data Controller
              </h2>
              <p>
                PantryPal (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy in full compliance with the European Union General Data Protection Regulation (GDPR) and the California Consumer Privacy Act (CCPA). This Privacy Policy explains how we collect, store, and process your personal data when you interact with our culinary recipe matching platform.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                2. Information We Collect
              </h2>
              <p>We collect the following minimal data necessary to deliver personalized recipe recommendations:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#F5F2EB]">
                <li><strong className="text-[#D4AF37]">Account Information:</strong> Your full name, email address, password hash, and optional profile avatar photo.</li>
                <li><strong className="text-[#D4AF37]">Pantry & Preference Data:</strong> The list of ingredients stored in your virtual pantry, favorite recipes, and dietary preference filters.</li>
                <li><strong className="text-[#D4AF37]">Technical Telemetry:</strong> Essential browser local storage keys used to maintain active session authentication.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                3. How We Use Your Information
              </h2>
              <p>Your data is exclusively used for the following legitimate purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Providing instant ingredient-to-recipe ranking match algorithms.</li>
                <li>Syncing your saved pantry items and favorite recipes across sessions.</li>
                <li>Allowing account customization and secure sign-in authentication.</li>
                <li>We do NOT sell, rent, or trade your personal information to third-party advertisers.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                4. Your Rights (GDPR & CCPA Data Erasure)
              </h2>
              <p>Under GDPR and CCPA regulations, you hold full authority over your data:</p>
              <div className="p-4 bg-[#1E1D1B] border border-[#D4AF37]/30 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#D4AF37] font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
                  <span>Right to Erasure (&quot;Right to be Forgotten&quot;)</span>
                </div>
                <p className="text-xs text-[#C2BCB2]">
                  You can permanently delete your entire account and all associated pantry staples, saved favorite recipes, and profile records at any time directly through the <strong className="text-[#F5F2EB]">Account Settings</strong> page in PantryPal.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                5. Contact Information
              </h2>
              <p>
                If you have privacy inquiries or wish to submit a data request, contact our Data Privacy Officer at:
              </p>
              <p className="font-semibold text-[#D4AF37] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#D4AF37]" /> contact.eshop.sahil@gmail.com
              </p>
            </section>
          </>
        )}

        {type === 'terms' && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or creating an account on PantryPal, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                2. License & Service Scope
              </h2>
              <p>
                PantryPal grants you a personal, non-exclusive, non-transferable license to use our web application for individual, non-commercial culinary planning and recipe discovery.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                3. User Account Responsibilities
              </h2>
              <p>
                You are responsible for safeguarding the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                4. Disclaimer & Limitation of Liability
              </h2>
              <p>
                PantryPal provides recipe match information on an &quot;as-is&quot; basis. Recipe ingredients and dietary tag suggestions are provided for informational convenience; users are responsible for verifying allergen safety before consumption.
              </p>
            </section>
          </>
        )}

        {type === 'cookies' && (
          <>
            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB] flex items-center gap-2">
                <Cookie className="w-5 h-5 text-[#D4AF37]" />
                1. What Are Cookies & Local Storage?
              </h2>
              <p>
                Cookies and browser local storage are small text files placed on your device to store user preferences and maintain sign-in sessions without re-authenticating on every page reload.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                2. How PantryPal Uses Cookies
              </h2>
              <p>We use local storage strictly for essential operational purposes:</p>
              <ul className="list-disc pl-5 space-y-2 text-[#F5F2EB]">
                <li><strong className="text-[#D4AF37]">Essential Session Tokens:</strong> Remembering your active sign-in status across browser tabs.</li>
                <li><strong className="text-[#D4AF37]">Pantry Persistence:</strong> Saving your added ingredients and saved favorite recipes locally when offline or between sessions.</li>
                <li><strong className="text-[#D4AF37]">Cookie Consent Choice:</strong> Storing your cookie banner decision (<code className="bg-[#23211E] px-1.5 py-0.5 rounded text-[#D4AF37]">pantrypal_cookie_consent</code>).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-serif font-bold text-[#F5F2EB]">
                3. Managing Your Cookie Preferences
              </h2>
              <p>
                You can accept or decline non-essential cookies via our Cookie Consent popup. Furthermore, you can clear all local storage and cookies at any time using your browser settings.
              </p>
            </section>
          </>
        )}
      </div>

    </div>
  );
};
