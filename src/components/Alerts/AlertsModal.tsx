'use client';

import { X, AlertTriangle, Cloud, Zap, Wind, Thermometer, Droplets, Eye, MapPin } from 'lucide-react';
import React from 'react';

interface WeatherAlert {
  id: string;
  type: 'severe_thunderstorm' | 'tornado' | 'flood' | 'hurricane' | 'heat' | 'cold' | 'wind' | 'fog';
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  instructions?: string;
}

interface DisasterEvent {
  id: string;
  type: 'earthquake' | 'wildfire' | 'tsunami' | 'volcanic' | 'landslide';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  timestamp: Date;
  affectedRadius: number;
}

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weatherAlerts: WeatherAlert[];
  disasterEvents: DisasterEvent[];
  onLocationSelect?: (location: { latitude: number; longitude: number; name: string }) => void;
}

export default function AlertsModal({
  isOpen,
  onClose,
  weatherAlerts,
  disasterEvents,
  onLocationSelect
}: AlertsModalProps) {
  if (!isOpen) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'severe_thunderstorm': return <Zap className="h-5 w-5" />;
      case 'tornado': return <Wind className="h-5 w-5" />;
      case 'flood': return <Droplets className="h-5 w-5" />;
      case 'hurricane': return <Wind className="h-5 w-5" />;
      case 'heat': return <Thermometer className="h-5 w-5" />;
      case 'cold': return <Thermometer className="h-5 w-5" />;
      case 'wind': return <Wind className="h-5 w-5" />;
      case 'fog': return <Eye className="h-5 w-5" />;
      case 'earthquake': return <AlertTriangle className="h-5 w-5" />;
      case 'wildfire': return <span className="text-lg">🔥</span>;
      case 'tsunami': return <span className="text-lg">🌊</span>;
      case 'volcanic': return <span className="text-lg">🌋</span>;
      case 'landslide': return <span className="text-lg">⛰️</span>;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'extreme': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleLocationClick = (location: string) => {
    if (onLocationSelect) {
      // Mock coordinates for demo - in real app, you'd geocode the location
      const mockCoordinates = {
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        name: location
      };
      onLocationSelect(mockCoordinates);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Active Alerts</h2>
            <p className="text-sm text-gray-600 mt-1">
              {weatherAlerts.length + disasterEvents.length} active alerts in your area
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {weatherAlerts.length === 0 && disasterEvents.length === 0 ? (
            <div className="text-center py-12">
              <Cloud className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Alerts</h3>
              <p className="text-gray-600">All clear in your area. Stay safe!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Weather Alerts */}
              {weatherAlerts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-600" />
                    Weather Alerts ({weatherAlerts.length})
                  </h3>
                  <div className="space-y-4">
                    {weatherAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                                {alert.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{alert.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <button
                                onClick={() => handleLocationClick(alert.location)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                <MapPin className="h-4 w-4" />
                                {alert.location}
                              </button>
                              <span>
                                {formatTime(alert.startTime)} - {formatTime(alert.endTime)}
                              </span>
                            </div>
                            {alert.instructions && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <h5 className="font-medium text-blue-900 mb-1">Safety Instructions:</h5>
                                <p className="text-blue-800 text-sm">{alert.instructions}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disaster Events */}
              {disasterEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    Disaster Events ({disasterEvents.length})
                  </h3>
                  <div className="space-y-4">
                    {disasterEvents.map((event) => (
                      <div
                        key={event.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${getSeverityColor(event.severity)}`}>
                            {getAlertIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{event.title}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(event.severity)}`}>
                                {event.severity.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-gray-700 mb-3">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <button
                                onClick={() => handleLocationClick(event.location)}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors"
                              >
                                <MapPin className="h-4 w-4" />
                                {event.location}
                              </button>
                              <span>{formatTime(event.timestamp)}</span>
                              <span>Radius: {event.affectedRadius}km</span>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <h5 className="font-medium text-red-900 mb-1">Emergency Guidelines:</h5>
                              <p className="text-red-800 text-sm">
                                Follow local emergency services instructions. Stay informed through official channels.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleTimeString()}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                View on Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
