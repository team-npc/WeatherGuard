'use client';

import {
    MapPin,
    Navigation,
    Search,
    X
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
  country?: string;
  region?: string;
  importance?: number;
}

interface LocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  onCurrentLocation?: () => void;
  onLocationPin?: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

// Enhanced global geocoding function with comprehensive location database
async function geocodeLocation(query: string): Promise<LocationResult[]> {
  if (!query.trim()) return [];

  try {
    // Combine multiple data sources for comprehensive coverage
    const results: LocationResult[] = [];

    // 1. Try Nominatim (OpenStreetMap) for real-world data
    const nominatimResults = await searchWithNominatim(query);
    results.push(...nominatimResults);

    // 2. Search comprehensive global database
    const globalResults = await searchWithComprehensiveDatabase(query);
    results.push(...globalResults);

    // 3. Search local landmarks and POIs
    const poiResults = await searchPointsOfInterest(query);
    results.push(...poiResults);

    // Remove duplicates and sort by relevance
    const uniqueResults = removeDuplicateLocations(results);
    return sortLocationsByRelevance(uniqueResults, query);

  } catch (error) {
    console.error('Geocoding error:', error);
    // Fallback to comprehensive database
    return await searchWithComprehensiveDatabase(query);
  }
}

// Real geocoding using Nominatim (OpenStreetMap)
async function searchWithNominatim(query: string): Promise<LocationResult[]> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=15&addressdetails=1&extratags=1`,
    {
      headers: {
        'User-Agent': 'WeatherSafetyApp/1.0'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Nominatim search failed');
  }

  const data = await response.json();

  return data.map((item: any, index: number) => ({
    id: `nominatim_${item.place_id || index}`,
    name: item.display_name.split(',')[0],
    address: item.display_name,
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    type: item.type || item.class || 'location',
    country: item.address?.country || '',
    region: item.address?.state || item.address?.region || '',
    importance: parseFloat(item.importance || '0')
  })).sort((a: LocationResult, b: LocationResult) => (b.importance || 0) - (a.importance || 0));
}

// Comprehensive global mock data for fallback
async function searchWithGlobalMockData(query: string): Promise<LocationResult[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));

  // Comprehensive global location database
  const globalLocationDatabase: LocationResult[] = [
    // Major World Cities - North America
    { id: 'na_1', name: 'New York City', address: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, type: 'city', country: 'United States', region: 'New York', importance: 0.95 },
    { id: 'na_2', name: 'Los Angeles', address: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, type: 'city', country: 'United States', region: 'California', importance: 0.9 },
    { id: 'na_3', name: 'Chicago', address: 'Chicago, IL, USA', latitude: 41.8781, longitude: -87.6298, type: 'city', country: 'United States', region: 'Illinois', importance: 0.85 },
    { id: 'na_4', name: 'Toronto', address: 'Toronto, ON, Canada', latitude: 43.6532, longitude: -79.3832, type: 'city', country: 'Canada', region: 'Ontario', importance: 0.8 },
    { id: 'na_5', name: 'Mexico City', address: 'Mexico City, Mexico', latitude: 19.4326, longitude: -99.1332, type: 'city', country: 'Mexico', region: 'Mexico City', importance: 0.85 },
    { id: 'na_6', name: 'Miami', address: 'Miami, FL, USA', latitude: 25.7617, longitude: -80.1918, type: 'city', country: 'United States', region: 'Florida', importance: 0.75 },
    { id: 'na_7', name: 'Seattle', address: 'Seattle, WA, USA', latitude: 47.6062, longitude: -122.3321, type: 'city', country: 'United States', region: 'Washington', importance: 0.7 },
    { id: 'na_8', name: 'Vancouver', address: 'Vancouver, BC, Canada', latitude: 49.2827, longitude: -123.1207, type: 'city', country: 'Canada', region: 'British Columbia', importance: 0.7 },

    // Europe
    { id: 'eu_1', name: 'London', address: 'London, England, UK', latitude: 51.5074, longitude: -0.1278, type: 'city', country: 'United Kingdom', region: 'England', importance: 0.95 },
    { id: 'eu_2', name: 'Paris', address: 'Paris, France', latitude: 48.8566, longitude: 2.3522, type: 'city', country: 'France', region: 'Île-de-France', importance: 0.9 },
    { id: 'eu_3', name: 'Berlin', address: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, type: 'city', country: 'Germany', region: 'Berlin', importance: 0.85 },
    { id: 'eu_4', name: 'Rome', address: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964, type: 'city', country: 'Italy', region: 'Lazio', importance: 0.85 },
    { id: 'eu_5', name: 'Madrid', address: 'Madrid, Spain', latitude: 40.4168, longitude: -3.7038, type: 'city', country: 'Spain', region: 'Madrid', importance: 0.8 },
    { id: 'eu_6', name: 'Amsterdam', address: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041, type: 'city', country: 'Netherlands', region: 'North Holland', importance: 0.75 },
    { id: 'eu_7', name: 'Vienna', address: 'Vienna, Austria', latitude: 48.2082, longitude: 16.3738, type: 'city', country: 'Austria', region: 'Vienna', importance: 0.7 },
    { id: 'eu_8', name: 'Stockholm', address: 'Stockholm, Sweden', latitude: 59.3293, longitude: 18.0686, type: 'city', country: 'Sweden', region: 'Stockholm', importance: 0.7 },

    // Asia
    { id: 'as_1', name: 'Tokyo', address: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, type: 'city', country: 'Japan', region: 'Kanto', importance: 0.95 },
    { id: 'as_2', name: 'Beijing', address: 'Beijing, China', latitude: 39.9042, longitude: 116.4074, type: 'city', country: 'China', region: 'Beijing', importance: 0.9 },
    { id: 'as_3', name: 'Shanghai', address: 'Shanghai, China', latitude: 31.2304, longitude: 121.4737, type: 'city', country: 'China', region: 'Shanghai', importance: 0.85 },
    { id: 'as_4', name: 'Mumbai', address: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.85 },
    { id: 'as_5', name: 'Seoul', address: 'Seoul, South Korea', latitude: 37.5665, longitude: 126.9780, type: 'city', country: 'South Korea', region: 'Seoul', importance: 0.8 },
    { id: 'as_6', name: 'Singapore', address: 'Singapore', latitude: 1.3521, longitude: 103.8198, type: 'city', country: 'Singapore', region: 'Singapore', importance: 0.8 },
    { id: 'as_7', name: 'Bangkok', address: 'Bangkok, Thailand', latitude: 13.7563, longitude: 100.5018, type: 'city', country: 'Thailand', region: 'Bangkok', importance: 0.75 },
    { id: 'as_8', name: 'Dubai', address: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, type: 'city', country: 'United Arab Emirates', region: 'Dubai', importance: 0.75 },

    // Africa
    { id: 'af_1', name: 'Cairo', address: 'Cairo, Egypt', latitude: 30.0444, longitude: 31.2357, type: 'city', country: 'Egypt', region: 'Cairo Governorate', importance: 0.8 },
    { id: 'af_2', name: 'Lagos', address: 'Lagos, Nigeria', latitude: 6.5244, longitude: 3.3792, type: 'city', country: 'Nigeria', region: 'Lagos State', importance: 0.75 },
    { id: 'af_3', name: 'Cape Town', address: 'Cape Town, South Africa', latitude: -33.9249, longitude: 18.4241, type: 'city', country: 'South Africa', region: 'Western Cape', importance: 0.7 },
    { id: 'af_4', name: 'Nairobi', address: 'Nairobi, Kenya', latitude: -1.2921, longitude: 36.8219, type: 'city', country: 'Kenya', region: 'Nairobi', importance: 0.65 },
    { id: 'af_5', name: 'Casablanca', address: 'Casablanca, Morocco', latitude: 33.5731, longitude: -7.5898, type: 'city', country: 'Morocco', region: 'Casablanca-Settat', importance: 0.6 },

    // South America
    { id: 'sa_1', name: 'São Paulo', address: 'São Paulo, SP, Brazil', latitude: -23.5505, longitude: -46.6333, type: 'city', country: 'Brazil', region: 'São Paulo', importance: 0.85 },
    { id: 'sa_2', name: 'Buenos Aires', address: 'Buenos Aires, Argentina', latitude: -34.6118, longitude: -58.3960, type: 'city', country: 'Argentina', region: 'Buenos Aires', importance: 0.8 },
    { id: 'sa_3', name: 'Rio de Janeiro', address: 'Rio de Janeiro, RJ, Brazil', latitude: -22.9068, longitude: -43.1729, type: 'city', country: 'Brazil', region: 'Rio de Janeiro', importance: 0.75 },
    { id: 'sa_4', name: 'Lima', address: 'Lima, Peru', latitude: -12.0464, longitude: -77.0428, type: 'city', country: 'Peru', region: 'Lima', importance: 0.7 },
    { id: 'sa_5', name: 'Bogotá', address: 'Bogotá, Colombia', latitude: 4.7110, longitude: -74.0721, type: 'city', country: 'Colombia', region: 'Bogotá', importance: 0.65 },

    // Oceania
    { id: 'oc_1', name: 'Sydney', address: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093, type: 'city', country: 'Australia', region: 'New South Wales', importance: 0.8 },
    { id: 'oc_2', name: 'Melbourne', address: 'Melbourne, VIC, Australia', latitude: -37.8136, longitude: 144.9631, type: 'city', country: 'Australia', region: 'Victoria', importance: 0.75 },
    { id: 'oc_3', name: 'Auckland', address: 'Auckland, New Zealand', latitude: -36.8485, longitude: 174.7633, type: 'city', country: 'New Zealand', region: 'Auckland', importance: 0.65 },

    // US Cities (including Alabama)
    { id: 'us_1', name: 'Tuscaloosa', address: 'Tuscaloosa, Alabama, USA', latitude: 33.2098, longitude: -87.5692, type: 'city', country: 'United States', region: 'Alabama', importance: 0.5 },
    { id: 'us_2', name: 'Birmingham', address: 'Birmingham, Alabama, USA', latitude: 33.5186, longitude: -86.8104, type: 'city', country: 'United States', region: 'Alabama', importance: 0.55 },
    { id: 'us_3', name: 'Atlanta', address: 'Atlanta, Georgia, USA', latitude: 33.7490, longitude: -84.3880, type: 'city', country: 'United States', region: 'Georgia', importance: 0.75 },
    { id: 'us_4', name: 'Nashville', address: 'Nashville, Tennessee, USA', latitude: 36.1627, longitude: -86.7816, type: 'city', country: 'United States', region: 'Tennessee', importance: 0.65 },
    { id: 'us_5', name: 'Denver', address: 'Denver, Colorado, USA', latitude: 39.7392, longitude: -104.9903, type: 'city', country: 'United States', region: 'Colorado', importance: 0.65 },

    // Major Airports Worldwide
    { id: 'air_1', name: 'Heathrow Airport', address: 'London Heathrow Airport, UK', latitude: 51.4700, longitude: -0.4543, type: 'airport', country: 'United Kingdom', region: 'England', importance: 0.9 },
    { id: 'air_2', name: 'JFK Airport', address: 'John F. Kennedy International Airport, NY, USA', latitude: 40.6413, longitude: -73.7781, type: 'airport', country: 'United States', region: 'New York', importance: 0.85 },
    { id: 'air_3', name: 'Charles de Gaulle', address: 'Charles de Gaulle Airport, Paris, France', latitude: 49.0097, longitude: 2.5479, type: 'airport', country: 'France', region: 'Île-de-France', importance: 0.8 },
    { id: 'air_4', name: 'Narita Airport', address: 'Narita International Airport, Tokyo, Japan', latitude: 35.7720, longitude: 140.3929, type: 'airport', country: 'Japan', region: 'Kanto', importance: 0.8 },

    // Universities Worldwide
    { id: 'uni_1', name: 'Harvard University', address: 'Cambridge, MA, USA', latitude: 42.3770, longitude: -71.1167, type: 'university', country: 'United States', region: 'Massachusetts', importance: 0.8 },
    { id: 'uni_2', name: 'Oxford University', address: 'Oxford, England, UK', latitude: 51.7548, longitude: -1.2544, type: 'university', country: 'United Kingdom', region: 'England', importance: 0.8 },
    { id: 'uni_3', name: 'University of Alabama', address: 'Tuscaloosa, AL, USA', latitude: 33.2119, longitude: -87.5447, type: 'university', country: 'United States', region: 'Alabama', importance: 0.6 },

    // Famous Landmarks
    { id: 'land_1', name: 'Eiffel Tower', address: 'Paris, France', latitude: 48.8584, longitude: 2.2945, type: 'landmark', country: 'France', region: 'Île-de-France', importance: 0.9 },
    { id: 'land_2', name: 'Statue of Liberty', address: 'New York, NY, USA', latitude: 40.6892, longitude: -74.0445, type: 'landmark', country: 'United States', region: 'New York', importance: 0.85 },
    { id: 'land_3', name: 'Big Ben', address: 'London, England, UK', latitude: 51.4994, longitude: -0.1245, type: 'landmark', country: 'United Kingdom', region: 'England', importance: 0.8 },
    { id: 'land_4', name: 'Sydney Opera House', address: 'Sydney, NSW, Australia', latitude: -33.8568, longitude: 151.2153, type: 'landmark', country: 'Australia', region: 'New South Wales', importance: 0.8 },

    // Comprehensive US Cities (Top 100+)
    { id: 'us_100', name: 'Phoenix', address: 'Phoenix, Arizona, USA', latitude: 33.4484, longitude: -112.0740, type: 'city', country: 'United States', region: 'Arizona', importance: 0.8 },
    { id: 'us_101', name: 'Philadelphia', address: 'Philadelphia, Pennsylvania, USA', latitude: 39.9526, longitude: -75.1652, type: 'city', country: 'United States', region: 'Pennsylvania', importance: 0.8 },
    { id: 'us_102', name: 'San Antonio', address: 'San Antonio, Texas, USA', latitude: 29.4241, longitude: -98.4936, type: 'city', country: 'United States', region: 'Texas', importance: 0.75 },
    { id: 'us_103', name: 'San Diego', address: 'San Diego, California, USA', latitude: 32.7157, longitude: -117.1611, type: 'city', country: 'United States', region: 'California', importance: 0.75 },
    { id: 'us_104', name: 'Dallas', address: 'Dallas, Texas, USA', latitude: 32.7767, longitude: -96.7970, type: 'city', country: 'United States', region: 'Texas', importance: 0.75 },
    { id: 'us_105', name: 'San Jose', address: 'San Jose, California, USA', latitude: 37.3382, longitude: -121.8863, type: 'city', country: 'United States', region: 'California', importance: 0.7 },
    { id: 'us_106', name: 'Austin', address: 'Austin, Texas, USA', latitude: 30.2672, longitude: -97.7431, type: 'city', country: 'United States', region: 'Texas', importance: 0.7 },
    { id: 'us_107', name: 'Jacksonville', address: 'Jacksonville, Florida, USA', latitude: 30.3322, longitude: -81.6557, type: 'city', country: 'United States', region: 'Florida', importance: 0.65 },
    { id: 'us_108', name: 'Fort Worth', address: 'Fort Worth, Texas, USA', latitude: 32.7555, longitude: -97.3308, type: 'city', country: 'United States', region: 'Texas', importance: 0.65 },
    { id: 'us_109', name: 'Columbus', address: 'Columbus, Ohio, USA', latitude: 39.9612, longitude: -82.9988, type: 'city', country: 'United States', region: 'Ohio', importance: 0.65 },
    { id: 'us_110', name: 'Charlotte', address: 'Charlotte, North Carolina, USA', latitude: 35.2271, longitude: -80.8431, type: 'city', country: 'United States', region: 'North Carolina', importance: 0.65 },
    { id: 'us_111', name: 'San Francisco', address: 'San Francisco, California, USA', latitude: 37.7749, longitude: -122.4194, type: 'city', country: 'United States', region: 'California', importance: 0.85 },
    { id: 'us_112', name: 'Indianapolis', address: 'Indianapolis, Indiana, USA', latitude: 39.7684, longitude: -86.1581, type: 'city', country: 'United States', region: 'Indiana', importance: 0.6 },
    { id: 'us_113', name: 'Seattle', address: 'Seattle, Washington, USA', latitude: 47.6062, longitude: -122.3321, type: 'city', country: 'United States', region: 'Washington', importance: 0.75 },
    { id: 'us_114', name: 'Denver', address: 'Denver, Colorado, USA', latitude: 39.7392, longitude: -104.9903, type: 'city', country: 'United States', region: 'Colorado', importance: 0.7 },
    { id: 'us_115', name: 'Washington DC', address: 'Washington, District of Columbia, USA', latitude: 38.9072, longitude: -77.0369, type: 'city', country: 'United States', region: 'District of Columbia', importance: 0.9 },
    { id: 'us_116', name: 'Boston', address: 'Boston, Massachusetts, USA', latitude: 42.3601, longitude: -71.0589, type: 'city', country: 'United States', region: 'Massachusetts', importance: 0.8 },
    { id: 'us_117', name: 'El Paso', address: 'El Paso, Texas, USA', latitude: 31.7619, longitude: -106.4850, type: 'city', country: 'United States', region: 'Texas', importance: 0.6 },
    { id: 'us_118', name: 'Detroit', address: 'Detroit, Michigan, USA', latitude: 42.3314, longitude: -83.0458, type: 'city', country: 'United States', region: 'Michigan', importance: 0.7 },
    { id: 'us_119', name: 'Memphis', address: 'Memphis, Tennessee, USA', latitude: 35.1495, longitude: -90.0490, type: 'city', country: 'United States', region: 'Tennessee', importance: 0.6 },
    { id: 'us_120', name: 'Portland', address: 'Portland, Oregon, USA', latitude: 45.5152, longitude: -122.6784, type: 'city', country: 'United States', region: 'Oregon', importance: 0.65 },
    { id: 'us_121', name: 'Oklahoma City', address: 'Oklahoma City, Oklahoma, USA', latitude: 35.4676, longitude: -97.5164, type: 'city', country: 'United States', region: 'Oklahoma', importance: 0.6 },
    { id: 'us_122', name: 'Las Vegas', address: 'Las Vegas, Nevada, USA', latitude: 36.1699, longitude: -115.1398, type: 'city', country: 'United States', region: 'Nevada', importance: 0.75 },
    { id: 'us_123', name: 'Louisville', address: 'Louisville, Kentucky, USA', latitude: 38.2527, longitude: -85.7585, type: 'city', country: 'United States', region: 'Kentucky', importance: 0.6 },
    { id: 'us_124', name: 'Baltimore', address: 'Baltimore, Maryland, USA', latitude: 39.2904, longitude: -76.6122, type: 'city', country: 'United States', region: 'Maryland', importance: 0.65 },
    { id: 'us_125', name: 'Milwaukee', address: 'Milwaukee, Wisconsin, USA', latitude: 43.0389, longitude: -87.9065, type: 'city', country: 'United States', region: 'Wisconsin', importance: 0.6 },

    // Major Indian Cities (Comprehensive)
    { id: 'in_1', name: 'Mumbai', address: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.95 },
    { id: 'in_2', name: 'Delhi', address: 'Delhi, India', latitude: 28.7041, longitude: 77.1025, type: 'city', country: 'India', region: 'Delhi', importance: 0.95 },
    { id: 'in_3', name: 'Bangalore', address: 'Bangalore, Karnataka, India', latitude: 12.9716, longitude: 77.5946, type: 'city', country: 'India', region: 'Karnataka', importance: 0.9 },
    { id: 'in_4', name: 'Hyderabad', address: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867, type: 'city', country: 'India', region: 'Telangana', importance: 0.85 },
    { id: 'in_5', name: 'Chennai', address: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, type: 'city', country: 'India', region: 'Tamil Nadu', importance: 0.85 },
    { id: 'in_6', name: 'Kolkata', address: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639, type: 'city', country: 'India', region: 'West Bengal', importance: 0.8 },
    { id: 'in_7', name: 'Pune', address: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.8 },
    { id: 'in_8', name: 'Ahmedabad', address: 'Ahmedabad, Gujarat, India', latitude: 23.0225, longitude: 72.5714, type: 'city', country: 'India', region: 'Gujarat', importance: 0.75 },
    { id: 'in_9', name: 'Jaipur', address: 'Jaipur, Rajasthan, India', latitude: 26.9124, longitude: 75.7873, type: 'city', country: 'India', region: 'Rajasthan', importance: 0.7 },
    { id: 'in_10', name: 'Surat', address: 'Surat, Gujarat, India', latitude: 21.1702, longitude: 72.8311, type: 'city', country: 'India', region: 'Gujarat', importance: 0.7 },
    { id: 'in_11', name: 'Lucknow', address: 'Lucknow, Uttar Pradesh, India', latitude: 26.8467, longitude: 80.9462, type: 'city', country: 'India', region: 'Uttar Pradesh', importance: 0.65 },
    { id: 'in_12', name: 'Kanpur', address: 'Kanpur, Uttar Pradesh, India', latitude: 26.4499, longitude: 80.3319, type: 'city', country: 'India', region: 'Uttar Pradesh', importance: 0.65 },
    { id: 'in_13', name: 'Nagpur', address: 'Nagpur, Maharashtra, India', latitude: 21.1458, longitude: 79.0882, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.6 },
    { id: 'in_14', name: 'Indore', address: 'Indore, Madhya Pradesh, India', latitude: 22.7196, longitude: 75.8577, type: 'city', country: 'India', region: 'Madhya Pradesh', importance: 0.6 },
    { id: 'in_15', name: 'Thane', address: 'Thane, Maharashtra, India', latitude: 19.2183, longitude: 72.9781, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.6 },
    { id: 'in_16', name: 'Bhopal', address: 'Bhopal, Madhya Pradesh, India', latitude: 23.2599, longitude: 77.4126, type: 'city', country: 'India', region: 'Madhya Pradesh', importance: 0.6 },
    { id: 'in_17', name: 'Visakhapatnam', address: 'Visakhapatnam, Andhra Pradesh, India', latitude: 17.6868, longitude: 83.2185, type: 'city', country: 'India', region: 'Andhra Pradesh', importance: 0.6 },
    { id: 'in_18', name: 'Pimpri-Chinchwad', address: 'Pimpri-Chinchwad, Maharashtra, India', latitude: 18.6298, longitude: 73.7997, type: 'city', country: 'India', region: 'Maharashtra', importance: 0.55 },
    { id: 'in_19', name: 'Patna', address: 'Patna, Bihar, India', latitude: 25.5941, longitude: 85.1376, type: 'city', country: 'India', region: 'Bihar', importance: 0.6 },
    { id: 'in_20', name: 'Vadodara', address: 'Vadodara, Gujarat, India', latitude: 22.3072, longitude: 73.1812, type: 'city', country: 'India', region: 'Gujarat', importance: 0.6 },

    // European Cities (Comprehensive)
    { id: 'eu_100', name: 'Barcelona', address: 'Barcelona, Catalonia, Spain', latitude: 41.3851, longitude: 2.1734, type: 'city', country: 'Spain', region: 'Catalonia', importance: 0.85 },
    { id: 'eu_101', name: 'Munich', address: 'Munich, Bavaria, Germany', latitude: 48.1351, longitude: 11.5820, type: 'city', country: 'Germany', region: 'Bavaria', importance: 0.8 },
    { id: 'eu_102', name: 'Milan', address: 'Milan, Lombardy, Italy', latitude: 45.4642, longitude: 9.1900, type: 'city', country: 'Italy', region: 'Lombardy', importance: 0.8 },
    { id: 'eu_103', name: 'Prague', address: 'Prague, Czech Republic', latitude: 50.0755, longitude: 14.4378, type: 'city', country: 'Czech Republic', region: 'Prague', importance: 0.75 },
    { id: 'eu_104', name: 'Warsaw', address: 'Warsaw, Masovian Voivodeship, Poland', latitude: 52.2297, longitude: 21.0122, type: 'city', country: 'Poland', region: 'Masovian', importance: 0.75 },
    { id: 'eu_105', name: 'Budapest', address: 'Budapest, Hungary', latitude: 47.4979, longitude: 19.0402, type: 'city', country: 'Hungary', region: 'Budapest', importance: 0.75 },
    { id: 'eu_106', name: 'Hamburg', address: 'Hamburg, Germany', latitude: 53.5511, longitude: 9.9937, type: 'city', country: 'Germany', region: 'Hamburg', importance: 0.7 },
    { id: 'eu_107', name: 'Brussels', address: 'Brussels, Belgium', latitude: 50.8503, longitude: 4.3517, type: 'city', country: 'Belgium', region: 'Brussels', importance: 0.75 },
    { id: 'eu_108', name: 'Copenhagen', address: 'Copenhagen, Capital Region, Denmark', latitude: 55.6761, longitude: 12.5683, type: 'city', country: 'Denmark', region: 'Capital Region', importance: 0.75 },
    { id: 'eu_109', name: 'Oslo', address: 'Oslo, Norway', latitude: 59.9139, longitude: 10.7522, type: 'city', country: 'Norway', region: 'Oslo', importance: 0.7 },
    { id: 'eu_110', name: 'Helsinki', address: 'Helsinki, Uusimaa, Finland', latitude: 60.1699, longitude: 24.9384, type: 'city', country: 'Finland', region: 'Uusimaa', importance: 0.7 },
    { id: 'eu_111', name: 'Dublin', address: 'Dublin, Leinster, Ireland', latitude: 53.3498, longitude: -6.2603, type: 'city', country: 'Ireland', region: 'Leinster', importance: 0.75 },
    { id: 'eu_112', name: 'Zurich', address: 'Zurich, Switzerland', latitude: 47.3769, longitude: 8.5417, type: 'city', country: 'Switzerland', region: 'Zurich', importance: 0.8 },
    { id: 'eu_113', name: 'Lisbon', address: 'Lisbon, Portugal', latitude: 38.7223, longitude: -9.1393, type: 'city', country: 'Portugal', region: 'Lisbon', importance: 0.75 },
    { id: 'eu_114', name: 'Athens', address: 'Athens, Attica, Greece', latitude: 37.9838, longitude: 23.7275, type: 'city', country: 'Greece', region: 'Attica', importance: 0.75 }
  ];

  // Enhanced global search algorithm
  const searchTerms = query.toLowerCase().split(' ');
  const results = globalLocationDatabase.filter(location => {
    const searchableText = `${location.name} ${location.address} ${location.type} ${location.country} ${location.region}`.toLowerCase();

    // Check if all search terms are found
    return searchTerms.every(term => searchableText.includes(term)) ||
           // Or if the name starts with the query
           location.name.toLowerCase().startsWith(query.toLowerCase()) ||
           // Or if any word in the name starts with the query
           location.name.toLowerCase().split(' ').some(word => word.startsWith(query.toLowerCase())) ||
           // Or if country/region matches
           (location.country && location.country.toLowerCase().includes(query.toLowerCase())) ||
           (location.region && location.region.toLowerCase().includes(query.toLowerCase()));
  });

  // Sort results by relevance and importance
  const sortedResults = results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact matches first
    if (aName === queryLower) return -1;
    if (bName === queryLower) return 1;

    // Starts with query
    if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1;
    if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1;

    // Sort by importance (higher importance first)
    const importanceDiff = (b.importance || 0) - (a.importance || 0);
    if (importanceDiff !== 0) return importanceDiff;

    // Shorter names first (more specific)
    return aName.length - bName.length;
  });

  return sortedResults.slice(0, 15); // Return top 15 results like Uber/Ola
}



export default function LocationSearch({
  onLocationSelect,
  onCurrentLocation,
  onLocationPin,
  placeholder = "Search anywhere in the world...",
  className = ''
}: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Handle search with debouncing
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (query.trim().length < 1) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await geocodeLocation(query);
        setResults(searchResults);
        setIsOpen(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 150);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleLocationSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.name);
    setIsOpen(false);
    setSelectedIndex(-1);
    onLocationSelect(location);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleCurrentLocation = () => {
    if (onCurrentLocation) {
      onCurrentLocation();
      setQuery('Current Location');
      setIsOpen(false);
    }
  };

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'city':
        return '🏙️';
      case 'university':
        return '🎓';
      case 'hospital':
        return '🏥';
      case 'airport':
        return '✈️';
      case 'stadium':
        return '🏟️';
      case 'landmark':
        return '🗿';
      case 'shopping':
        return '🛍️';
      case 'government':
        return '🏛️';
      case 'park':
        return '🌳';
      case 'location':
        return '📍';
      default:
        return '🌍';
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0 || query.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm shadow-sm hover:shadow-md transition-shadow duration-200 placeholder-gray-500 text-gray-900"
        />

        <div className="absolute inset-y-0 right-0 flex items-center">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 mr-1 text-gray-400 hover:text-gray-600 rounded"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {onCurrentLocation && (
            <button
              onClick={handleCurrentLocation}
              className="p-2 mr-1 text-gray-400 hover:text-blue-600 rounded"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>

        {isLoading && (
          <div className="absolute inset-y-0 right-12 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-auto">
          {/* Current Location Option */}
          {onCurrentLocation && (
            <div className="border-b border-gray-100">
              <button
                onClick={handleCurrentLocation}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <Navigation className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-blue-600">
                      Use current location
                    </div>
                    <div className="text-xs text-gray-500">
                      Get your precise location
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {results.length > 0 ? (
            <ul className="py-1">
              {results.map((result, index) => (
                <li key={result.id}>
                  <div className={`flex items-center hover:bg-gray-50 focus-within:bg-gray-50 transition-colors ${
                      index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}>
                    <button
                      onClick={() => handleLocationSelect(result)}
                      className="flex-1 px-4 py-3 text-left focus:outline-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                          <span className="text-base">
                            {getLocationIcon(result.type)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {result.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {result.address}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {result.type && (
                              <div className="text-xs text-blue-600 capitalize font-medium">
                                {result.type.replace('_', ' ')}
                              </div>
                            )}
                            {result.country && (
                              <div className="text-xs text-gray-400">
                                {result.country}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Pin Button */}
                    {onLocationPin && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLocationPin(result);
                        }}
                        className="px-3 py-3 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors focus:outline-none focus:text-red-500"
                        title="Pin this location"
                      >
                        📌
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-gray-500">
              No locations found for &quot;{query}&quot;
            </div>
          )}

          {/* Footer with helpful text */}
          <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>🌍 Global coverage - Search anywhere worldwide</span>
              <div className="flex items-center space-x-1">
                <span>Powered by</span>
                <span className="font-medium text-blue-600">OpenStreetMap</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Comprehensive database search function
