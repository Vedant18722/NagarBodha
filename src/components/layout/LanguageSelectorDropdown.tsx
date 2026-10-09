/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Searchable Multilingual Selector Dropdown
 * 15 Indian and International Languages with Native Script display.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../../i18n/translations';
import { Globe, Search, Check, ChevronDown, X } from 'lucide-react';

export const LanguageSelectorDropdown: React.FC = () => {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const activeLangMeta = useMemo(
    () => SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const indianLanguages = useMemo(
    () => filteredLanguages.filter((l) => l.isIndian),
    [filteredLanguages]
  );
  const internationalLanguages = useMemo(
    () => filteredLanguages.filter((l) => !l.isIndian),
    [filteredLanguages]
  );

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-slate-900 border border-slate-700/90 hover:border-cyan-500/70 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={t('language_select')}
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="font-medium font-sans">{activeLangMeta.nativeName}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-2.5 bg-slate-900/90 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200 px-1">
              <span>{t('language_select')} (15 Languages)</span>
              <span className="text-[10px] text-cyan-400 font-mono">{activeLangMeta.code.toUpperCase()}</span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / भाषा..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* List of Languages */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {/* Indian Languages Section */}
            {indianLanguages.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                  भारतीय भाषाः (Indian Languages)
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {indianLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelect(lang.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">
                            {lang.nativeName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({lang.name})
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* International Languages Section */}
            {internationalLanguages.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                  International Languages
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {internationalLanguages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelect(lang.code)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-white">
                            {lang.nativeName}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            ({lang.name})
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {filteredLanguages.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                No language found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
