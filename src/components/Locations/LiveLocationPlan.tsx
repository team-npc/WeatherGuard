'use client';

import React, { useState } from 'react';
import { 
  Navigation, 
  Shield, 
  Clock, 
  Users, 
  Smartphone, 
  Wifi, 
  Battery, 
  MapPin,
  Eye,
  EyeOff,
  Settings,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface LiveLocationPlanProps {
  className?: string;
}

interface ImplementationPhase {
  id: string;
  title: string;
  description: string;
  features: string[];
  timeline: string;
  complexity: 'Low' | 'Medium' | 'High';
  status: 'Planned' | 'In Development' | 'Testing' | 'Complete';
}

const implementationPhases: ImplementationPhase[] = [
  {
    id: 'phase1',
    title: 'Phase 1: Basic Location Sharing',
    description: 'Implement core location sharing functionality with manual updates',
    features: [
      'Manual location check-ins',
      'Location history storage',
      'Basic privacy controls',
      'Emergency location broadcasting'
    ],
    timeline: '2-3 weeks',
    complexity: 'Low',
    status: 'Planned'
  },
  {
    id: 'phase2',
    title: 'Phase 2: Real-time Updates',
    description: 'Add WebSocket-based real-time location updates',
    features: [
      'WebSocket connection management',
      'Real-time location broadcasting',
      'Connection status indicators',
      'Automatic reconnection handling'
    ],
    timeline: '3-4 weeks',
    complexity: 'Medium',
    status: 'Planned'
  },
  {
    id: 'phase3',
    title: 'Phase 3: Advanced Features',
    description: 'Implement geofencing, background tracking, and mobile optimization',
    features: [
      'Geofencing alerts',
      'Background location tracking',
      'Battery optimization',
      'Offline location caching'
    ],
    timeline: '4-6 weeks',
    complexity: 'High',
    status: 'Planned'
  },
  {
    id: 'phase4',
    title: 'Phase 4: Mobile App Integration',
    description: 'Native mobile app with push notifications and enhanced tracking',
    features: [
      'React Native mobile app',
      'Push notification system',
      'Enhanced GPS accuracy',
      'Cross-platform synchronization'
    ],
    timeline: '6-8 weeks',
    complexity: 'High',
    status: 'Planned'
  }
];

interface PrivacyControl {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function LiveLocationPlan({ className = '' }: LiveLocationPlanProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'phases' | 'privacy' | 'technical'>('overview');
  const [privacyControls, setPrivacyControls] = useState<PrivacyControl[]>([
    {
      id: 'temporary_sharing',
      title: 'Temporary Sharing',
      description: 'Set time limits for location sharing (1 hour, 8 hours, 24 hours)',
      icon: <Clock className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'selective_sharing',
      title: 'Selective Contact Sharing',
      description: 'Choose specific contacts who can see your location',
      icon: <Users className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'location_history',
      title: 'Location History Control',
      description: 'Control how long location history is retained (24h, 7d, 30d, never)',
      icon: <Shield className="h-5 w-5" />,
      enabled: true
    },
    {
      id: 'emergency_override',
      title: 'Emergency Override',
      description: 'Automatic location sharing during emergency alerts',
      icon: <AlertTriangle className="h-5 w-5" />,
      enabled: false
    },
    {
      id: 'precision_control',
      title: 'Location Precision',
      description: 'Choose between exact location or approximate area sharing',
      icon: <MapPin className="h-5 w-5" />,
      enabled: true
    }
  ]);

  const togglePrivacyControl = (id: string) => {
    setPrivacyControls(prev => prev.map(control => 
      control.id === id ? { ...control, enabled: !control.enabled } : control
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Testing': return 'bg-blue-100 text-blue-800';
      case 'In Development': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'text-red-600';
      case 'Medium': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Navigation className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Live Location Sharing</h2>
            <p className="text-sm text-gray-600">Detailed implementation plan and privacy controls</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'phases', label: 'Implementation' },
            { id: 'privacy', label: 'Privacy' },
            { id: 'technical', label: 'Technical' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-1">Current Status: Planning Phase</h3>
                  <p className="text-sm text-blue-800">
                    Live location sharing is currently in the planning and design phase. The system will be built 
                    with privacy-first principles and emergency-focused features.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Real-time location updates
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Granular privacy controls
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Emergency broadcasting
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Battery optimization
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Offline capability
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Technical Requirements</h3>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Smartphone className="h-4 w-4 text-blue-500" />
                    HTML5 Geolocation API
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Wifi className="h-4 w-4 text-blue-500" />
                    WebSocket connections
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Battery className="h-4 w-4 text-blue-500" />
                    Background processing
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500" />
                    End-to-end encryption
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <Settings className="h-4 w-4 text-blue-500" />
                    Push notifications
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'phases' && (
          <div className="space-y-4">
            {implementationPhases.map((phase, index) => (
              <div key={phase.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{phase.title}</h3>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(phase.status)}`}>
                      {phase.status}
                    </span>
                    <span className={`text-sm font-medium ${getComplexityColor(phase.complexity)}`}>
                      {phase.complexity}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Features</h4>
                    <ul className="space-y-1">
                      {phase.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                    <p className="text-sm text-gray-600">{phase.timeline}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900 mb-1">Privacy-First Design</h3>
                  <p className="text-sm text-green-800">
                    All location sharing features are designed with user privacy and control as the top priority. 
                    Users have complete control over who sees their location and for how long.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Privacy Controls</h3>
              <div className="space-y-3">
                {privacyControls.map((control) => (
                  <div key={control.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {control.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900">{control.title}</h4>
                        <button
                          onClick={() => togglePrivacyControl(control.id)}
                          className={`p-1 rounded-full transition-colors ${
                            control.enabled 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {control.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-gray-600">{control.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Architecture Overview</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
{`Frontend (React/Next.js)
├── Geolocation API integration
├── WebSocket client for real-time updates
├── Service Worker for background processing
└── Local storage for offline caching

Backend (Node.js/Express)
├── WebSocket server for real-time communication
├── Location data processing and validation
├── Privacy controls enforcement
└── Emergency alert integration

Database (SQLite/PostgreSQL)
├── User location history
├── Privacy settings
├── Contact permissions
└── Emergency events

Mobile Integration (Future)
├── React Native app
├── Background location services
├── Push notification system
└── Enhanced GPS accuracy`}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Security Considerations</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Data Protection</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• End-to-end encryption for location data</li>
                    <li>• Secure WebSocket connections (WSS)</li>
                    <li>• Regular data purging based on retention settings</li>
                    <li>• No third-party location data sharing</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-700">Access Control</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• JWT-based authentication</li>
                    <li>• Role-based permission system</li>
                    <li>• Rate limiting for API endpoints</li>
                    <li>• Audit logging for location access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
