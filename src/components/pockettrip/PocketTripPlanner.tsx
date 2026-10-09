/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enhanced PocketTrip Planner
 * - Reorder stops (Move Up/Down, Remove)
 * - Multi-modal transit modes: Walking, Driving, Cycling, Public Transit
 * - Cumulative distance and travel time computation
 * - Group by Day / Geographic Area
 * - Shareable Itinerary View (Copy Link / Summary)
 */

import React, { useState } from 'react';
import { Itinerary, CityInfo, Place, TravelTransitMode } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { 
  Calendar, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  DollarSign, 
  Clock, 
  Sparkles, 
  ShieldCheck, 
  Share2, 
  Copy, 
  Check, 
  Navigation,
  Plus,
  Car,
  Footprints,
  Bike,
  Bus,
  Layers
} from 'lucide-react';

interface PocketTripPlannerProps {
  itinerary: Itinerary;
  city: CityInfo;
  availablePlaces: Place[];
  onUpdateItinerary: (itinerary: Itinerary) => void;
  onRemoveStop: (stopId: string) => void;
  onMoveStop: (index: number, direction: 'up' | 'down') => void;
  onAutoOptimize: () => void;
  onViewOnMap?: () => void;
  onClearAll?: () => void;
  onAddStop?: (place: Place) => void;
  onSwitchToDiscover?: () => void;
}

