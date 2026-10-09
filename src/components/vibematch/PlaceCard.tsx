/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Enhanced Destination Card
 * Real photography, image gallery trigger, bookmarking, distance, verified pricing & metrics.
 */

import React, { useState } from 'react';
import { Place, CityInfo, AIRecommendationExplanation } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { 
  Check, 
  Plus, 
  ArrowLeftRight, 
  BookOpen, 
  Navigation, 
  Bookmark, 
  Camera, 
  MapPin, 
  Clock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface PlaceCardProps {
  place: Place;
  city: CityInfo;
  isSelected: boolean;
  onSelect: () => void;
  isInComparison: boolean;
  onToggleCompare: () => void;
  isInItinerary: boolean;
  onToggleItinerary: () => void;
  onOpenCultureLens: () => void;
  onGetRoute: () => void;
  aiExplanation?: AIRecommendationExplanation;
  onOpenGallery?: (place: Place) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (placeId: string) => void;
  onViewOnMap?: () => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  city,
  isSelected,
  onSelect,
  isInComparison,
  onToggleCompare,
  isInItinerary,
  onToggleItinerary,
  onOpenCultureLens,
  onGetRoute,
  aiExplanation,
  onOpenGallery,
  isBookmarked = false,
  onToggleBookmark,
  onViewOnMap
}) => {
  const { t, tDual } = useTranslation();
  const [imageError, setImageError] = useState(false);

  const imagesCount = place.images?.length || (place.imageUrl ? 1 : 0);

  return (
    <div
      onClick={onSelect}
      className={`group relative bg-slate-900 border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col ${
        isSelected 
          ? 'border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50' 
          : 'border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-slate-950/50'
      }`}
    >
      {/* 1. Real Photography Banner */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-950">
        {!imageError && place.imageUrl ? (
          <img
            src={place.imageUrl}
            alt={`${place.name} photograph`}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/50 p-4 text-center">
            <Camera className="w-8 h-8 text-cyan-400/60 mb-1" />
            <span className="text-xs text-slate-400 font-medium">{place.name}</span>
          </div>
        )}

        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/40" />

        {/* Top Floating Badges */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
          {/* Category Badge */}
          <span className="pointer-events-auto px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-950/80 backdrop-blur-md text-cyan-300 border border-slate-700/80 capitalize shadow-xs">
            {tDual(`layer_${place.category === 'cafe' ? 'cafes' : place.category}` as any).primary}
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            {/* Gallery Button (if images exist) */}
            {imagesCount > 0 && onOpenGallery && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenGallery(place);
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium bg-slate-950/80 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700/80 backdrop-blur-md transition-colors"
                title="Open photo gallery"
              >
                <Camera className="w-3 h-3 text-cyan-400" />
                <span>{imagesCount} {t('photos_count')}</span>
              </button>
            )}

            {/* Favorite / Bookmark Button */}
            {onToggleBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(place.id);
                }}
                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                  isBookmarked
                    ? 'bg-rose-500/90 text-white shadow-md shadow-rose-950/50 scale-105'
                    : 'bg-slate-950/80 hover:bg-slate-900 text-slate-300 hover:text-rose-400 border border-slate-700/80'
                }`}
                title={isBookmarked ? t('saved_bookmark') : t('save_bookmark')}
                aria-pressed={isBookmarked}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Image Overlay: Price & Rating */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-end justify-between text-white pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-600/70 text-emerald-300 font-mono font-bold text-xs shadow-xs">
              {place.priceTier === 0 ? t('free_entry') : `${city.currencySymbol}${place.estimatedCostLocal}`}
            </span>
            {place.distanceKm !== undefined && (
              <span className="text-[11px] text-slate-300 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-700/80 font-mono">
                {place.distanceKm} km
              </span>
            )}
          </div>

          <span className="text-xs font-semibold bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-700/80 text-amber-300 font-mono flex items-center gap-1">
            <span>★</span>
            <span>{place.overallRating}</span>
            <span className="text-slate-400 font-normal text-[10px]">({place.reviewCount.toLocaleString()})</span>
          </span>
        </div>
      </div>

      {/* 2. Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Title & Native Name */}
          <div className="flex items-start justify-between gap-1">
            <div>
              <h2 className="text-sm font-bold text-white font-sans tracking-tight group-hover:text-cyan-300 transition-colors">
                {place.name}
              </h2>
              {place.nativeName && (
                <div className="text-[11px] text-cyan-400/90 font-devanagari mt-0.5">
                  {place.nativeName}
                </div>
              )}
            </div>
          </div>

          {/* Location & Opening Hours */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
            <div className="flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate">{place.locality || place.address}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0 font-mono text-slate-400">
              <Clock className="w-3 h-3 text-slate-500" />
              <span>~{place.dwellTimeMins}m</span>
            </div>
          </div>

          {/* Short Description */}
          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {place.shortDescription}
          </p>

          {/* Dimension Metrics */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-slate-800/80 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] truncate">
                {tDual('cleanliness').primary}
              </span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {place.cleanlinessRating}/5.0
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] truncate">
                {tDual('evening_light').primary}
              </span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {place.lightingRating}/5.0
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] truncate">
                {tDual('accessibility').primary}
              </span>
              <span className="font-mono font-medium text-slate-200 tabular-nums">
                {place.accessibilityRating}/5.0
              </span>
            </div>
          </div>

          {/* AI Recommendation Context */}
          {aiExplanation && (
            <div className="mt-2.5 p-2 bg-slate-950/70 border border-cyan-900/40 rounded-lg text-[11px] text-cyan-200/90 leading-snug">
              <span className="text-cyan-400 font-semibold">{t('match_logic')}:</span> {aiExplanation.reason}
            </div>
          )}
        </div>

        {/* 3. Action Controls */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            {/* CultureLens Drawer Trigger */}
            <button
              type="button"
              onClick={onOpenCultureLens}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-cyan-300 bg-slate-950 hover:bg-slate-800 border border-cyan-800/50 rounded-lg transition-colors cursor-pointer"
              title="Explore verified cultural history"
            >
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">{tDual('culture_lens').primary}</span>
            </button>

            {/* RouteShield Trigger */}
            <button
              type="button"
              onClick={onGetRoute}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Inspect route and safety signals"
            >
              <Navigation className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{tDual('route_check').primary}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Compare Toggle */}
            <button
              type="button"
              onClick={onToggleCompare}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-medium rounded-lg transition-colors border cursor-pointer ${
                isInComparison 
                  ? 'bg-amber-950/80 border-amber-600 text-amber-300' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title="Add or remove from comparison matrix"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{isInComparison ? t('comparing_btn') : t('compare_btn')}</span>
            </button>

            {/* Itinerary Add/Remove */}
            <button
              type="button"
              onClick={onToggleItinerary}
              className={`flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all active:scale-95 cursor-pointer ${
                isInItinerary 
                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400' 
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
              }`}
            >
              {isInItinerary ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{t('added_itinerary')}</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('add_itinerary')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
