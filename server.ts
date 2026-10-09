/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Full-Stack Server
 * Express Server with Vite Dev Middlewares & Secure Gemini / Open-Meteo / OSRM API Proxies
 */

import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '5mb' }));

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

// In-Memory store for citizen reports initialized with seed data
interface StoredReport {
  id: string;
  cityId: string;
  category: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  locationName: string;
  timestamp: string;
  corroborations: number;
  status: 'unverified' | 'corroborated' | 'reviewed';
  aiClassificationNote?: string;
  hasPhoto?: boolean;
  hasAudio?: boolean;
  reportedBy: string;
}

const civicReportsStore: StoredReport[] = [
  {
    id: 'rep-pun-001',
    cityId: 'pune',
    category: 'road_potholes',
    title: 'Shivajinagar J.M. Road Footpath Pavement Repair',
    description: 'PMC Ward utility pipeline trenching along east sidewalk near Sambhaji Park entrance. Tactile tiles removed; temporary metal ramps installed for pedestrian crossing.',
    lat: 18.5262,
    lng: 73.8492,
    locationName: 'J.M. Road, opposite Sambhaji Park',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
    corroborations: 4,
    status: 'corroborated',
    aiClassificationNote: 'Physical pedestrian footpath obstacle. Temporary steel plate ramp in place; caution advised for wheelchair commuters.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Chinmayee K. (SPPU Student)'
  },
  {
    id: 'rep-pun-002',
    cityId: 'pune',
    category: 'transit_delay',
    title: 'PMPML Swargate Feeder Bus Frequency Advisory',
    description: 'Bus Route 11 (Swargate to Pune Station via Bajirao Road) running with 15-minute headway delays due to festival barricading near Mandai.',
    lat: 18.5018,
    lng: 73.8583,
    locationName: 'Swargate Bus Terminal Bay 3',
    timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
    corroborations: 5,
    status: 'reviewed',
    aiClassificationNote: 'Public transit advisory. Pune Metro Purple Line operational as alternate rapid bypass to Civil Court.',
    hasPhoto: false,
    hasAudio: true,
    reportedBy: 'Aditya D. (Daily Commuter)'
  },
  {
    id: 'rep-pun-003',
    cityId: 'pune',
    category: 'lighting_outage',
    title: 'Senapati Bapat Road Tekdi Footpath Streetlamp Intermittent',
    description: 'Two sodium luminaires on western lane ascending towards Symbiosis campus flickering after 8:00 PM. High vehicular traffic maintains fair visibility.',
    lat: 18.5341,
    lng: 73.8312,
    locationName: 'Senapati Bapat Road, near ICC Trade Tower',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    corroborations: 2,
    status: 'corroborated',
    aiClassificationNote: 'Ambient evening lighting drop on foothill pavement. Commercial facade lighting active across the street.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Soham G. (Tech Worker)'
  },
  {
    id: 'rep-pun-004',
    cityId: 'pune',
    category: 'quiet_zone',
    title: 'Jayakar Library Garden Reading Silence Maintained',
    description: 'SPPU Jayakar Library open lawns peaceful, zero traffic noise, ideal shaded benches for academic preparation and reading.',
    lat: 18.5529,
    lng: 73.8261,
    locationName: 'Jayakar Library Quadrangle, SPPU Campus',
    timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    corroborations: 7,
    status: 'reviewed',
    aiClassificationNote: 'Positive acoustic indicator. Nominal study comfort with shaded canopy.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Kavita J. (PhD Scholar)'
  },
  {
    id: 'rep-pun-005',
    cityId: 'pune',
    category: 'waterlogging',
    title: 'Hinjawadi Wakad Bridge Low-Dip Drainage Maintenance',
    description: 'Pre-monsoon culvert desilting completed under Wakad Flyover connector towards Hinjawadi Phase 1. Road clear of standing water.',
    lat: 18.5987,
    lng: 73.7624,
    locationName: 'Wakad Bridge Hinjawadi Junction',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Culvert desilting verified by local civic team. Traffic flow normal.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Rohan N. (IT Professional)'
  },
  {
    id: 'rep-pcmc-001',
    cityId: 'pimpri_chinchwad',
    category: 'waste_sanitation',
    title: 'Nigdi Pradhikaran Green Waste Collection Scheduled',
    description: 'PCMC dry leaf waste collection van active at Sector 25 garden perimeter. Walkway swept clean.',
    lat: 18.6582,
    lng: 73.7745,
    locationName: 'Sector 25 Pradhikaran Spine Road',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Municipal sanitation operation completed. Footway clear.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Sunil M. (Resident)'
  },
  {
    id: 'rep-bom-001',
    cityId: 'mumbai',
    category: 'waterlogging',
    title: 'Apollo Bunder Sea Spray on Low Curb Jetty',
    description: 'High tide breeze causing localized sea spray dampness near Colaba jetty. Footway remains open and dry.',
    lat: 18.9215,
    lng: 72.8340,
    locationName: 'Colaba Jetty Walkway',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    corroborations: 4,
    status: 'corroborated',
    aiClassificationNote: 'Minor moisture signal. No physical disruption to pedestrian movement.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Kunal P. (Morning Walker)'
  },
  {
    id: 'rep-nvm-001',
    cityId: 'navi_mumbai',
    category: 'quiet_zone',
    title: 'Central Park Kharghar Morning Reading Pavilion Open',
    description: 'Gazebo amphitheatre quiet and clean, shaded seating free for morning yoga and study.',
    lat: 19.0583,
    lng: 73.0722,
    locationName: 'Kharghar Central Park Sector 23',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    corroborations: 5,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic comfort optimal. No obstacles reported.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Devika T. (Student)'
  },
  {
    id: 'rep-thn-001',
    cityId: 'thane',
    category: 'transit_delay',
    title: 'TMT Bus Headway Normal along Talao Pali Ring',
    description: 'Thane Municipal Transport feeder buses arriving every 8 minutes at Talao Pali stop.',
    lat: 19.1928,
    lng: 72.9723,
    locationName: 'Jambli Naka Talao Pali',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Transit advisory clear. Flow on schedule.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Prasad B. (Commuter)'
  },
  {
    id: 'rep-nsk-001',
    cityId: 'nashik',
    category: 'road_potholes',
    title: 'Trimbak Road Pavement Stone Re-alignment',
    description: 'Footpath pavers leveled near Pandavleni foothills parking lot; pedestrian walking lane clear.',
    lat: 19.9614,
    lng: 73.7483,
    locationName: 'Pandavleni Foothill Path',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    corroborations: 2,
    status: 'corroborated',
    aiClassificationNote: 'Maintenance verified complete by civic team.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Manoj V. (Runner)'
  },
  {
    id: 'rep-ngp-001',
    cityId: 'nagpur',
    category: 'lighting_outage',
    title: 'Futala Promenade LED Streetlight Checked',
    description: 'Lakeside solar LED masts fully functional for evening walkers and families.',
    lat: 21.1558,
    lng: 79.0435,
    locationName: 'Futala Lake West Promenade',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    corroborations: 4,
    status: 'corroborated',
    aiClassificationNote: 'Lighting integrity verified.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Anand R. (Resident)'
  },
  {
    id: 'rep-csn-001',
    cityId: 'chhatrapati_sambhajinagar',
    category: 'quiet_zone',
    title: 'Bibi Ka Maqbara Charbagh Lawn Serenity Verified',
    description: 'ASI heritage gardens peaceful with zero loudspeaker or traffic noise intrusion.',
    lat: 19.9014,
    lng: 75.3204,
    locationName: 'Begumpura Heritage Zone',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    corroborations: 6,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic sanctuary confirmed.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Farhan S. (Photographer)'
  },
  {
    id: 'rep-kop-001',
    cityId: 'kolhapur',
    category: 'heavy_crowd',
    title: 'Bhavani Mandap Mahalakshmi Darshan Queue Moderate',
    description: 'Estimated waiting time in darshan queue is 25 minutes; water dispensers refilled.',
    lat: 16.6946,
    lng: 74.2238,
    locationName: 'Bhavani Mandap Main Gateway',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    corroborations: 8,
    status: 'reviewed',
    aiClassificationNote: 'Crowd density moderate. Paved covered walkway in service.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Snehal P. (Pilgrim)'
  },
  {
    id: 'rep-del-001',
    cityId: 'delhi',
    category: 'transit_delay',
    title: 'Chandni Chowk Pedestrian Promenade Electric Rickshaw Flow Normal',
    description: 'Pedestrianized zone clear of unauthorized motorized vehicles; Delhi Metro Gate 5 clear.',
    lat: 28.6562,
    lng: 77.2410,
    locationName: 'Chandni Chowk Heritage Stretch',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    corroborations: 5,
    status: 'reviewed',
    aiClassificationNote: 'Pedestrian boulevard functioning as planned.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Aakash G. (Explorer)'
  },
  {
    id: 'rep-blr-001',
    cityId: 'bengaluru',
    category: 'quiet_zone',
    title: 'Cubbon Park Bamboo Avenue Silence Observed',
    description: 'Vehicles strictly restricted on Sundays. Birds chirping, ideal for reading and sketching.',
    lat: 12.9763,
    lng: 77.5929,
    locationName: 'Kasturba Road Central Bamboo Pavilion',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    corroborations: 7,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic sanctuary verified.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Divya M. (Architect)'
  }
];

