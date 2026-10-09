/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { VibeFilterState, CityInfo } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { SlidersHorizontal, Sparkles, RefreshCw, Accessibility } from 'lucide-react';

interface VibeMatchFilterProps {
  filter: VibeFilterState;
  onChange: (f: VibeFilterState) => void;
  city: CityInfo;
  onReset: () => void;
  onRunAiRecommendations: () => void;
  isAiLoading: boolean;
  aiSource?: string;
}

export const VibeMatchFilter: React.FC<VibeMatchFilterProps> = ({
  filter,
  onChange,
  city,
  onReset,
  onRunAiRecommendations,
  isAiLoading,
  aiSource
}) => {
  const { t, tDual } = useTranslation();

  const vibes: { id: VibeFilterState['vibe']; key: 'vibe_all' | 'vibe_quiet' | 'vibe_heritage' | 'vibe_vibrant' | 'vibe_scenic' }[] = [
    { id: 'all', key: 'vibe_all' },
    { id: 'quiet', key: 'vibe_quiet' },
    { id: 'heritage', key: 'vibe_heritage' },
    { id: 'vibrant', key: 'vibe_vibrant' },
    { id: 'scenic', key: 'vibe_scenic' }
  ];

  // Scale budget slider based on currency (USD: up to $60, INR: up to ₹2500)
  const maxBudgetLimit = city.currencyCode === 'INR' ? 2500 : 60;
  const budgetStep = city.currencyCode === 'INR' ? 50 : 2;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white font-sans">
            {tDual('vibematch_title').primary}
            {tDual('vibematch_title').secondary && (
              <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                ({tDual('vibematch_title').secondary})
              </span>
            )}
          </h2>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> {t('reset_filters')}
        </button>
      </div>

      {/* Mood Selector Segmented Tabs */}
      <div>
        <label className="text-xs font-semibold text-slate-300 block mb-2">
          {t('desired_atmosphere')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {vibes.map((v) => {
            const dual = tDual(v.key);
            return (
              <button
                key={v.id}
                onClick={() => onChange({ ...filter, vibe: v.id })}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors border flex items-center gap-1 ${
                  filter.vibe === v.id
                    ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{dual.primary}</span>
                {dual.secondary && (
                  <span className="text-[9px] text-cyan-400 font-devanagari">({dual.secondary})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Column Sliders: Budget Limit & Available Hours */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Budget Limit Slider */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">
              {tDual('spending_limit').primary}
            </span>
            <span className="font-mono font-bold text-emerald-400 tabular-nums">
              {filter.maxBudgetLocal === 0 
                ? t('free_only') 
                : `${city.currencySymbol}${filter.maxBudgetLocal}`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxBudgetLimit}
            step={budgetStep}
            value={filter.maxBudgetLocal}
            onChange={(e) => onChange({ ...filter, maxBudgetLocal: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* Available Hours */}
        <div>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-300 font-medium">
              {tDual('time_available').primary}
            </span>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {filter.maxHours} {filter.maxHours === 1 ? t('hour') : t('hours')}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={8}
            step={0.5}
            value={filter.maxHours}
            onChange={(e) => onChange({ ...filter, maxHours: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Accessibility Checkbox Toggle & AI Reasoning Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
          <input
            type="checkbox"
            checked={filter.accessibilityRequired}
            onChange={(e) => onChange({ ...filter, accessibilityRequired: e.target.checked })}
            className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 w-3.5 h-3.5 accent-cyan-400"
          />
          <Accessibility className="w-3.5 h-3.5 text-cyan-400" />
          <span>{t('step_free_required')}</span>
        </label>

        {/* Trigger Gemini AI Structured Explanation */}
        <button
          onClick={onRunAiRecommendations}
          disabled={isAiLoading}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-cyan-500/40 text-cyan-300 rounded-lg text-xs font-semibold transition-all active:scale-95 disabled:opacity-60"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>{isAiLoading ? t('synthesizing') : t('ai_match_rationale')}</span>
        </button>
      </div>

      {aiSource && (
        <div className="text-[10px] text-right text-slate-400 font-mono">
          Engine: {aiSource === 'gemini-3.8-flash' ? 'Google Gemini 3.8 Flash' : 'Deterministic Heuristic'}
        </div>
      )}
    </div>
  );
};
