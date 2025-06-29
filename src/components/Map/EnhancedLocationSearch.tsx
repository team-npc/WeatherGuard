'use client';

import { MapPin, Navigation, Search, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  country: string;
  state?: string;
  city?: string;
  description?: string;
  icon?: string;
}

interface EnhancedLocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  onCurrentLocation?: () => void;
  placeholder?: string;
  className?: string;
}

export default function EnhancedLocationSearch({
  onLocationSelect,
  onCurrentLocation,
  placeholder = "Search anywhere in the world...",
  className = ''
}: EnhancedLocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Comprehensive global location database with detailed information
  const globalLocations: LocationResult[] = [
    // Indian States and Cities - Comprehensive
    { id: 'india', name: 'India', address: 'Republic of India', latitude: 20.5937, longitude: 78.9629, type: 'country', country: 'India', description: 'South Asian country with rich cultural heritage', icon: '🇮🇳' },

    // Indian States
    { id: 'tamil-nadu', name: 'Tamil Nadu', address: 'Tamil Nadu, India', latitude: 11.1271, longitude: 78.6569, type: 'state', country: 'India', state: 'Tamil Nadu', description: 'South Indian state known for temples, culture, and classical arts', icon: '🏛️' },
    { id: 'telangana', name: 'Telangana', address: 'Telangana, India', latitude: 18.1124, longitude: 79.0193, type: 'state', country: 'India', state: 'Telangana', description: 'IT hub state with rich history and culture', icon: '💻' },
    { id: 'karnataka', name: 'Karnataka', address: 'Karnataka, India', latitude: 15.3173, longitude: 75.7139, type: 'state', country: 'India', state: 'Karnataka', description: 'Garden state of India, tech capital', icon: '🌸' },
    { id: 'maharashtra', name: 'Maharashtra', address: 'Maharashtra, India', latitude: 19.7515, longitude: 75.7139, type: 'state', country: 'India', state: 'Maharashtra', description: 'Financial powerhouse of India', icon: '🏦' },
    { id: 'kerala', name: 'Kerala', address: 'Kerala, India', latitude: 10.8505, longitude: 76.2711, type: 'state', country: 'India', state: 'Kerala', description: 'Gods Own Country, backwaters and spices', icon: '🌴' },
    { id: 'rajasthan', name: 'Rajasthan', address: 'Rajasthan, India', latitude: 27.0238, longitude: 74.2179, type: 'state', country: 'India', state: 'Rajasthan', description: 'Land of Kings, deserts and palaces', icon: '🏰' },
    { id: 'gujarat', name: 'Gujarat', address: 'Gujarat, India', latitude: 22.2587, longitude: 71.1924, type: 'state', country: 'India', state: 'Gujarat', description: 'Vibrant state, business hub', icon: '🏭' },
    { id: 'west-bengal', name: 'West Bengal', address: 'West Bengal, India', latitude: 22.9868, longitude: 87.8550, type: 'state', country: 'India', state: 'West Bengal', description: 'Cultural capital region', icon: '🎭' },
    { id: 'uttar-pradesh', name: 'Uttar Pradesh', address: 'Uttar Pradesh, India', latitude: 26.8467, longitude: 80.9462, type: 'state', country: 'India', state: 'Uttar Pradesh', description: 'Most populous state, historical significance', icon: '🕌' },
    { id: 'punjab', name: 'Punjab', address: 'Punjab, India', latitude: 31.1471, longitude: 75.3412, type: 'state', country: 'India', state: 'Punjab', description: 'Land of five rivers, agricultural hub', icon: '🌾' },

    // Major Indian Cities
    { id: 'chennai', name: 'Chennai', address: 'Chennai, Tamil Nadu, India', latitude: 13.0827, longitude: 80.2707, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Chennai', description: 'Capital of Tamil Nadu, Detroit of India, major port city', icon: '🏙️' },
    { id: 'hyderabad', name: 'Hyderabad', address: 'Hyderabad, Telangana, India', latitude: 17.3850, longitude: 78.4867, type: 'city', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'City of Pearls, Cyberabad, IT hub of India', icon: '💎' },
    { id: 'bangalore', name: 'Bangalore', address: 'Bangalore, Karnataka, India', latitude: 12.9716, longitude: 77.5946, type: 'city', country: 'India', state: 'Karnataka', city: 'Bangalore', description: 'Silicon Valley of India, Garden City', icon: '💻' },
    { id: 'mumbai', name: 'Mumbai', address: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, type: 'city', country: 'India', state: 'Maharashtra', city: 'Mumbai', description: 'Financial capital of India, Bollywood hub', icon: '🏦' },
    { id: 'delhi', name: 'New Delhi', address: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090, type: 'city', country: 'India', state: 'Delhi', city: 'New Delhi', description: 'Capital of India, political center', icon: '🏛️' },
    { id: 'kolkata', name: 'Kolkata', address: 'Kolkata, West Bengal, India', latitude: 22.5726, longitude: 88.3639, type: 'city', country: 'India', state: 'West Bengal', city: 'Kolkata', description: 'Cultural capital of India, City of Joy', icon: '🎭' },
    { id: 'pune', name: 'Pune', address: 'Pune, Maharashtra, India', latitude: 18.5204, longitude: 73.8567, type: 'city', country: 'India', state: 'Maharashtra', city: 'Pune', description: 'Oxford of the East, IT and education hub', icon: '🎓' },
    { id: 'ahmedabad', name: 'Ahmedabad', address: 'Ahmedabad, Gujarat, India', latitude: 23.0225, longitude: 72.5714, type: 'city', country: 'India', state: 'Gujarat', city: 'Ahmedabad', description: 'Commercial capital of Gujarat', icon: '🏭' },
    { id: 'jaipur', name: 'Jaipur', address: 'Jaipur, Rajasthan, India', latitude: 26.9124, longitude: 75.7873, type: 'city', country: 'India', state: 'Rajasthan', city: 'Jaipur', description: 'Pink City, royal heritage', icon: '🏰' },
    { id: 'kochi', name: 'Kochi', address: 'Kochi, Kerala, India', latitude: 9.9312, longitude: 76.2673, type: 'city', country: 'India', state: 'Kerala', city: 'Kochi', description: 'Queen of Arabian Sea, spice port', icon: '🌊' },
    { id: 'coimbatore', name: 'Coimbatore', address: 'Coimbatore, Tamil Nadu, India', latitude: 11.0168, longitude: 76.9558, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Coimbatore', description: 'Manchester of South India, textile hub', icon: '🏭' },
    { id: 'madurai', name: 'Madurai', address: 'Madurai, Tamil Nadu, India', latitude: 9.9252, longitude: 78.1198, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Madurai', description: 'Temple city, cultural heritage', icon: '🕌' },
    { id: 'trichy', name: 'Tiruchirappalli', address: 'Tiruchirappalli, Tamil Nadu, India', latitude: 10.7905, longitude: 78.7047, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Tiruchirappalli', description: 'Rock Fort city, educational hub', icon: '🏛️' },
    { id: 'salem', name: 'Salem', address: 'Salem, Tamil Nadu, India', latitude: 11.6643, longitude: 78.1460, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Salem', description: 'Steel city, mango hub', icon: '🥭' },
    { id: 'tirunelveli', name: 'Tirunelveli', address: 'Tirunelveli, Tamil Nadu, India', latitude: 8.7139, longitude: 77.7567, type: 'city', country: 'India', state: 'Tamil Nadu', city: 'Tirunelveli', description: 'Rice bowl of Tamil Nadu', icon: '🌾' },

    // Hyderabad specific locations
    { id: 'hitech-city', name: 'HITEC City', address: 'HITEC City, Hyderabad, Telangana, India', latitude: 17.4435, longitude: 78.3772, type: 'area', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'IT and financial district', icon: '🏢' },
    { id: 'charminar', name: 'Charminar', address: 'Charminar, Hyderabad, Telangana, India', latitude: 17.3616, longitude: 78.4747, type: 'landmark', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Historic monument and mosque', icon: '🕌' },
    { id: 'gachibowli', name: 'Gachibowli', address: 'Gachibowli, Hyderabad, Telangana, India', latitude: 17.4399, longitude: 78.3489, type: 'area', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'IT hub and business district', icon: '💼' },
    { id: 'madhapur', name: 'Madhapur', address: 'Madhapur, Hyderabad, Telangana, India', latitude: 17.4474, longitude: 78.3914, type: 'area', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Technology corridor', icon: '🖥️' },
    { id: 'banjara-hills', name: 'Banjara Hills', address: 'Banjara Hills, Hyderabad, Telangana, India', latitude: 17.4126, longitude: 78.4482, type: 'area', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Upscale residential area', icon: '🏘️' },

    // Tamil Nadu specific locations
    { id: 'tn-open-university', name: 'Tamil Nadu Open University', address: 'opposite Sai Hospital, Chitrapuri Colony, Hyderabad, Telangana, India', latitude: 17.4065, longitude: 78.4772, type: 'university', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Distance education university', icon: '🎓' },
    { id: 'sai-aishwarya-layout', name: 'Sai Aishwarya Layout', address: 'Sai Aishwarya Layout, Chitrapuri Colony, Hyderabad, Telangana, India', latitude: 17.4058, longitude: 78.4765, type: 'area', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Residential layout', icon: '🏠' },
    { id: 'tn-mercantile-bank', name: 'Tamil Nadu Mercantile Bank', address: 'See locations', latitude: 17.4072, longitude: 78.4758, type: 'bank', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Banking services', icon: '🏦' },
    { id: 'tamilnad-mercantile-rikab', name: 'Tamilnad Mercantile Bank - Rikab Gunj', address: 'Rikab Gunj, Hyderabad, Telangana, India', latitude: 17.3845, longitude: 78.4563, type: 'bank', country: 'India', state: 'Telangana', city: 'Hyderabad', description: 'Bank branch in Rikab Gunj', icon: '🏦' },

    // Global Countries
    { id: 'usa', name: 'United States', address: 'United States of America', latitude: 39.8283, longitude: -98.5795, type: 'country', country: 'United States', description: 'Land of the free, home of the brave', icon: '🇺🇸' },
    { id: 'canada', name: 'Canada', address: 'Canada', latitude: 56.1304, longitude: -106.3468, type: 'country', country: 'Canada', description: 'The Great White North', icon: '🇨🇦' },
    { id: 'uk', name: 'United Kingdom', address: 'United Kingdom', latitude: 55.3781, longitude: -3.4360, type: 'country', country: 'United Kingdom', description: 'Historic island nation', icon: '🇬🇧' },
    { id: 'france', name: 'France', address: 'France', latitude: 46.2276, longitude: 2.2137, type: 'country', country: 'France', description: 'Republic of art and culture', icon: '🇫🇷' },
    { id: 'germany', name: 'Germany', address: 'Germany', latitude: 51.1657, longitude: 10.4515, type: 'country', country: 'Germany', description: 'Heart of Europe', icon: '🇩🇪' },
    { id: 'japan', name: 'Japan', address: 'Japan', latitude: 36.2048, longitude: 138.2529, type: 'country', country: 'Japan', description: 'Land of the rising sun', icon: '🇯🇵' },
    { id: 'australia', name: 'Australia', address: 'Australia', latitude: -25.2744, longitude: 133.7751, type: 'country', country: 'Australia', description: 'Down under continent', icon: '🇦🇺' },
    { id: 'china', name: 'China', address: 'Peoples Republic of China', latitude: 35.8617, longitude: 104.1954, type: 'country', country: 'China', description: 'Most populous country', icon: '🇨🇳' },
    { id: 'brazil', name: 'Brazil', address: 'Brazil', latitude: -14.2350, longitude: -51.9253, type: 'country', country: 'Brazil', description: 'Largest South American country', icon: '🇧🇷' },
    { id: 'russia', name: 'Russia', address: 'Russian Federation', latitude: 61.5240, longitude: 105.3188, type: 'country', country: 'Russia', description: 'Largest country by land area', icon: '🇷🇺' },

    // Major Cities - USA
    { id: 'nyc', name: 'New York City', address: 'New York, NY, USA', latitude: 40.7128, longitude: -74.0060, type: 'city', country: 'United States', state: 'New York', city: 'New York City', description: 'The most populous city in the United States, Big Apple', icon: '🏙️' },
    { id: 'la', name: 'Los Angeles', address: 'Los Angeles, CA, USA', latitude: 34.0522, longitude: -118.2437, type: 'city', country: 'United States', state: 'California', city: 'Los Angeles', description: 'City of Angels, entertainment capital of the world', icon: '🌴' },
    { id: 'chicago', name: 'Chicago', address: 'Chicago, IL, USA', latitude: 41.8781, longitude: -87.6298, type: 'city', country: 'United States', state: 'Illinois', city: 'Chicago', description: 'The Windy City, architectural marvels', icon: '🏙️' },
    { id: 'houston', name: 'Houston', address: 'Houston, TX, USA', latitude: 29.7604, longitude: -95.3698, type: 'city', country: 'United States', state: 'Texas', city: 'Houston', description: 'Space City, energy capital', icon: '🚀' },
    { id: 'phoenix', name: 'Phoenix', address: 'Phoenix, AZ, USA', latitude: 33.4484, longitude: -112.0740, type: 'city', country: 'United States', state: 'Arizona', city: 'Phoenix', description: 'Valley of the Sun', icon: '☀️' },
    { id: 'philadelphia', name: 'Philadelphia', address: 'Philadelphia, PA, USA', latitude: 39.9526, longitude: -75.1652, type: 'city', country: 'United States', state: 'Pennsylvania', city: 'Philadelphia', description: 'City of Brotherly Love', icon: '🔔' },
    { id: 'san-antonio', name: 'San Antonio', address: 'San Antonio, TX, USA', latitude: 29.4241, longitude: -98.4936, type: 'city', country: 'United States', state: 'Texas', city: 'San Antonio', description: 'Historic Texas city', icon: '🏛️' },
    { id: 'san-diego', name: 'San Diego', address: 'San Diego, CA, USA', latitude: 32.7157, longitude: -117.1611, type: 'city', country: 'United States', state: 'California', city: 'San Diego', description: 'Americas Finest City', icon: '🏖️' },
    { id: 'dallas', name: 'Dallas', address: 'Dallas, TX, USA', latitude: 32.7767, longitude: -96.7970, type: 'city', country: 'United States', state: 'Texas', city: 'Dallas', description: 'Big D, business hub', icon: '🏢' },
    { id: 'san-jose', name: 'San Jose', address: 'San Jose, CA, USA', latitude: 37.3382, longitude: -121.8863, type: 'city', country: 'United States', state: 'California', city: 'San Jose', description: 'Heart of Silicon Valley', icon: '💻' },

    // Major Cities - International
    { id: 'london', name: 'London', address: 'London, United Kingdom', latitude: 51.5074, longitude: -0.1278, type: 'city', country: 'United Kingdom', state: 'England', city: 'London', description: 'Historic capital of England, Big Ben, Thames', icon: '🏰' },
    { id: 'paris', name: 'Paris', address: 'Paris, France', latitude: 48.8566, longitude: 2.3522, type: 'city', country: 'France', state: 'Île-de-France', city: 'Paris', description: 'City of Light, romantic capital, Eiffel Tower', icon: '🗼' },
    { id: 'tokyo', name: 'Tokyo', address: 'Tokyo, Japan', latitude: 35.6762, longitude: 139.6503, type: 'city', country: 'Japan', state: 'Tokyo', city: 'Tokyo', description: 'Modern metropolis, tech capital, anime culture', icon: '🏯' },
    { id: 'sydney', name: 'Sydney', address: 'Sydney, NSW, Australia', latitude: -33.8688, longitude: 151.2093, type: 'city', country: 'Australia', state: 'New South Wales', city: 'Sydney', description: 'Harbor city with iconic opera house and bridge', icon: '🏛️' },
    { id: 'dubai', name: 'Dubai', address: 'Dubai, UAE', latitude: 25.2048, longitude: 55.2708, type: 'city', country: 'United Arab Emirates', state: 'Dubai', city: 'Dubai', description: 'Luxury destination, modern architecture, Burj Khalifa', icon: '🏗️' },
    { id: 'singapore', name: 'Singapore', address: 'Singapore', latitude: 1.3521, longitude: 103.8198, type: 'city', country: 'Singapore', city: 'Singapore', description: 'Garden city, financial hub of Asia', icon: '🌆' },
    { id: 'hong-kong', name: 'Hong Kong', address: 'Hong Kong', latitude: 22.3193, longitude: 114.1694, type: 'city', country: 'Hong Kong', city: 'Hong Kong', description: 'Pearl of the Orient, skyscrapers', icon: '🏙️' },
    { id: 'beijing', name: 'Beijing', address: 'Beijing, China', latitude: 39.9042, longitude: 116.4074, type: 'city', country: 'China', state: 'Beijing', city: 'Beijing', description: 'Capital of China, Forbidden City', icon: '🏛️' },
    { id: 'shanghai', name: 'Shanghai', address: 'Shanghai, China', latitude: 31.2304, longitude: 121.4737, type: 'city', country: 'China', state: 'Shanghai', city: 'Shanghai', description: 'Financial center, modern skyline', icon: '🏙️' },
    { id: 'moscow', name: 'Moscow', address: 'Moscow, Russia', latitude: 55.7558, longitude: 37.6176, type: 'city', country: 'Russia', state: 'Moscow', city: 'Moscow', description: 'Capital of Russia, Red Square', icon: '🏛️' },
    { id: 'istanbul', name: 'Istanbul', address: 'Istanbul, Turkey', latitude: 41.0082, longitude: 28.9784, type: 'city', country: 'Turkey', state: 'Istanbul', city: 'Istanbul', description: 'Bridge between Europe and Asia', icon: '🕌' },
    { id: 'rome', name: 'Rome', address: 'Rome, Italy', latitude: 41.9028, longitude: 12.4964, type: 'city', country: 'Italy', state: 'Lazio', city: 'Rome', description: 'Eternal City, Colosseum, Vatican', icon: '🏛️' },
    { id: 'barcelona', name: 'Barcelona', address: 'Barcelona, Spain', latitude: 41.3851, longitude: 2.1734, type: 'city', country: 'Spain', state: 'Catalonia', city: 'Barcelona', description: 'Gaudi architecture, Mediterranean coast', icon: '🏖️' },
    { id: 'amsterdam', name: 'Amsterdam', address: 'Amsterdam, Netherlands', latitude: 52.3676, longitude: 4.9041, type: 'city', country: 'Netherlands', state: 'North Holland', city: 'Amsterdam', description: 'Venice of the North, canals', icon: '🚲' },
    { id: 'berlin', name: 'Berlin', address: 'Berlin, Germany', latitude: 52.5200, longitude: 13.4050, type: 'city', country: 'Germany', state: 'Berlin', city: 'Berlin', description: 'Capital of Germany, Brandenburg Gate', icon: '🏛️' },
    { id: 'zurich', name: 'Zurich', address: 'Zurich, Switzerland', latitude: 47.3769, longitude: 8.5417, type: 'city', country: 'Switzerland', state: 'Zurich', city: 'Zurich', description: 'Financial center, Swiss Alps', icon: '🏔️' },
    { id: 'vienna', name: 'Vienna', address: 'Vienna, Austria', latitude: 48.2082, longitude: 16.3738, type: 'city', country: 'Austria', state: 'Vienna', city: 'Vienna', description: 'Imperial city, classical music', icon: '🎼' },
    { id: 'stockholm', name: 'Stockholm', address: 'Stockholm, Sweden', latitude: 59.3293, longitude: 18.0686, type: 'city', country: 'Sweden', state: 'Stockholm', city: 'Stockholm', description: 'Venice of the North, archipelago', icon: '🏰' },
    { id: 'oslo', name: 'Oslo', address: 'Oslo, Norway', latitude: 59.9139, longitude: 10.7522, type: 'city', country: 'Norway', state: 'Oslo', city: 'Oslo', description: 'Capital of Norway, fjords', icon: '🏔️' },
    { id: 'copenhagen', name: 'Copenhagen', address: 'Copenhagen, Denmark', latitude: 55.6761, longitude: 12.5683, type: 'city', country: 'Denmark', state: 'Capital Region', city: 'Copenhagen', description: 'Happiest city, Little Mermaid', icon: '🧜‍♀️' },
    
    // Countries
    { id: 'usa', name: 'United States', address: 'United States of America', latitude: 39.8283, longitude: -98.5795, type: 'country', country: 'United States', description: 'Land of the free, home of the brave', icon: '🇺🇸' },
    { id: 'canada', name: 'Canada', address: 'Canada', latitude: 56.1304, longitude: -106.3468, type: 'country', country: 'Canada', description: 'The Great White North', icon: '🇨🇦' },
    { id: 'uk', name: 'United Kingdom', address: 'United Kingdom', latitude: 55.3781, longitude: -3.4360, type: 'country', country: 'United Kingdom', description: 'Historic island nation', icon: '🇬🇧' },
    { id: 'france', name: 'France', address: 'France', latitude: 46.2276, longitude: 2.2137, type: 'country', country: 'France', description: 'Republic of art and culture', icon: '🇫🇷' },
    { id: 'germany', name: 'Germany', address: 'Germany', latitude: 51.1657, longitude: 10.4515, type: 'country', country: 'Germany', description: 'Heart of Europe', icon: '🇩🇪' },
    { id: 'japan', name: 'Japan', address: 'Japan', latitude: 36.2048, longitude: 138.2529, type: 'country', country: 'Japan', description: 'Land of the rising sun', icon: '🇯🇵' },
    { id: 'australia', name: 'Australia', address: 'Australia', latitude: -25.2744, longitude: 133.7751, type: 'country', country: 'Australia', description: 'Down under continent', icon: '🇦🇺' },
    
    // States/Provinces
    { id: 'california', name: 'California', address: 'California, USA', latitude: 36.7783, longitude: -119.4179, type: 'state', country: 'United States', state: 'California', description: 'Golden State, tech and entertainment hub', icon: '🌞' },
    { id: 'texas', name: 'Texas', address: 'Texas, USA', latitude: 31.9686, longitude: -99.9018, type: 'state', country: 'United States', state: 'Texas', description: 'Lone Star State, everything is bigger', icon: '⭐' },
    { id: 'florida', name: 'Florida', address: 'Florida, USA', latitude: 27.7663, longitude: -81.6868, type: 'state', country: 'United States', state: 'Florida', description: 'Sunshine State, tropical paradise', icon: '🌴' },
    { id: 'newyork', name: 'New York State', address: 'New York, USA', latitude: 42.1657, longitude: -74.9481, type: 'state', country: 'United States', state: 'New York', description: 'Empire State', icon: '🗽' },
    
    // Famous Landmarks
    { id: 'statue-liberty', name: 'Statue of Liberty', address: 'Liberty Island, NY, USA', latitude: 40.6892, longitude: -74.0445, type: 'landmark', country: 'United States', state: 'New York', description: 'Symbol of freedom and democracy', icon: '🗽' },
    { id: 'eiffel-tower', name: 'Eiffel Tower', address: 'Paris, France', latitude: 48.8584, longitude: 2.2945, type: 'landmark', country: 'France', state: 'Île-de-France', description: 'Iconic iron tower, symbol of Paris', icon: '🗼' },
    { id: 'big-ben', name: 'Big Ben', address: 'London, UK', latitude: 51.4994, longitude: -0.1245, type: 'landmark', country: 'United Kingdom', state: 'England', description: 'Famous clock tower in Westminster', icon: '🕰️' },
    { id: 'sydney-opera', name: 'Sydney Opera House', address: 'Sydney, NSW, Australia', latitude: -33.8568, longitude: 151.2153, type: 'landmark', country: 'Australia', state: 'New South Wales', description: 'Architectural masterpiece', icon: '🏛️' },
    
    // Airports
    { id: 'jfk', name: 'John F. Kennedy International Airport', address: 'Queens, NY, USA', latitude: 40.6413, longitude: -73.7781, type: 'airport', country: 'United States', state: 'New York', description: 'Major international gateway to NYC', icon: '✈️' },
    { id: 'lax', name: 'Los Angeles International Airport', address: 'Los Angeles, CA, USA', latitude: 33.9425, longitude: -118.4081, type: 'airport', country: 'United States', state: 'California', description: 'Primary airport serving LA', icon: '✈️' },
    { id: 'heathrow', name: 'London Heathrow Airport', address: 'London, UK', latitude: 51.4700, longitude: -0.4543, type: 'airport', country: 'United Kingdom', state: 'England', description: 'Busiest airport in Europe', icon: '✈️' },
  ];

  // Enhanced search function
  const searchLocations = async (searchQuery: string): Promise<LocationResult[]> => {
    if (!searchQuery.trim()) return [];
    
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // Filter and score results
    const filteredResults = globalLocations.filter(location => {
      return (
        location.name.toLowerCase().includes(normalizedQuery) ||
        location.address.toLowerCase().includes(normalizedQuery) ||
        location.country.toLowerCase().includes(normalizedQuery) ||
        location.state?.toLowerCase().includes(normalizedQuery) ||
        location.city?.toLowerCase().includes(normalizedQuery) ||
        location.description?.toLowerCase().includes(normalizedQuery)
      );
    });

    // Sort by relevance
    const sortedResults = filteredResults.sort((a, b) => {
      const aExact = a.name.toLowerCase() === normalizedQuery ? 100 : 0;
      const bExact = b.name.toLowerCase() === normalizedQuery ? 100 : 0;
      
      const aStarts = a.name.toLowerCase().startsWith(normalizedQuery) ? 50 : 0;
      const bStarts = b.name.toLowerCase().startsWith(normalizedQuery) ? 50 : 0;
      
      const aTypeScore = a.type === 'city' ? 30 : a.type === 'country' ? 20 : a.type === 'state' ? 25 : 10;
      const bTypeScore = b.type === 'city' ? 30 : b.type === 'country' ? 20 : b.type === 'state' ? 25 : 10;
      
      const aScore = aExact + aStarts + aTypeScore;
      const bScore = bExact + bStarts + bTypeScore;
      
      return bScore - aScore;
    });

    setIsLoading(false);
    return sortedResults.slice(0, 25); // Return top 25 results for comprehensive search
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 0) {
        try {
          const searchResults = await searchLocations(query);
          setResults(searchResults);
          setIsOpen(searchResults.length > 0);
          setSelectedIndex(-1);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
          setIsOpen(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
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
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'city': return '🏙️';
      case 'country': return '🌍';
      case 'state': return '📍';
      case 'landmark': return '🗿';
      case 'airport': return '✈️';
      default: return '📍';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'city': return 'City';
      case 'country': return 'Country';
      case 'state': return 'State';
      case 'area': return 'Area';
      case 'landmark': return 'Landmark';
      case 'airport': return 'Airport';
      case 'university': return 'University';
      case 'bank': return 'Bank';
      case 'hospital': return 'Hospital';
      case 'mall': return 'Shopping';
      default: return 'Place';
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
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white text-black placeholder-gray-500 font-normal text-sm"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {onCurrentLocation && (
            <button
              onClick={handleCurrentLocation}
              className="p-1 text-blue-600 hover:text-blue-700 rounded transition-colors"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Google Maps style Results dropdown - Larger size */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-2xl max-h-[500px] overflow-y-auto min-w-[500px] left-0">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2 text-sm">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <div className="py-1">
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleLocationSelect(result)}
                  className={`w-full px-5 py-4 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 flex items-center justify-center mt-0.5 flex-shrink-0 bg-gray-100 rounded-full">
                      <MapPin className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-black text-base leading-tight mb-1">
                        {result.name}
                      </div>
                      <div className="text-sm text-gray-700 leading-tight mb-1">
                        {result.address}
                      </div>
                      {result.description && (
                        <div className="text-xs text-gray-600 mt-1 leading-relaxed">
                          {result.description}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                          {getTypeLabel(result.type)}
                        </span>
                        <span className="text-xs text-blue-600 font-medium">
                          {result.country}
                        </span>
                        {result.state && result.state !== result.country && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-600">
                              {result.state}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end justify-start mt-0.5 flex-shrink-0">
                      <div className="text-2xl mb-1">
                        {result.icon || getTypeIcon(result.type)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              <div className="text-sm">No results found</div>
              <div className="text-xs text-gray-400 mt-1">Try a different search term</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
