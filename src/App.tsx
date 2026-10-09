/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { SUPPORTED_CITIES, DEFAULT_CITY } from './data/cities';
import { PLACES_DATABASE } from './data/places';
import { INITIAL_CIVIC_REPORTS } from './data/sampleReports';
import {
  CityInfo,
  Place,
  CivicReport,
  WeatherCondition,
  Itinerary,
  RouteContext,
  VibeFilterState,
  SignalCategory,
  AIRecommendationExplanation
} from './types';
import {
  fetchWeather,
  fetchReports,
  submitCivicReport,
  corroborateCivicReport,
  fetchRoute,
  fetchRecommendations,
  checkSystemHealth
} from './services/api';

import { LanguageProvider, useTranslation } from './i18n/LanguageContext';
import { ThemeProvider } from './components/layout/ThemeContext';
import { TopNavigation, NavTab } from './components/layout/TopNavigation';
import { CityPulseDashboard } from './components/citypulse/CityPulseDashboard';
import { NagarMap } from './components/map/NagarMap';
import { VibeMatchFilter } from './components/vibematch/VibeMatchFilter';
import { PlaceCard } from './components/vibematch/PlaceCard';
import { ComparisonModal } from './components/comparison/ComparisonModal';
import { FullCompareView } from './components/comparison/FullCompareView';
import { PocketTripPlanner } from './components/pockettrip/PocketTripPlanner';
import { RouteShieldModal } from './components/routeshield/RouteShieldModal';
import { CultureLensDrawer } from './components/culturelens/CultureLensDrawer';
import { CivicEchoModal } from './components/civicecho/CivicEchoModal';
import { CivicEchoLedger } from './components/civicecho/CivicEchoLedger';
import { QuickPlanModal } from './components/pockettrip/QuickPlanModal';
import { PhotoGalleryModal } from './components/common/PhotoGalleryModal';
import { NotificationToast, ToastMessage } from './components/layout/NotificationToast';
import { Bookmark } from 'lucide-react';

