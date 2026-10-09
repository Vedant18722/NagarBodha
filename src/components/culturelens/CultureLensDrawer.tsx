/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Place, CityInfo } from '../../types';
import { fetchCultureStory } from '../../services/api';
import { useTranslation } from '../../i18n/LanguageContext';
import { BookOpen, Volume2, VolumeX, X, Sparkles, ShieldCheck } from 'lucide-react';

interface CultureLensDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
  city: CityInfo;
}

export const CultureLensDrawer: React.FC<CultureLensDrawerProps> = ({
  isOpen,
  onClose,
  place,
  city
}) => {
  const { t, tDual } = useTranslation();
  const [narrative, setNarrative] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !place) {
      setNarrative('');
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetchCultureStory(place.name, place.cultureLore, place.category)
      .then((story) => {
        if (isMounted) {
          setNarrative(story);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNarrative(place.cultureLore);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, [isOpen, place]);

  if (!isOpen || !place) return null;

  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(narrative || place.cultureLore);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                {tDual('culturelens_title').primary}
                {tDual('culturelens_title').secondary && (
                  <span className="text-xs text-cyan-400 font-devanagari ml-2 font-normal">
                    ({tDual('culturelens_title').secondary})
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                {t('culturelens_subtitle')}
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

        {/* Content Scrollable Area */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Destination Photograph Banner */}
          {place.imageUrl && (
            <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-800 shrink-0 bg-slate-950">
              <img
                src={place.imageUrl}
                alt={place.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              {place.photoAttribution && (
                <div className="absolute bottom-2 right-2 text-[10px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-sans">
                  Photo: {place.photoAttribution}
                </div>
              )}
            </div>
          )}

          {/* Venue Dossier Title */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block mb-1">
              {city.name} · {place.category.toUpperCase()}
            </span>
            <h3 className="text-xl font-bold text-white font-sans leading-tight">
              {place.name}
            </h3>
            {place.nativeName && (
              <div className="text-xs text-slate-400 font-devanagari mt-1">
                {place.nativeName}
              </div>
            )}
          </div>

          {/* Audio Narrator Bar */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-200">{t('audio_narration')}</span>
              <span className="text-[10px] text-slate-400 font-mono">Web Speech API</span>
            </div>
            <button
              onClick={toggleSpeech}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isSpeaking 
                  ? 'bg-rose-500 text-white' 
                  : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
              }`}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span>{t('pause_voice')}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{t('listen_story')}</span>
                </>
              )}
            </button>
          </div>

          {/* Heritage Narrative Box */}
          <div className="p-5 bg-slate-950/60 border border-slate-800/90 rounded-xl space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
              <div className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('grounded_narrative')}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">Gemini 3.8 Flash</span>
            </div>

            {isLoading ? (
              <div className="space-y-2 py-3 animate-pulse">
                <div className="h-3 bg-slate-800 rounded w-full"></div>
                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
                <div className="h-3 bg-slate-800 rounded w-4/6"></div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif italic">
                "{narrative || place.cultureLore}"
              </p>
            )}
          </div>

          {/* Archival Background Records */}
          <div className="space-y-2 text-xs">
            <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] font-mono">
              {t('archival_provenance')}
            </h4>
            <p className="text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
              {place.cultureLore}
            </p>
          </div>

          {/* Visitor Etiquette & Guidelines */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('visitor_etiquette')}</span>
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
              <li>Respect ongoing public use, academic reading zones, or active sacred spaces.</li>
              <li>Maintain acoustic quiet in cloistered courtyards and library loggias.</li>
              <li>Keep walkways and curb ramps clear for wheelchair and stroller commuters.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 text-[11px] text-slate-400 font-mono text-center">
          Source: Municipal Archives & Historical Library Registries
        </div>
      </div>
    </div>
  );
};
