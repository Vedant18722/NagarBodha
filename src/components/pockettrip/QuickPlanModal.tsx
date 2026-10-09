/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { CityInfo, VibeType } from '../../types';
import { Sparkles, DollarSign, Clock, X, Compass } from 'lucide-react';

interface QuickPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: CityInfo;
  onApplyPlan: (budget: number, hours: number, vibe: VibeType) => void;
}

export const QuickPlanModal: React.FC<QuickPlanModalProps> = ({
  isOpen,
  onClose,
  city,
  onApplyPlan
}) => {
  const [budget, setBudget] = useState<number>(city.currencyCode === 'INR' ? 400 : 20);
  const [hours, setHours] = useState<number>(3);
  const [vibe, setVibe] = useState<VibeType>('heritage');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyPlan(budget, hours, vibe);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white font-sans">
              Instant Urban Plan — {city.name}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Available Budget ({city.currencyCode})
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-cyan-400 font-mono">{city.currencySymbol}</span>
              <input
                type="number"
                min={0}
                max={5000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Available Time Window
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 5].map((h) => (
                <button
                  type="button"
                  key={h}
                  onClick={() => setHours(h)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    hours === h
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {h} Hours
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Primary Vibe
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'heritage', label: '🏛️ Art & Heritage' },
                { id: 'quiet', label: '🤫 Quiet Study' },
                { id: 'vibrant', label: '⚡ Vibrant Food' },
                { id: 'scenic', label: '🌿 Scenic Walk' }
              ].map((v) => (
                <button
                  type="button"
                  key={v.id}
                  onClick={() => setVibe(v.id as VibeType)}
                  className={`py-2 px-2.5 text-xs text-left font-medium rounded-lg border transition-colors ${
                    vibe === v.id
                      ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 text-xs font-bold rounded-lg shadow-md transition-all active:scale-95"
            >
              Generate Itinerary & Filter Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
