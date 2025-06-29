'use client';

import MapControls, { CompactMapControls } from '@/components/Map/MapControls';
import {
    DisasterEvent,
    LiveLocation,
    MapMarker,
    StaticLocation,
    WeatherAlert,
    WeatherData
} from '@/types';
import {
    AlertTriangle,
    Bell,
    MapPin,
    Menu,
    Settings,
    Users,
    X
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

// Dynamically import the map component to avoid SSR issues
const WeatherSafetyMap = dynamic(
  () => import('@/components/Map/WeatherSafetyMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="h-full bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    )
  }
);

// Import auth and UI components

interface LocationResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type?: string;
}

// Import components dynamically to avoid auto-removal
const EnhancedLocationSearch = require('@/components/Map/EnhancedLocationSearch').default;
const AlertsDropdown = require('@/components/Alerts/AlertsDropdown').default;
const TrafficInfo = require('@/components/Map/TrafficInfo').default;

export default function Dashboard() {
  // For demo purposes, we'll use a mock user
  const currentUser = null; // This will be replaced with actual auth later

  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([33.2098, -87.5692]); // Tuscaloosa, AL
  const [mapZoom, setMapZoom] = useState(13);

  // Demo mode - no tour or auth needed
  const [showAlertsDropdown, setShowAlertsDropdown] = useState(false);
  
  // Layer visibility state
  const [showWeatherRadar, setShowWeatherRadar] = useState(false);
  const [showTrafficLayer, setShowTrafficLayer] = useState(false);
  const [showStaticLocations, setShowStaticLocations] = useState(true);
  const [showLiveLocations, setShowLiveLocations] = useState(true);
  const [showWeatherAlerts, setShowWeatherAlerts] = useState(true);
  const [showDisasterEvents, setShowDisasterEvents] = useState(true);
  
  // Data state
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [staticLocations, setStaticLocations] = useState<StaticLocation[]>([]);
  const [liveLocations] = useState<LiveLocation[]>([]);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);
  const [disasterEvents, setDisasterEvents] = useState<DisasterEvent[]>([]);
  const [markers] = useState<MapMarker[]>([]);
  const [pinnedLocations, setPinnedLocations] = useState<StaticLocation[]>([]);
  
  // UI state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  // Advanced Emergency Detection State
  const [emergencyTriggers, setEmergencyTriggers] = useState({
    severeThreat: false,
    rapidWeatherChange: false,
    multipleAlerts: false,
    proximityThreat: false,
    manualActivation: false,
    deviceShaking: false,
    panicButton: false
  });
  const [emergencyLevel, setEmergencyLevel] = useState<'low' | 'medium' | 'high' | 'critical'>('low');
  const [lastEmergencyCheck, setLastEmergencyCheck] = useState(Date.now());
  const [emergencyHistory, setEmergencyHistory] = useState<Array<{
    timestamp: number;
    trigger: string;
    level: string;
    location: { lat: number; lng: number };
  }>>([]);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [familyFormData, setFamilyFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: 'Spouse',
    isEmergency: true
  });
  const [familyFormErrors, setFamilyFormErrors] = useState<{[key: string]: string}>({});
  const [emergencyContacts, setEmergencyContacts] = useState([
    { id: '1', name: 'Emergency Contact 1', phone: '+1234567890', relationship: 'Family', isEmergency: true },
    { id: '2', name: 'Emergency Contact 2', phone: '+0987654321', relationship: 'Friend', isEmergency: true },
    { id: '3', name: 'Family Member', phone: '+1122334455', relationship: 'Spouse', isEmergency: true }
  ]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
    loadPinnedLocations();
    initializeEmergencyDetection();

    // Demo mode - simplified initialization
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Advanced Emergency Detection System
  const initializeEmergencyDetection = () => {
    // Device motion detection for panic situations
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      let shakeThreshold = 15;
      let lastShake = 0;

      const handleDeviceMotion = (event: DeviceMotionEvent) => {
        const acceleration = event.accelerationIncludingGravity;
        if (acceleration) {
          const totalAcceleration = Math.sqrt(
            Math.pow(acceleration.x || 0, 2) +
            Math.pow(acceleration.y || 0, 2) +
            Math.pow(acceleration.z || 0, 2)
          );

          if (totalAcceleration > shakeThreshold) {
            const now = Date.now();
            if (now - lastShake > 1000) { // Prevent multiple triggers
              lastShake = now;
              triggerEmergency('deviceShaking', 'Device shaking detected - possible panic situation');
            }
          }
        }
      };

      window.addEventListener('devicemotion', handleDeviceMotion);
    }

    // Geolocation monitoring for rapid movement (possible evacuation)
    if (navigator.geolocation) {
      let lastPosition: GeolocationPosition | null = null;

      const watchPosition = () => {
        navigator.geolocation.watchPosition(
          (position) => {
            if (lastPosition) {
              const distance = calculateDistance(
                lastPosition.coords.latitude,
                lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
              );

              const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000; // seconds
              const speed = distance / timeDiff; // km/s

              // If moving faster than 50 km/h (emergency evacuation speed)
              if (speed > 0.014 && timeDiff > 10) {
                triggerEmergency('rapidMovement', 'Rapid movement detected - possible evacuation');
              }
            }
            lastPosition = position;
          },
          (error) => console.warn('Geolocation error:', error),
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );
      };

      watchPosition();
    }

    // Continuous threat monitoring
    const monitorThreats = setInterval(() => {
      checkForEmergencyConditions();
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(monitorThreats);
    };
  };

  // Emergency Detection Functions
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkForEmergencyConditions = () => {
    const now = Date.now();
    let newTriggers = { ...emergencyTriggers };
    let newLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check for severe weather threats
    const severeAlerts = weatherAlerts.filter(alert =>
      alert.severity === 'Severe' || alert.severity === 'Extreme'
    );
    if (severeAlerts.length > 0) {
      newTriggers.severeThreat = true;
      newLevel = 'high';
    }

    // Check for multiple simultaneous alerts
    const totalAlerts = weatherAlerts.length + disasterEvents.length;
    if (totalAlerts >= 3) {
      newTriggers.multipleAlerts = true;
      newLevel = newLevel === 'high' ? 'critical' : 'high';
    }

    // Check for proximity threats (disasters within 50km)
    const nearbyThreats = disasterEvents.filter(event => {
      const distance = calculateDistance(
        mapCenter[0], mapCenter[1],
        event.latitude, event.longitude
      );
      return distance <= 50;
    });

    if (nearbyThreats.length > 0) {
      newTriggers.proximityThreat = true;
      newLevel = newLevel === 'critical' ? 'critical' : 'high';
    }

    // Auto-trigger emergency mode for critical situations
    const shouldAutoTrigger = newLevel === 'critical' ||
                             (newLevel === 'high' && Object.values(newTriggers).filter(Boolean).length >= 2);

    if (shouldAutoTrigger && !isEmergencyMode) {
      triggerEmergency('autoDetection', 'Critical conditions detected - Emergency mode auto-activated');
    }

    setEmergencyTriggers(newTriggers);
    setEmergencyLevel(newLevel);
    setLastEmergencyCheck(now);
  };

  const triggerEmergency = (trigger: string, reason: string) => {
    setIsEmergencyMode(true);

    // Log emergency event
    const emergencyEvent = {
      timestamp: Date.now(),
      trigger,
      level: emergencyLevel,
      location: { lat: mapCenter[0], lng: mapCenter[1] }
    };

    setEmergencyHistory(prev => [...prev.slice(-9), emergencyEvent]); // Keep last 10 events

    // Update triggers
    setEmergencyTriggers(prev => ({
      ...prev,
      [trigger]: true,
      manualActivation: trigger === 'manual'
    }));

    // Show emergency notification
    showNotification('🚨 EMERGENCY ACTIVATED', reason, 'error');

    // Vibrate device if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Send emergency alerts to contacts (simulated)
    sendEmergencyAlerts(emergencyEvent);
  };

  const sendEmergencyAlerts = async (event: any) => {
    const currentLocation = {
      lat: mapCenter[0],
      lng: mapCenter[1],
      timestamp: new Date().toISOString()
    };

    // Get emergency contacts from state
    const activeEmergencyContacts = emergencyContacts.filter(contact => contact.isEmergency);

    const emergencyMessage = `🚨 EMERGENCY ALERT 🚨
${event.trigger.toUpperCase()}

Location: ${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}
Google Maps: https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}
Time: ${new Date().toLocaleString()}
Level: ${event.level.toUpperCase()}

This is an automated emergency alert from WeatherGuard Safety App.`;

    // Send SMS to all emergency contacts
    for (const contact of activeEmergencyContacts) {
      try {
        // SMS via device's messaging app
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(emergencyMessage)}`;
        window.open(smsUrl, '_blank');

        // WhatsApp message
        const whatsappUrl = `https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(emergencyMessage)}`;
        setTimeout(() => {
          window.open(whatsappUrl, '_blank');
        }, 1000);

        console.log(`📱 Emergency alert sent to ${contact.name} (${contact.phone})`);
      } catch (error) {
        console.error(`Failed to send alert to ${contact.name}:`, error);
      }
    }

    // Share live location via Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: '🚨 Emergency Location Share',
          text: emergencyMessage,
          url: `https://maps.google.com/?q=${currentLocation.lat},${currentLocation.lng}`
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    }

    // Log emergency event
    console.log('🚨 EMERGENCY ALERT SENT:', {
      timestamp: currentLocation.timestamp,
      location: `${currentLocation.lat.toFixed(6)}, ${currentLocation.lng.toFixed(6)}`,
      trigger: event.trigger,
      level: event.level,
      contactsNotified: activeEmergencyContacts.length
    });

    showNotification('🚨 Emergency Alerts Sent', `Notified ${activeEmergencyContacts.length} emergency contacts`, 'error');
  };

  // Advanced panic button with multiple communication channels
  const activatePanicButton = async () => {
    // Immediate emergency response
    const emergencyEvent = {
      timestamp: Date.now(),
      trigger: 'PANIC_BUTTON',
      level: 'CRITICAL',
      location: { lat: mapCenter[0], lng: mapCenter[1] }
    };

    // Trigger emergency mode
    setIsEmergencyMode(true);
    setEmergencyLevel('critical');
    setEmergencyTriggers(prev => ({ ...prev, panicButton: true, manualActivation: true }));

    // Vibrate device intensely
    if (navigator.vibrate) {
      navigator.vibrate([500, 200, 500, 200, 500, 200, 500]);
    }

    // Send emergency alerts
    await sendEmergencyAlerts(emergencyEvent);

    // Auto-dial emergency services after a delay
    setTimeout(() => {
      const confirmCall = confirm('🚨 PANIC BUTTON ACTIVATED!\n\nWould you like to call emergency services (911)?');
      if (confirmCall) {
        window.open('tel:911', '_self');
      }
    }, 3000);

    // Log emergency history
    setEmergencyHistory(prev => [...prev.slice(-9), emergencyEvent]);

    showNotification('🆘 PANIC BUTTON ACTIVATED', 'Emergency contacts notified. Stay safe!', 'error');
  };

  // Call emergency services
  const callEmergencyServices = () => {
    const confirmCall = confirm('Call Emergency Services (911)?');
    if (confirmCall) {
      window.open('tel:911', '_self');
    }
  };

  // Share current location
  const shareCurrentLocation = async () => {
    const locationMessage = `📍 My Current Location:
Latitude: ${mapCenter[0].toFixed(6)}
Longitude: ${mapCenter[1].toFixed(6)}
Google Maps: https://maps.google.com/?q=${mapCenter[0]},${mapCenter[1]}
Time: ${new Date().toLocaleString()}

Shared via WeatherGuard Safety App`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '📍 Location Share',
          text: locationMessage,
          url: `https://maps.google.com/?q=${mapCenter[0]},${mapCenter[1]}`
        });
      } catch (error) {
        // Fallback to SMS
        const smsUrl = `sms:?body=${encodeURIComponent(locationMessage)}`;
        window.open(smsUrl, '_blank');
      }
    } else {
      // Fallback to SMS
      const smsUrl = `sms:?body=${encodeURIComponent(locationMessage)}`;
      window.open(smsUrl, '_blank');
    }

    showNotification('📍 Location Shared', 'Location shared successfully', 'success');
  };

  // Form validation functions
  const validateFamilyForm = () => {
    const errors: {[key: string]: string} = {};

    if (!familyFormData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!familyFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(familyFormData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!familyFormData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(familyFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFamilyFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetFamilyForm = () => {
    setFamilyFormData({
      name: '',
      phone: '',
      email: '',
      relationship: 'Spouse',
      isEmergency: true
    });
    setFamilyFormErrors({});
  };

  const handleFamilyFormSubmit = () => {
    if (!validateFamilyForm()) {
      return;
    }

    const newContact = {
      id: Date.now().toString(),
      name: familyFormData.name,
      phone: familyFormData.phone,
      email: familyFormData.email,
      relationship: familyFormData.relationship,
      isEmergency: familyFormData.isEmergency
    };

    setEmergencyContacts(prev => [...prev, newContact]);
    setShowFamilyModal(false);
    resetFamilyForm();
    showNotification('👨‍👩‍👧‍👦 Added', `${newContact.name} added as emergency contact!`, 'success');
  };

  // Load pinned locations from localStorage
  const loadPinnedLocations = () => {
    try {
      const savedPins = JSON.parse(localStorage.getItem('pinnedLocations') || '[]');
      setPinnedLocations(savedPins);

      // Add pinned locations to static locations for map display
      setStaticLocations(prev => {
        // Remove existing pinned locations to avoid duplicates
        const nonPinned = prev.filter(loc => loc.type !== 'pinned');
        return [...nonPinned, ...savedPins];
      });
    } catch (error) {
      console.error('Error loading pinned locations:', error);
    }
  };

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load weather data for current location
      await loadWeatherData(mapCenter[0], mapCenter[1]);
      
      // Load sample locations and events
      await loadSampleData();
      
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWeatherData = async (lat: number, lng: number) => {
    try {
      // Mock weather data for demo
      const mockWeatherData: WeatherData = {
        location: { lat, lon: lng, name: 'Tuscaloosa, AL' },
        current: {
          temp: 72,
          feels_like: 75,
          humidity: 65,
          pressure: 1013,
          visibility: 10,
          wind_speed: 8,
          wind_direction: 180,
          weather: {
            main: 'Partly Cloudy',
            description: 'Partly cloudy with chance of storms',
            icon: '02d'
          }
        }
      };
      setWeatherData(mockWeatherData);
    } catch (err) {
      console.error('Failed to load weather data:', err);
    }
  };

  const loadSampleData = async () => {
    try {
      // Mock static locations
      const mockStaticLocations: StaticLocation[] = [
        {
          id: 1,
          user_id: 1,
          name: 'Home',
          type: 'home',
          address: '123 Main St, Tuscaloosa, AL',
          latitude: 33.2098,
          longitude: -87.5692,
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: 1,
          name: 'University of Alabama',
          type: 'work',
          address: '739 University Blvd, Tuscaloosa, AL',
          latitude: 33.2119,
          longitude: -87.5447,
          is_primary: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setStaticLocations(mockStaticLocations);

      // Mock weather alerts
      const mockWeatherAlerts: WeatherAlert[] = [
        {
          id: 1,
          alert_id: 'SEVERE_THUNDERSTORM_001',
          type: 'Severe Thunderstorm Warning',
          severity: 'severe',
          title: 'Severe Thunderstorm Warning',
          description: 'Severe thunderstorm with heavy rain and strong winds expected',
          latitude: 33.2098,
          longitude: -87.5692,
          radius_km: 25,
          start_time: new Date().toISOString(),
          end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          created_at: new Date().toISOString(),
          is_active: true
        }
      ];
      setWeatherAlerts(mockWeatherAlerts);

      // Mock disaster events
      const mockDisasterEvents: DisasterEvent[] = [
        {
          id: 1,
          event_id: 'TRAFFIC_001',
          type: 'traffic',
          severity: 'moderate',
          title: 'Multi-vehicle accident on I-65',
          description: 'Three-car accident blocking left lane',
          latitude: 33.2732,
          longitude: -87.5286,
          radius_km: 2,
          start_time: new Date().toISOString(),
          source: 'Traffic Management',
          created_at: new Date().toISOString(),
          is_active: true
        }
      ];
      setDisasterEvents(mockDisasterEvents);

    } catch (err) {
      console.error('Failed to load sample data:', err);
    }
  };

  const handleLocationSelect = (location: LocationResult) => {
    // Set map center and appropriate zoom level
    setMapCenter([location.latitude, location.longitude]);

    // Set zoom level based on location type for better view
    const zoomLevel = getOptimalZoomLevel(location);
    setMapZoom(zoomLevel);

    // Load weather data for the location
    loadWeatherData(location.latitude, location.longitude);

    // Assess and display safety information
    assessLocationSafety(location);

    // Show pin option for this location
    showPinOption(location);
  };

  // Function to show pin option for a location
  const showPinOption = (location: LocationResult) => {
    const isAlreadyPinned = pinnedLocations.some(
      pinned => Math.abs(pinned.latitude - location.latitude) < 0.001 &&
                Math.abs(pinned.longitude - location.longitude) < 0.001
    );

    if (typeof window !== 'undefined') {
      // Remove any existing pin option
      const existingPinOption = document.getElementById('pin-option');
      if (existingPinOption) {
        existingPinOption.remove();
      }

      // Create or get notification container
      let notificationContainer = document.getElementById('notification-container');
      if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
          position: fixed;
          top: 120px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
      }

      // Create pin option notification
      const pinOption = document.createElement('div');
      pinOption.id = 'pin-option';
      pinOption.setAttribute('data-notification', 'pin');
      pinOption.style.cssText = `
        position: relative;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 12px;
        max-width: 280px;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
      `;

      pinOption.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 16px;">📍</span>
          <span style="font-weight: 600; color: #374151; font-size: 14px;">${location.name}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button id="pin-location-btn" style="
            flex: 1;
            background: ${isAlreadyPinned ? '#ef4444' : '#3b82f6'};
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
          " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ${isAlreadyPinned ? '📌 Unpin Location' : '📌 Pin Location'}
          </button>
          <button onclick="this.parentElement.parentElement.remove()" style="
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 12px;
            cursor: pointer;
          " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            ✕
          </button>
        </div>
      `;

      // Add click handler for pin button
      const pinButton = pinOption.querySelector('#pin-location-btn');
      if (pinButton) {
        pinButton.addEventListener('click', () => {
          if (isAlreadyPinned) {
            unpinLocation(location);
          } else {
            pinLocation(location);
          }
          pinOption.remove();
        });
      }

      notificationContainer.appendChild(pinOption);

      // Auto-remove after 5 seconds
      setTimeout(() => {
        if (pinOption.parentElement) {
          pinOption.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (pinOption.parentElement) {
              pinOption.remove();
            }
          }, 300);
        }
      }, 5000);
    }
  };

  // Function to pin a location
  const pinLocation = async (location: LocationResult) => {
    try {
      const newPinnedLocation: StaticLocation = {
        id: Date.now(),
        user_id: 1, // Default user ID for demo
        name: location.name,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        type: 'pinned',
        is_primary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      // Add to pinned locations state
      setPinnedLocations(prev => [...prev, newPinnedLocation]);

      // Also add to static locations for map display
      setStaticLocations(prev => [...prev, newPinnedLocation]);

      // Show success notification
      showNotification('📌 Location Pinned', `${location.name} has been added to your pinned locations.`, 'success');

      // Save to localStorage for persistence
      const savedPins = JSON.parse(localStorage.getItem('pinnedLocations') || '[]');
      savedPins.push(newPinnedLocation);
      localStorage.setItem('pinnedLocations', JSON.stringify(savedPins));

    } catch (error) {
      console.error('Error pinning location:', error);
      showNotification('❌ Error', 'Failed to pin location. Please try again.', 'error');
    }
  };

  // Function to unpin a location
  const unpinLocation = async (location: LocationResult) => {
    try {
      // Remove from pinned locations state
      setPinnedLocations(prev => prev.filter(
        pinned => !(Math.abs(pinned.latitude - location.latitude) < 0.001 &&
                   Math.abs(pinned.longitude - location.longitude) < 0.001)
      ));

      // Remove from static locations
      setStaticLocations(prev => prev.filter(
        loc => !(Math.abs(loc.latitude - location.latitude) < 0.001 &&
                Math.abs(loc.longitude - location.longitude) < 0.001 &&
                loc.type === 'pinned')
      ));

      // Show success notification
      showNotification('📌 Location Unpinned', `${location.name} has been removed from your pinned locations.`, 'success');

      // Update localStorage
      const savedPins = JSON.parse(localStorage.getItem('pinnedLocations') || '[]');
      const updatedPins = savedPins.filter((pin: StaticLocation) =>
        !(Math.abs(pin.latitude - location.latitude) < 0.001 &&
          Math.abs(pin.longitude - location.longitude) < 0.001)
      );
      localStorage.setItem('pinnedLocations', JSON.stringify(updatedPins));

    } catch (error) {
      console.error('Error unpinning location:', error);
      showNotification('❌ Error', 'Failed to unpin location. Please try again.', 'error');
    }
  };

  // Function to show simple notifications
  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (typeof window !== 'undefined') {
      // Create or get notification container
      let notificationContainer = document.getElementById('notification-container');
      if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
          position: fixed;
          top: 120px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        `;
        document.body.appendChild(notificationContainer);
      }

      const notification = document.createElement('div');
      notification.setAttribute('data-notification', 'general');
      notification.style.cssText = `
        position: relative;
        background: white;
        border-left: 4px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        padding: 12px 16px;
        max-width: 300px;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
      `;

      notification.innerHTML = `
        <div style="display: flex; align-items: start; gap: 8px;">
          <div style="flex: 1;">
            <h4 style="font-weight: 600; color: #111827; margin: 0 0 4px 0; font-size: 14px;">${title}</h4>
            <p style="color: #6b7280; margin: 0; font-size: 13px;">${message}</p>
          </div>
          <button onclick="this.parentElement.parentElement.remove()" style="
            color: #9ca3af;
            background: none;
            border: none;
            cursor: pointer;
            padding: 0;
            width: 16px;
            height: 16px;
          ">✕</button>
        </div>
      `;

      notificationContainer.appendChild(notification);

      // Auto-remove after 3 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 300);
        }
      }, 3000);
    }
  };

  // Function to determine optimal zoom level based on location type
  const getOptimalZoomLevel = (location: LocationResult): number => {
    const locationType = location.type?.toLowerCase() || '';

    // City/town level
    if (locationType.includes('city') || locationType.includes('town') || locationType.includes('village')) {
      return 12;
    }
    // Country level
    if (locationType.includes('country')) {
      return 6;
    }
    // State/region level
    if (locationType.includes('state') || locationType.includes('region') || locationType.includes('province')) {
      return 8;
    }
    // Specific address or landmark
    if (locationType.includes('house') || locationType.includes('building') || locationType.includes('amenity')) {
      return 16;
    }
    // Default for most locations (neighborhoods, districts, etc.)
    return 14;
  };

  // Function to assess location safety
  const assessLocationSafety = async (location: LocationResult) => {
    try {
      // Check for active disasters in the area
      const nearbyDisasters = disasterEvents.filter(disaster => {
        const distance = calculateDistance(
          location.latitude, location.longitude,
          disaster.latitude, disaster.longitude
        );
        return distance <= (disaster.radius_km || 50); // Within disaster radius
      });

      // Check for severe weather alerts
      const nearbyAlerts = weatherAlerts.filter(alert => {
        const distance = calculateDistance(
          location.latitude, location.longitude,
          alert.latitude, alert.longitude
        );
        return distance <= 100; // Within 100km
      });

      // Determine overall safety status
      const safetyStatus = determineSafetyStatus(nearbyDisasters, nearbyAlerts);

      // Show safety notification
      showSafetyNotification(location, safetyStatus, nearbyDisasters, nearbyAlerts);

    } catch (error) {
      console.error('Error assessing location safety:', error);
    }
  };



  // Determine safety status based on nearby threats
  const determineSafetyStatus = (disasters: DisasterEvent[], alerts: WeatherAlert[]): 'safe' | 'caution' | 'danger' => {
    const extremeDisasters = disasters.filter(d => d.severity === 'extreme');
    const severeDisasters = disasters.filter(d => d.severity === 'severe');
    const extremeAlerts = alerts.filter(a => a.severity === 'extreme');
    const severeAlerts = alerts.filter(a => a.severity === 'severe');

    if (extremeDisasters.length > 0 || extremeAlerts.length > 0) {
      return 'danger';
    }
    if (severeDisasters.length > 0 || severeAlerts.length > 0 || disasters.length > 2) {
      return 'caution';
    }
    return 'safe';
  };

  // Show safety notification to user
  const showSafetyNotification = (
    location: LocationResult,
    status: 'safe' | 'caution' | 'danger',
    disasters: DisasterEvent[],
    alerts: WeatherAlert[]
  ) => {
    const statusConfig = {
      safe: {
        color: 'green',
        icon: '✅',
        title: 'Location appears safe',
        message: 'No immediate threats detected in this area.'
      },
      caution: {
        color: 'yellow',
        icon: '⚠️',
        title: 'Exercise caution',
        message: `${disasters.length + alerts.length} potential threat(s) detected nearby.`
      },
      danger: {
        color: 'red',
        icon: '🚨',
        title: 'Danger - Avoid this area',
        message: 'Extreme weather or disaster conditions detected.'
      }
    };

    const config = statusConfig[status];

    // Create and show notification with proper z-index
    if (typeof window !== 'undefined') {
      // Get or create notification container
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
          position: fixed;
          top: 80px;
          right: 16px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 12px;
          pointer-events: none;
        `;
        document.body.appendChild(container);
      }

      const notification = document.createElement('div');
      notification.className = 'safety-notification';
      notification.style.cssText = `
        background: white;
        border-left: 4px solid ${config.color === 'green' ? '#10b981' : config.color === 'yellow' ? '#f59e0b' : '#ef4444'};
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        padding: 16px;
        max-width: 320px;
        min-width: 280px;
        animation: slideIn 0.3s ease-out;
        pointer-events: auto;
        margin-bottom: 8px;
      `;

      // CSS animations are now in globals.css

      notification.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 12px;">
          <span style="font-size: 20px; line-height: 1;">${config.icon}</span>
          <div style="flex: 1; min-width: 0;">
            <h4 style="font-weight: 600; color: #111827; margin: 0 0 4px 0; font-size: 14px;">${location.name}</h4>
            <p style="font-weight: 500; color: ${config.color === 'green' ? '#065f46' : config.color === 'yellow' ? '#92400e' : '#991b1b'}; margin: 0 0 4px 0; font-size: 13px;">${config.title}</p>
            <p style="color: #4b5563; margin: 0 0 8px 0; font-size: 13px; line-height: 1.4;">${config.message}</p>
            ${disasters.length > 0 ? `<p style="color: #6b7280; margin: 4px 0 0 0; font-size: 11px;">Active disasters: ${disasters.map(d => d.type).join(', ')}</p>` : ''}
            ${alerts.length > 0 ? `<p style="color: #6b7280; margin: 2px 0 0 0; font-size: 11px;">Weather alerts: ${alerts.length}</p>` : ''}
          </div>
          <button onclick="this.parentElement.parentElement.style.animation='slideOut 0.3s ease-in'; setTimeout(() => this.parentElement.parentElement.remove(), 300);"
                  style="color: #9ca3af; background: none; border: none; cursor: pointer; padding: 0; width: 16px; height: 16px; display: flex; align-items: center; justify-content: center;"
                  onmouseover="this.style.color='#4b5563'"
                  onmouseout="this.style.color='#9ca3af'">
            <svg style="width: 16px; height: 16px;" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
            </svg>
          </button>
        </div>
      `;

      container.appendChild(notification);

      // Auto-remove after 8 seconds with animation
      setTimeout(() => {
        if (notification.parentElement) {
          notification.style.animation = 'slideOut 0.3s ease-in';
          setTimeout(() => {
            if (notification.parentElement) {
              notification.remove();
            }
          }, 300);
        }
      }, 8000);
    }
  };

  const handleCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setMapZoom(15);
          loadWeatherData(latitude, longitude);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your current location. Please check your browser settings.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const handleRefreshData = () => {
    loadInitialData();
  };

  const handleCenterOnUser = () => {
    handleCurrentLocation();
  };

  const filteredStaticLocations = showStaticLocations ? staticLocations : [];
  const filteredLiveLocations = showLiveLocations ? liveLocations : [];
  const filteredWeatherAlerts = showWeatherAlerts ? weatherAlerts : [];
  const filteredDisasterEvents = showDisasterEvents ? disasterEvents : [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Weather Safety App...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading App</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification Container */}
      <div id="notification-container" className="fixed top-20 right-4 z-[9999] space-y-3 pointer-events-none">
        {/* Notifications will be dynamically added here */}
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 tour-welcome">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⛈️</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">WeatherGuard</h1>
                  <p className="text-xs text-blue-600 font-medium">Safety First</p>
                </div>
              </a>
            </div>

            {/* Search Bar in Header */}
            <div className="hidden md:block flex-1 max-w-lg mx-8 tour-search">
              <EnhancedLocationSearch
                onLocationSelect={handleLocationSelect}
                onCurrentLocation={handleCurrentLocation}
                placeholder="Search places, addresses..."
                className="w-full"
              />
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setShowAlertsDropdown(!showAlertsDropdown)}
                  className="flex items-center gap-2 text-sm text-black hover:text-gray-800 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
                >
                  <Bell className="h-4 w-4" />
                  <span>{weatherAlerts.length + disasterEvents.length} Active Alerts</span>
                </button>

                <AlertsDropdown
                  isOpen={showAlertsDropdown}
                  onClose={() => setShowAlertsDropdown(false)}
                  weatherAlerts={weatherAlerts}
                  disasterEvents={disasterEvents}
                  onLocationSelect={(location) => {
                    setMapCenter([location.latitude, location.longitude]);
                    setMapZoom(14);
                    setShowAlertsDropdown(false);
                  }}
                />
              </div>
              <button
                onClick={() => {
                  if (isEmergencyMode) {
                    setIsEmergencyMode(false);
                    setEmergencyTriggers({
                      severeThreat: false,
                      rapidWeatherChange: false,
                      multipleAlerts: false,
                      proximityThreat: false,
                      manualActivation: false,
                      deviceShaking: false,
                      panicButton: false
                    });
                  } else {
                    triggerEmergency('manual', 'Emergency mode manually activated');
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isEmergencyMode
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 animate-pulse'
                    : emergencyLevel === 'critical'
                    ? 'bg-red-500 text-white hover:bg-red-600 animate-bounce'
                    : emergencyLevel === 'high'
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                {isEmergencyMode ? '🚨 Exit Emergency' :
                 emergencyLevel === 'critical' ? '🚨 CRITICAL' :
                 emergencyLevel === 'high' ? '⚠️ HIGH RISK' :
                 '🚨 Emergency Mode'}
              </button>
              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors tour-settings"
              >
                <Settings className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  // Add login functionality here
                  alert('Login functionality coming soon!');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Log In
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isEmergencyMode
                    ? 'bg-red-100 text-red-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                🚨
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-4 space-y-3">
            <EnhancedLocationSearch
              onLocationSelect={handleLocationSelect}
              onCurrentLocation={handleCurrentLocation}
              placeholder="Search places, addresses..."
              className="w-full"
            />

            {/* Mobile Emergency Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEmergencyMode(!isEmergencyMode)}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isEmergencyMode
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-orange-100 text-orange-700 border border-orange-200'
                }`}
              >
                {isEmergencyMode ? '🚨 Exit Emergency' : '🚨 Emergency Mode'}
              </button>
              <button
                onClick={shareCurrentLocation}
                className="px-4 py-3 bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
              >
                📍 Share Location
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Emergency Mode Banner */}
      {isEmergencyMode && (
        <div className="bg-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
                <div>
                  <span className="font-semibold">EMERGENCY MODE ACTIVE</span>
                  <span className="ml-2 text-red-100">Location sharing enabled for all emergency contacts</span>
                </div>
              </div>
              <button
                onClick={() => setIsEmergencyMode(false)}
                className="px-3 py-1 bg-red-700 hover:bg-red-800 rounded text-sm font-medium transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-12rem)]">
          
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-4 max-h-full overflow-y-auto">
            {/* Location Search */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold text-black mb-4">Search Location</h2>
              <EnhancedLocationSearch
                onLocationSelect={handleLocationSelect}
                onCurrentLocation={handleCurrentLocation}
                placeholder="Search for a location..."
              />
            </div>

            {/* Traffic Information */}
            <TrafficInfo location="Hyderabad" />

            {/* Pinned Locations */}
            <div className="bg-white rounded-lg shadow-sm p-4 tour-pinned-locations">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">📌 Pinned Locations</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {pinnedLocations.length}
                </span>
              </div>

              {pinnedLocations.length === 0 ? (
                <div className="text-center py-6">
                  <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-2">No pinned locations yet</p>
                  <p className="text-xs text-gray-400">Search for a location and pin it to save it here</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pinnedLocations.map((location) => (
                    <div
                      key={location.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => {
                        setMapCenter([location.latitude, location.longitude]);
                        setMapZoom(14);
                        loadWeatherData(location.latitude, location.longitude);
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {location.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {location.address}
                        </p>
                        <p className="text-xs text-gray-400">
                          {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unpinLocation({
                              id: location.id.toString(),
                              name: location.name,
                              address: location.address,
                              latitude: location.latitude,
                              longitude: location.longitude
                            });
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Unpin location"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {pinnedLocations.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to clear all pinned locations?')) {
                        setPinnedLocations([]);
                        setStaticLocations(prev => prev.filter(loc => loc.type !== 'pinned'));
                        localStorage.removeItem('pinnedLocations');
                        showNotification('🗑️ Cleared', 'All pinned locations have been removed.', 'info');
                      }
                    }}
                    className="w-full text-xs text-gray-500 hover:text-red-500 transition-colors py-2"
                  >
                    Clear All Pins
                  </button>
                </div>
              )}
            </div>

            {/* Map Controls */}
            <MapControls
              showWeatherRadar={showWeatherRadar}
              showTrafficLayer={showTrafficLayer}
              showStaticLocations={showStaticLocations}
              showLiveLocations={showLiveLocations}
              showWeatherAlerts={showWeatherAlerts}
              showDisasterEvents={showDisasterEvents}
              onToggleWeatherRadar={() => setShowWeatherRadar(!showWeatherRadar)}
              onToggleTrafficLayer={() => setShowTrafficLayer(!showTrafficLayer)}
              onToggleStaticLocations={() => setShowStaticLocations(!showStaticLocations)}
              onToggleLiveLocations={() => setShowLiveLocations(!showLiveLocations)}
              onToggleWeatherAlerts={() => setShowWeatherAlerts(!showWeatherAlerts)}
              onToggleDisasterEvents={() => setShowDisasterEvents(!showDisasterEvents)}
              onRefreshData={handleRefreshData}
              onCenterOnUser={handleCenterOnUser}
            />

            {/* Advanced Emergency Status */}
            <div className="bg-white rounded-lg shadow-sm p-4 tour-emergency-status">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">🚨 Emergency Status</h2>
                <span className={`text-xs px-2 py-1 rounded font-medium ${
                  emergencyLevel === 'critical' ? 'bg-red-100 text-red-700' :
                  emergencyLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                  emergencyLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {emergencyLevel.toUpperCase()}
                </span>
              </div>

              {/* Emergency Triggers */}
              <div className="space-y-2 mb-4">
                <h3 className="text-sm font-medium text-gray-700">Active Triggers:</h3>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {Object.entries(emergencyTriggers).map(([key, active]) => (
                    <div key={key} className={`flex items-center gap-2 p-2 rounded ${
                      active ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-500'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${active ? 'bg-red-500' : 'bg-gray-300'}`}></div>
                      <span className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Emergency Actions */}
              <div className="space-y-2">
                <button
                  onClick={activatePanicButton}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 animate-pulse hover:animate-bounce"
                >
                  🆘 PANIC BUTTON
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={shareCurrentLocation}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs py-2 px-3 rounded transition-colors"
                  >
                    📍 Share Location
                  </button>
                  <button
                    onClick={callEmergencyServices}
                    className="bg-green-100 hover:bg-green-200 text-green-700 text-xs py-2 px-3 rounded transition-colors"
                  >
                    📞 Call 911
                  </button>
                </div>
              </div>

              {/* Emergency History */}
              {emergencyHistory.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Events:</h3>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {emergencyHistory.slice(-3).map((event, index) => (
                      <div key={index} className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <div className="font-medium">{event.trigger}</div>
                        <div>{new Date(event.timestamp).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">Last Check:</span>
                  <span className="text-gray-400">
                    {new Date(lastEmergencyCheck).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Current Location Info */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Location</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {weatherData?.location.name || 'Tuscaloosa, AL'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Lat: {mapCenter[0].toFixed(4)}, Lng: {mapCenter[1].toFixed(4)}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      🌡️ {weatherData?.current.temp || 72}°F • {weatherData?.current.weather.description || 'Partly cloudy'}
                    </p>
                  </div>
                </div>

                {/* Weather Summary */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Wind:</span>
                      <span className="font-medium">{weatherData?.current.wind_speed || 8} mph</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">Humidity:</span>
                      <span className="font-medium">{weatherData?.current.humidity || 65}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Family & Friends Tracking */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Family & Friends</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Location Sharing</p>
                    <p className="text-xs text-gray-600">Manage family location tracking</p>
                  </div>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                    Setup
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>• Add family members in <strong>Contacts</strong> section</p>
                  <p>• Enable location sharing in <strong>Locations</strong> tab</p>
                  <p>• Set up emergency contacts for alerts</p>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Emergency Mode:</span>
                    <span className="text-gray-400">Inactive</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Safety Overview</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Weather Alerts</span>
                  <span className="font-medium text-red-600">{weatherAlerts.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Disaster Events</span>
                  <span className="font-medium text-orange-600">{disasterEvents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Saved Locations</span>
                  <span className="font-medium text-blue-600">{staticLocations.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Live Locations</span>
                  <span className="font-medium text-green-600">{liveLocations.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Map - Main Content */}
          <div className="lg:col-span-4 relative">
            {/* Mobile Controls */}
            <div className="lg:hidden mb-4 space-y-4">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <EnhancedLocationSearch
                  onLocationSelect={handleLocationSelect}
                  onCurrentLocation={handleCurrentLocation}
                  placeholder="Search for a location..."
                />
              </div>
              
              <CompactMapControls
                showWeatherRadar={showWeatherRadar}
                showTrafficLayer={showTrafficLayer}
                showStaticLocations={showStaticLocations}
                showLiveLocations={showLiveLocations}
                showWeatherAlerts={showWeatherAlerts}
                showDisasterEvents={showDisasterEvents}
                onToggleWeatherRadar={() => setShowWeatherRadar(!showWeatherRadar)}
                onToggleTrafficLayer={() => setShowTrafficLayer(!showTrafficLayer)}
                onToggleStaticLocations={() => setShowStaticLocations(!showStaticLocations)}
                onToggleLiveLocations={() => setShowLiveLocations(!showLiveLocations)}
                onToggleWeatherAlerts={() => setShowWeatherAlerts(!showWeatherAlerts)}
                onToggleDisasterEvents={() => setShowDisasterEvents(!showDisasterEvents)}
                onRefreshData={handleRefreshData}
                onCenterOnUser={handleCenterOnUser}
              />
            </div>

            {/* Map Container */}
            <div className="h-full bg-white rounded-lg shadow-sm overflow-hidden tour-map">
              <WeatherSafetyMap
                center={mapCenter}
                zoom={mapZoom}
                markers={markers}
                staticLocations={filteredStaticLocations}
                liveLocations={filteredLiveLocations}
                weatherAlerts={filteredWeatherAlerts}
                disasterEvents={filteredDisasterEvents}
                weatherData={weatherData}
                showWeatherRadar={showWeatherRadar}
                showTrafficLayer={showTrafficLayer}
                onLocationSelect={(lat, lng) => {
                  setMapCenter([lat, lng]);
                  setMapZoom(14); // Good zoom level for clicked locations
                  loadWeatherData(lat, lng);

                  // Create a location object for safety assessment
                  const clickedLocation = {
                    id: `clicked-${Date.now()}`,
                    name: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                    address: 'Clicked location',
                    latitude: lat,
                    longitude: lng,
                    type: 'point'
                  };

                  // Assess safety for clicked location
                  assessLocationSafety(clickedLocation);

                  // Show pin option for clicked location
                  showPinOption(clickedLocation);
                }}
                className="h-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">⚙️ Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Emergency Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🚨 Emergency Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Auto Emergency Detection</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Device Shake Detection</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Location Sharing in Emergency</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Notification Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔔 Notifications</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Weather Alerts</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Disaster Warnings</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Family Safety Updates</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Privacy Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">🔒 Privacy</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Share Location with Family</span>
                      <input type="checkbox" defaultChecked className="rounded" />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Anonymous Usage Data</span>
                      <input type="checkbox" className="rounded" />
                    </label>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">📞 Emergency Contacts</h3>

                  {/* Current Emergency Contacts */}
                  <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                    {emergencyContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                          <div className="text-xs text-gray-500">{contact.phone} • {contact.relationship}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            contact.isEmergency ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {contact.isEmergency ? 'Emergency' : 'Regular'}
                          </span>
                          <button
                            onClick={() => {
                              setEmergencyContacts(prev =>
                                prev.map(c =>
                                  c.id === contact.id
                                    ? { ...c, isEmergency: !c.isEmergency }
                                    : c
                                )
                              );
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Toggle
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setShowFamilyModal(true)}
                      className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      + Add Family Member
                    </button>
                    <button
                      onClick={() => setShowFamilyModal(true)}
                      className="w-full bg-green-100 hover:bg-green-200 text-green-700 py-2 px-4 rounded-lg transition-colors"
                    >
                      + Add Emergency Contact
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Family Setup Modal */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">👨‍👩‍👧‍👦 Add Family Member</h2>
                <button
                  onClick={() => setShowFamilyModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={familyFormData.name}
                    onChange={(e) => setFamilyFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter family member's name"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      familyFormErrors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {familyFormErrors.name && (
                    <p className="text-red-500 text-xs mt-1">{familyFormErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={familyFormData.phone}
                    onChange={(e) => setFamilyFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      familyFormErrors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {familyFormErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">{familyFormErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={familyFormData.email}
                    onChange={(e) => setFamilyFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="family@example.com"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      familyFormErrors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {familyFormErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{familyFormErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                  <select
                    value={familyFormData.relationship}
                    onChange={(e) => setFamilyFormData(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Spouse">Spouse</option>
                    <option value="Child">Child</option>
                    <option value="Parent">Parent</option>
                    <option value="Sibling">Sibling</option>
                    <option value="Friend">Friend</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="emergency-contact"
                    checked={familyFormData.isEmergency}
                    onChange={(e) => setFamilyFormData(prev => ({ ...prev, isEmergency: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="emergency-contact" className="text-sm text-gray-700">
                    Set as emergency contact
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowFamilyModal(false);
                    resetFamilyForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFamilyFormSubmit}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!familyFormData.name || !familyFormData.phone || !familyFormData.email}
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
