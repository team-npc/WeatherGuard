'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Cloud, 
  Zap, 
  Car, 
  Mountain, 
  Flame,
  X,
  ExternalLink,
  Clock,
  MapPin,
  Volume2,
  VolumeX,
  Bell,
  BellOff
} from 'lucide-react';
import { WeatherAlert, DisasterEvent, AlertSeverity } from '@/types';

interface EmergencyAlertsProps {
  weatherAlerts?: WeatherAlert[];
  disasterEvents?: DisasterEvent[];
  onAlertDismiss?: (alertId: string, type: 'weather' | 'disaster') => void;
  className?: string;
}

interface AlertItemProps {
  alert: WeatherAlert | DisasterEvent;
  type: 'weather' | 'disaster';
  onDismiss?: (alertId: string, type: 'weather' | 'disaster') => void;
}

function AlertItem({ alert, type, onDismiss }: AlertItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'extreme': return 'bg-red-100 border-red-300 text-red-800';
      case 'severe': return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'moderate': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'minor': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'extreme': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'severe': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'moderate': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  const getTypeIcon = () => {
    if (type === 'weather') {
      const weatherAlert = alert as WeatherAlert;
      if (weatherAlert.type.toLowerCase().includes('tornado')) return <Zap className="h-5 w-5" />;
      if (weatherAlert.type.toLowerCase().includes('thunder')) return <Cloud className="h-5 w-5" />;
      return <Cloud className="h-5 w-5" />;
    } else {
      const disasterEvent = alert as DisasterEvent;
      switch (disasterEvent.type) {
        case 'earthquake': return <Mountain className="h-5 w-5" />;
        case 'fire': return <Flame className="h-5 w-5" />;
        case 'traffic': return <Car className="h-5 w-5" />;
        default: return <AlertTriangle className="h-5 w-5" />;
      }
    }
  };

  const getTimeInfo = () => {
    if (type === 'weather') {
      const weatherAlert = alert as WeatherAlert;
      if (weatherAlert.start_time) {
        const startTime = new Date(weatherAlert.start_time);
        const now = new Date();
        if (startTime > now) {
          return `Starts ${startTime.toLocaleTimeString()}`;
        } else if (weatherAlert.end_time) {
          const endTime = new Date(weatherAlert.end_time);
          return `Until ${endTime.toLocaleTimeString()}`;
        }
      }
    } else {
      const disasterEvent = alert as DisasterEvent;
      const eventTime = new Date(disasterEvent.created_at);
      const now = new Date();
      const diffMs = now.getTime() - eventTime.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      
      if (diffHours > 0) {
        return `${diffHours}h ${diffMinutes % 60}m ago`;
      } else {
        return `${diffMinutes}m ago`;
      }
    }
    return '';
  };

  const alertId = type === 'weather' ? (alert as WeatherAlert).alert_id : (alert as DisasterEvent).event_id;

  return (
    <div className={`border-l-4 rounded-lg p-4 mb-3 transition-all ${getSeverityColor(alert.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex items-center gap-2 mt-1">
            {getSeverityIcon(alert.severity)}
            {getTypeIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{alert.title}</h3>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-white bg-opacity-50">
                {alert.severity.toUpperCase()}
              </span>
            </div>
            
            <p className={`text-sm mb-2 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {alert.description}
            </p>
            
            <div className="flex items-center gap-4 text-xs opacity-75">
              {getTimeInfo() && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getTimeInfo()}
                </div>
              )}
              
              {((type === 'weather' && (alert as WeatherAlert).latitude) || 
                (type === 'disaster' && (alert as DisasterEvent).latitude)) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Location included
                </div>
              )}
              
              {type === 'disaster' && (alert as DisasterEvent).source && (
                <div className="flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" />
                  {(alert as DisasterEvent).source}
                </div>
              )}
            </div>
            
            {alert.description && alert.description.length > 100 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-medium mt-2 hover:underline"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
            title={isMuted ? 'Unmute alert' : 'Mute alert'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
          
          {onDismiss && (
            <button
              onClick={() => onDismiss(alertId, type)}
              className="p-1 rounded hover:bg-white hover:bg-opacity-50 transition-colors"
              title="Dismiss alert"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EmergencyAlerts({ 
  weatherAlerts = [], 
  disasterEvents = [], 
  onAlertDismiss,
  className = '' 
}: EmergencyAlertsProps) {
  const [filter, setFilter] = useState<'all' | 'extreme' | 'severe' | 'weather' | 'disaster'>('all');
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Show browser notifications for new alerts
  useEffect(() => {
    if (!isNotificationsEnabled || Notification.permission !== 'granted') return;

    const allAlerts = [...weatherAlerts, ...disasterEvents];
    const extremeAlerts = allAlerts.filter(alert => 
      alert.severity === 'extreme' && !dismissedAlerts.has(
        'alert_id' in alert ? alert.alert_id : alert.event_id
      )
    );

    extremeAlerts.forEach(alert => {
      new Notification(alert.title, {
        body: alert.description,
        icon: '/favicon.ico',
        tag: 'alert_id' in alert ? alert.alert_id : alert.event_id
      });
    });
  }, [weatherAlerts, disasterEvents, isNotificationsEnabled, dismissedAlerts]);

  const handleDismissAlert = (alertId: string, type: 'weather' | 'disaster') => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    if (onAlertDismiss) {
      onAlertDismiss(alertId, type);
    }
  };

  const filteredWeatherAlerts = weatherAlerts.filter(alert => {
    if (dismissedAlerts.has(alert.alert_id)) return false;
    switch (filter) {
      case 'extreme': return alert.severity === 'extreme';
      case 'severe': return alert.severity === 'severe' || alert.severity === 'extreme';
      case 'disaster': return false;
      case 'weather': return true;
      default: return true;
    }
  });

  const filteredDisasterEvents = disasterEvents.filter(event => {
    if (dismissedAlerts.has(event.event_id)) return false;
    switch (filter) {
      case 'extreme': return event.severity === 'extreme';
      case 'severe': return event.severity === 'severe' || event.severity === 'extreme';
      case 'weather': return false;
      case 'disaster': return true;
      default: return true;
    }
  });

  const totalAlerts = filteredWeatherAlerts.length + filteredDisasterEvents.length;
  const extremeAlerts = [...filteredWeatherAlerts, ...filteredDisasterEvents].filter(
    alert => alert.severity === 'extreme'
  ).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Emergency Alerts</h2>
              <p className="text-sm text-gray-600">
                {totalAlerts} active alert{totalAlerts !== 1 ? 's' : ''}
                {extremeAlerts > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {extremeAlerts} EXTREME
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsNotificationsEnabled(!isNotificationsEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              isNotificationsEnabled 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}
            title={isNotificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
          >
            {isNotificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All', count: totalAlerts },
            { id: 'extreme', label: 'Extreme', count: extremeAlerts },
            { id: 'severe', label: 'Severe+', count: [...filteredWeatherAlerts, ...filteredDisasterEvents].filter(a => a.severity === 'severe' || a.severity === 'extreme').length },
            { id: 'weather', label: 'Weather', count: weatherAlerts.filter(a => !dismissedAlerts.has(a.alert_id)).length },
            { id: 'disaster', label: 'Disasters', count: disasterEvents.filter(e => !dismissedAlerts.has(e.event_id)).length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Alerts List */}
        <div className="space-y-3">
          {totalAlerts === 0 ? (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active alerts</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'All clear! No emergency alerts in your area.'
                  : `No ${filter} alerts at this time.`
                }
              </p>
            </div>
          ) : (
            <>
              {/* Weather Alerts */}
              {filteredWeatherAlerts.map((alert) => (
                <AlertItem
                  key={alert.alert_id}
                  alert={alert}
                  type="weather"
                  onDismiss={handleDismissAlert}
                />
              ))}
              
              {/* Disaster Events */}
              {filteredDisasterEvents.map((event) => (
                <AlertItem
                  key={event.event_id}
                  alert={event}
                  type="disaster"
                  onDismiss={handleDismissAlert}
                />
              ))}
            </>
          )}
        </div>

        {/* Emergency Actions */}
        {extremeAlerts > 0 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-red-900 mb-1">Extreme Weather Alert</h3>
                <p className="text-sm text-red-800 mb-3">
                  Take immediate action to protect yourself and your family. Consider checking in with your emergency contacts.
                </p>
                <div className="flex gap-2">
                  <button className="px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors">
                    Send Safety Check-in
                  </button>
                  <button className="px-3 py-2 bg-white text-red-600 text-sm rounded-lg border border-red-300 hover:bg-red-50 transition-colors">
                    View Emergency Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
