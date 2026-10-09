/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NagarBodha Sample Civic Signals — Primary Focus: Pune (PMC) & Pimpri-Chinchwad (PCMC)
 * Grounded in Indian urban realities: PMPML transit, potholes, water supply, streetlights.
 */

import { CivicReport } from '../types';

export const INITIAL_CIVIC_REPORTS: CivicReport[] = [
  // ==================== PUNE (PMC) ====================
  {
    id: 'rep-pun-001',
    cityId: 'pune',
    category: 'road_potholes',
    title: 'Shivajinagar J.M. Road Footpath Pavement Repair',
    description: 'PMC Ward utility pipeline trenching along east sidewalk near Sambhaji Park entrance. Tactile tiles removed; temporary metal ramps installed for pedestrian crossing.',
    lat: 18.5262,
    lng: 73.8492,
    locationName: 'J.M. Road, opposite Sambhaji Park',
    wardOrPrabhag: 'Prabhag 14 - Shivajinagar Ghole Road',
    timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 mins ago
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
    wardOrPrabhag: 'Prabhag 20 - Kasba Vishrambaug Wada',
    timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(), // 85 mins ago
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
    wardOrPrabhag: 'Prabhag 13 - Aundh-Baner',
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
    wardOrPrabhag: 'Prabhag 14 - Ganeshkhind',
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
    wardOrPrabhag: 'Hinjawadi Grampanchayat / MIDC',
    timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Culvert desilting verified by local civic team. Traffic flow normal.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Rohan N. (IT Professional)'
  },

  // ==================== PIMPRI-CHINCHWAD (PCMC) ====================
  {
    id: 'rep-pcmc-001',
    cityId: 'pimpri_chinchwad',
    category: 'waste_sanitation',
    title: 'Nigdi Pradhikaran Green Waste Collection Scheduled',
    description: 'PCMC dry leaf waste collection van active at Sector 25 garden perimeter. Walkway swept clean.',
    lat: 18.6582,
    lng: 73.7745,
    locationName: 'Sector 25 Pradhikaran Spine Road',
    wardOrPrabhag: 'PCMC Prabhag 15 - Nigdi',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Municipal sanitation operation completed. Footway clear.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Sunil M. (Resident)'
  },

  // ==================== MUMBAI (BMC) ====================
  {
    id: 'rep-bom-001',
    cityId: 'mumbai',
    category: 'waterlogging',
    title: 'Apollo Bunder Sea Spray on Low Curb Jetty',
    description: 'High tide breeze causing localized sea spray dampness near Colaba jetty. Footway remains open and dry.',
    lat: 18.9215,
    lng: 72.8340,
    locationName: 'Colaba Jetty Walkway',
    wardOrPrabhag: 'BMC A Ward - Colaba',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    corroborations: 4,
    status: 'corroborated',
    aiClassificationNote: 'Minor moisture signal. No physical disruption to pedestrian movement.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Kunal P. (Morning Walker)'
  },

  // ==================== NAVI MUMBAI (NMMC) ====================
  {
    id: 'rep-nvm-001',
    cityId: 'navi_mumbai',
    category: 'quiet_zone',
    title: 'Central Park Kharghar Morning Reading Pavilion Open',
    description: 'Gazebo amphitheatre quiet and clean, shaded seating free for morning yoga and study.',
    lat: 19.0583,
    lng: 73.0722,
    locationName: 'Kharghar Central Park Sector 23',
    wardOrPrabhag: 'NMMC Kharghar Ward',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    corroborations: 5,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic comfort optimal. No obstacles reported.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Devika T. (Student)'
  },

  // ==================== THANE (TMC) ====================
  {
    id: 'rep-thn-001',
    cityId: 'thane',
    category: 'transit_delay',
    title: 'TMT Bus Headway Normal along Talao Pali Ring',
    description: 'Thane Municipal Transport feeder buses arriving every 8 minutes at Talao Pali stop.',
    lat: 19.1928,
    lng: 72.9723,
    locationName: 'Jambli Naka Talao Pali',
    wardOrPrabhag: 'TMC Naupada Prabhag',
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    corroborations: 3,
    status: 'corroborated',
    aiClassificationNote: 'Transit advisory clear. Flow on schedule.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Prasad B. (Commuter)'
  },

  // ==================== NASHIK (NMC) ====================
  {
    id: 'rep-nsk-001',
    cityId: 'nashik',
    category: 'road_potholes',
    title: 'Trimbak Road Pavement Stone Re-alignment',
    description: 'Footpath pavers leveled near Pandavleni foothills parking lot; pedestrian walking lane clear.',
    lat: 19.9614,
    lng: 73.7483,
    locationName: 'Pandavleni Foothill Path',
    wardOrPrabhag: 'NMC CIDCO Division',
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    corroborations: 2,
    status: 'corroborated',
    aiClassificationNote: 'Maintenance verified complete by civic team.',
    hasPhoto: false,
    hasAudio: false,
    reportedBy: 'Manoj V. (Runner)'
  },

  // ==================== NAGPUR (NMC) ====================
  {
    id: 'rep-ngp-001',
    cityId: 'nagpur',
    category: 'lighting_outage',
    title: 'Futala Promenade LED Streetlight Checked',
    description: 'Lakeside solar LED masts fully functional for evening walkers and families.',
    lat: 21.1558,
    lng: 79.0435,
    locationName: 'Futala Lake West Promenade',
    wardOrPrabhag: 'NMC Dharampeth Zone',
    timestamp: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    corroborations: 4,
    status: 'corroborated',
    aiClassificationNote: 'Lighting integrity verified.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Anand R. (Resident)'
  },

  // ==================== CHHATRAPATI SAMBHAJINAGAR ====================
  {
    id: 'rep-csn-001',
    cityId: 'chhatrapati_sambhajinagar',
    category: 'quiet_zone',
    title: 'Bibi Ka Maqbara Charbagh Lawn Serenity Verified',
    description: 'ASI heritage gardens peaceful with zero loudspeaker or traffic noise intrusion.',
    lat: 19.9014,
    lng: 75.3204,
    locationName: 'Begumpura Heritage Zone',
    wardOrPrabhag: 'CSMC Begumpura Ward',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    corroborations: 6,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic sanctuary confirmed.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Farhan S. (Photographer)'
  },

  // ==================== KOLHAPUR ====================
  {
    id: 'rep-kop-001',
    cityId: 'kolhapur',
    category: 'heavy_crowd',
    title: 'Bhavani Mandap Mahalakshmi Darshan Queue Moderate',
    description: 'Estimated waiting time in darshan queue is 25 minutes; water dispensers refilled.',
    lat: 16.6946,
    lng: 74.2238,
    locationName: 'Bhavani Mandap Main Gateway',
    wardOrPrabhag: 'KMC Central Ward',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    corroborations: 8,
    status: 'reviewed',
    aiClassificationNote: 'Crowd density moderate. Paved covered walkway in service.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Snehal P. (Pilgrim)'
  },

  // ==================== DELHI ====================
  {
    id: 'rep-del-001',
    cityId: 'delhi',
    category: 'transit_delay',
    title: 'Chandni Chowk Pedestrian Promenade Electric Rickshaw Flow Normal',
    description: 'Pedestrianized zone clear of unauthorized motorized vehicles; Delhi Metro Gate 5 clear.',
    lat: 28.6562,
    lng: 77.2410,
    locationName: 'Chandni Chowk Heritage Stretch',
    wardOrPrabhag: 'MCD City SP Zone',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
    corroborations: 5,
    status: 'reviewed',
    aiClassificationNote: 'Pedestrian boulevard functioning as planned.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Aakash G. (Explorer)'
  },

  // ==================== BENGALURU ====================
  {
    id: 'rep-blr-001',
    cityId: 'bengaluru',
    category: 'quiet_zone',
    title: 'Cubbon Park Bamboo Avenue Silence Observed',
    description: 'Vehicles strictly restricted on Sundays. Birds chirping, ideal for reading and sketching.',
    lat: 12.9763,
    lng: 77.5929,
    locationName: 'Kasturba Road Central Bamboo Pavilion',
    wardOrPrabhag: 'BBMP East Zone',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    corroborations: 7,
    status: 'reviewed',
    aiClassificationNote: 'Acoustic sanctuary verified.',
    hasPhoto: true,
    hasAudio: false,
    reportedBy: 'Divya M. (Architect)'
  }
];