function NagarBodhaApp() {
  const { t, tDual } = useTranslation();

  // --- 1. CORE CITY & NAVIGATION STATE ---
  const [selectedCity, setSelectedCity] = useState<CityInfo>(() => {
    try {
      const savedCityId = localStorage.getItem('nagarbodha_selected_city');
      if (savedCityId && SUPPORTED_CITIES[savedCityId]) {
        return SUPPORTED_CITIES[savedCityId];
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CITY; // Pune, Maharashtra, India
  });

  // Persist selected city across page refreshes
  useEffect(() => {
    try {
      localStorage.setItem('nagarbodha_selected_city', selectedCity.id);
    } catch {
      // ignore
    }
  }, [selectedCity.id]);

  const [activeTab, setActiveTab] = useState<NavTab>('pulse');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- 2. MAP & LAYER STATE ---
  const [layerVisibility, setLayerVisibility] = useState({
    heritage: true,
    cafes: true,
    nature: true,
    study: true,
    hazards: true
  });
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [isPickingLocation, setIsPickingLocation] = useState(false);
  const [pickedCoordinates, setPickedCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // --- 3. WEATHER & EXTERNAL SERVICES ---
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [reports, setReports] = useState<CivicReport[]>(INITIAL_CIVIC_REPORTS);
  const [routeContext, setRouteContext] = useState<RouteContext | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [isRefreshingPulse, setIsRefreshingPulse] = useState(false);

  // --- 4. VIBEMATCH FILTER STATE ---
  const defaultBudget = selectedCity.currencyCode === 'INR' ? 1000 : 35;
  const [filter, setFilter] = useState<VibeFilterState>({
    vibe: 'all',
    maxBudgetLocal: defaultBudget,
    maxHours: 4,
    category: 'all',
    accessibilityRequired: false,
    searchQuery: ''
  });

  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendationExplanation[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSource, setAiSource] = useState<string>('');

  // --- 5. COMPARISON STATE ---
  const [comparisonPlaceIds, setComparisonPlaceIds] = useState<string[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  // --- 6. POCKETTRIP ITINERARY STATE ---
  const [itinerary, setItinerary] = useState<Itinerary>(() => {
    try {
      const saved = localStorage.getItem(`nagarbodha_itinerary_${selectedCity.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      id: `itin-${selectedCity.id}`,
      cityId: selectedCity.id,
      name: `${selectedCity.name} Exploration`,
      budgetCeiling: defaultBudget,
      allocatedCost: 0,
      timeCeilingHours: 4,
      allocatedTimeMins: 0,
      stops: []
    };
  });

  // Persist itinerary changes
  useEffect(() => {
    try {
      localStorage.setItem(`nagarbodha_itinerary_${itinerary.cityId}`, JSON.stringify(itinerary));
    } catch {
      // ignore
    }
  }, [itinerary]);

  // --- 7. MODAL & INTERACTIVE STATES ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCultureLensOpen, setIsCultureLensOpen] = useState(false);
  const [cultureLensPlace, setCultureLensPlace] = useState<Place | null>(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [routeDestinationPlace, setRouteDestinationPlace] = useState<Place | null>(null);
  const [isQuickPlanOpen, setIsQuickPlanOpen] = useState(false);
  const [galleryPlace, setGalleryPlace] = useState<Place | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [bookmarkedPlaceIds, setBookmarkedPlaceIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nagarbodha_bookmarked_places');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleToggleBookmark = (placeId: string) => {
    setBookmarkedPlaceIds(prev => {
      const next = prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId];
      try {
        localStorage.setItem('nagarbodha_bookmarked_places', JSON.stringify(next));
      } catch {
        // ignore
      }
      const place = PLACES_DATABASE.find(p => p.id === placeId);
      if (next.includes(placeId)) {
        addToast('success', 'Saved to Bookmarks', place ? `${place.name} added to your personal guide.` : undefined);
      } else {
        addToast('info', 'Removed Bookmark', place ? `${place.name} removed from bookmarks.` : undefined);
      }
      return next;
    });
  };

  const handleOpenGallery = (place: Place) => {
    setGalleryPlace(place);
    setIsGalleryOpen(true);
  };

  // --- INITIAL DATA FETCH & HEALTH CHECK ---
  useEffect(() => {
    checkSystemHealth();
  }, []);

  // Update weather and reports whenever city changes
  useEffect(() => {
    let isMounted = true;

    // Reset city specific filters & state
    const newBudget = selectedCity.currencyCode === 'INR' ? 1000 : 35;
    setFilter(prev => ({
      ...prev,
      maxBudgetLocal: newBudget,
      searchQuery: ''
    }));

    let initialItinerary: Itinerary = {
      id: `itin-${selectedCity.id}`,
      cityId: selectedCity.id,
      name: `${selectedCity.name} Exploration`,
      budgetCeiling: newBudget,
      allocatedCost: 0,
      timeCeilingHours: 4,
      allocatedTimeMins: 0,
      stops: []
    };
    try {
      const savedItin = localStorage.getItem(`nagarbodha_itinerary_${selectedCity.id}`);
      if (savedItin) {
        initialItinerary = JSON.parse(savedItin);
      }
    } catch {
      // ignore
    }
    setItinerary(initialItinerary);

    setComparisonPlaceIds([]);
    setSelectedPlace(null);
    setRouteContext(null);
    setPickedCoordinates(null);

    // Fetch Weather with graceful fallback
    fetchWeather(selectedCity.lat, selectedCity.lng, selectedCity.id).then(w => {
      if (isMounted) setWeather(w);
    });

    // Fetch Reports
    fetchReports(selectedCity.id).then(repList => {
      if (isMounted && repList && repList.length > 0) {
        setReports(repList);
      } else if (isMounted) {
        setReports(INITIAL_CIVIC_REPORTS.filter(r => r.cityId === selectedCity.id));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedCity.id]);

  // Places belonging to selected city
  const cityPlaces = useMemo(() => {
    return PLACES_DATABASE.filter(p => p.cityId === selectedCity.id);
  }, [selectedCity.id]);

  // Active reports for selected city
  const activeCityReports = useMemo(() => {
    return reports.filter(r => r.cityId === selectedCity.id);
  }, [reports, selectedCity.id]);

  // Filtered Places based on user inputs
  const filteredPlaces = useMemo(() => {
    return cityPlaces.filter(place => {
      if (filter.vibe !== 'all' && place.vibe !== filter.vibe) return false;
      if (filter.category !== 'all' && place.category !== filter.category) return false;

      if (filter.maxBudgetLocal > 0 && place.estimatedCostLocal > filter.maxBudgetLocal) {
        return false;
      }
      if (filter.maxBudgetLocal === 0 && place.priceTier !== 0) {
        return false;
      }

      if (filter.accessibilityRequired && place.accessibilityRating < 4.0) {
        return false;
      }

      if (place.dwellTimeMins > filter.maxHours * 60) {
        return false;
      }

      if (filter.searchQuery.trim()) {
        const q = filter.searchQuery.toLowerCase();
        const matchesName = place.name.toLowerCase().includes(q);
        const matchesCategory = place.category.toLowerCase().includes(q);
        const matchesVibe = place.vibe.toLowerCase().includes(q);
        const matchesDesc = place.shortDescription.toLowerCase().includes(q);
        const matchesFeatures = place.features.some(f => f.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesVibe && !matchesDesc && !matchesFeatures) {
          return false;
        }
      }

      return true;
    });
  }, [cityPlaces, filter]);

  // Places for Discover view, supporting saved/bookmarked filtering
  const discoverPlaces = useMemo(() => {
    if (showSavedOnly) {
      return cityPlaces.filter(p => bookmarkedPlaceIds.includes(p.id));
    }
    return filteredPlaces;
  }, [filteredPlaces, cityPlaces, showSavedOnly, bookmarkedPlaceIds]);

  // Places currently selected for comparison
  const comparisonPlaces = useMemo(() => {
    return PLACES_DATABASE.filter(p => comparisonPlaceIds.includes(p.id));
  }, [comparisonPlaceIds]);

  // --- ACTIONS & HANDLERS ---
  const handleToggleCompare = (placeId: string) => {
    setComparisonPlaceIds(prev => {
      if (prev.includes(placeId)) {
        addToast('info', 'Removed from comparison');
        return prev.filter(id => id !== placeId);
      }
      if (prev.length >= 3) {
        addToast('warning', 'Comparison limit reached', 'You can compare at most 3 destinations side-by-side.');
        return prev;
      }
      addToast('success', 'Added to comparison matrix');
      return [...prev, placeId];
    });
  };

  const handleToggleItinerary = (place: Place) => {
    const existing = itinerary.stops.find(s => s.placeId === place.id);
    if (existing) {
      setItinerary(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.placeId !== place.id)
      }));
      addToast('info', `Removed ${place.name} from itinerary`);
    } else {
      const newStop = {
        id: `stop-${Date.now()}-${place.id}`,
        placeId: place.id,
        placeName: place.name,
        category: place.category,
        allocatedTimeMins: place.dwellTimeMins,
        estimatedCost: place.estimatedCostLocal,
        transitToNextMins: 20,
        transitCost: selectedCity.currencyCode === 'INR' ? 25 : 2.5,
        lat: place.lat,
        lng: place.lng
      };
      setItinerary(prev => ({
        ...prev,
        stops: [...prev.stops, newStop]
      }));
      addToast('success', `Added ${place.name} to PocketTrip`, `Cost: ${selectedCity.currencySymbol}${place.estimatedCostLocal}`);
    }
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= itinerary.stops.length) return;

    const newStops = [...itinerary.stops];
    const temp = newStops[index];
    newStops[index] = newStops[targetIndex];
    newStops[targetIndex] = temp;

    setItinerary(prev => ({ ...prev, stops: newStops }));
  };

  const handleAutoOptimizeItinerary = () => {
    const sorted = [...cityPlaces].sort((a, b) => {
      if (a.priceTier !== b.priceTier) return a.priceTier - b.priceTier;
      return b.overallRating - a.overallRating;
    });

    let currentCost = 0;
    let currentMins = 0;
    const selectedStops: typeof itinerary.stops = [];

    for (const place of sorted) {
      const stopCost = place.estimatedCostLocal + (selectedCity.currencyCode === 'INR' ? 25 : 2.5);
      const stopMins = place.dwellTimeMins + 20;

      if (currentCost + stopCost <= itinerary.budgetCeiling && currentMins + stopMins <= itinerary.timeCeilingHours * 60) {
        selectedStops.push({
          id: `opt-${Date.now()}-${place.id}`,
          placeId: place.id,
          placeName: place.name,
          category: place.category,
          allocatedTimeMins: place.dwellTimeMins,
          estimatedCost: place.estimatedCostLocal,
          transitToNextMins: 20,
          transitCost: selectedCity.currencyCode === 'INR' ? 25 : 2.5,
          lat: place.lat,
          lng: place.lng
        });
        currentCost += stopCost;
        currentMins += stopMins;
      }

      if (selectedStops.length >= 3) break;
    }

    setItinerary(prev => ({ ...prev, stops: selectedStops }));
    addToast('success', 'Auto-Pack Complete', `Packed ${selectedStops.length} stops within ${selectedCity.currencySymbol}${itinerary.budgetCeiling}.`);
  };

  const handleRequestRoute = async (origin: Place, dest: Place) => {
    setIsLoadingRoute(true);
    const route = await fetchRoute(origin.lat, origin.lng, dest.lat, dest.lng, selectedCity.id, origin.name, dest.name);
    setRouteContext(route);
    setIsLoadingRoute(false);
    addToast('info', 'Route Computed', `${(route.distanceMeters / 1000).toFixed(1)} km walking corridor checked.`);
  };

  const handleCorroborateReport = async (reportId: string) => {
    const result = await corroborateCivicReport(reportId);
    if (result.success) {
      setReports(prev => prev.map(r => {
        if (r.id === reportId) {
          return {
            ...r,
            corroborations: result.corroborations,
            status: result.status as any
          };
        }
        return r;
      }));
      addToast('success', 'Corroboration Recorded', 'Signal verification weight updated.');
    }
  };

  const handleSubmitReport = async (reportData: {
    cityId: string;
    category: SignalCategory;
    title: string;
    description: string;
    lat: number;
    lng: number;
    locationName?: string;
    reportedBy?: string;
    photoUrl?: string;
  }): Promise<boolean> => {
    const result = await submitCivicReport(reportData);
    if (result.success && result.report) {
      setReports(prev => [result.report!, ...prev]);
      addToast('success', 'Signal Submitted', 'Logged as unverified pending neighbor confirmation.');
      return true;
    }
    return false;
  };

  const handleRunAiRecommendations = async () => {
    setIsAiLoading(true);
    const result = await fetchRecommendations(
      filter.searchQuery || 'High comfort discovery matching constraints',
      selectedCity.id,
      filter.vibe,
      filter.maxBudgetLocal,
      filter.maxHours,
      cityPlaces
    );
    setAiRecommendations(result.recommendations);
    setAiSource(result.source);
    setIsAiLoading(false);
    addToast('info', 'AI Synthesis Ready', `Generated rationale via ${result.source === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Local Heuristic Engine'}.`);
  };

  const handleRefreshPulseData = async () => {
    setIsRefreshingPulse(true);
    try {
      const [newWeather, newReports] = await Promise.all([
        fetchWeather(selectedCity.lat, selectedCity.lng, selectedCity.id),
        fetchReports(selectedCity.id)
      ]);
      setWeather(newWeather);
      if (newReports && newReports.length > 0) {
        setReports(newReports);
      }
      addToast('success', 'Telemetry Refreshed', `${selectedCity.name} weather and civic signals up to date.`);
    } catch {
      addToast('warning', 'Refresh Incomplete', 'Used local cached telemetry.');
    } finally {
      setIsRefreshingPulse(false);
    }
  };

  const handleApplyQuickPlan = (budget: number, hours: number, vibe: any) => {
    setFilter(prev => ({
      ...prev,
      maxBudgetLocal: budget,
      maxHours: hours,
      vibe
    }));
    setItinerary(prev => ({
      ...prev,
      budgetCeiling: budget,
      timeCeilingHours: hours
    }));
    setActiveTab('discover');
    addToast('success', 'Plan Applied', `Filtered places for ${hours}h with ${selectedCity.currencySymbol}${budget} budget.`);
  };

  const itineraryPlaceIds = useMemo(() => {
    return itinerary.stops.map(s => s.placeId);
  }, [itinerary.stops]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* 1. Universal Top Navigation Bar with Language Selector & Bilingual Toggle */}
      <TopNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        comparisonCount={comparisonPlaceIds.length}
        itineraryStopCount={itinerary.stops.length}
        onOpenQuickPlan={() => setIsQuickPlanOpen(true)}
      />

      {/* 2. Main Workstation Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* TAB 1: CITY PULSE (Unified Map & Discovery) */}
        {activeTab === 'pulse' && (
          <div className="space-y-5">
            <CityPulseDashboard
              city={selectedCity}
              weather={weather}
              activeReports={activeCityReports}
              layerVisibility={layerVisibility}
              onToggleLayer={(k) => setLayerVisibility(prev => ({ ...prev, [k]: !prev[k] }))}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              searchQuery={filter.searchQuery}
              onSearchChange={(q) => setFilter(prev => ({ ...prev, searchQuery: q }))}
              onQuickQuery={(q) => setFilter(prev => ({ ...prev, searchQuery: q }))}
              placesCount={cityPlaces.length}
              onRefreshData={handleRefreshPulseData}
              isRefreshing={isRefreshingPulse}
            />

            {/* Split Screen: Map on Left/Top + Place Cards on Right/Bottom */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Map Canvas (7 cols on Desktop) with Legitimate OpenStreetMap Tiles */}
              <div className="lg:col-span-7 h-[500px] lg:h-[620px] sticky top-20">
                <NagarMap
                  city={selectedCity}
                  places={filteredPlaces}
                  selectedPlace={selectedPlace}
                  onSelectPlace={(p) => setSelectedPlace(p)}
                  activeReports={activeCityReports}
                  selectedReport={selectedReport}
                  onSelectReport={(r) => setSelectedReport(r)}
                  routeContext={routeContext}
                  isPickingLocation={isPickingLocation}
                  onPickLocation={(lat, lng) => {
                    setPickedCoordinates({ lat, lng });
                    setIsPickingLocation(false);
                    setIsReportModalOpen(true);
                    addToast('info', 'Location Pinned', `Coordinates [${lat.toFixed(4)}, ${lng.toFixed(4)}] attached.`);
                  }}
                  pickedCoordinates={pickedCoordinates}
                  layerVisibility={layerVisibility}
                  onShowToast={addToast}
                  onOpenCultureLens={(p) => {
                    setCultureLensPlace(p);
                    setIsCultureLensOpen(true);
                  }}
                  onToggleItinerary={handleToggleItinerary}
                  isInItinerary={(placeId) => itineraryPlaceIds.includes(placeId)}
                />
              </div>

              {/* Discovery Stream (5 cols on Desktop) */}
              <div className="lg:col-span-5 space-y-4">
                <VibeMatchFilter
                  filter={filter}
                  onChange={setFilter}
                  city={selectedCity}
                  onReset={() => setFilter({
                    vibe: 'all',
                    maxBudgetLocal: defaultBudget,
                    maxHours: 4,
                    category: 'all',
                    accessibilityRequired: false,
                    searchQuery: ''
                  })}
                  onRunAiRecommendations={handleRunAiRecommendations}
                  isAiLoading={isAiLoading}
                  aiSource={aiSource}
                />

                {/* Filtered Place Cards List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>
                      {t('showing_places')} ({filteredPlaces.length} / {cityPlaces.length})
                    </span>
                    {comparisonPlaceIds.length > 0 && (
                      <button
                        onClick={() => setIsComparisonOpen(true)}
                        className="text-cyan-400 hover:underline font-semibold"
                      >
                        {t('open_comparison')} ({comparisonPlaceIds.length})
                      </button>
                    )}
                  </div>

                  {filteredPlaces.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl">
                      <p className="text-xs font-semibold text-slate-300">{t('no_matching_places')}</p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t('no_matching_subtext')}
                      </p>
                      <button
                        onClick={() => setFilter({
                          vibe: 'all',
                          maxBudgetLocal: defaultBudget,
                          maxHours: 4,
                          category: 'all',
                          accessibilityRequired: false,
                          searchQuery: ''
                        })}
                        className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg"
                      >
                        {t('reset_filters')}
                      </button>
                    </div>
                  ) : (
                    filteredPlaces.map(place => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        city={selectedCity}
                        isSelected={selectedPlace?.id === place.id}
                        onSelect={() => setSelectedPlace(place)}
                        isInComparison={comparisonPlaceIds.includes(place.id)}
                        onToggleCompare={() => handleToggleCompare(place.id)}
                        isInItinerary={itineraryPlaceIds.includes(place.id)}
                        onToggleItinerary={() => handleToggleItinerary(place)}
                        onOpenCultureLens={() => {
                          setCultureLensPlace(place);
                          setIsCultureLensOpen(true);
                        }}
                        onGetRoute={() => {
                          setRouteDestinationPlace(place);
                          setIsRouteModalOpen(true);
                        }}
                        aiExplanation={aiRecommendations.find(r => r.placeId === place.id)}
                        onOpenGallery={handleOpenGallery}
                        isBookmarked={bookmarkedPlaceIds.includes(place.id)}
                        onToggleBookmark={handleToggleBookmark}
                        onViewOnMap={() => setSelectedPlace(place)}
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISCOVER (Dedicated VibeMatch View) */}
        {activeTab === 'discover' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-lg font-bold text-white font-sans">
                  {tDual('vibematch_title').primary}
                  {tDual('vibematch_title').secondary && (
                    <span className="text-sm text-cyan-400 font-devanagari ml-2 font-normal">
                      ({tDual('vibematch_title').secondary})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400">
                  {t('vibematch_subtitle')}
                </p>
              </div>

              {/* Quick filter pills: All vs Saved/Bookmarked */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    !showSavedOnly
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-950/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t('filter_all')} ({filteredPlaces.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowSavedOnly(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    showSavedOnly
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-950/50'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${showSavedOnly ? 'fill-current' : ''}`} />
                  <span>{t('filter_saved')} ({bookmarkedPlaceIds.length})</span>
                </button>
              </div>
            </div>

            <VibeMatchFilter
              filter={filter}
              onChange={setFilter}
              city={selectedCity}
              onReset={() => {
                setShowSavedOnly(false);
                setFilter({
                  vibe: 'all',
                  maxBudgetLocal: defaultBudget,
                  maxHours: 4,
                  category: 'all',
                  accessibilityRequired: false,
                  searchQuery: ''
                });
              }}
              onRunAiRecommendations={handleRunAiRecommendations}
              isAiLoading={isAiLoading}
              aiSource={aiSource}
            />

            {discoverPlaces.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-sm font-semibold text-slate-300">
                  {showSavedOnly ? 'No Saved Destinations in ' + selectedCity.name : t('no_matching_places')}
                </p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  {showSavedOnly 
                    ? 'Click the bookmark icon on any destination card to save it to your personal travel guide.' 
                    : t('no_matching_subtext')}
                </p>
                {showSavedOnly ? (
                  <button
                    type="button"
                    onClick={() => setShowSavedOnly(false)}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    View All {selectedCity.name} Destinations
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFilter({
                      vibe: 'all',
                      maxBudgetLocal: defaultBudget,
                      maxHours: 4,
                      category: 'all',
                      accessibilityRequired: false,
                      searchQuery: ''
                    })}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                  >
                    {t('reset_filters')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {discoverPlaces.map(place => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    city={selectedCity}
                    isSelected={selectedPlace?.id === place.id}
                    onSelect={() => setSelectedPlace(place)}
                    isInComparison={comparisonPlaceIds.includes(place.id)}
                    onToggleCompare={() => handleToggleCompare(place.id)}
                    isInItinerary={itineraryPlaceIds.includes(place.id)}
                    onToggleItinerary={() => handleToggleItinerary(place)}
                    onOpenCultureLens={() => {
                      setCultureLensPlace(place);
                      setIsCultureLensOpen(true);
                    }}
                    onGetRoute={() => {
                      setRouteDestinationPlace(place);
                      setIsRouteModalOpen(true);
                    }}
                    aiExplanation={aiRecommendations.find(r => r.placeId === place.id)}
                    onOpenGallery={handleOpenGallery}
                    isBookmarked={bookmarkedPlaceIds.includes(place.id)}
                    onToggleBookmark={handleToggleBookmark}
                    onViewOnMap={() => {
                      setSelectedPlace(place);
                      setActiveTab('pulse');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPARE (Direct Access to Tulanapitha) */}
        {activeTab === 'compare' && (
          <FullCompareView
            comparisonPlaces={comparisonPlaces}
            allCityPlaces={cityPlaces}
            city={selectedCity}
            onToggleCompare={handleToggleCompare}
            onClearComparison={() => setComparisonPlaceIds([])}
            onToggleItinerary={handleToggleItinerary}
            itineraryPlaceIds={itineraryPlaceIds}
            onOpenCultureLens={(place) => {
              setCultureLensPlace(place);
              setIsCultureLensOpen(true);
            }}
            onOpenGallery={handleOpenGallery}
            onSwitchToDiscover={() => setActiveTab('discover')}
          />
        )}

        {/* TAB 4: ITINERARY (PocketTrip Timeline) */}
        {activeTab === 'itinerary' && (
          <PocketTripPlanner
            itinerary={itinerary}
            city={selectedCity}
            availablePlaces={cityPlaces}
            onUpdateItinerary={setItinerary}
            onRemoveStop={(id) => setItinerary(prev => ({
              ...prev,
              stops: prev.stops.filter(s => s.id !== id)
            }))}
            onMoveStop={handleMoveStop}
            onAutoOptimize={handleAutoOptimizeItinerary}
            onClearAll={() => {
              setItinerary(prev => ({ ...prev, stops: [] }));
              addToast('info', 'Itinerary Cleared');
            }}
            onAddStop={handleToggleItinerary}
            onSwitchToDiscover={() => setActiveTab('discover')}
            onViewOnMap={() => setActiveTab('pulse')}
          />
        )}

        {/* TAB 5: CIVIC SIGNALS (CivicEcho Public Ledger) */}
        {activeTab === 'signals' && (
          <CivicEchoLedger
            reports={activeCityReports}
            city={selectedCity}
            onCorroborate={handleCorroborateReport}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onFocusReportOnMap={(rep) => {
              setSelectedReport(rep);
              setActiveTab('pulse');
              addToast('info', 'Focused Report', rep.title);
            }}
          />
        )}
      </main>

      {/* 3. Global Interactive Modals & Drawers */}
      <ComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        places={comparisonPlaces}
        city={selectedCity}
        onRemovePlace={handleToggleCompare}
        onClearAll={() => setComparisonPlaceIds([])}
        onAddToItinerary={(place) => handleToggleItinerary(place)}
        itineraryPlaceIds={itineraryPlaceIds}
      />

      <RouteShieldModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        destinationPlace={routeDestinationPlace}
        availablePlaces={cityPlaces}
        routeContext={routeContext}
        onRequestRoute={handleRequestRoute}
        isLoadingRoute={isLoadingRoute}
      />

      <CultureLensDrawer
        isOpen={isCultureLensOpen}
        onClose={() => setIsCultureLensOpen(false)}
        place={cultureLensPlace}
        city={selectedCity}
      />

      <CivicEchoModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        city={selectedCity}
        onSubmitReport={handleSubmitReport}
        onStartPickLocation={() => {
          setIsPickingLocation(true);
          setActiveTab('pulse');
          addToast('info', 'Location Pinning Active', 'Click anywhere on the map to drop your report coordinates.');
        }}
        pickedCoordinates={pickedCoordinates}
      />

      <QuickPlanModal
        isOpen={isQuickPlanOpen}
        onClose={() => setIsQuickPlanOpen(false)}
        city={selectedCity}
        onApplyPlan={handleApplyQuickPlan}
      />

      <PhotoGalleryModal
        place={galleryPlace}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Notification Toast Stream */}
      <NotificationToast
        toasts={toasts}
        onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))}
      />

      {/* Footer (Quiet Copyright & Legal Attribution) */}
      <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">NagarBodha (नगरबोध)</span>
            <span>·</span>
            <span>{t('app_tagline')}</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            OpenStreetMap · Open-Meteo · Project OSRM · Gemini 3.8 Flash
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NagarBodhaApp />
      </LanguageProvider>
    </ThemeProvider>
  );
}