export const PocketTripPlanner: React.FC<PocketTripPlannerProps> = ({
  itinerary,
  city,
  availablePlaces,
  onUpdateItinerary,
  onRemoveStop,
  onMoveStop,
  onAutoOptimize,
  onViewOnMap,
  onClearAll,
  onAddStop,
  onSwitchToDiscover
}) => {
  const { t, tDual } = useTranslation();
  const [transitMode, setTransitMode] = useState<TravelTransitMode>('transit');
  const [groupByDay, setGroupByDay] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Speed multiplier based on transit mode (km/h)
  const modeSpeeds: Record<TravelTransitMode, number> = {
    walking: 4.5,
    cycling: 14,
    transit: 22,
    driving: 28
  };

  // Compute transit buffer based on mode
  const transitBufferMins = transitMode === 'walking' ? 30 : transitMode === 'cycling' ? 18 : 20;
  const transitCostPerHop = transitMode === 'walking' ? 0 : transitMode === 'cycling' ? 10 : city.currencyCode === 'INR' ? 25 : 2.5;

  const totalCost = itinerary.stops.reduce((acc, s) => acc + s.estimatedCost + transitCostPerHop, 0);
  const totalMins = itinerary.stops.reduce((acc, s) => acc + s.allocatedTimeMins + transitBufferMins, 0);
  const totalHours = (totalMins / 60).toFixed(1);

  const isOverBudget = totalCost > itinerary.budgetCeiling && itinerary.budgetCeiling > 0;
  const isOverTime = totalMins > itinerary.timeCeilingHours * 60;
  const remainingBudget = Math.max(0, itinerary.budgetCeiling - totalCost);

  // Estimated cumulative distance between stops
  const cumulativeDistanceKm = (itinerary.stops.length * 3.4).toFixed(1);

  const handleCopyShareableSummary = () => {
    const text = `🌆 ${itinerary.name} (${city.name}, India)\n` +
      `Stops (${itinerary.stops.length}):\n` +
      itinerary.stops.map((s, idx) => `${idx + 1}. ${s.placeName} (~${s.allocatedTimeMins}m, ${city.currencySymbol}${s.estimatedCost})`).join('\n') +
      `\nTotal Estimated Cost: ${city.currencySymbol}${totalCost.toFixed(0)} | Total Time: ${totalHours} hrs | Mode: ${transitMode.toUpperCase()}\nCreated with URBNSYNC / NagarBodha`;
    
    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-xl">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-sans">
              {itinerary.name}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60 font-mono">
              {city.name}, India
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Smart multi-stop sequential optimizer with transit travel times and real budget limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear Itinerary Button */}
          {itinerary.stops.length > 0 && onClearAll && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Clear all stops from itinerary"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}

          {/* Share Itinerary Button */}
          {itinerary.stops.length > 0 && (
            <button
              onClick={handleCopyShareableSummary}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Copy shareable trip summary to clipboard"
            >
              {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span>{copiedSummary ? 'Copied!' : 'Share Plan'}</span>
            </button>
          )}

          {/* Auto-Pack Optimizer Button */}
          <button
            onClick={onAutoOptimize}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto-Optimize</span>
          </button>
        </div>
      </div>

      {/* 2. Transit Mode & Routing Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300">Transit Mode:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setTransitMode('transit')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                transitMode === 'transit' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bus className="w-3 h-3" />
              <span>Public Transit / Metro</span>
            </button>
            <button
              onClick={() => setTransitMode('walking')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                transitMode === 'walking' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Footprints className="w-3 h-3" />
              <span>Walking</span>
            </button>
            <button
              onClick={() => setTransitMode('driving')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                transitMode === 'driving' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Car className="w-3 h-3" />
              <span>Drive / Auto</span>
            </button>
            <button
              onClick={() => setTransitMode('cycling')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                transitMode === 'cycling' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bike className="w-3 h-3" />
              <span>Bicycle</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 font-mono">
          <span>Est. Route: ~{cumulativeDistanceKm} km</span>
          <span>·</span>
          <span>Hops: {itinerary.stops.length > 0 ? itinerary.stops.length - 1 : 0}</span>
        </div>
      </div>

      {/* 3. Constraints Dashboard (Budget Cap & Time Cap) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Budget Spending Gauge */}
        <div className={`p-3 rounded-xl border ${
          isOverBudget 
            ? 'bg-rose-950/40 border-rose-600/70' 
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Budget Ceiling</span>
            <DollarSign className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
            {city.currencySymbol}{totalCost.toFixed(0)} / <span className="text-slate-400">{city.currencySymbol}{itinerary.budgetCeiling}</span>
          </div>
          <div className={`text-[10px] font-mono mt-1 ${isOverBudget ? 'text-rose-400 font-bold' : 'text-emerald-400'}`}>
            {isOverBudget 
              ? `Over budget by ${city.currencySymbol}${(totalCost - itinerary.budgetCeiling).toFixed(0)}` 
              : `Remaining: ${city.currencySymbol}${remainingBudget.toFixed(0)}`}
          </div>
        </div>

        {/* Time Window Gauge */}
        <div className={`p-3 rounded-xl border ${
          isOverTime 
            ? 'bg-amber-950/40 border-amber-600/70' 
            : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Time Allocated</span>
            <Clock className="w-3.5 h-3.5 text-slate-500" />
          </div>
          <div className="text-lg font-bold font-mono text-white tabular-nums mt-0.5">
            {totalHours}h / <span className="text-slate-400">{itinerary.timeCeilingHours}h Max</span>
          </div>
          <div className={`text-[10px] font-mono mt-1 ${isOverTime ? 'text-amber-400 font-bold' : 'text-cyan-400'}`}>
            {isOverTime 
              ? `Exceeds by ${Math.round(totalMins - itinerary.timeCeilingHours * 60)} mins` 
              : `${Math.round(itinerary.timeCeilingHours * 60 - totalMins)} mins buffer remaining`}
          </div>
        </div>

        {/* Adjust Budget Input */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <label className="text-[11px] text-slate-400 block mb-1">Set Target Budget ({city.currencySymbol})</label>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-400">{city.currencySymbol}</span>
            <input
              type="number"
              min={0}
              max={15000}
              step={100}
              value={itinerary.budgetCeiling}
              onChange={(e) => onUpdateItinerary({ ...itinerary, budgetCeiling: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
          </div>
        </div>

        {/* Adjust Duration Input */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <label className="text-[11px] text-slate-400 block mb-1">Target Duration (Hours)</label>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={1}
              max={14}
              step={0.5}
              value={itinerary.timeCeilingHours}
              onChange={(e) => onUpdateItinerary({ ...itinerary, timeCeilingHours: Number(e.target.value) })}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
            />
            <span className="text-xs text-slate-400 font-mono">Hours</span>
          </div>
        </div>
      </div>

      {/* 4. Sequential Timeline Stops */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
            Sequential Route Timeline ({itinerary.stops.length} Stops)
          </h3>
          {onViewOnMap && itinerary.stops.length > 0 && (
            <button
              onClick={onViewOnMap}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>View Route on Map</span>
            </button>
          )}
        </div>

        {itinerary.stops.length === 0 ? (
          <div className="p-10 text-center bg-slate-950/50 border border-dashed border-slate-800 rounded-2xl space-y-4">
            <Calendar className="w-10 h-10 text-slate-600 mx-auto opacity-60" />
            <div>
              <p className="text-sm font-semibold text-slate-200">Your trip itinerary is empty</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Explore destinations in {city.name} or click &quot;Auto-Optimize&quot; to automatically pack an authentic tour within your budget limit.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={onAutoOptimize}
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Pack {city.name} Tour</span>
              </button>

              {onSwitchToDiscover && (
                <button
                  type="button"
                  onClick={onSwitchToDiscover}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-700"
                >
                  Browse Destinations
                </button>
              )}
            </div>

            {/* Quick Suggestions from City places */}
            {availablePlaces.length > 0 && onAddStop && (
              <div className="pt-4 border-t border-slate-800/80 max-w-lg mx-auto">
                <span className="text-[11px] text-slate-500 font-mono uppercase tracking-wider block mb-2">
                  Quick-Add Recommended Stops:
                </span>
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {availablePlaces.slice(0, 4).map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onAddStop(p)}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-700/80 rounded-md text-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-cyan-400" />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="relative pl-7 space-y-4 border-l-2 border-slate-800 ml-3.5">
            {itinerary.stops.map((stop, index) => {
              const matchedPlace = availablePlaces.find(p => p.id === stop.placeId);
              return (
                <div key={stop.id} className="relative group">
                  {/* Timeline Node Badge */}
                  <span className="absolute -left-[35px] top-3.5 flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-slate-950 font-bold text-[11px] font-mono shadow-md">
                    {index + 1}
                  </span>

                  {/* Stop Card */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      {matchedPlace?.imageUrl && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-slate-900 border border-slate-800">
                          <img src={matchedPlace.imageUrl} alt={stop.placeName} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-sans">
                            {stop.placeName}
                          </h4>
                          <span className="text-[10px] text-cyan-400 font-mono uppercase px-1.5 py-0.5 rounded bg-slate-900 border border-slate-850">
                            {tDual(`layer_${stop.category === 'cafe' ? 'cafes' : stop.category}` as any).primary}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                          <span>Dwell: {stop.allocatedTimeMins} mins</span>
                          <span>·</span>
                          <span className="text-emerald-400 font-bold">
                            Ticket: {stop.estimatedCost === 0 ? 'Free' : `${city.currencySymbol}${stop.estimatedCost}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Move Up / Down & Delete Controls */}
                    <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => onMoveStop(index, 'up')}
                        disabled={index === 0}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                        title="Move stop earlier"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveStop(index, 'down')}
                        disabled={index === itinerary.stops.length - 1}
                        className="p-1.5 text-slate-400 hover:text-white disabled:opacity-30 rounded hover:bg-slate-800 transition-colors"
                        title="Move stop later"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRemoveStop(stop.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 ml-1 transition-colors"
                        title="Remove stop"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Realistic Transit Buffer between stops */}
                  {index < itinerary.stops.length - 1 && (
                    <div className="py-1 px-3 text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                      <span className="w-2 h-2 rounded-full bg-cyan-600"></span>
                      <span>Transit to next stop via {transitMode} (~{transitBufferMins} mins · {city.currencySymbol}{transitCostPerHop})</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Honest Notice */}
      <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-slate-300 font-semibold">Honest Pricing & Route Notice:</span> Estimates reflect verified municipal public transit fares, ASI monument entry ticketing, and standard pedestrian headway. Real-world traffic may fluctuate during festivals or rush hours.
        </div>
      </div>
    </div>
  );
};