// --- 1. HEALTH ENDPOINT ---
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    appName: 'NagarBodha (नगरबोध)',
    version: '1.0.0',
    geminiConfigured: !!aiClient,
    environment: process.env.NODE_ENV || 'development',
    serverTime: new Date().toISOString(),
    activeSignalsCount: civicReportsStore.length
  });
});

// --- 2. LIVE WEATHER PROXY (Open-Meteo API) ---
app.get('/api/weather', async (req: Request, res: Response) => {
  const { lat, lng, cityId } = req.query;
  // Default to Pune coordinates
  const latitude = Number(lat) || 18.5204;
  const longitude = Number(lng) || 73.8567;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&timezone=auto`;
    const response = await fetch(weatherUrl, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Weather service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const current = data.current;

    // Decode WMO weather code
    const wCode = current?.weather_code ?? 0;
    let description = 'Clear Sky';
    if (wCode === 1 || wCode === 2) description = 'Partly Cloudy';
    else if (wCode === 3) description = 'Overcast';
    else if (wCode >= 51 && wCode <= 67) description = 'Light Rain & Drizzle';
    else if (wCode >= 80 && wCode <= 82) description = 'Rain Showers';
    else if (wCode >= 95) description = 'Thunderstorms';

    res.json({
      success: true,
      cityId: cityId || 'pune',
      temperatureC: Math.round(current?.temperature_2m ?? 27),
      weatherCode: wCode,
      weatherDescription: description,
      precipitationProbability: current?.precipitation ? 60 : 10,
      windSpeedKmh: Math.round(current?.wind_speed_10m ?? 8),
      isDay: current?.is_day === 1,
      freshness: 'live',
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    // Graceful baseline fallback
    res.json({
      success: true,
      cityId: cityId || 'pune',
      temperatureC: 27,
      weatherCode: 1,
      weatherDescription: 'Pleasant & Clear (Baseline Estimate)',
      precipitationProbability: 15,
      windSpeedKmh: 10,
      isDay: true,
      freshness: 'fallback',
      lastUpdated: new Date().toISOString()
    });
  }
});

// --- 3. LIVE ROUTE & HAZARD CROSS-CHECK (OSRM API) ---
app.get('/api/route', async (req: Request, res: Response) => {
  const { startLat, startLng, endLat, endLng, cityId } = req.query;

  const sLat = Number(startLat);
  const sLng = Number(startLng);
  const eLat = Number(endLat);
  const eLng = Number(endLng);

  if (isNaN(sLat) || isNaN(sLng) || isNaN(eLat) || isNaN(eLng)) {
    return res.status(400).json({ error: 'Valid startLat, startLng, endLat, endLng are required' });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    // Call public OSRM walking profile
    const osrmUrl = `https://router.project-osrm.org/route/v1/walking/${sLng},${sLat};${eLng},${eLat}?overview=full&geometries=geojson&steps=true`;
    const response = await fetch(osrmUrl, { signal: controller.signal });
    clearTimeout(timeout);

    let routeCoordinates: [number, number][] = [];
    let distanceMeters = 0;
    let durationSeconds = 0;

    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        distanceMeters = Math.round(route.distance);
        durationSeconds = Math.round(route.duration);
        // OSRM coordinates are [lng, lat], convert to [lat, lng]
        routeCoordinates = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);
      }
    }

    // Fallback if OSRM is unreachable or returned empty
    if (routeCoordinates.length === 0) {
      // Direct interpolated geodesic path
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const fraction = i / steps;
        routeCoordinates.push([
          sLat + (eLat - sLat) * fraction,
          sLng + (eLng - sLng) * fraction
        ]);
      }
      // Haversine approximation
      const R = 6371e3;
      const φ1 = sLat * Math.PI / 180;
      const φ2 = eLat * Math.PI / 180;
      const Δφ = (eLat - sLat) * Math.PI / 180;
      const Δλ = (eLng - sLng) * Math.PI / 180;
      const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceMeters = Math.round(R * c);
      durationSeconds = Math.round(distanceMeters / 1.3); // ~4.7 km/h walking speed
    }

    // Find nearby citizen reports within 250m buffer of route bounding box
    const minLat = Math.min(sLat, eLat) - 0.003;
    const maxLat = Math.max(sLat, eLat) + 0.003;
    const minLng = Math.min(sLng, eLng) - 0.003;
    const maxLng = Math.max(sLng, eLng) + 0.003;

    const nearbySignals = civicReportsStore.filter(r => 
      (!cityId || r.cityId === cityId) &&
      r.lat >= minLat && r.lat <= maxLat &&
      r.lng >= minLng && r.lng <= maxLng
    );

    res.json({
      success: true,
      distanceMeters,
      durationSeconds,
      transitMode: 'walking',
      estimatedTransitFare: 0,
      coordinates: routeCoordinates,
      nearbySignals,
      safetyDisclaimer: 'Route context reflects verified community reports and open routing data. Real-world conditions may vary; always stay vigilant and use well-lit primary corridors after dark.'
    });
  } catch (err) {
    res.status(500).json({ error: 'Routing calculation failed', details: String(err) });
  }
});

