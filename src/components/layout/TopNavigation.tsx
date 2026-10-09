/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NagarBodhaLogo } from '../common/NagarBodhaLogo';
import { CityInfo } from '../../types';
import { SUPPORTED_CITIES } from '../../data/cities';
import { useTranslation } from '../../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { IndianCitySelector } from './IndianCitySelector';
import { LanguageSelectorDropdown } from './LanguageSelectorDropdown';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, Compass, Sliders, Calendar, AlertTriangle, ArrowLeftRight, Languages } from 'lucide-react';

export type NavTab = 'pulse' | 'discover' | 'compare' | 'itinerary' | 'signals';

interface TopNavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  selectedCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
  comparisonCount: number;
  itineraryStopCount: number;
  onOpenQuickPlan: () => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  activeTab,
  onSelectTab,
  selectedCity,
  onSelectCity,
  comparisonCount,
  itineraryStopCount,
  onOpenQuickPlan
}) => {
  const { language, setLanguage, bilingualSanskrit, setBilingualSanskrit, t, tDual } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; key: 'nav_pulse' | 'nav_discover' | 'nav_compare' | 'nav_itinerary' | 'nav_signals'; icon: React.ReactNode; badge?: number }[] = [
    { id: 'pulse', key: 'nav_pulse', icon: <Compass className="w-4 h-4" /> },
    { id: 'discover', key: 'nav_discover', icon: <Sliders className="w-4 h-4" /> },
    { 
      id: 'compare', 
      key: 'nav_compare', 
      icon: <ArrowLeftRight className="w-4 h-4" />,
      badge: comparisonCount > 0 ? comparisonCount : undefined 
    },
    { 
      id: 'itinerary', 
      key: 'nav_itinerary', 
      icon: <Calendar className="w-4 h-4" />,
      badge: itineraryStopCount > 0 ? itineraryStopCount : undefined 
    },
    { id: 'signals', key: 'nav_signals', icon: <AlertTriangle className="w-4 h-4" /> }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Zone with NagarBodha Logo */}
        <div className="shrink-0 flex items-center gap-3">
          <button 
            onClick={() => onSelectTab('pulse')} 
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
            aria-label="NagarBodha Home"
          >
            <NagarBodhaLogo size={34} />
          </button>
        </div>

        {/* Zone 2: Navigation Links with Optional Bilingual Sanskrit Display */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const dual = tDual(item.key);

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center py-1 transition-colors whitespace-nowrap shrink-0 relative ${
                  isActive 
                    ? 'text-cyan-400 font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{dual.primary}</span>
                  {item.badge !== undefined && (
                    <span className="text-[11px] font-mono font-bold text-cyan-300 ml-0.5">
                      ({item.badge})
                    </span>
                  )}
                </div>

                {/* Secondary Sanskrit Subtitle when Bilingual is Active */}
                {dual.secondary && (
                  <span className="text-[10px] text-cyan-400/90 font-devanagari leading-tight -mt-0.5">
                    {dual.secondary}
                  </span>
                )}

                {isActive && (
                  <span className="absolute -bottom-4.5 left-0 right-0 h-0.5 bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Language Selector + Sanskrit Toggle + City Selector + Quick Plan) */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Theme Toggle (Day / Night / System) */}
          <ThemeToggle />

          {/* Multilingual Selector Dropdown (15 Languages) */}
          <LanguageSelectorDropdown />

          {/* Sanskrit Bilingual Toggle Button */}
          <button
            onClick={() => setBilingualSanskrit(!bilingualSanskrit)}
            className={`hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              bilingualSanskrit 
                ? 'bg-cyan-950/70 border-cyan-500 text-cyan-300 shadow-sm shadow-cyan-950/50' 
                : 'bg-slate-900 border-slate-700/80 text-slate-400 hover:text-slate-200 hover:border-slate-600'
            }`}
            title="Display Sanskrit in Devanagari alongside English across the interface"
            aria-pressed={bilingualSanskrit}
          >
            <span className="font-devanagari font-bold text-cyan-400 text-xs">सं</span>
            <span>+</span>
            <span className="text-xs">EN</span>
          </button>

          {/* Indian City Selector */}
          <IndianCitySelector
            selectedCity={selectedCity}
            onSelectCity={onSelectCity}
          />

          {/* Quick Plan CTA */}
          <button
            onClick={onOpenQuickPlan}
            className="hidden sm:inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-400 rounded-lg hover:from-cyan-300 hover:to-teal-300 shadow-sm transition-all active:scale-95 whitespace-nowrap shrink-0"
          >
            {t('quick_plan')}
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-3 pb-4 space-y-2">
          {/* Mobile Sanskrit Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-slate-300 font-medium">
              {t('bilingual_toggle')} (संस्कृतम् + EN)
            </span>
            <button
              onClick={() => setBilingualSanskrit(!bilingualSanskrit)}
              className={`px-3 py-1 rounded text-xs font-bold font-devanagari ${
                bilingualSanskrit ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {bilingualSanskrit ? 'सक्रियम्' : 'निष्क्रियम्'}
            </button>
          </div>

          {navItems.map((item) => {
            const dual = tDual(item.key);
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2 text-left text-sm rounded-lg ${
                  activeTab === item.id 
                    ? 'bg-slate-900 text-cyan-400 font-medium' 
                    : 'text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <div>
                    <div>{dual.primary}</div>
                    {dual.secondary && (
                      <div className="text-[11px] text-cyan-400 font-devanagari">
                        {dual.secondary}
                      </div>
                    )}
                  </div>
                </div>
                {item.badge !== undefined && (
                  <span className="text-xs font-mono text-cyan-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenQuickPlan();
                setMobileMenuOpen(false);
              }}
              className="w-full text-center px-3 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg"
            >
              {t('quick_plan')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