async function searchWithComprehensiveDatabase(query: string): Promise<LocationResult[]> {
  // Use the existing global mock data function but enhance it
  return await searchWithGlobalMockData(query);
}

// Points of Interest search function
async function searchPointsOfInterest(query: string): Promise<LocationResult[]> {
  const normalizedQuery = query.toLowerCase().trim();
  const results: LocationResult[] = [];

  // Famous landmarks and POIs
  const landmarks = [
    // Iconic landmarks
    { name: "Eiffel Tower", address: "Champ de Mars, 5 Avenue Anatole France, 75007 Paris, France", lat: 48.8584, lng: 2.2945, type: "landmark", country: "France", region: "Île-de-France" },
    { name: "Statue of Liberty", address: "Liberty Island, New York, NY 10004, USA", lat: 40.6892, lng: -74.0445, type: "landmark", country: "United States", region: "New York" },
    { name: "Big Ben", address: "Westminster, London SW1A 0AA, UK", lat: 51.4994, lng: -0.1245, type: "landmark", country: "United Kingdom", region: "England" },
    { name: "Sydney Opera House", address: "Bennelong Point, Sydney NSW 2000, Australia", lat: -33.8568, lng: 151.2153, type: "landmark", country: "Australia", region: "New South Wales" },
    { name: "Taj Mahal", address: "Dharmapuri, Forest Colony, Tajganj, Agra, Uttar Pradesh 282001, India", lat: 27.1751, lng: 78.0421, type: "landmark", country: "India", region: "Uttar Pradesh" },
    { name: "Colosseum", address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy", lat: 41.8902, lng: 12.4922, type: "landmark", country: "Italy", region: "Lazio" },
    { name: "Machu Picchu", address: "08680, Peru", lat: -13.1631, lng: -72.5450, type: "landmark", country: "Peru", region: "Cusco" },
    { name: "Great Wall of China", address: "Huairou, China", lat: 40.4319, lng: 116.5704, type: "landmark", country: "China", region: "Beijing" },
    { name: "Christ the Redeemer", address: "Parque Nacional da Tijuca - Alto da Boa Vista, Rio de Janeiro - RJ, Brazil", lat: -22.9519, lng: -43.2105, type: "landmark", country: "Brazil", region: "Rio de Janeiro" },
    { name: "Burj Khalifa", address: "1 Sheikh Mohammed bin Rashid Blvd - Downtown Dubai - Dubai - United Arab Emirates", lat: 25.1972, lng: 55.2744, type: "landmark", country: "United Arab Emirates", region: "Dubai" },

    // Airports
    { name: "John F. Kennedy International Airport", address: "Queens, NY 11430, USA", lat: 40.6413, lng: -73.7781, type: "airport", country: "United States", region: "New York" },
    { name: "Los Angeles International Airport", address: "1 World Way, Los Angeles, CA 90045, USA", lat: 33.9425, lng: -118.4081, type: "airport", country: "United States", region: "California" },
    { name: "Heathrow Airport", address: "Longford TW6, UK", lat: 51.4700, lng: -0.4543, type: "airport", country: "United Kingdom", region: "England" },
    { name: "Charles de Gaulle Airport", address: "95700 Roissy-en-France, France", lat: 49.0097, lng: 2.5479, type: "airport", country: "France", region: "Île-de-France" },
    { name: "Tokyo Haneda Airport", address: "3 Chome-3-2 Hanedakuko, Ota City, Tokyo 144-0041, Japan", lat: 35.5494, lng: 139.7798, type: "airport", country: "Japan", region: "Tokyo" },
    { name: "Dubai International Airport", address: "Garhoud - Dubai - United Arab Emirates", lat: 25.2532, lng: 55.3657, type: "airport", country: "United Arab Emirates", region: "Dubai" },
    { name: "Singapore Changi Airport", address: "Airport Blvd, Singapore", lat: 1.3644, lng: 103.9915, type: "airport", country: "Singapore", region: "Singapore" },
    { name: "Frankfurt Airport", address: "60547 Frankfurt am Main, Germany", lat: 50.0379, lng: 8.5622, type: "airport", country: "Germany", region: "Hesse" },

    // Universities
    { name: "Harvard University", address: "Cambridge, MA 02138, USA", lat: 42.3770, lng: -71.1167, type: "university", country: "United States", region: "Massachusetts" },
    { name: "Stanford University", address: "Stanford, CA 94305, USA", lat: 37.4275, lng: -122.1697, type: "university", country: "United States", region: "California" },
    { name: "MIT", address: "77 Massachusetts Ave, Cambridge, MA 02139, USA", lat: 42.3601, lng: -71.0942, type: "university", country: "United States", region: "Massachusetts" },
    { name: "Oxford University", address: "Oxford OX1 2JD, UK", lat: 51.7548, lng: -1.2544, type: "university", country: "United Kingdom", region: "England" },
    { name: "Cambridge University", address: "Cambridge CB2 1TN, UK", lat: 52.2043, lng: 0.1149, type: "university", country: "United Kingdom", region: "England" },
    { name: "University of Tokyo", address: "7 Chome-3-1 Hongo, Bunkyo City, Tokyo 113-8654, Japan", lat: 35.7128, lng: 139.7627, type: "university", country: "Japan", region: "Tokyo" },

    // Shopping centers
    { name: "Times Square", address: "Manhattan, NY 10036, USA", lat: 40.7580, lng: -73.9855, type: "shopping", country: "United States", region: "New York" },
    { name: "Oxford Street", address: "Oxford St, London, UK", lat: 51.5154, lng: -0.1447, type: "shopping", country: "United Kingdom", region: "England" },
    { name: "Champs-Élysées", address: "Av. des Champs-Élysées, Paris, France", lat: 48.8698, lng: 2.3076, type: "shopping", country: "France", region: "Île-de-France" },
    { name: "Shibuya Crossing", address: "Shibuya City, Tokyo, Japan", lat: 35.6598, lng: 139.7006, type: "shopping", country: "Japan", region: "Tokyo" },
    { name: "Dubai Mall", address: "Downtown Dubai - Dubai - United Arab Emirates", lat: 25.1975, lng: 55.2796, type: "shopping", country: "United Arab Emirates", region: "Dubai" },

    // Beaches
    { name: "Bondi Beach", address: "Bondi Beach NSW 2026, Australia", lat: -33.8915, lng: 151.2767, type: "beach", country: "Australia", region: "New South Wales" },
    { name: "Waikiki Beach", address: "Honolulu, HI 96815, USA", lat: 21.2793, lng: -157.8311, type: "beach", country: "United States", region: "Hawaii" },
    { name: "Copacabana Beach", address: "Copacabana, Rio de Janeiro - RJ, Brazil", lat: -22.9711, lng: -43.1822, type: "beach", country: "Brazil", region: "Rio de Janeiro" },
    { name: "Miami Beach", address: "Miami Beach, FL, USA", lat: 25.7907, lng: -80.1300, type: "beach", country: "United States", region: "Florida" },

    // Parks
    { name: "Central Park", address: "New York, NY, USA", lat: 40.7829, lng: -73.9654, type: "park", country: "United States", region: "New York" },
    { name: "Hyde Park", address: "London W2 2UH, UK", lat: 51.5073, lng: -0.1657, type: "park", country: "United Kingdom", region: "England" },
    { name: "Golden Gate Park", address: "San Francisco, CA, USA", lat: 37.7694, lng: -122.4862, type: "park", country: "United States", region: "California" },
    { name: "Ueno Park", address: "Ueno, Taito City, Tokyo 110-0007, Japan", lat: 35.7148, lng: 139.7731, type: "park", country: "Japan", region: "Tokyo" }
  ];

  // Search through landmarks
  landmarks.forEach(landmark => {
    if (landmark.name.toLowerCase().includes(normalizedQuery) ||
        landmark.address.toLowerCase().includes(normalizedQuery) ||
        landmark.type.toLowerCase().includes(normalizedQuery)) {
      results.push({
        id: `poi-${landmark.name.replace(/\s+/g, '-').toLowerCase()}`,
        name: landmark.name,
        address: landmark.address,
        latitude: landmark.lat,
        longitude: landmark.lng,
        type: landmark.type,
        country: landmark.country,
        region: landmark.region,
        importance: 0.8
      });
    }
  });

  return results.slice(0, 10); // Return top 10 POI matches
}

// Remove duplicate locations
function removeDuplicateLocations(locations: LocationResult[]): LocationResult[] {
  const seen = new Set<string>();
  return locations.filter(location => {
    const key = `${location.latitude.toFixed(4)},${location.longitude.toFixed(4)}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Sort locations by relevance
function sortLocationsByRelevance(locations: LocationResult[], query: string): LocationResult[] {
  const normalizedQuery = query.toLowerCase().trim();

  return locations.sort((a, b) => {
    // Calculate relevance score
    const scoreA = calculateRelevanceScore(a, normalizedQuery);
    const scoreB = calculateRelevanceScore(b, normalizedQuery);

    return scoreB - scoreA; // Sort in descending order
  });
}

// Calculate relevance score for a location
function calculateRelevanceScore(location: LocationResult, query: string): number {
  let score = 0;

  // Exact name match gets highest score
  if (location.name.toLowerCase() === query) {
    score += 100;
  }

  // Name starts with query
  if (location.name.toLowerCase().startsWith(query)) {
    score += 50;
  }

  // Name contains query
  if (location.name.toLowerCase().includes(query)) {
    score += 25;
  }

  // Address contains query
  if (location.address.toLowerCase().includes(query)) {
    score += 15;
  }

  // Country/region contains query
  if (location.country?.toLowerCase().includes(query) ||
      location.region?.toLowerCase().includes(query)) {
    score += 10;
  }

  // Add importance factor
  score += (location.importance || 0) * 20;

  return score;
}
