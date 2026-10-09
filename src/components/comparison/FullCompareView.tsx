/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Full Compare View
 * Comprehensive side-by-side comparison matrix with winner highlights,
 * quick selector to add places, and itinerary integration.
 */

import React from 'react';
import { Place, CityInfo } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { 
  ArrowLeftRight, 
  Plus, 
  Trash2, 
  Check, 
  Award, 
  Camera, 
  MapPin, 
  Clock, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  BookOpen
} from 'lucide-react';

interface FullCompareViewProps {
  comparisonPlaces: Place[];
  allCityPlaces: Place[];
  city: CityInfo;
  onToggleCompare: (placeId: string) => void;
  onClearComparison: () => void;
  onToggleItinerary: (place: Place) => void;
  itineraryPlaceIds: string[];
  onOpenCultureLens: (place: Place) => void;
  onOpenGallery: (place: Place) => void;
  onSwitchToDiscover: () => void;
}

export const FullCompareView: React.FC<FullCompareViewProps> = ({
  comparisonPlaces,
  allCityPlaces,
  city,
  onToggleCompare,
  onClearComparison,
  onToggleItinerary,
  itineraryPlaceIds,
  onOpenCultureLens,
  onOpenGallery,
  onSwitchToDiscover
}) => {
  const { t, tDual } = useTranslation();

  // Determine top performers for highlights
  const minCost = comparisonPlaces.length > 0 
    ? Math.min(...comparisonPlaces.map(p => p.estimatedCostLocal)) 
    : 0;

  const maxCleanliness = comparisonPlaces.length > 0 
    ? Math.max(...comparisonPlaces.map(p => p.cleanlinessRating)) 
    : 0;

  const maxAccessibility = comparisonPlaces.length > 0 
    ? Math.max(...comparisonPlaces.map(p => p.accessibilityRating)) 
    : 0;

  const maxLighting = comparisonPlaces.length > 0 
    ? Math.max(...comparisonPlaces.map(p => p.lightingRating)) 
    : 0;

  // Unselected places in this city available to add
  const availableToAdd = allCityPlaces.filter(
    p => !comparisonPlaces.some(cp => cp.id === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white font-sans">
              {tDual('compare_title').primary}
              {tDual('compare_title').secondary && (
                <span className="text-sm text-cyan-400 font-devanagari ml-2 font-normal">
                  ({tDual('compare_title').secondary})
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare key parameters side-by-side: admission pricing, accessibility, lighting, dwell times, and verified amenities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {comparisonPlaces.length > 0 && (
            <button
              type="button"
              onClick={onClearComparison}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t('clear_all')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToDiscover}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Destinations</span>
          </button>
        </div>
      </div>

      {/* Main Compare Matrix */}
      {comparisonPlaces.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-2xl space-y-4">
          <ArrowLeftRight className="w-12 h-12 text-slate-600 mx-auto opacity-70" />
          <div>
            <h3 className="text-base font-bold text-slate-200">{t('no_comparison_items')}</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Select 2 to 3 destinations from {city.name} to view detailed side-by-side comparisons of accessibility, fees, and evening safety.
            </p>
          </div>

          {/* Quick Picker from top spots */}
          {availableToAdd.length > 0 && (
            <div className="pt-4 max-w-xl mx-auto">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-mono block mb-2.5">
                Quick-Add {city.name} Destinations:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {availableToAdd.slice(0, 5).map(place => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => onToggleCompare(place.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-cyan-500/50 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" />
                    <span>{place.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Side-by-Side Cards Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {comparisonPlaces.map(place => {
              const inItinerary = itineraryPlaceIds.includes(place.id);
              const isBestPrice = place.estimatedCostLocal === minCost;
              const isBestCleanliness = place.cleanlinessRating === maxCleanliness && comparisonPlaces.length > 1;
              const isBestAccessibility = place.accessibilityRating === maxAccessibility && comparisonPlaces.length > 1;

              return (
                <div
                  key={place.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-xl hover:border-slate-700 transition-all"
                >
                  {/* Photo Header */}
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    {place.imageUrl ? (
                      <img
                        src={place.imageUrl}
                        alt={place.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <Camera className="w-8 h-8" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Category & Remove Button */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-700/80 capitalize">
                        {tDual(`layer_${place.category === 'cafe' ? 'cafes' : place.category}` as any).primary}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleCompare(place.id)}
                        className="p-1 rounded-full bg-slate-950/80 hover:bg-rose-950/90 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition-colors cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Price and Gallery Overlay */}
                    <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between">
                      <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs shadow-xs ${
                        isBestPrice 
                          ? 'bg-emerald-950/90 border border-emerald-500 text-emerald-300' 
                          : 'bg-slate-950/80 border border-slate-800 text-white'
                      }`}>
                        {place.priceTier === 0 ? t('free_entry') : `${city.currencySymbol}${place.estimatedCostLocal}`}
                        {isBestPrice && <span className="ml-1 text-[9px] text-emerald-400 font-sans font-normal">★ Best Value</span>}
                      </span>

                      {place.images && place.images.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onOpenGallery(place)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-950/80 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 text-[10px] cursor-pointer"
                        >
                          <Camera className="w-3 h-3 text-cyan-400" />
                          <span>{place.images.length} Photos</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="text-base font-bold text-white font-sans">{place.name}</h4>
                        <span className="text-xs text-amber-300 font-mono shrink-0">★ {place.overallRating}</span>
                      </div>
                      {place.nativeName && (
                        <p className="text-xs text-cyan-400/90 font-devanagari mt-0.5">{place.nativeName}</p>
                      )}

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2 font-mono">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{place.locality || place.address}</span>
                      </div>

                      {/* Detailed Metric Comparison Grid */}
                      <div className="mt-3.5 space-y-2 border-t border-slate-800/80 pt-3 text-xs">
                        {/* Cleanliness */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{tDual('cleanliness').primary}</span>
                          <span className={`font-mono font-semibold tabular-nums flex items-center gap-1 ${
                            isBestCleanliness ? 'text-emerald-400 font-bold' : 'text-slate-200'
                          }`}>
                            {place.cleanlinessRating}/5.0
                            {isBestCleanliness && <Award className="w-3 h-3 text-emerald-400" />}
                          </span>
                        </div>

                        {/* Evening Lighting */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{tDual('evening_light').primary}</span>
                          <span className={`font-mono font-semibold tabular-nums flex items-center gap-1 ${
                            place.lightingRating === maxLighting && comparisonPlaces.length > 1 ? 'text-cyan-400 font-bold' : 'text-slate-200'
                          }`}>
                            {place.lightingRating}/5.0
                          </span>
                        </div>

                        {/* Accessibility */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">{tDual('accessibility').primary}</span>
                          <span className={`font-mono font-semibold tabular-nums flex items-center gap-1 ${
                            isBestAccessibility ? 'text-cyan-400 font-bold' : 'text-slate-200'
                          }`}>
                            {place.accessibilityRating}/5.0
                            {isBestAccessibility && <Award className="w-3 h-3 text-cyan-400" />}
                          </span>
                        </div>

                        {/* Dwell Time */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Dwell Time</span>
                          <span className="font-mono text-slate-300">~{place.dwellTimeMins} mins</span>
                        </div>

                        {/* Crowd Profile */}
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Vibe & Footfall</span>
                          <span className="font-mono text-cyan-300 capitalize">{place.vibe}</span>
                        </div>
                      </div>

                      {/* Verified Features Chips */}
                      {place.features && place.features.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1.5">Amenities:</span>
                          <div className="flex flex-wrap gap-1">
                            {place.features.map(f => (
                              <span key={f} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 text-[10px] border border-slate-850">
                                {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Action Buttons */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenCultureLens(place)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-950 hover:bg-slate-850 border border-cyan-800/50 rounded-lg text-xs font-semibold text-cyan-300 transition-colors cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Lore</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleItinerary(place)}
                        className={`flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          inItinerary
                            ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                            : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                        }`}
                      >
                        {inItinerary ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>In Itinerary</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add to PocketTrip</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick-Add Bar to Compare up to 3 */}
          {comparisonPlaces.length < 3 && availableToAdd.length > 0 && (
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span className="text-xs text-slate-300 font-medium">
                  You can compare {3 - comparisonPlaces.length} more destination{3 - comparisonPlaces.length > 1 ? 's' : ''}:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {availableToAdd.slice(0, 4).map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onToggleCompare(p.id)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-md text-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3 text-cyan-400" />
                    <span>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