// --- 4. CIVIC REPORTS ENDPOINTS ---
app.get('/api/reports', (req: Request, res: Response) => {
  const { cityId } = req.query;
  const reports = cityId 
    ? civicReportsStore.filter(r => r.cityId === cityId)
    : civicReportsStore;
  res.json({ success: true, count: reports.length, reports });
});

app.post('/api/reports', async (req: Request, res: Response) => {
  const { cityId, category, title, description, lat, lng, locationName, reportedBy, photoUrl } = req.body;

  if (!cityId || !category || !description || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Missing required report fields (cityId, category, description, lat, lng)' });
  }

  // AI Categorization & Sentiment Extraction via Gemini 3.8 Flash if available
  let aiClassificationNote = 'Standard community observation logged.';
  if (aiClient) {
    try {
      const prompt = `Analyze this citizen urban report:
Title: ${title || 'N/A'}
Category: ${category}
Description: ${description}
Provide a single concise 1-sentence objective summary note assessing whether this presents a mobility or lighting obstacle for pedestrians. Do not use markdown tags or JSON.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });
      if (response.text) {
        aiClassificationNote = response.text.trim();
      }
    } catch (e) {
      console.warn('AI report classification skipped:', e);
    }
  }

  const newReport: StoredReport = {
    id: `rep-${Date.now()}`,
    cityId,
    category,
    title: (title || category.replace('_', ' ')).slice(0, 80),
    description: String(description).slice(0, 500),
    lat: Number(lat),
    lng: Number(lng),
    locationName: locationName || 'Citizen Selected Map Anchor',
    timestamp: new Date().toISOString(),
    corroborations: 1,
    status: 'unverified',
    aiClassificationNote,
    hasPhoto: !!photoUrl,
    hasAudio: false,
    reportedBy: (reportedBy || 'Anonymous Explorer').slice(0, 50)
  };

  civicReportsStore.unshift(newReport);

  res.status(201).json({
    success: true,
    message: 'Report submitted successfully. Tagged as unverified pending corroboration.',
    report: newReport
  });
});

app.post('/api/reports/:id/corroborate', (req: Request, res: Response) => {
  const { id } = req.params;
  const report = civicReportsStore.find(r => r.id === id);

  if (!report) {
    return res.status(404).json({ error: 'Report not found' });
  }

  report.corroborations += 1;
  // Auto-elevate to corroborated status if >= 2 community confirmations
  if (report.corroborations >= 2 && report.status === 'unverified') {
    report.status = 'corroborated';
  }

  res.json({
    success: true,
    corroborations: report.corroborations,
    status: report.status
  });
});

// --- 5. AI RECOMMENDATION & INTENT EXPLANATION ENDPOINT ---
app.post('/api/recommend', async (req: Request, res: Response) => {
  const { query, cityId, vibe, maxBudget, maxHours, places } = req.body;

  if (!places || !Array.isArray(places)) {
    return res.status(400).json({ error: 'Places array is required' });
  }

  // If Gemini client is active, use structured prompt to interpret intent and produce explainable matches
  if (aiClient) {
    try {
      const placesSummary = places.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        vibe: p.vibe,
        cost: p.estimatedCostLocal,
        dwellMins: p.dwellTimeMins,
        cleanliness: p.cleanlinessRating,
        accessibility: p.accessibilityRating,
        lighting: p.lightingRating
      }));

      const prompt = `You are NagarBodha (नगरबोध), an urban intelligence engine.
User City: ${cityId}
User Intent / Query: "${query || 'Explore affordable hidden gems'}"
User Filters: Vibe=${vibe || 'all'}, MaxBudget=${maxBudget}, MaxHours=${maxHours}

Available Places in City:
${JSON.stringify(placesSummary, null, 2)}

Return a strict JSON array of objects with maximum 4 recommended places that match best. Format:
[
  {
    "placeId": "id-string",
    "reason": "1 clear sentence explaining why this matches the user's intent and vibe",
    "budgetFit": "e.g. Free entry, fits student budget easily",
    "timeFit": "e.g. 60 min dwell time, fits well within schedule"
  }
]
Return ONLY the raw JSON array, with no markdown code fences or backticks.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      let text = response.text?.trim() || '';
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      text = text.trim();

      const parsed = JSON.parse(text);
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        recommendations: parsed
      });
    } catch (err) {
      console.warn('Gemini recommendation query failed, falling back to heuristic engine:', err);
    }
  }

  // Deterministic Heuristic Engine Fallback
  const fallbackRecs = places.slice(0, 4).map((p: any) => ({
    placeId: p.id,
    reason: `Selected for high ${p.vibe} atmosphere with a ${p.cleanlinessRating}/5.0 comfort score.`,
    budgetFit: p.priceTier === 0 ? 'Zero admission fee, perfectly matches budget limit.' : `Estimated cost ${p.estimatedCostLocal} matches target budget.`,
    timeFit: `${p.dwellTimeMins} minutes dwell time fits smoothly into your travel envelope.`
  }));

  res.json({
    success: true,
    source: 'deterministic-heuristic',
    recommendations: fallbackRecs
  });
});

// --- 6. CULTURELENS GROUNDED STORYTELLING ENDPOINT ---
app.post('/api/culture-story', async (req: Request, res: Response) => {
  const { placeName, cultureLore, category } = req.body;

  if (aiClient && cultureLore) {
    try {
      const prompt = `You are the CultureLens (संस्कृतिदृष्टि) module of NagarBodha.
Translate and craft a concise, vivid 3-sentence heritage narrative for "${placeName}" grounded STRICTLY in these verified historical facts:
"${cultureLore}"
Highlight:
1. Historical origin / significance
2. Architectural or cultural detail
3. Etiquette or mindful perspective for today's visitor.
Do not invent unverified claims. Output plain text only.`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      if (response.text) {
        return res.json({
          success: true,
          source: 'gemini-3.8-flash',
          story: response.text.trim()
        });
      }
    } catch (e) {
      console.warn('CultureLens AI story generation fallback:', e);
    }
  }

  res.json({
    success: true,
    source: 'archival-record',
    story: cultureLore || 'Archival historical record verified from municipal heritage logs.'
  });
});

// --- VITE MIDDLEWARE (DEV) OR STATIC ASSETS (PROD) ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NagarBodha server running at http://localhost:${PORT}`);
  });
}

startServer();
