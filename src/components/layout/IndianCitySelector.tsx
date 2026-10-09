/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Indian City Selector
 * Searchable, grouped selector focusing on Maharashtra and major Indian metropolitan centers.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { CityInfo } from '../../types';
import { SUPPORTED_CITIES, DEFAULT_CITY } from '../../data/cities';
import { MapPin, Search, ChevronDown, Check, X, Building2, Sparkles } from 'lucide-react';

interface IndianCitySelectorProps {
  selectedCity: CityInfo;
  onSelectCity: (city: CityInfo) => void;
}

export const IndianCitySelector: React.FC<IndianCitySelectorProps> = ({
  selectedCity,
  onSelectCity
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState<'all' | 'maharashtra' | 'other'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // All cities as array
  const allCitiesList = useMemo(() => Object.values(SUPPORTED_CITIES), []);

  // Filter cities by search query and region filter
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCitiesList.filter((c) => {
      // Region filter
      if (regionFilter === 'maharashtra' && !c.isMaharashtra) return false;
      if (regionFilter === 'other' && c.isMaharashtra) return false;

      // Query filter
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q) ||
        c.sanskritName.toLowerCase().includes(q) ||
        c.municipalBody.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q)
      );
    });
  }, [allCitiesList, searchQuery, regionFilter]);

  // Group into Maharashtra & Other Major Indian Cities
  const maharashtraCities = useMemo(
    () => filteredCities.filter((c) => c.isMaharashtra),
    [filteredCities]
  );
  const otherIndianCities = useMemo(
    () => filteredCities.filter((c) => !c.isMaharashtra),
    [filteredCities]
  );

  const handleSelect = (city: CityInfo) => {
    onSelectCity(city);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button: Formatted as 'City, State, Country' */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 border border-slate-700/90 hover:border-cyan-500/70 text-slate-200 text-xs rounded-lg px-2.5 sm:px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer shadow-xs group"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Switch Indian City & Regional Context"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <MapPin className="w-3.5 h-3.5 text-cyan-400 group-hover:text-cyan-300 shrink-0" />
        
        {/* City Display Format: Pune, Maharashtra, India */}
        <div className="flex items-center gap-1 text-left truncate max-w-[130px] sm:max-w-[210px] md:max-w-[250px]">
          <span className="font-semibold text-slate-100">{selectedCity.name}</span>
          <span className="text-slate-400 hidden sm:inline">, {selectedCity.state}</span>
          <span className="text-slate-500 hidden md:inline">, India</span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-cyan-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu / Popover */}
      {isOpen && (
        <div className="absolute right-0 sm:left-0 sm:right-auto mt-2 w-[310px] sm:w-[380px] bg-slate-950 border border-slate-800 rounded-xl shadow-2xl shadow-slate-950/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header & Search */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Select City (भारतवर्ष नगरमाला)</span>
              </div>
              <button
                type="button"
                onClick={() => handleSelect(DEFAULT_CITY)}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline flex items-center gap-1"
                title="Reset directly to Pune, Maharashtra"
              >
                <Sparkles className="w-3 h-3" />
                <span>Reset to Pune</span>
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search city, district, or state..."
                className="w-full pl-8 pr-7 py-1.5 bg-slate-950 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Region Filter Chips */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <button
                type="button"
                onClick={() => setRegionFilter('all')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  regionFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All Cities ({allCitiesList.length})
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('maharashtra')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  regionFilter === 'maharashtra'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                🚩 Maharashtra (13)
              </button>
              <button
                type="button"
                onClick={() => setRegionFilter('other')}
                className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                  regionFilter === 'other'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                🇮🇳 Other Cities (15)
              </button>
            </div>
          </div>

          {/* City Groups List */}
          <div className="max-h-[340px] overflow-y-auto divide-y divide-slate-800/60 p-1.5">
            {/* Maharashtra Group */}
            {maharashtraCities.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Maharashtra — Primary Focus</span>
                  <span className="text-[10px] text-amber-400/80 font-normal font-devanagari">महाराष्ट्र</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {maharashtraCities.map((city) => {
                    const isSelected = selectedCity.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">
                              {city.name}
                            </span>
                            {city.id === 'pune' && (
                              <span className="text-[9px] uppercase px-1.5 py-0.2 bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 rounded font-mono font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-devanagari truncate mt-0.5">
                            <span className="text-cyan-400/90">{city.sanskritName}</span>
                            <span>·</span>
                            <span className="text-slate-500 font-sans">{city.state}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Other Indian Cities Group */}
            {otherIndianCities.length > 0 && (
              <div className="py-1">
                <div className="px-2.5 py-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Other Major Indian Cities</span>
                  <span className="text-[10px] text-cyan-400/80 font-normal font-devanagari">भारतस्य महानगराणि</span>
                </div>
                <div className="space-y-0.5 mt-0.5">
                  {otherIndianCities.map((city) => {
                    const isSelected = selectedCity.id === city.id;
                    return (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleSelect(city)}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/70 border border-cyan-500/50 text-cyan-200'
                            : 'hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-xs text-white">
                              {city.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({city.state})
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-devanagari truncate mt-0.5">
                            <span className="text-cyan-400/90">{city.sanskritName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty Search State */}
            {filteredCities.length === 0 && (
              <div className="py-8 px-4 text-center">
                <Building2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-medium">
                  No cities found for &quot;{searchQuery}&quot;
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Try searching for Pune, Mumbai, Nashik, Bengaluru, or Delhi.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 px-3 py-1 text-xs bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-md border border-slate-700"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-slate-900/60 border-t border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
            <span>Current: {selectedCity.name}, {selectedCity.state}, India</span>
            <span className="font-mono text-cyan-400">{selectedCity.currencySymbol} INR</span>
          </div>
        </div>
      )}
    </div>
  );
};
