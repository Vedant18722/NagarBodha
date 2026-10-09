/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Advanced Smart City Map (NagarMap)
 * - Multi-provider basemaps: Street, Satellite, Hybrid, Terrain, and Dark
 * - Interactive smart-city layers: Heritage, Tourism, Transit, Hazards, Cleanliness, Lighting
 * - Advanced controls: GPS Geolocation, Fullscreen, Distance Measurement, Search, Zoom
 * - Selected place preview drawer & category legend
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Place, CivicReport, RouteContext, CityInfo, MapStyleMode, SmartCityLayersState } from '../../types';
import { useTranslation } from '../../i18n/LanguageContext';
import { 
  Layers, 
  MapPin, 
  Crosshair, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Ruler, 
  Search, 
  X, 
  Compass, 
  Eye, 
  Camera, 
  BookOpen, 
  Plus, 
  Check, 
  SlidersHorizontal,
  Loader2,
  Globe
} from 'lucide-react';

interface NagarMapProps {
  city: CityInfo;
  places: Place[];
  selectedPlace: Place | null;
  onSelectPlace: (place: Place) => void;
  activeReports: CivicReport[];
  selectedReport?: CivicReport | null;
  onSelectReport?: (report: CivicReport) => void;
  routeContext: RouteContext | null;
  isPickingLocation?: boolean;
  onPickLocation?: (lat: number, lng: number) => void;
  pickedCoordinates?: { lat: number; lng: number } | null;
  onOpenCultureLens?: (place: Place) => void;
  onToggleItinerary?: (place: Place) => void;
  isInItinerary?: (placeId: string) => boolean;
  layerVisibility?: Record<string, boolean>;
  onShowToast?: (type: 'info' | 'success' | 'warning', title: string, message?: string) => void;
}

