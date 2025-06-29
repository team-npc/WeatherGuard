'use client';

import { Search, MapPin, Navigation, X } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
}

interface SimpleLocationSearchProps {
  onLocationSelect: (location: LocationResult) => void;
  onCurrentLocation?: () => void;
  onLocationPin?: (location: LocationResult) => void;
  placeholder?: string;
  className?: string;
}

export default function SimpleLocationSearch({
  onLocationSelect,
  onCurrentLocation,
  onLocationPin,
  placeholder = "Search anywhere in the world...",
  className = ''
}: SimpleLocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock search function
  const searchLocations = async (searchQuery: string): Promise<LocationResult[]> => {
    if (!searchQuery.trim()) return [];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Mock results
    const mockResults: LocationResult[] = [
      {
        id: '1',
        name: 'New York City',
        address: 'New York, NY, USA',
        latitude: 40.7128,
        longitude: -74.0060,
        type: 'city'
      },
      {
        id: '2',
        name: 'Los Angeles',
        address: 'Los Angeles, CA, USA',
        latitude: 34.0522,
        longitude: -118.2437,
        type: 'city'
      },
      {
        id: '3',
        name: 'London',
        address: 'London, UK',
        latitude: 51.5074,
        longitude: -0.1278,
        type: 'city'
      },
      {
        id: '4',
        name: 'Tokyo',
        address: 'Tokyo, Japan',
        latitude: 35.6762,
        longitude: 139.6503,
        type: 'city'
      },
      {
        id: '5',
        name: 'Paris',
        address: 'Paris, France',
        latitude: 48.8566,
        longitude: 2.3522,
        type: 'city'
      }
    ];

    return mockResults.filter(location => 
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length > 0) {
        setIsLoading(true);
        try {
          const searchResults = await searchLocations(query);
          setResults(searchResults);
          setIsOpen(searchResults.length > 0);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
          setIsOpen(false);
        } finally {
          setIsLoading(false);
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
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationSelect = (location: LocationResult) => {
    setQuery(location.name);
    setIsOpen(false);
    onLocationSelect(location);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleCurrentLocation = () => {
    if (onCurrentLocation) {
      onCurrentLocation();
      setQuery('Current Location');
      setIsOpen(false);
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
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
        />

        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {query && (
            <button
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {onCurrentLocation && (
            <button
              onClick={handleCurrentLocation}
              className="p-1 text-blue-600 hover:text-blue-700 rounded"
              title="Use current location"
            >
              <Navigation className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Results dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <div className="mt-2">Searching...</div>
            </div>
          ) : results.length > 0 ? (
            <ul className="py-2">
              {results.map((result) => (
                <li key={result.id}>
                  <div className="flex items-center hover:bg-gray-50">
                    <button
                      onClick={() => handleLocationSelect(result)}
                      className="flex-1 px-4 py-3 text-left focus:outline-none"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-5 h-5 flex items-center justify-center mt-0.5">
                          <span className="text-base">🌍</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate text-sm">
                            {result.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate mt-0.5">
                            {result.address}
                          </div>
                        </div>
                        <MapPin className="h-3 w-3 text-gray-400 mt-1 flex-shrink-0" />
                      </div>
                    </button>
                    
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
            <div className="p-4 text-center text-gray-500">
              No locations found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
