/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CityInfo, WeatherCondition, CivicReport } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { CloudRain, Sun, Wind, ShieldAlert, Sparkles, PlusCircle, RefreshCw } from 'lucide-react';

interface CityPulseDashboardProps {
  city: CityInfo;
  weather: WeatherCondition | null;
  activeReports: CivicReport[];
  layerVisibility: {
    heritage: boolean;
    cafes: boolean;
    nature: boolean;
    study: boolean;
    hazards: boolean;
  };
  onToggleLayer: (layer: keyof CityPulseDashboardProps['layerVisibility']) => void;
  onOpenReportModal: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onQuickQuery: (q: string) => void;
  placesCount: number;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export const CityPulseDashboard: React.FC<CityPulseDashboardProps> = ({
  city,
  weather,
  activeReports,
  layerVisibility,
  onToggleLayer,
  onOpenReportModal,
  searchQuery,
  onSearchChange,
  onQuickQuery,
  placesCount,
  onRefreshData,
  isRefreshing = false
}) => {
  const { t, tDual } = useTranslation();
  const unverifiedCount = activeReports.filter(r => r.status === 'unverified').length;
  const corroboratedCount = activeReports.filter(r => r.status === 'corroborated' || r.status === 'reviewed').length;

  return (
    <div className="space-y-4">
      {/* Top Banner: City Identity & Sanskrit Root */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                {city.name}
              </h1>
              <span className="text-xs text-cyan-400 font-devanagari font-semibold">
                {city.sanskritName}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl">
              {city.tagline}
            </p>
          </div>

          {/* Live Weather Widget */}
          <div className="flex items-center gap-3 bg-slate-950/70 border border-slate-800/80 rounded-lg px-3 py-2 shrink-0">
            {weather ? (
              <>
                <div className="text-cyan-400">
                  {weather.precipitationProbability > 40 ? (
                    <CloudRain className="w-5 h-5 text-cyan-400" />
                  ) : weather.isDay ? (
                    <Sun className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Wind className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm font-bold font-mono text-white tabular-nums">
                      {weather.temperatureC}°C
                    </span>
                    <span className="text-[11px] text-slate-300 truncate max-w-[120px]">
                      {weather.weatherDescription}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                    <span>Rain {weather.precipitationProbability}%</span>
                    <span>·</span>
                    <span className={weather.freshness === 'live' ? 'text-emerald-400' : 'text-slate-400'}>
                      {weather.freshness === 'live' ? 'Live API' : t('offline_fallback_badge')}
                    </span>
                  </div>
                </div>
                {onRefreshData && (
                  <button
                    type="button"
                    onClick={onRefreshData}
                    disabled={isRefreshing}
                    className="p-1 text-slate-400 hover:text-cyan-400 transition-colors disabled:opacity-50 cursor-pointer"
                    title="Refresh weather and civic telemetry"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                )}
              </>
            ) : (
              <div className="text-xs text-slate-400">Loading conditions...</div>
            )}
          </div>
        </div>

        {/* Search & Natural-Language Intent Input */}
        <div className="mt-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
              >
                {t('clear')}
              </button>
            )}
          </div>

          {/* Quick Query Intent Chips */}
          <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-[11px] text-slate-400">
            <span className="text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-400" /> {t('intent_label')}:
            </span>
            <button
              onClick={() => onQuickQuery('Free historic courtyard with quiet reading space')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>{tDual('intent_quiet').primary}</span>
              {tDual('intent_quiet').secondary && (
                <span className="text-[9px] text-cyan-400 font-devanagari">({tDual('intent_quiet').secondary})</span>
              )}
            </button>
            <button
              onClick={() => onQuickQuery('Heritage landmark with step-free wheelchair accessibility')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>{tDual('intent_step_free').primary}</span>
              {tDual('intent_step_free').secondary && (
                <span className="text-[9px] text-cyan-400 font-devanagari">({tDual('intent_step_free').secondary})</span>
              )}
            </button>
            <button
              onClick={() => onQuickQuery('Affordable local cafe snack under student budget')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>{tDual('intent_budget').primary}</span>
              {tDual('intent_budget').secondary && (
                <span className="text-[9px] text-cyan-400 font-devanagari">({tDual('intent_budget').secondary})</span>
              )}
            </button>
            <button
              onClick={() => onQuickQuery('Evening scenic sunset promenade with street lighting')}
              className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1"
            >
              <span>{tDual('intent_scenic').primary}</span>
              {tDual('intent_scenic').secondary && (
                <span className="text-[9px] text-cyan-400 font-devanagari">({tDual('intent_scenic').secondary})</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Urban Metric Strip & Signal Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium">
            {tDual('verified_landmarks').primary}
            {tDual('verified_landmarks').secondary && (
              <span className="text-[10px] text-cyan-400 font-devanagari block">{tDual('verified_landmarks').secondary}</span>
            )}
          </div>
          <div className="text-lg font-bold text-white font-mono tabular-nums mt-0.5">
            {placesCount} <span className="text-[10px] text-slate-400 font-normal">in directory</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium">
            {tDual('active_hazard_signals').primary}
            {tDual('active_hazard_signals').secondary && (
              <span className="text-[10px] text-rose-400 font-devanagari block">{tDual('active_hazard_signals').secondary}</span>
            )}
          </div>
          <div className="text-lg font-bold text-amber-400 font-mono tabular-nums mt-0.5">
            {activeReports.length} <span className="text-[10px] text-slate-400 font-normal">reported</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-2.5">
          <div className="text-[11px] text-slate-400 font-medium">
            {tDual('community_status').primary}
            {tDual('community_status').secondary && (
              <span className="text-[10px] text-cyan-400 font-devanagari block">{tDual('community_status').secondary}</span>
            )}
          </div>
          <div className="text-xs font-mono text-slate-300 mt-1">
            <span className="text-emerald-400 font-bold">{corroboratedCount}</span> {t('corroborated')} · <span className="text-amber-400">{unverifiedCount}</span> {t('unverified')}
          </div>
        </div>

        {/* Trigger Community Report Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center justify-center gap-1.5 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 rounded-lg p-2.5 text-xs font-semibold transition-all hover:bg-slate-850 active:scale-95 group text-left"
        >
          <PlusCircle className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform shrink-0" />
          <div className="flex flex-col">
            <span>{tDual('report_local_signal').primary}</span>
            {tDual('report_local_signal').secondary && (
              <span className="text-[10px] text-cyan-400/90 font-devanagari leading-tight">{tDual('report_local_signal').secondary}</span>
            )}
          </div>
        </button>
      </div>

      {/* Layer Toggles Filter Bar with Bilingual Support */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] uppercase tracking-wider font-mono shrink-0">
          {t('map_layers')}:
        </span>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleLayer('heritage')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
              layerVisibility.heritage 
                ? 'bg-cyan-950/70 border-cyan-600 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span>🏛️ {tDual('layer_heritage').primary}</span>
            {tDual('layer_heritage').secondary && (
              <span className="text-[9px] text-cyan-400 font-devanagari">({tDual('layer_heritage').secondary})</span>
            )}
          </button>
          <button
            onClick={() => onToggleLayer('cafes')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
              layerVisibility.cafes 
                ? 'bg-amber-950/70 border-amber-600 text-amber-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span>☕ {tDual('layer_cafes').primary}</span>
            {tDual('layer_cafes').secondary && (
              <span className="text-[9px] text-amber-400 font-devanagari">({tDual('layer_cafes').secondary})</span>
            )}
          </button>
          <button
            onClick={() => onToggleLayer('nature')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
              layerVisibility.nature 
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300' 
                : 'bg-slate-950 border-slate-800 text-slate-400'
            }`}
          >
            <span>🌿 {tDual('layer_nature').primary}</span>
            {tDual('layer_nature').secondary && (
              <span className="text-[9px] text-emerald-400 font-devanagari">({tDual('layer_nature').secondary})</span>
            )}
          </button>
          <button
            onClick={() => onToggleLayer('study')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
              layerVisibility.study 
                ? 'bg-indigo-950/70 border-indigo-600 text-indigo-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <span>📖 {tDual('layer_study').primary}</span>
            {tDual('layer_study').secondary && (
              <span className="text-[9px] text-indigo-400 font-devanagari">({tDual('layer_study').secondary})</span>
            )}
          </button>
          <button
            onClick={() => onToggleLayer('hazards')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border flex items-center gap-1 ${
              layerVisibility.hazards 
                ? 'bg-rose-950/70 border-rose-600 text-rose-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            <span>{tDual('layer_hazards').primary} ({activeReports.length})</span>
            {tDual('layer_hazards').secondary && (
              <span className="text-[9px] text-rose-400 font-devanagari">({tDual('layer_hazards').secondary})</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
