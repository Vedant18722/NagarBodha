/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Theme Toggle Component
 * Day Mode (Light), Night Mode (Dark), and System Default selector.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { useTranslation } from '../../i18n/LanguageContext';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, effectiveTheme, setTheme } = useTheme();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options = [
    { id: 'dark', label: t('theme_night'), icon: Moon },
    { id: 'light', label: t('theme_day'), icon: Sun },
    { id: 'system', label: t('theme_system'), icon: Laptop },
  ] as const;

  const ActiveIcon = theme === 'system' ? Laptop : effectiveTheme === 'light' ? Sun : Moon;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all bg-slate-900 border-slate-700/80 text-slate-300 hover:text-slate-100 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Toggle Theme (Day / Night / System)"
      >
        <ActiveIcon className={`w-3.5 h-3.5 ${effectiveTheme === 'light' ? 'text-amber-400' : 'text-cyan-400'}`} />
        <span className="hidden xl:inline text-xs">
          {theme === 'system' ? 'System' : effectiveTheme === 'light' ? 'Day' : 'Night'}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/90 z-50 p-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="text-[10px] uppercase font-bold text-slate-500 px-2 py-1 tracking-wider">
            Display Theme
          </div>
          {options.map((opt) => {
            const isSelected = theme === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setTheme(opt.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/70 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-3.5 h-3.5 ${opt.id === 'light' ? 'text-amber-400' : 'text-cyan-400'}`} />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
