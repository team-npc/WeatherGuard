'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { DisasterEvent, LiveLocation, MapMarker, StaticLocation, WeatherAlert, WeatherData } from '../../types';

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker-icon-2x.png',
  iconUrl: '/leaflet/marker-icon.png',
  shadowUrl: '/leaflet/marker-shadow.png',
});

interface WeatherSafetyMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  staticLocations?: StaticLocation[];
  liveLocations?: LiveLocation[];
  weatherAlerts?: WeatherAlert[];
  disasterEvents?: DisasterEvent[];
  weatherData?: WeatherData;
  showWeatherRadar?: boolean;
  showTrafficLayer?: boolean;
  onLocationSelect?: (lat: number, lng: number) => void;
  onMarkerClick?: (marker: MapMarker) => void;
  className?: string;
}

// Custom icons for different marker types
const createCustomIcon = (type: string, severity?: string) => {
  const getIconConfig = () => {
    switch (type) {
      case 'user':
        return { icon: '👤', color: '#3b82f6' };
      case 'contact':
        return { icon: '👥', color: '#10b981' };
      case 'location':
        return { icon: '📍', color: '#6366f1' };
      case 'pinned':
        return { icon: '📌', color: '#dc2626' };
      case 'weather':
        const weatherColor = severity === 'extreme' ? '#dc2626' : 
                           severity === 'severe' ? '#ea580c' :
                           severity === 'moderate' ? '#d97706' : '#65a30d';
        return { icon: '🌩️', color: weatherColor };
      case 'disaster':
        const disasterColor = severity === 'extreme' ? '#dc2626' : 
                             severity === 'severe' ? '#ea580c' :
                             severity === 'moderate' ? '#d97706' : '#65a30d';
        return { icon: '⚠️', color: disasterColor };
      case 'checkin':
        return { icon: '✅', color: '#059669' };
      default:
        return { icon: '📍', color: '#6b7280' };
    }
  };

  const { icon, color } = getIconConfig();
  
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${icon}
      </div>
    `,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      if (onLocationSelect) {
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  return null;
}

// Component to handle center changes and update map view
function MapViewController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      // Use flyTo for smooth animation to new location
      map.flyTo(center, zoom, {
        duration: 1.5,
        easeLinearity: 0.25
      });
    }
  }, [map, center, zoom]);

  return null;
}

// Component to add weather radar overlay
function WeatherRadarLayer({ show }: { show: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!show) return;

    // Add OpenWeatherMap precipitation layer
    const precipitationLayer = L.tileLayer(
      'https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=' + 
      (process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo'),
      {
        attribution: 'Weather data © OpenWeatherMap',
        opacity: 0.6,
        maxZoom: 18
      }
    );

    precipitationLayer.addTo(map);

    return () => {
      map.removeLayer(precipitationLayer);
    };
  }, [map, show]);

  return null;
}

// Component to add traffic layer
function TrafficLayer({ show }: { show: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!show) return;

    // In a real implementation, this would use a traffic API like Google Maps or HERE
    // For demo purposes, we'll add a placeholder
    const trafficLayer = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: 'Traffic data placeholder',
        opacity: 0.3,
        maxZoom: 18
      }
    );

    trafficLayer.addTo(map);

    return () => {
      map.removeLayer(trafficLayer);
    };
  }, [map, show]);

  return null;
}

export default function WeatherSafetyMap({
  center,
  zoom = 13,
  markers = [],
  staticLocations = [],
  liveLocations = [],
  weatherAlerts = [],
  disasterEvents = [],
  weatherData,
  showWeatherRadar = false,
  showTrafficLayer = false,
  onLocationSelect,
  onMarkerClick,
  className = ''
}: WeatherSafetyMapProps) {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className={`bg-gray-200 animate-pulse rounded-lg ${className}`}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-500">Loading map...</div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'extreme': return '#dc2626';
      case 'severe': return '#ea580c';
      case 'moderate': return '#d97706';
      case 'minor': return '#65a30d';
      default: return '#6b7280';
    }
  };

  const getAlertRadius = (alert: WeatherAlert): number => {
    return (alert.radius_km || 25) * 1000; // Convert to meters
  };

  const getDisasterRadius = (event: DisasterEvent): number => {
    return (event.radius_km || 10) * 1000; // Convert to meters
  };

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Weather radar overlay */}
        <WeatherRadarLayer show={showWeatherRadar} />

        {/* Traffic layer */}
        <TrafficLayer show={showTrafficLayer} />

        {/* Map view controller for smooth navigation */}
        <MapViewController center={center} zoom={zoom} />

        {/* Map click handler */}
        <MapClickHandler onLocationSelect={onLocationSelect} />

        {/* Custom markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={createCustomIcon(marker.type, marker.severity)}
            eventHandlers={{
              click: () => onMarkerClick?.(marker)
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{marker.title}</h3>
                {marker.description && (
                  <p className="text-xs text-gray-600 mt-1">{marker.description}</p>
                )}
                {marker.timestamp && (
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(marker.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Static locations */}
        {staticLocations.map((location) => (
          <Marker
            key={`static-${location.id}`}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon(location.type === 'pinned' ? 'pinned' : 'location')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{location.name}</h3>
                <p className="text-xs text-gray-600 capitalize">
                  {location.type === 'pinned' ? '📌 Pinned Location' : location.type}
                </p>
                <p className="text-xs text-gray-500 mt-1">{location.address}</p>
                {location.is_primary && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">
                    Primary
                  </span>
                )}
                {location.type === 'pinned' && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-xs text-gray-400">
                      Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Live locations */}
        {liveLocations.map((location) => (
          <Marker
            key={`live-${location.id}`}
            position={[location.latitude, location.longitude]}
            icon={createCustomIcon('user')}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">Live Location</h3>
                <p className="text-xs text-gray-600">
                  Updated: {new Date(location.timestamp).toLocaleString()}
                </p>
                {location.accuracy && (
                  <p className="text-xs text-gray-500">
                    Accuracy: ±{Math.round(location.accuracy)}m
                  </p>
                )}
                {location.battery_level && (
                  <p className="text-xs text-gray-500">
                    Battery: {location.battery_level}%
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Weather alerts */}
        {weatherAlerts.map((alert) => (
          <React.Fragment key={`alert-${alert.id}`}>
            {alert.latitude && alert.longitude && (
              <>
                <Marker
                  position={[alert.latitude, alert.longitude]}
                  icon={createCustomIcon('weather', alert.severity)}
                >
                  <Popup>
                    <div className="p-2 max-w-xs">
                      <h3 className="font-semibold text-sm text-red-700">{alert.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-xs px-2 py-1 rounded text-white bg-${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">{alert.type}</span>
                      </div>
                      {alert.start_time && (
                        <p className="text-xs text-gray-500 mt-1">
                          Starts: {new Date(alert.start_time).toLocaleString()}
                        </p>
                      )}
                      {alert.end_time && (
                        <p className="text-xs text-gray-500">
                          Ends: {new Date(alert.end_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[alert.latitude, alert.longitude]}
                  radius={getAlertRadius(alert)}
                  pathOptions={{
                    color: getSeverityColor(alert.severity),
                    fillColor: getSeverityColor(alert.severity),
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              </>
            )}
          </React.Fragment>
        ))}

        {/* Disaster events */}
        {disasterEvents.map((event) => (
          <React.Fragment key={`disaster-${event.id}`}>
            <Marker
              position={[event.latitude, event.longitude]}
              icon={createCustomIcon('disaster', event.severity)}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <h3 className="font-semibold text-sm text-red-700">{event.title}</h3>
                  {event.description && (
                    <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded text-white`} 
                          style={{ backgroundColor: getSeverityColor(event.severity) }}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500 capitalize">{event.type}</span>
                  </div>
                  {event.source && (
                    <p className="text-xs text-gray-500 mt-1">Source: {event.source}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[event.latitude, event.longitude]}
              radius={getDisasterRadius(event)}
              pathOptions={{
                color: getSeverityColor(event.severity),
                fillColor: getSeverityColor(event.severity),
                fillOpacity: 0.15,
                weight: 2,
                dashArray: '5, 5'
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>

      {/* Weather info overlay */}
      {weatherData && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{weatherData.current.weather.icon}</span>
            <div>
              <h3 className="font-semibold text-sm">{weatherData.location.name}</h3>
              <p className="text-xs text-gray-600">{weatherData.current.weather.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Temp:</span>
              <span className="ml-1 font-medium">{weatherData.current.temp}°F</span>
            </div>
            <div>
              <span className="text-gray-500">Feels:</span>
              <span className="ml-1 font-medium">{weatherData.current.feels_like}°F</span>
            </div>
            <div>
              <span className="text-gray-500">Humidity:</span>
              <span className="ml-1 font-medium">{weatherData.current.humidity}%</span>
            </div>
            <div>
              <span className="text-gray-500">Wind:</span>
              <span className="ml-1 font-medium">{weatherData.current.wind_speed} mph</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
