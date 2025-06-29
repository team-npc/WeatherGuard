'use client';

import React from 'react';
import { 
  Cloud, 
  Car, 
  Users, 
  MapPin, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Layers,
  Navigation,
  RefreshCw
} from 'lucide-react';

interface MapControlsProps {
  showWeatherRadar: boolean;
  showTrafficLayer: boolean;
  showStaticLocations: boolean;
  showLiveLocations: boolean;
  showWeatherAlerts: boolean;
  showDisasterEvents: boolean;
  onToggleWeatherRadar: () => void;
  onToggleTrafficLayer: () => void;
  onToggleStaticLocations: () => void;
  onToggleLiveLocations: () => void;
  onToggleWeatherAlerts: () => void;
  onToggleDisasterEvents: () => void;
  onRefreshData?: () => void;
  onCenterOnUser?: () => void;
  className?: string;
}

interface ControlButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}

function ControlButton({ active, onClick, icon, label, count }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
        ${active 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
        }
      `}
      title={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {count !== undefined && count > 0 && (
        <span className={`
          text-xs px-1.5 py-0.5 rounded-full font-bold
          ${active ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}
        `}>
          {count}
        </span>
      )}
    </button>
  );
}

export default function MapControls({
  showWeatherRadar,
  showTrafficLayer,
  showStaticLocations,
  showLiveLocations,
  showWeatherAlerts,
  showDisasterEvents,
  onToggleWeatherRadar,
  onToggleTrafficLayer,
  onToggleStaticLocations,
  onToggleLiveLocations,
  onToggleWeatherAlerts,
  onToggleDisasterEvents,
  onRefreshData,
  onCenterOnUser,
  className = ''
}: MapControlsProps) {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      {/* Layer Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Map Layers
        </h3>
        <div className="space-y-2">
          <ControlButton
            active={showWeatherRadar}
            onClick={onToggleWeatherRadar}
            icon={<Cloud className="w-4 h-4" />}
            label="Weather Radar"
          />
          <ControlButton
            active={showTrafficLayer}
            onClick={onToggleTrafficLayer}
            icon={<Car className="w-4 h-4" />}
            label="Traffic"
          />
        </div>
      </div>

      {/* Location Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Locations
        </h3>
        <div className="space-y-2">
          <ControlButton
            active={showStaticLocations}
            onClick={onToggleStaticLocations}
            icon={<MapPin className="w-4 h-4" />}
            label="Saved Places"
          />
          <ControlButton
            active={showLiveLocations}
            onClick={onToggleLiveLocations}
            icon={<Users className="w-4 h-4" />}
            label="Live Locations"
          />
        </div>
      </div>

      {/* Alert Controls */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Alerts & Events
        </h3>
        <div className="space-y-2">
          <ControlButton
            active={showWeatherAlerts}
            onClick={onToggleWeatherAlerts}
            icon={<Cloud className="w-4 h-4" />}
            label="Weather Alerts"
          />
          <ControlButton
            active={showDisasterEvents}
            onClick={onToggleDisasterEvents}
            icon={<AlertTriangle className="w-4 h-4" />}
            label="Disasters"
          />
        </div>
      </div>

      {/* Action Controls */}
      <div className="space-y-2 pt-4 border-t border-gray-200">
        {onCenterOnUser && (
          <button
            onClick={onCenterOnUser}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Center on Me
          </button>
        )}
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        )}
      </div>
    </div>
  );
}

// Compact version for mobile
export function CompactMapControls({
  showWeatherRadar,
  showTrafficLayer,
  showStaticLocations,
  showLiveLocations,
  showWeatherAlerts,
  showDisasterEvents,
  onToggleWeatherRadar,
  onToggleTrafficLayer,
  onToggleStaticLocations,
  onToggleLiveLocations,
  onToggleWeatherAlerts,
  onToggleDisasterEvents,
  onRefreshData,
  onCenterOnUser,
  className = ''
}: MapControlsProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700"
      >
        <span className="flex items-center gap-2">
          <Layers className="w-4 h-4" />
          Map Controls
        </span>
        {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Expanded controls */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 mt-3">
            <button
              onClick={onToggleWeatherRadar}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showWeatherRadar 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Cloud className="w-3 h-3" />
              Radar
            </button>
            <button
              onClick={onToggleTrafficLayer}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showTrafficLayer 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Car className="w-3 h-3" />
              Traffic
            </button>
            <button
              onClick={onToggleStaticLocations}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showStaticLocations 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MapPin className="w-3 h-3" />
              Places
            </button>
            <button
              onClick={onToggleLiveLocations}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showLiveLocations 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-3 h-3" />
              Live
            </button>
            <button
              onClick={onToggleWeatherAlerts}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showWeatherAlerts 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Cloud className="w-3 h-3" />
              Alerts
            </button>
            <button
              onClick={onToggleDisasterEvents}
              className={`flex items-center justify-center gap-1 px-2 py-2 rounded text-xs font-medium transition-all ${
                showDisasterEvents 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              Events
            </button>
          </div>
          
          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-3">
            {onCenterOnUser && (
              <button
                onClick={onCenterOnUser}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Center
              </button>
            )}
            {onRefreshData && (
              <button
                onClick={onRefreshData}
                className="flex items-center justify-center gap-1 px-2 py-2 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
