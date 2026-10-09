/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouteContext, Place, CivicReport } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { Shield, Navigation, AlertTriangle, MapPin, X, Info } from 'lucide-react';

interface RouteShieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationPlace: Place | null;
  availablePlaces: Place[];
  routeContext: RouteContext | null;
  onRequestRoute: (originPlace: Place, destPlace: Place) => void;
  isLoadingRoute: boolean;
}

export const RouteShieldModal: React.FC<RouteShieldModalProps> = ({
  isOpen,
  onClose,
  destinationPlace,
  availablePlaces,
  routeContext,
  onRequestRoute,
  isLoadingRoute
}) => {
  const { t, tDual } = useTranslation();
  const [selectedOriginId, setSelectedOriginId] = useState<string>(
    availablePlaces[0]?.id !== destinationPlace?.id ? availablePlaces[0]?.id : availablePlaces[1]?.id || ''
  );

  if (!isOpen || !destinationPlace) return null;

  const originPlace = availablePlaces.find(p => p.id === selectedOriginId) || availablePlaces[0];

  const handleCompute = () => {
    if (originPlace && destinationPlace) {
      onRequestRoute(originPlace, destinationPlace);
    }
  };

  const distanceKm = routeContext ? (routeContext.distanceMeters / 1000).toFixed(2) : null;
  const durationMins = routeContext ? Math.round(routeContext.durationSeconds / 60) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {tDual('routeshield_title').primary}
                {tDual('routeshield_title').secondary && (
                  <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                    ({tDual('routeshield_title').secondary})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {t('routeshield_subtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Waypoints Selection */}
          <div className="space-y-3 p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl">
            {/* Origin */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                {t('start_origin')}
              </label>
              <select
                value={selectedOriginId}
                onChange={(e) => setSelectedOriginId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white"
              >
                {availablePlaces.filter(p => p.id !== destinationPlace.id).map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                    {p.name} ({p.address})
                  </option>
                ))}
              </select>
            </div>

            {/* Destination (Locked) */}
            <div>
              <label className="text-[11px] font-medium text-slate-400 block mb-1">
                {t('destination_target')}
              </label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-cyan-300 font-semibold">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{destinationPlace.name}</span>
              </div>
            </div>

            <button
              onClick={handleCompute}
              disabled={isLoadingRoute}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              <Navigation className="w-4 h-4" />
              <span>{isLoadingRoute ? 'Calculating OSRM Path...' : t('calculate_corridor')}</span>
            </button>
          </div>

          {/* Route Metrics Summary (if computed) */}
          {routeContext && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{t('distance')}</span>
                  <span className="text-base font-bold font-mono text-white tabular-nums">
                    {distanceKm} km
                  </span>
                </div>
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">{t('estimated_walk')}</span>
                  <span className="text-base font-bold font-mono text-cyan-400 tabular-nums">
                    {durationMins} minutes
                  </span>
                </div>
              </div>

              {/* Corridor Signal Intersections */}
              <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>{t('reported_street_conditions')}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-400">
                    {routeContext.nearbySignals.length} Active Signal(s)
                  </span>
                </div>

                {routeContext.nearbySignals.length === 0 ? (
                  <div className="p-3 bg-slate-900/60 rounded-lg text-xs text-slate-400">
                    {t('no_hazards_corridor')}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {routeContext.nearbySignals.map((signal) => (
                      <div key={signal.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-300">{signal.title}</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase">
                            {signal.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">{signal.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Legal and Contextual Safety Disclaimer */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-300">Notice:</span> {t('mandatory_context_notice')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
