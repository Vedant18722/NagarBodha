/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Destination Photo Gallery Modal
 * Fullscreen viewer for multiple real destination photographs with attribution.
 */

import React, { useState, useEffect } from 'react';
import { Place } from '../../types';
import { X, ChevronLeft, ChevronRight, Camera, ExternalLink, MapPin } from 'lucide-react';

interface PhotoGalleryModalProps {
  place: Place | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  place,
  isOpen,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
    }
  }, [isOpen, place?.id]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen || !place) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, place, currentIndex]);

  if (!isOpen || !place) return null;

  const images = place.images && place.images.length > 0 
    ? place.images 
    : place.imageUrl 
      ? [place.imageUrl] 
      : [];

  const handleNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const handlePrev = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/70 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base font-sans">{place.name}</h3>
              {place.nativeName && (
                <span className="text-xs text-cyan-400 font-devanagari hidden sm:inline">
                  ({place.nativeName})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{place.locality || place.address}</span>
              {images.length > 0 && (
                <span className="font-mono text-cyan-300">
                  · {currentIndex + 1} of {images.length}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Close Gallery"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Photo Viewer */}
        <div className="relative flex-1 bg-black/60 min-h-[300px] sm:min-h-[420px] flex items-center justify-center overflow-hidden group">
          {images.length > 0 ? (
            <img
              src={images[currentIndex]}
              alt={`${place.name} photograph ${currentIndex + 1}`}
              className="max-h-[60vh] w-full object-contain select-none transition-opacity duration-300"
              loading="lazy"
            />
          ) : (
            <div className="text-center p-8 text-slate-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Verified photograph preview coming soon.</p>
            </div>
          )}

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/80 shadow-lg transition-transform active:scale-95 focus:outline-none"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white border border-slate-700/80 shadow-lg transition-transform active:scale-95 focus:outline-none"
              aria-label="Next photo"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Attribution badge */}
          {place.photoAttribution && (
            <div className="absolute bottom-2 right-3 px-2 py-0.5 rounded bg-slate-950/80 text-[10px] text-slate-400 font-sans border border-slate-800">
              Photo: {place.photoAttribution}
            </div>
          )}
        </div>

        {/* Thumbnail Bar */}
        {images.length > 1 && (
          <div className="flex items-center gap-2 p-3 bg-slate-950/80 border-t border-slate-800 overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative shrink-0 w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  currentIndex === idx 
                    ? 'border-cyan-400 ring-2 ring-cyan-500/30 scale-105' 
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Context & Description */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 text-xs text-slate-300 space-y-1.5">
          <p className="line-clamp-2 text-slate-200">{place.shortDescription}</p>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Hours: {place.openingHours}</span>
            <span className="font-semibold text-cyan-300">
              {place.priceTier === 0 ? 'Free Entry' : `Ticket: ₹${place.estimatedCostLocal}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
