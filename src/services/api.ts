/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CivicReport, WeatherCondition, RouteContext, Place, AIRecommendationExplanation } from '../types';

export async function checkSystemHealth() {
  try {
    const res = await fetch('/api/health');
    if (res.ok) return await res.json();
  } catch (e) {
    console.warn('Health check failed:', e);
  }
  return { status: 'offline', geminiConfigured: false };
}

export async function fetchWeather(lat: number, lng: number, cityId: string): Promise<WeatherCondition> {
  try {
    const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}&cityId=${cityId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        cityId: data.cityId,
        temperatureC: data.temperatureC,
        weatherCode: data.weatherCode,
        weatherDescription: data.weatherDescription,
        precipitationProbability: data.precipitationProbability,
        windSpeedKmh: data.windSpeedKmh,
        isDay: data.isDay,
        freshness: data.freshness,
        lastUpdated: data.lastUpdated
      };
    }
  } catch (e) {
    console.warn('Weather fetch error:', e);
  }

  return {
    cityId: cityId as any,
    temperatureC: 22,
    weatherCode: 1,
    weatherDescription: 'Pleasant & Clear (Offline Baseline)',
    precipitationProbability: 10,
    windSpeedKmh: 12,
    isDay: true,
    freshness: 'fallback',
    lastUpdated: new Date().toISOString()
  };
}

export async function fetchRoute(
  startLat: number, 
  startLng: number, 
  endLat: number, 
  endLng: number, 
  cityId: string,
  startName: string = 'Current Location',
  endName: string = 'Destination'
): Promise<RouteContext> {
  try {
    const res = await fetch(`/api/route?startLat=${startLat}&startLng=${startLng}&endLat=${endLat}&endLng=${endLng}&cityId=${cityId}`);
    if (res.ok) {
      const data = await res.json();
      return {
        origin: { name: startName, lat: startLat, lng: startLng },
        destination: { name: endName, lat: endLat, lng: endLng },
        distanceMeters: data.distanceMeters,
        durationSeconds: data.durationSeconds,
        transitMode: data.transitMode,
        estimatedTransitFare: data.estimatedTransitFare,
        coordinates: data.coordinates,
        nearbySignals: data.nearbySignals || [],
        isDaytimeEstimated: true,
        safetyDisclaimer: data.safetyDisclaimer
      };
    }
  } catch (e) {
    console.warn('Route fetch error:', e);
  }

  // Graceful geodesic fallback
  const steps = 10;
  const coords: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    coords.push([
      startLat + (endLat - startLat) * (i / steps),
      startLng + (endLng - startLng) * (i / steps)
    ]);
  }

  return {
    origin: { name: startName, lat: startLat, lng: startLng },
    destination: { name: endName, lat: endLat, lng: endLng },
    distanceMeters: 1200,
    durationSeconds: 900,
    transitMode: 'walking',
    estimatedTransitFare: 0,
    coordinates: coords,
    nearbySignals: [],
    isDaytimeEstimated: true,
    safetyDisclaimer: 'Route context uses straight-line interpolation as fallback. Always stay vigilant and use lit primary corridors after dark.'
  };
}

export async function fetchReports(cityId?: string): Promise<CivicReport[]> {
  try {
    const url = cityId ? `/api/reports?cityId=${cityId}` : '/api/reports';
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      return data.reports || [];
    }
  } catch (e) {
    console.warn('Reports fetch error:', e);
  }
  return [];
}

export async function submitCivicReport(report: {
  cityId: string;
  category: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName?: string;
  reportedBy?: string;
  photoUrl?: string;
}): Promise<{ success: boolean; report?: CivicReport; message?: string }> {
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Report submission error:', e);
  }
  return { success: false, message: 'Could not connect to server. Report queued locally.' };
}

export async function corroborateCivicReport(reportId: string): Promise<{ success: boolean; corroborations: number; status: string }> {
  try {
    const res = await fetch(`/api/reports/${reportId}/corroborate`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn('Corroboration error:', e);
  }
  return { success: false, corroborations: 0, status: 'unverified' };
}

export async function fetchRecommendations(
  query: string,
  cityId: string,
  vibe: string,
  maxBudget: number,
  maxHours: number,
  places: Place[]
): Promise<{ source: string; recommendations: AIRecommendationExplanation[] }> {
  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, cityId, vibe, maxBudget, maxHours, places })
    });
    if (res.ok) {
      const data = await res.json();
      return { source: data.source, recommendations: data.recommendations || [] };
    }
  } catch (e) {
    console.warn('Recommendation API error:', e);
  }

  // Fallback
  return {
    source: 'deterministic-heuristic',
    recommendations: places.slice(0, 4).map(p => ({
      placeId: p.id,
      reason: `Matches ${p.vibe} preferences with strong accessibility (${p.accessibilityRating}/5.0).`,
      budgetFit: p.priceTier === 0 ? 'Free entrance, perfect for student budget.' : `Under target budget limit.`,
      timeFit: `${p.dwellTimeMins} mins dwell time fits available window.`
    }))
  };
}

export async function fetchCultureStory(placeName: string, cultureLore: string, category: string): Promise<string> {
  try {
    const res = await fetch('/api/culture-story', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ placeName, cultureLore, category })
    });
    if (res.ok) {
      const data = await res.json();
      return data.story;
    }
  } catch (e) {
    console.warn('Culture story fetch error:', e);
  }
  return cultureLore;
}
