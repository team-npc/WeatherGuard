// User and Authentication Types
export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notification_preferences: NotificationPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferences {
  weather: boolean;
  emergency: boolean;
  checkin: boolean;
}

// Location Types
export interface StaticLocation {
  id: number;
  user_id: number;
  name: string;
  type: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface LiveLocation {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
  is_active: boolean;
  battery_level?: number;
}

export type LocationType = 'home' | 'work' | 'school' | 'family' | 'other';

// Contact Types
export interface Contact {
  id: number;
  user_id: number;
  contact_user_id?: number;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  is_emergency_contact: boolean;
  can_see_location: boolean;
  created_at: string;
}

// Weather and Alert Types
export interface WeatherAlert {
  id: number;
  alert_id: string;
  type: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  area_description?: string;
  latitude?: number;
  longitude?: number;
  radius_km?: number;
  start_time?: string;
  end_time?: string;
  created_at: string;
  is_active: boolean;
}

export type AlertSeverity = 'minor' | 'moderate' | 'severe' | 'extreme';

// Safety Check-in Types
export interface SafetyCheckin {
  id: number;
  user_id: number;
  status: CheckinStatus;
  message?: string;
  latitude?: number;
  longitude?: number;
  timestamp: string;
}

export type CheckinStatus = 'safe' | 'need_help' | 'emergency';

// Disaster Event Types
export interface DisasterEvent {
  id: number;
  event_id: string;
  type: DisasterType;
  severity: string;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  radius_km?: number;
  start_time?: string;
  end_time?: string;
  source?: string;
  created_at: string;
  is_active: boolean;
}

export type DisasterType = 'earthquake' | 'traffic' | 'fire' | 'flood' | 'storm' | 'wildfire' | 'unrest' | 'hurricane' | 'tornado' | 'tsunami' | 'volcano' | 'landslide' | 'other';

// Notification Types
export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  data?: string;
  is_read: boolean;
  sent_at: string;
}

// Weather Data Types (from APIs)
export interface WeatherData {
  location: {
    lat: number;
    lon: number;
    name: string;
  };
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
    visibility: number;
    wind_speed: number;
    wind_direction: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    };
  };
  forecast?: WeatherForecast[];
  alerts?: WeatherAlert[];
}

export interface WeatherForecast {
  datetime: string;
  temp_max: number;
  temp_min: number;
  humidity: number;
  wind_speed: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  precipitation_probability: number;
}

// Map and Visualization Types
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapMarker {
  id: string;
  type: MarkerType;
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
  severity?: AlertSeverity;
  timestamp?: string;
  data?: any;
}

export type MarkerType = 'user' | 'contact' | 'location' | 'weather' | 'disaster' | 'checkin';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Emergency Response Types
export interface EmergencyResponse {
  id: string;
  type: 'weather' | 'disaster' | 'manual';
  severity: AlertSeverity;
  affected_users: number[];
  message: string;
  instructions: string[];
  created_at: string;
  expires_at?: string;
}

// Live Location Sharing Plan (for future implementation)
export interface LocationSharingPlan {
  implementation_phases: {
    phase1: 'WebRTC peer-to-peer sharing';
    phase2: 'Real-time WebSocket updates';
    phase3: 'Mobile app integration';
    phase4: 'Geofencing and automated alerts';
  };
  privacy_controls: {
    temporary_sharing: boolean;
    location_history_retention: string;
    granular_permissions: boolean;
    emergency_override: boolean;
  };
  technical_requirements: {
    geolocation_api: boolean;
    background_location: boolean;
    push_notifications: boolean;
    offline_capability: boolean;
  };
}

// Form Types
export interface LocationForm {
  name: string;
  type: LocationType;
  address: string;
  latitude: number;
  longitude: number;
  is_primary: boolean;
}

export interface ContactForm {
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  is_emergency_contact: boolean;
  can_see_location: boolean;
}

export interface CheckinForm {
  status: CheckinStatus;
  message?: string;
  include_location: boolean;
}
