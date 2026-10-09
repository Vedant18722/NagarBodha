/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Place, CityInfo } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { X, ArrowLeftRight, Check, Plus, AlertCircle } from 'lucide-react';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  city: CityInfo;
  onRemovePlace: (placeId: string) => void;
  onClearAll: () => void;
  onAddToItinerary: (place: Place) => void;
  itineraryPlaceIds: string[];
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  places,
  city,
  onRemovePlace,
  onClearAll,
  onAddToItinerary,
  itineraryPlaceIds
}) => {
  const { t, tDual } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {tDual('compare_title').primary}
                {tDual('compare_title').secondary && (
                  <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                    ({tDual('compare_title').secondary})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {t('compare_subtitle')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {places.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
              >
                {t('clear_all')}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {places.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">{t('no_comparison_items')}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                {t('no_comparison_subtext')}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-3 px-4 font-semibold text-slate-400 w-1/4">{t('metric_label')}</th>
                    {places.map((place) => (
                      <th key={place.id} className="py-3 px-4 font-bold text-white w-1/3 min-w-[200px]">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-sm">{place.name}</div>
                            <div className="text-[11px] text-cyan-400 font-normal capitalize">
                              {place.category} · {place.vibe}
                            </div>
                          </div>
                          <button
                            onClick={() => onRemovePlace(place.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove from comparison"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {/* Estimated Cost */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('estimated_expense').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-mono font-bold text-emerald-400 tabular-nums">
                        {p.priceTier === 0 ? t('free_entry') : `${city.currencySymbol}${p.estimatedCostLocal}`}
                      </td>
                    ))}
                  </tr>

                  {/* Cleanliness / Maintenance */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('cleanliness_comfort').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-mono text-slate-200 tabular-nums">
                        {p.cleanlinessRating}/5.0 <span className="text-slate-400 text-[10px]">({p.reviewCount} reviews)</span>
                      </td>
                    ))}
                  </tr>

                  {/* Evening Lighting Rating */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('evening_ambient_light').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-mono text-slate-200 tabular-nums">
                        {p.lightingRating}/5.0
                        <span className="text-[10px] text-slate-400 block font-sans">
                          {p.lightingRating >= 4.5 ? 'Well-lit pedestrian corridor' : 'Moderate streetlight coverage'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Wheelchair & Accessibility */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('mobility_access').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-mono text-slate-200 tabular-nums">
                        {p.accessibilityRating}/5.0
                        <span className="text-[10px] text-cyan-400 block font-sans">
                          {p.accessibilityRating >= 4.5 ? 'Step-free with ramps/lifts' : 'Gentle slope or minimal steps'}
                        </span>
                      </td>
                    ))}
                  </tr>

                  {/* Typical Dwell Time */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('suggested_dwell').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 font-mono text-slate-200 tabular-nums">
                        {p.dwellTimeMins} minutes
                      </td>
                    ))}
                  </tr>

                  {/* Opening Hours */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('hours_operation').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4 text-slate-300">
                        {p.openingHours}
                      </td>
                    ))}
                  </tr>

                  {/* Verified Features */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('notable_features').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        <ul className="list-disc list-inside space-y-1 text-slate-300">
                          {p.features.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  {/* Active Citizen Reports */}
                  <tr>
                    <td className="py-3 px-4 text-slate-400 font-medium">{tDual('community_signals_near').primary}</td>
                    {places.map((p) => (
                      <td key={p.id} className="py-3 px-4">
                        {p.activeSignalCount > 0 ? (
                          <span className="text-amber-400 font-semibold font-mono">
                            {p.activeSignalCount} active citizen report near venue
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-mono">
                            No active hazard reports logged
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Direct Add to Itinerary CTA Row */}
                  <tr>
                    <td className="py-4 px-4 text-slate-400 font-medium">{tDual('next_action').primary}</td>
                    {places.map((p) => {
                      const inItin = itineraryPlaceIds.includes(p.id);
                      return (
                        <td key={p.id} className="py-4 px-4">
                          <button
                            onClick={() => onAddToItinerary(p)}
                            className={`w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                              inItin
                                ? 'bg-emerald-600 text-white'
                                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                            }`}
                          >
                            {inItin ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>{t('added_itinerary')}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>{t('add_to_pockettrip')}</span>
                              </>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
