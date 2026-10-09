/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Core Domain Models & Schemas (India & Maharashtra Centered)
 */

export type CityId = string;

export interface CityInfo {
  id: CityId;
  name: string;
  state: string;
  country: string;
  sanskritName: string;
  lat: number;
  lng: number;
  currencySymbol: string;
  currencyCode: string;
  exchangeRateToUsd: number; // e.g. 86.5
  tagline: string;
  overview: string;
  zoomLevel: number;
  isMaharashtra: boolean;
  municipalBody: string;
}

export type PlaceCategory = 'heritage' | 'cafe' | 'nature' | 'culture' | 'study' | 'transit_hub' | 'religious' | 'museum' | 'scenic';
export type VibeType = 'quiet' | 'heritage' | 'vibrant' | 'scenic' | 'budget';

export interface Place {
  id: string;
  cityId: CityId;
  name: string;
  nativeName?: string;
  category: PlaceCategory;
  vibe: VibeType;
  lat: number;
  lng: number;
  address: string;
  locality?: string; // e.g. 'Shivajinagar', 'Deccan Gymkhana', 'Kothrud'
  priceTier: 0 | 1 | 2 | 3; // 0: Free, 1: ₹, 2: ₹₹, 3: ₹₹₹
  estimatedCostLocal: number; // in INR (₹)
  cleanlinessRating: number; // 1.0 - 5.0
  lightingRating: number; // 1.0 - 5.0 (evening comfort)
  accessibilityRating: number; // 1.0 - 5.0
  overallRating: number; // 1.0 - 5.0
  reviewCount: number;
  dwellTimeMins: number;
  shortDescription: string;
  cultureLore: string;
  openingHours: string;
  features: string[];
  activeSignalCount: number;
  imageUrl?: string;
  images?: string[];
  photoAttribution?: string;
  distanceKm?: number;
  historicalEra?: string;
  isPopular?: boolean;
  isUnesco?: boolean;
}

export type AppTheme = 'light' | 'dark' | 'system';
export type MapStyleMode = 'streets' | 'satellite' | 'hybrid' | 'terrain' | 'dark';
export type TravelTransitMode = 'walking' | 'driving' | 'cycling' | 'transit';

export interface SmartCityLayersState {
  heritage: boolean;
  tourist: boolean;
  nature: boolean;
  cafes: boolean;
  study: boolean;
  transit: boolean;
  traffic: boolean;
  waste: boolean;
  waterSupply: boolean;
  streetlights: boolean;
  airQuality: boolean;
  waterlogging: boolean;
  accessibility: boolean;
}

export type SignalCategory = 
  | 'road_potholes'
  | 'waterlogging' 
  | 'lighting_outage' 
  | 'waste_sanitation'
  | 'transit_delay'
  | 'water_supply'
  | 'construction_hazard' 
  | 'heavy_crowd' 
  | 'quiet_zone';

export type VerificationStatus = 'unverified' | 'corroborated' | 'reviewed';

export interface CivicReport {
  id: string;
  cityId: CityId;
  category: SignalCategory;
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName: string;
  wardOrPrabhag?: string;
  timestamp: string; // ISO string
  corroborations: number;
  status: VerificationStatus;
  aiClassificationNote?: string;
  hasPhoto?: boolean;
  photoUrl?: string;
  hasAudio?: boolean;
  reportedBy: string;
}

export interface WeatherCondition {
  cityId: CityId;
  temperatureC: number;
  weatherCode: number;
  weatherDescription: string;
  precipitationProbability: number;
  windSpeedKmh: number;
  isDay: boolean;
  freshness: 'live' | 'cached' | 'fallback';
  lastUpdated: string;
}

export interface ItineraryStop {
  id: string;
  placeId: string;
  placeName: string;
  category: PlaceCategory;
  allocatedTimeMins: number;
  estimatedCost: number;
  notes?: string;
  transitToNextMins?: number;
  transitCost?: number;
  lat: number;
  lng: number;
}

export interface Itinerary {
  id: string;
  cityId: CityId;
  name: string;
  budgetCeiling: number;
  allocatedCost: number;
  timeCeilingHours: number;
  allocatedTimeMins: number;
  stops: ItineraryStop[];
}

export interface RouteContext {
  origin: { name: string; lat: number; lng: number };
  destination: { name: string; lat: number; lng: number };
  distanceMeters: number;
  durationSeconds: number;
  transitMode: 'walking' | 'transit';
  estimatedTransitFare: number;
  coordinates: [number, number][]; // [lat, lng] array
  nearbySignals: CivicReport[];
  isDaytimeEstimated: boolean;
  safetyDisclaimer: string;
}

export interface VibeFilterState {
  vibe: 'all' | VibeType;
  maxBudgetLocal: number;
  maxHours: number;
  category: 'all' | PlaceCategory;
  accessibilityRequired: boolean;
  searchQuery: string;
}

export interface AIRecommendationExplanation {
  placeId: string;
  reason: string;
  budgetFit: string;
  timeFit: string;
}