export const NagarMap: React.FC<NagarMapProps> = ({
  city,
  places,
  selectedPlace,
  onSelectPlace,
  activeReports,
  selectedReport,
  onSelectReport,
  routeContext,
  isPickingLocation = false,
  onPickLocation,
  pickedCoordinates,
  onOpenCultureLens,
  onToggleItinerary,
  isInItinerary,
  onShowToast
}) => {
  const { t, tDual } = useTranslation();
  const mapWrapperRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  
  // UI container refs for disabling Leaflet click propagation
  const toolbarRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  
  // Layer refs
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);
  const overlayTileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const reportsLayerRef = useRef<L.LayerGroup | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const measureLineRef = useRef<L.Polyline | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [mapStyle, setMapStyle] = useState<MapStyleMode>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLayersModalOpen, setIsLayersModalOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [mapSearchQuery, setMapSearchQuery] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  // Distance Measurement State
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [measurePoints, setMeasurePoints] = useState<L.LatLng[]>([]);
  const [measuredDistanceKm, setMeasuredDistanceKm] = useState<number | null>(null);

  // Radius Filter (0 = All)
  const [radiusFilterKm, setRadiusFilterKm] = useState<number>(0);

  // Smart City Layer Toggles
  const [layers, setLayers] = useState<SmartCityLayersState>({
    heritage: true,
    tourist: true,
    nature: true,
    cafes: true,
    study: true,
    transit: true,
    traffic: true,
    waste: true,
    waterSupply: true,
    streetlights: true,
    airQuality: true,
    waterlogging: true,
    accessibility: true,
  });

  // Base Tile Configuration
  const getTileConfig = (style: MapStyleMode) => {
    switch (style) {
      case 'satellite':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          attribution: '&copy; Esri World Imagery · DigitalGlobe · NagarBodha',
          maxZoom: 18
        };
      case 'hybrid':
        return {
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          overlayUrl: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
          attribution: '&copy; Esri & CartoDB Labels · NagarBodha',
          maxZoom: 18
        };
      case 'terrain':
        return {
          url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenTopoMap contributors · NagarBodha',
          maxZoom: 17
        };
      case 'dark':
        return {
          url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          attribution: '&copy; CartoDB Dark Matter · OpenStreetMap',
          maxZoom: 19
        };
      case 'streets':
      default:
        return {
          url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          attribution: '&copy; OpenStreetMap contributors · NagarBodha',
          maxZoom: 19
        };
    }
  };

  // Prevent Leaflet from capturing click or scroll events on overlay UI bars
  useEffect(() => {
    const elements = [toolbarRef.current, searchBarRef.current, bottomBarRef.current];
    elements.forEach((el) => {
      if (el) {
        L.DomEvent.disableClickPropagation(el);
        L.DomEvent.disableScrollPropagation(el);
      }
    });
  });

  // Keep fullscreen state in sync with browser
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
      setTimeout(() => mapInstanceRef.current?.invalidateSize(), 200);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  // 1. Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [city.lat, city.lng],
        zoom: city.zoomLevel || 13,
        zoomControl: false,
        attributionControl: false
      });

      // Layer groups
      markersLayerRef.current = L.layerGroup().addTo(map);
      reportsLayerRef.current = L.layerGroup().addTo(map);

      // Attribution
      L.control.attribution({
        position: 'bottomleft',
        prefix: '<span class="text-[10px] text-slate-500 font-sans">OpenStreetMap · NagarBodha</span>'
      }).addTo(map);

      // Click handler
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (isPickingLocation && onPickLocation) {
          onPickLocation(e.latlng.lat, e.latlng.lng);
        } else if (isMeasuring) {
          handleMeasureClick(e.latlng);
        }
      });

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([city.lat, city.lng], city.zoomLevel || 13, { animate: true });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [city.id]);

  // 2. Update Basemap Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;
    const config = getTileConfig(mapStyle);

    // If current zoom exceeds maxZoom of the new basemap, adjust down
    if (map.getZoom() > config.maxZoom) {
      map.setZoom(config.maxZoom);
    }

    // Remove existing layers
    if (baseTileLayerRef.current) {
      map.removeLayer(baseTileLayerRef.current);
      baseTileLayerRef.current = null;
    }
    if (overlayTileLayerRef.current) {
      map.removeLayer(overlayTileLayerRef.current);
      overlayTileLayerRef.current = null;
    }

    // Add new primary base layer (DO NOT revert to OSM on tileerror!)
    const primaryTiles = L.tileLayer(config.url, {
      maxZoom: config.maxZoom,
      subdomains: ['a', 'b', 'c'],
      attribution: config.attribution
    });

    primaryTiles.addTo(map);
    baseTileLayerRef.current = primaryTiles;

    // Optional Hybrid Labels overlay
    if (config.overlayUrl) {
      const overlayTiles = L.tileLayer(config.overlayUrl, {
        maxZoom: config.maxZoom,
        subdomains: ['a', 'b', 'c']
      });
      overlayTiles.addTo(map);
      overlayTileLayerRef.current = overlayTiles;
    }
  }, [mapStyle]);

  // 3. Handle Distance Measurement
  const handleMeasureClick = (latlng: L.LatLng) => {
    setMeasurePoints((prev) => {
      const next = [...prev, latlng];
      if (next.length >= 2) {
        const distMeters = next[0].distanceTo(next[1]);
        const distKm = Number((distMeters / 1000).toFixed(2));
        setMeasuredDistanceKm(distKm);

        if (mapInstanceRef.current) {
          if (measureLineRef.current) measureLineRef.current.remove();
          measureLineRef.current = L.polyline([next[0], next[1]], {
            color: '#06b6d4',
            weight: 3,
            dashArray: '6, 6'
          }).addTo(mapInstanceRef.current);
        }
      }
      return next;
    });
  };

  const resetMeasurement = () => {
    setIsMeasuring(false);
    setMeasurePoints([]);
    setMeasuredDistanceKm(null);
    if (measureLineRef.current) {
      measureLineRef.current.remove();
      measureLineRef.current = null;
    }
  };

  // 4. GPS Geolocation
  const handleLocateMe = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!navigator.geolocation) {
      if (onShowToast) {
        onShowToast('warning', 'Geolocation Unavailable', 'Device GPS is not supported in this browser.');
      }
      return;
    }
    if (!mapInstanceRef.current) return;

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const map = mapInstanceRef.current;
        if (!map) return;

        map.flyTo([lat, lng], 15, { duration: 1.5 });

        if (userGpsMarkerRef.current) {
          userGpsMarkerRef.current.remove();
        }

        const gpsIcon = L.divIcon({
          className: 'user-gps-marker',
          html: `
            <div class="relative flex items-center justify-center w-8 h-8">
              <span class="absolute w-8 h-8 rounded-full bg-cyan-400/50 animate-ping"></span>
              <span class="relative w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg"></span>
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        });

        userGpsMarkerRef.current = L.marker([lat, lng], { icon: gpsIcon })
          .addTo(map)
          .bindPopup(`
            <div class="text-xs p-1 font-sans">
              <div class="font-bold text-cyan-600">Your Current Location</div>
              <div class="text-[10px] text-slate-500 font-mono">${lat.toFixed(4)}, ${lng.toFixed(4)}</div>
            </div>
          `)
          .openPopup();

        // Calculate distance to city center
        const cityCenter = L.latLng(city.lat, city.lng);
        const userLoc = L.latLng(lat, lng);
        const distKm = Math.round(cityCenter.distanceTo(userLoc) / 1000);

        if (onShowToast) {
          if (distKm > 50) {
            onShowToast('info', 'Location Detected', `You are ~${distKm} km from ${city.name}. Use Reset View to return.`);
          } else {
            onShowToast('success', 'Location Found', `Centered at your current location in ${city.name}.`);
          }
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation failed:', err.message);
        // Fallback: center on city center
        mapInstanceRef.current?.setView([city.lat, city.lng], city.zoomLevel || 13, { animate: true });
        if (onShowToast) {
          onShowToast('warning', 'GPS Access Notice', `Device GPS unavailable (${err.message}). Centered on ${city.name}.`);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  // 5. Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!mapWrapperRef.current) return;
    if (!isFullscreen) {
      if (mapWrapperRef.current.requestFullscreen) {
        mapWrapperRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
    setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
  };

  // 6. Reset View
  const handleResetView = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    mapInstanceRef.current?.setView([city.lat, city.lng], city.zoomLevel || 13, { animate: true });
    if (onShowToast) {
      onShowToast('info', 'View Reset', `Centered map back to ${city.name}.`);
    }
  };

  // 7. Render Place Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;
    markersLayerRef.current.clearLayers();

    const cityCenter = L.latLng(city.lat, city.lng);

    places.forEach((place) => {
      // Radius filter check
      if (radiusFilterKm > 0) {
        const placeLatLng = L.latLng(place.lat, place.lng);
        const distKm = cityCenter.distanceTo(placeLatLng) / 1000;
        if (distKm > radiusFilterKm) return;
      }

      // Smart City Category Visibility
      if (place.category === 'heritage' && !layers.heritage) return;
      if (place.category === 'culture' && !layers.tourist) return;
      if (place.category === 'nature' && !layers.nature) return;
      if (place.category === 'cafe' && !layers.cafes) return;
      if (place.category === 'study' && !layers.study) return;
      if (place.category === 'transit_hub' && !layers.transit) return;

      const isSelected = selectedPlace?.id === place.id;
      
      let iconColor = 'bg-cyan-600 text-white';
      let symbol = '🏛️';
      if (place.category === 'cafe') {
        iconColor = 'bg-amber-600 text-white';
        symbol = '☕';
      } else if (place.category === 'nature') {
        iconColor = 'bg-emerald-600 text-white';
        symbol = '🌿';
      } else if (place.category === 'study') {
        iconColor = 'bg-indigo-600 text-white';
        symbol = '📖';
      } else if (place.category === 'transit_hub') {
        iconColor = 'bg-blue-600 text-white';
        symbol = '🚇';
      } else if (place.category === 'religious') {
        iconColor = 'bg-orange-600 text-white';
        symbol = '🕉️';
      } else if (place.category === 'museum') {
        iconColor = 'bg-purple-600 text-white';
        symbol = '🖼️';
      }

      const markerHtml = `
        <div class="group relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
          ${isSelected ? '<span class="absolute w-9 h-9 rounded-full bg-cyan-400/40 animate-ping"></span>' : ''}
          <div class="flex items-center justify-center w-7 h-7 rounded-full shadow-md border-2 ${isSelected ? 'border-white ring-2 ring-cyan-400' : 'border-slate-900'} ${iconColor} text-xs">
            ${symbol}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'place-marker-node',
        html: markerHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      const marker = L.marker([place.lat, place.lng], { icon: customIcon })
        .addTo(markersLayerRef.current!);

      marker.on('click', () => {
        onSelectPlace(place);
      });

      const dualCategory = tDual(`layer_${place.category === 'cafe' ? 'cafes' : place.category}` as any);
      marker.bindTooltip(`
        <div class="font-sans text-xs font-medium text-slate-100 px-1 py-0.5">
          <div class="font-semibold text-white">${place.name}</div>
          <div class="text-[10px] text-cyan-400">${dualCategory.primary} · ${place.priceTier === 0 ? t('free_entry') : `${city.currencySymbol}${place.estimatedCostLocal}`}</div>
        </div>
      `, { direction: 'top', offset: [0, -14], opacity: 0.95 });
    });
  }, [places, selectedPlace, layers, radiusFilterKm, city, t, tDual]);

  // 8. Render Hazard & Citizen Signal Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !reportsLayerRef.current) return;
    reportsLayerRef.current.clearLayers();

    activeReports.forEach((report) => {
      // Check Smart City Layer Toggles
      if (report.category === 'lighting_outage' && !layers.streetlights) return;
      if (report.category === 'waterlogging' && !layers.waterlogging) return;
      if (report.category === 'road_potholes' && !layers.traffic) return;
      if (report.category === 'transit_delay' && !layers.transit) return;
      if (report.category === 'waste_sanitation' && !layers.waste) return;
      if (report.category === 'water_supply' && !layers.waterSupply) return;
      if (report.category === 'quiet_zone' && !layers.study) return;

      const isSelected = selectedReport?.id === report.id;
      let badgeColor = 'bg-rose-600';
      let icon = '⚠️';

      if (report.category === 'lighting_outage') {
        badgeColor = 'bg-amber-600';
        icon = '💡';
      } else if (report.category === 'waterlogging') {
        badgeColor = 'bg-blue-600';
        icon = '💧';
      } else if (report.category === 'quiet_zone') {
        badgeColor = 'bg-teal-600';
        icon = '🤫';
      } else if (report.category === 'transit_delay') {
        badgeColor = 'bg-orange-600';
        icon = '🚌';
      } else if (report.category === 'waste_sanitation') {
        badgeColor = 'bg-emerald-700';
        icon = '♻️';
      }

      const reportHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}">
          <div class="flex items-center justify-center w-6 h-6 rounded-full shadow-md border-2 border-white text-[11px] ${badgeColor} text-white">
            ${icon}
          </div>
        </div>
      `;

      const hazardIcon = L.divIcon({
        className: 'hazard-marker-node',
        html: reportHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([report.lat, report.lng], { icon: hazardIcon })
        .addTo(reportsLayerRef.current!);

      if (onSelectReport) {
        marker.on('click', () => onSelectReport(report));
      }

      marker.bindTooltip(`
        <div class="font-sans text-xs px-1 py-0.5">
          <div class="font-semibold text-rose-400">${report.title}</div>
          <div class="text-[10px] text-slate-400 font-mono">${report.status.toUpperCase()} (${report.corroborations} confirmations)</div>
        </div>
      `, { direction: 'top', offset: [0, -12], opacity: 0.95 });
    });
  }, [activeReports, selectedReport, layers, onSelectReport]);

  // 9. Route Polyline
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
      routePolylineRef.current = null;
    }

    if (routeContext && routeContext.coordinates.length > 0) {
      const polyline = L.polyline(routeContext.coordinates, {
        color: '#22d3ee',
        weight: 5,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      routePolylineRef.current = polyline;
    }
  }, [routeContext]);

  // 10. Handle Map Search flyTo
  const handleMapSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapSearchQuery.trim() || !mapInstanceRef.current) return;
    const q = mapSearchQuery.toLowerCase();
    const match = places.find(p => 
      p.name.toLowerCase().includes(q) || 
      p.locality?.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q)
    );

    if (match) {
      mapInstanceRef.current.flyTo([match.lat, match.lng], 16, { duration: 1.2 });
      onSelectPlace(match);
      setMapSearchQuery('');
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950" ref={mapWrapperRef}>
      {/* 1. Top Search & Filter Floating Bar */}
      <div 
        ref={searchBarRef}
        className="absolute top-3 inset-x-3 sm:left-4 sm:right-auto z-30 flex items-center gap-2 pointer-events-auto"
      >
        <form onSubmit={handleMapSearchSubmit} className="relative flex-1 sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={mapSearchQuery}
            onChange={(e) => setMapSearchQuery(e.target.value)}
            placeholder={t('map_search_places')}
            className="w-full pl-9 pr-8 py-2 bg-slate-950/90 backdrop-blur-md border border-slate-700/80 rounded-xl text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-xl"
          />
          {mapSearchQuery && (
            <button
              type="button"
              onClick={() => setMapSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Smart Layer Manager Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLayersModalOpen(!isLayersModalOpen);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold backdrop-blur-md border transition-all shadow-xl cursor-pointer ${
            isLayersModalOpen
              ? 'bg-cyan-500 text-slate-950 border-cyan-400'
              : 'bg-slate-950/90 text-slate-200 hover:text-cyan-300 border-slate-700/80'
          }`}
          title="Toggle Smart City Layers & Basemaps"
        >
          <Layers className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('map_layers')}</span>
        </button>

        {/* Legend Toggle */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsLegendOpen(!isLegendOpen);
          }}
          className={`p-2 rounded-xl text-xs backdrop-blur-md border transition-all shadow-xl ${
            isLegendOpen
              ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
              : 'bg-slate-950/90 text-slate-300 hover:text-white border-slate-700/80'
          }`}
          title="Toggle Category Legend"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Floating Right Action Toolbar (Always visible & responsive) */}
      <div 
        ref={toolbarRef}
        className="absolute right-3 top-14 z-30 flex flex-col gap-1.5 pointer-events-auto"
      >
        {/* Zoom In */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            mapInstanceRef.current?.zoomIn();
          }}
          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <span className="font-bold text-base leading-none select-none">+</span>
        </button>

        {/* Zoom Out */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            mapInstanceRef.current?.zoomOut();
          }}
          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title="Zoom Out (−)"
          aria-label="Zoom Out"
        >
          <span className="font-bold text-base leading-none select-none">−</span>
        </button>

        {/* GPS Locate Me */}
        <button
          type="button"
          onClick={handleLocateMe}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all active:scale-90 ${
            isLocating 
              ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
              : 'bg-slate-950/90 border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50'
          }`}
          title={isLocating ? 'Detecting GPS location...' : t('map_locate_me')}
          aria-label="My Location"
        >
          {isLocating ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          ) : (
            <Crosshair className="w-4 h-4 text-cyan-400" />
          )}
        </button>

        {/* Satellite Toggle Quick Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setMapStyle(prev => prev === 'satellite' ? 'streets' : 'satellite');
          }}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all active:scale-90 ${
            mapStyle === 'satellite'
              ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold ring-2 ring-cyan-400/40'
              : 'bg-slate-950/90 border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50'
          }`}
          title={mapStyle === 'satellite' ? 'Switch back to Street Map' : 'Switch to Satellite View'}
          aria-label="Satellite View Toggle"
        >
          <span className="text-sm leading-none select-none">🛰️</span>
        </button>

        {/* Reset View */}
        <button
          type="button"
          onClick={handleResetView}
          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title={`${t('map_reset_view')} (${city.name})`}
          aria-label="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Distance Measurement */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (isMeasuring) resetMeasurement();
            else setIsMeasuring(true);
          }}
          className={`p-2.5 rounded-xl border backdrop-blur-md shadow-xl transition-all active:scale-90 ${
            isMeasuring 
              ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold' 
              : 'bg-slate-950/90 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 border-slate-700/80'
          }`}
          title={t('map_measure_dist')}
          aria-label="Measure Distance"
        >
          <Ruler className="w-4 h-4" />
        </button>

        {/* Fullscreen Mode */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleFullscreen();
          }}
          className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-700/80 text-slate-200 hover:text-cyan-400 hover:border-cyan-500/50 backdrop-blur-md shadow-xl transition-all active:scale-90"
          title={t('map_fullscreen')}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3. Bottom-Left Basemap Quick Switcher (Google Maps Style) */}
      <div 
        ref={bottomBarRef} 
        className="absolute bottom-4 left-4 z-30 pointer-events-auto flex items-center gap-2"
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setMapStyle(prev => prev === 'satellite' ? 'streets' : 'satellite');
          }}
          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl backdrop-blur-md border shadow-2xl transition-all cursor-pointer select-none ${
            mapStyle === 'satellite'
              ? 'bg-slate-900/95 border-cyan-400 text-cyan-300 ring-1 ring-cyan-400/40'
              : 'bg-slate-950/90 border-slate-700/80 text-slate-200 hover:text-white hover:border-cyan-500/50'
          }`}
          title={mapStyle === 'satellite' ? 'Click to switch to Street Map' : 'Click to switch to Satellite View'}
        >
          <span className="text-base leading-none">{mapStyle === 'satellite' ? '🛰️' : '🗺️'}</span>
          <div className="text-left">
            <div className="text-[11px] font-bold leading-tight flex items-center gap-1.5">
              <span>{mapStyle === 'satellite' ? 'Satellite View' : 'Street Map'}</span>
              <span className={`text-[9px] uppercase px-1 py-0.5 rounded font-mono font-semibold ${
                mapStyle === 'satellite' ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
              }`}>
                {mapStyle === 'satellite' ? 'Active' : 'Toggle'}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* 3. Distance Measurement Live Banner */}
      {isMeasuring && (
        <div className="absolute top-16 left-4 z-30 p-2.5 rounded-xl bg-slate-950/90 border border-cyan-500/80 text-xs text-white backdrop-blur-md shadow-xl flex items-center gap-3">
          <div>
            <div className="font-semibold text-cyan-300">Measure Tool Active</div>
            <div className="text-[10px] text-slate-400">
              {measurePoints.length === 0 && 'Click first point on map...'}
              {measurePoints.length === 1 && 'Click second point to measure...'}
              {measuredDistanceKm !== null && (
                <span className="font-mono font-bold text-cyan-400 text-xs">
                  Straight-line Distance: {measuredDistanceKm} km
                </span>
              )}
            </div>
          </div>
          <button
            onClick={resetMeasurement}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px]"
          >
            Done
          </button>
        </div>
      )}

      {/* 4. Smart City Layer & Basemap Modal / Flyout */}
      {isLayersModalOpen && (
        <div className="absolute top-14 left-4 z-40 w-80 bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-4 text-xs space-y-4 max-h-[80vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-sm">Smart City Layer Manager</h4>
            <button onClick={() => setIsLayersModalOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Basemap Styles */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Basemap Cartography
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['streets', 'satellite', 'hybrid', 'terrain', 'dark'] as MapStyleMode[]).map((style) => (
                <button
                  key={style}
                  onClick={() => setMapStyle(style)}
                  className={`px-2.5 py-1.5 rounded-lg text-left capitalize transition-all border ${
                    mapStyle === style
                      ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {t(`map_style_${style}` as any)}
                </button>
              ))}
            </div>
          </div>

          {/* Radius Filter */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Nearby Radius Filter</span>
              <span className="font-mono text-cyan-400">{radiusFilterKm === 0 ? 'All City' : `${radiusFilterKm} km`}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[0, 2, 5, 10, 20].map((r) => (
                <button
                  key={r}
                  onClick={() => setRadiusFilterKm(r)}
                  className={`px-2 py-1 rounded text-[11px] font-mono border ${
                    radiusFilterKm === r
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {r === 0 ? 'All' : `${r}km`}
                </button>
              ))}
            </div>
          </div>

          {/* Smart City Layers Toggle List */}
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
              Interactive Civic Layers
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'heritage', label: t('layer_heritage'), icon: '🏛️' },
                { key: 'tourist', label: t('layer_tourist'), icon: '📸' },
                { key: 'nature', label: t('layer_nature'), icon: '🌿' },
                { key: 'cafes', label: t('layer_cafes'), icon: '☕' },
                { key: 'study', label: t('layer_study'), icon: '📖' },
                { key: 'transit', label: t('layer_transit'), icon: '🚇' },
                { key: 'traffic', label: t('layer_traffic'), icon: '🚗' },
                { key: 'waste', label: t('layer_waste'), icon: '♻️' },
                { key: 'waterSupply', label: t('layer_water_supply'), icon: '💧' },
                { key: 'streetlights', label: t('layer_streetlights'), icon: '💡' },
                { key: 'airQuality', label: t('layer_air_quality'), icon: '🍃' },
                { key: 'waterlogging', label: t('layer_waterlogging'), icon: '🌊' },
              ].map((item) => {
                const isActive = (layers as any)[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() => setLayers(prev => ({ ...prev, [item.key]: !isActive }))}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-colors ${
                      isActive
                        ? 'bg-slate-900 border-slate-700 text-slate-200'
                        : 'bg-slate-950 border-slate-850 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="font-medium text-[11px]">{item.label}</span>
                    </div>
                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                      isActive ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400' : 'border-slate-750'
                    }`}>
                      {isActive ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. Category Map Legend Popup */}
      {isLegendOpen && (
        <div className="absolute bottom-6 left-4 z-30 p-3 bg-slate-950/95 border border-slate-800 rounded-xl shadow-2xl backdrop-blur-md text-xs space-y-2 max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-bold text-white text-[11px] pb-1 border-b border-slate-800">
            <span>Map Marker Legend</span>
            <button onClick={() => setIsLegendOpen(false)} className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5"><span>🏛️</span> Heritage Site</div>
            <div className="flex items-center gap-1.5"><span>☕</span> Cafe / Food</div>
            <div className="flex items-center gap-1.5"><span>🌿</span> Park / Hill Tekdi</div>
            <div className="flex items-center gap-1.5"><span>📖</span> Study / Library</div>
            <div className="flex items-center gap-1.5"><span>🚇</span> Metro / Transit</div>
            <div className="flex items-center gap-1.5"><span>🕉️</span> Religious Temple</div>
            <div className="flex items-center gap-1.5"><span>💡</span> Streetlight Issue</div>
            <div className="flex items-center gap-1.5"><span>⚠️</span> Civic Hazard</div>
          </div>
        </div>
      )}

      {/* 6. Selected Location Slideout Drawer (Bottom/Right) */}
      {selectedPlace && (
        <div className="absolute bottom-4 inset-x-4 sm:left-auto sm:right-4 sm:w-96 z-40 bg-slate-950/95 border border-cyan-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-800">
                {selectedPlace.imageUrl ? (
                  <img src={selectedPlace.imageUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs">🏛️</div>
                )}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm leading-tight">{selectedPlace.name}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                  <span className="text-cyan-400">{selectedPlace.locality}</span>
                  <span>·</span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {selectedPlace.priceTier === 0 ? t('free_entry') : `${city.currencySymbol}${selectedPlace.estimatedCostLocal}`}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onSelectPlace(null as any)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
            {selectedPlace.shortDescription}
          </p>

          <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-800/80">
            {onOpenCultureLens && (
              <button
                onClick={() => onOpenCultureLens(selectedPlace)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-800/50"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Culture Lens</span>
              </button>
            )}

            {onToggleItinerary && (
              <button
                onClick={() => onToggleItinerary(selectedPlace)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isInItinerary && isInItinerary(selectedPlace.id)
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400'
                }`}
              >
                {isInItinerary && isInItinerary(selectedPlace.id) ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>In Plan</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to Plan</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* 7. Actual Leaflet HTML Container */}
      <div ref={mapContainerRef} id="nagar-map-canvas" className="absolute inset-0 w-full h-full z-0" />
    </div>
  );
};
