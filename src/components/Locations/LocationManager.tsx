'use client';

import { LocationForm, LocationType, StaticLocation } from '@/types';
import {
    Building,
    Edit,
    Home,
    MapPin,
    Navigation,
    Plus,
    School,
    Star,
    Trash2,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface LocationManagerProps {
  userId: number;
  onLocationSelect?: (location: StaticLocation) => void;
  className?: string;
}

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: LocationForm) => void;
  editingLocation?: StaticLocation | null;
}

function LocationFormModal({ isOpen, onClose, onSave, editingLocation }: LocationFormModalProps) {
  const [formData, setFormData] = useState<LocationForm>({
    name: '',
    type: 'home',
    address: '',
    latitude: 0,
    longitude: 0,
    is_primary: false
  });

  const [isGeolocating, setIsGeolocating] = useState(false);

  useEffect(() => {
    if (editingLocation) {
      setFormData({
        name: editingLocation.name,
        type: editingLocation.type,
        address: editingLocation.address,
        latitude: editingLocation.latitude,
        longitude: editingLocation.longitude,
        is_primary: editingLocation.is_primary
      });
    } else {
      setFormData({
        name: '',
        type: 'home',
        address: '',
        latitude: 0,
        longitude: 0,
        is_primary: false
      });
    }
  }, [editingLocation, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGeolocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsGeolocating(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location. Please enter coordinates manually.');
          setIsGeolocating(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {editingLocation ? 'Edit Location' : 'Add New Location'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Home, Work, Mom's House"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LocationType }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="home">Home</option>
                <option value="work">Work</option>
                <option value="school">School</option>
                <option value="family">Family</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Full address"
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="33.2098"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="-87.5692"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isGeolocating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isGeolocating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Getting location...
                </>
              ) : (
                <>
                  <Navigation className="h-4 w-4" />
                  Use Current Location
                </>
              )}
            </button>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_primary"
                checked={formData.is_primary}
                onChange={(e) => setFormData(prev => ({ ...prev, is_primary: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                Set as primary location for this type
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingLocation ? 'Update' : 'Add'} Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LocationManager({ userId, onLocationSelect, className = '' }: LocationManagerProps) {
  const [locations, setLocations] = useState<StaticLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StaticLocation | null>(null);
  const [isLocationSharingEnabled, setIsLocationSharingEnabled] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);

  useEffect(() => {
    loadLocations();
  }, [userId]);

  const loadLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/locations/static/user/${userId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLocations(result.data);
        }
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLocation = async (locationData: LocationForm) => {
    try {
      // In a real implementation, this would make an API call
      const newLocation: StaticLocation = {
        id: Date.now(), // Mock ID
        user_id: userId,
        ...locationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editingLocation) {
        setLocations(prev => prev.map(loc => 
          loc.id === editingLocation.id ? { ...newLocation, id: editingLocation.id } : loc
        ));
      } else {
        setLocations(prev => [...prev, newLocation]);
      }
      
      setEditingLocation(null);
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  const handleDeleteLocation = async (locationId: number) => {
    if (confirm('Are you sure you want to delete this location?')) {
      setLocations(prev => prev.filter(loc => loc.id !== locationId));
    }
  };

  const getLocationIcon = (type: LocationType) => {
    switch (type) {
      case 'home': return <Home className="h-5 w-5" />;
      case 'work': return <Building className="h-5 w-5" />;
      case 'school': return <School className="h-5 w-5" />;
      case 'family': return <Users className="h-5 w-5" />;
      default: return <MapPin className="h-5 w-5" />;
    }
  };

  const getLocationColor = (type: LocationType) => {
    switch (type) {
      case 'home': return 'text-blue-600 bg-blue-100';
      case 'work': return 'text-green-600 bg-green-100';
      case 'school': return 'text-purple-600 bg-purple-100';
      case 'family': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Saved Locations</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Location
          </button>
        </div>

        {/* Global Location Sharing Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Live Location Sharing</h3>
                <p className="text-sm text-gray-600">Share your location with family and friends</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLocationSharingEnabled ? (
                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Inactive</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => setIsLocationSharingEnabled(!isLocationSharingEnabled)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLocationSharingEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isLocationSharingEnabled ? (
                <>
                  <Users className="h-4 w-4" />
                  Stop Sharing
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Start Sharing
                </>
              )}
            </button>

            <button
              onClick={() => setEmergencyMode(!emergencyMode)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                emergencyMode
                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              {emergencyMode ? (
                <>
                  <Users className="h-4 w-4" />
                  Exit Emergency Mode
                </>
              ) : (
                <>
                  <Users className="h-4 w-4" />
                  Emergency Mode
                </>
              )}
            </button>
          </div>

          {emergencyMode && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <Users className="h-4 w-4" />
                <span className="font-medium">Emergency Mode Active</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Your location is being shared with all emergency contacts automatically.
              </p>
            </div>
          )}

          {isLocationSharingEnabled && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Users className="h-4 w-5 text-blue-600" />
                <span className="font-medium">Location Sharing Active</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Your location is visible to selected contacts. You can manage permissions in the Contacts section.
              </p>
            </div>
          )}
        </div>

        {locations.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No locations saved</h3>
            <p className="text-gray-600 mb-4">Add your important places to track weather and safety conditions.</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Location
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onLocationSelect?.(location)}
              >
                <div className={`p-2 rounded-lg ${getLocationColor(location.type)}`}>
                  {getLocationIcon(location.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900 truncate">{location.name}</h3>
                    {location.is_primary && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{location.address}</p>
                  <p className="text-xs text-gray-500 capitalize">{location.type}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingLocation(location);
                      setIsModalOpen(true);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLocation(location.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleSaveLocation}
        editingLocation={editingLocation}
      />
    </div>
  );
}
