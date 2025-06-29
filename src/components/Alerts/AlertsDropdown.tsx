'use client';

import { AlertTriangle, Clock, Cloud, Droplets, MapPin, Wind, Zap } from 'lucide-react';

interface WeatherAlert {
  id: number;
  alert_id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  start_time: string;
  end_time?: string;
  created_at: string;
  is_active: boolean;
}

interface DisasterEvent {
  id: number;
  event_id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  start_time: string;
  source: string;
  created_at: string;
  is_active: boolean;
}

interface AlertsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  weatherAlerts: WeatherAlert[];
  disasterEvents: DisasterEvent[];
  onLocationSelect?: (location: { latitude: number; longitude: number; name: string }) => void;
}

export default function AlertsDropdown({
  isOpen,
  onClose,
  weatherAlerts,
  disasterEvents
}: AlertsDropdownProps) {
  if (!isOpen) return null;

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'severe_thunderstorm': return <Zap className="h-4 w-4" />;
      case 'tornado': return <Wind className="h-4 w-4" />;
      case 'flood': return <Droplets className="h-4 w-4" />;
      case 'hurricane': return <Wind className="h-4 w-4" />;
      case 'earthquake': return <AlertTriangle className="h-4 w-4" />;
      case 'wildfire': return <span className="text-sm">🔥</span>;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minor': case 'low': return 'text-yellow-600 bg-yellow-50';
      case 'moderate': case 'medium': return 'text-orange-600 bg-orange-50';
      case 'severe': case 'high': return 'text-red-600 bg-red-50';
      case 'extreme': case 'critical': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const allAlerts = [
    ...weatherAlerts.map(alert => ({ ...alert, category: 'weather' })),
    ...disasterEvents.map(event => ({ ...event, category: 'disaster' }))
  ];

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Active Alerts</h3>
          <p className="text-sm text-gray-600 mt-1">
            {allAlerts.length} alerts in your area
          </p>
        </div>

        {/* Content */}
        <div className="max-h-80 overflow-y-auto">
          {allAlerts.length === 0 ? (
            <div className="p-6 text-center">
              <Cloud className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h4 className="font-medium text-gray-900 mb-1">No Active Alerts</h4>
              <p className="text-sm text-gray-600">All clear in your area</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {allAlerts.map((alert, index) => (
                <div key={alert.id || index} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                          {alert.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">
                            {`${alert.latitude.toFixed(2)}, ${alert.longitude.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(alert.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {allAlerts.length > 0 && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button 
              onClick={onClose}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Alerts
            </button>
          </div>
        )}
      </div>
    </>
  );
}
