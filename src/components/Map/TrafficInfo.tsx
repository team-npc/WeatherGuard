'use client';

import { Car, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import React from 'react';

interface TrafficInfoProps {
  location?: string;
  className?: string;
}

export default function TrafficInfo({ location = "Hyderabad", className = "" }: TrafficInfoProps) {
  // Mock traffic data
  const trafficData = {
    status: 'light', // light, moderate, heavy
    description: 'Light traffic in this area',
    conditions: 'Typical conditions',
    temperature: '25°',
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  const getTrafficColor = (status: string) => {
    switch (status) {
      case 'light': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'heavy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrafficIcon = (status: string) => {
    switch (status) {
      case 'light': return <CheckCircle className="h-4 w-4" />;
      case 'moderate': return <Clock className="h-4 w-4" />;
      case 'heavy': return <AlertTriangle className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">{location}</h3>
        <span className="text-sm text-gray-500">{trafficData.temperature}</span>
      </div>
      
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${getTrafficColor(trafficData.status)}`}>
          {getTrafficIcon(trafficData.status)}
        </div>
        <div className="flex-1">
          <div className={`font-medium text-sm ${getTrafficColor(trafficData.status)}`}>
            {trafficData.description}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {trafficData.conditions}
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-400">
          Updated {trafficData.lastUpdated}
        </div>
      </div>
    </div>
  );
}
