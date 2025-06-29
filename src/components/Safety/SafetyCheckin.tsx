'use client';

import { CheckinStatus, SafetyCheckin } from '@/types';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    HelpCircle,
    MapPin,
    Send,
    Shield,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface SafetyCheckinProps {
  userId: number;
  onCheckinComplete?: (checkin: SafetyCheckin) => void;
  className?: string;
}

interface QuickCheckinButtonProps {
  status: CheckinStatus;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick: () => void;
}

function QuickCheckinButton({ status, icon, title, description, color, onClick }: QuickCheckinButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg border-2 transition-all hover:scale-105 ${color}`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-2">
          {icon}
        </div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </button>
  );
}

export default function SafetyCheckin({ userId, onCheckinComplete, className = '' }: SafetyCheckinProps) {
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [lastCheckinTime, setLastCheckinTime] = useState<Date | null>(null);
  const [emergencyContacts, setEmergencyContacts] = useState(3); // Mock data
  const [selectedStatus, setSelectedStatus] = useState<CheckinStatus>('safe');
  const [message, setMessage] = useState('');
  const [includeLocation, setIncludeLocation] = useState(false);
  const [notifyContacts, setNotifyContacts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentCheckins, setRecentCheckins] = useState<SafetyCheckin[]>([]);
  const [lastCheckin, setLastCheckin] = useState<SafetyCheckin | null>(null);

  useEffect(() => {
    loadRecentCheckins();
  }, [userId]);

  const loadRecentCheckins = async () => {
    try {
      // Mock recent check-ins for demo
      const mockCheckins: SafetyCheckin[] = [
        {
          id: 1,
          user_id: userId,
          status: 'safe',
          message: 'All good at home, weather looks clear',
          latitude: 33.2098,
          longitude: -87.5692,
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 2,
          user_id: userId,
          status: 'safe',
          message: 'At work, monitoring weather conditions',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
        }
      ];
      setRecentCheckins(mockCheckins);
      setLastCheckin(mockCheckins[0]);
    } catch (error) {
      console.error('Failed to load recent check-ins:', error);
    }
  };

  const handleQuickCheckin = (status: CheckinStatus) => {
    setSelectedStatus(status);
    if (status === 'safe') {
      // For safe status, submit immediately without modal
      handleSubmitCheckin(status, '', false, false);
    } else {
      // For need_help or emergency, open modal for details
      setIsCheckinModalOpen(true);
    }
  };

  const handleSubmitCheckin = async (
    status: CheckinStatus, 
    checkinMessage: string = '', 
    includeLocationData: boolean = false,
    notifyContactsData: boolean = false
  ) => {
    setIsSubmitting(true);
    try {
      let latitude, longitude;
      
      if (includeLocationData && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000
            });
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.error('Failed to get location:', error);
        }
      }

      const checkinData: Omit<SafetyCheckin, 'id' | 'timestamp'> = {
        user_id: userId,
        status,
        message: checkinMessage || undefined,
        latitude,
        longitude
      };

      // Mock API call - in real implementation, this would call the backend
      const newCheckin: SafetyCheckin = {
        id: Date.now(),
        ...checkinData,
        timestamp: new Date().toISOString()
      };

      setRecentCheckins(prev => [newCheckin, ...prev.slice(0, 4)]);
      setLastCheckin(newCheckin);
      
      if (onCheckinComplete) {
        onCheckinComplete(newCheckin);
      }

      // Reset form
      setMessage('');
      setIncludeLocation(false);
      setNotifyContacts(false);
      setIsCheckinModalOpen(false);

      // Show success message
      if (status === 'emergency') {
        alert('Emergency check-in sent! Your emergency contacts have been notified.');
      } else if (status === 'need_help') {
        alert('Help request sent! Your emergency contacts have been notified.');
      } else {
        // Don't show alert for safe status to avoid interrupting quick check-ins
      }

    } catch (error) {
      console.error('Failed to submit check-in:', error);
      alert('Failed to submit check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: CheckinStatus) => {
    switch (status) {
      case 'safe': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'need_help': return <HelpCircle className="h-5 w-5 text-yellow-600" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: CheckinStatus) => {
    switch (status) {
      case 'safe': return 'text-green-700 bg-green-50';
      case 'need_help': return 'text-yellow-700 bg-yellow-50';
      case 'emergency': return 'text-red-700 bg-red-50';
    }
  };

  const getTimeSince = (timestamp: string) => {
    const now = new Date();
    const checkinTime = new Date(timestamp);
    const diffMs = now.getTime() - checkinTime.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Safety Check-in</h2>
            <p className="text-sm text-gray-600">Let your contacts know you're safe</p>
          </div>
        </div>

        {/* Emergency Mode Status */}
        {isEmergencyMode && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Emergency Mode Active</h3>
                <p className="text-sm text-red-700">
                  Your location is being shared with all {emergencyContacts} emergency contacts automatically.
                </p>
              </div>
              <button
                onClick={() => setIsEmergencyMode(false)}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                Deactivate
              </button>
            </div>
          </div>
        )}

        {/* Global Family Tracking Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 mb-2">Family & Friends Network</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center justify-between">
                  <span>Emergency Contacts:</span>
                  <span className="font-medium">{emergencyContacts} configured</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location Sharing:</span>
                  <span className="font-medium">
                    {isEmergencyMode ? 'Active (Emergency)' : 'Manual'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Last Family Check:</span>
                  <span className="font-medium">
                    {lastCheckinTime ? getTimeSince(lastCheckinTime.toISOString()) : 'Never'}
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-xs text-blue-600">
                  💡 <strong>Tip:</strong> Add family members in the <strong>Contacts</strong> section to enable location sharing and emergency notifications worldwide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Last Check-in Status */}
        {lastCheckin && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {getStatusIcon(lastCheckin.status)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">{lastCheckin.status.replace('_', ' ')}</span>
                  <span className="text-sm text-gray-500">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {getTimeSince(lastCheckin.timestamp)}
                  </span>
                </div>
                {lastCheckin.message && (
                  <p className="text-sm text-gray-600 mt-1">{lastCheckin.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Check-in Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <QuickCheckinButton
            status="safe"
            icon={<CheckCircle className="h-8 w-8" />}
            title="I'm Safe"
            description="Quick check-in to let contacts know you're okay"
            color="border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
            onClick={() => handleQuickCheckin('safe')}
          />
          
          <QuickCheckinButton
            status="need_help"
            icon={<HelpCircle className="h-8 w-8" />}
            title="Need Help"
            description="Request assistance from your emergency contacts"
            color="border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            onClick={() => handleQuickCheckin('need_help')}
          />
          
          <QuickCheckinButton
            status="emergency"
            icon={<AlertTriangle className="h-8 w-8" />}
            title="Emergency"
            description="Send immediate emergency alert to all contacts"
            color="border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            onClick={() => handleQuickCheckin('emergency')}
          />
        </div>

        {/* Global Emergency Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => setIsEmergencyMode(!isEmergencyMode)}
            className={`p-4 rounded-lg border-2 transition-all ${
              isEmergencyMode
                ? 'border-red-300 bg-red-50 text-red-700'
                : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">
                  {isEmergencyMode ? 'Exit Emergency Mode' : 'Activate Emergency Mode'}
                </h3>
                <p className="text-sm opacity-90">
                  {isEmergencyMode
                    ? 'Stop automatic location sharing'
                    : 'Share location with all emergency contacts'
                  }
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setLastCheckinTime(new Date());
              alert('Family check initiated! Checking status of all family members...');
            }}
            className="p-4 rounded-lg border-2 border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
          >
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6" />
              <div className="text-left">
                <h3 className="font-semibold">Check on Family</h3>
                <p className="text-sm opacity-90">
                  Send check-in request to all family members
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Check-ins */}
        {recentCheckins.length > 1 && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Recent Check-ins</h3>
            <div className="space-y-2">
              {recentCheckins.slice(1, 4).map((checkin) => (
                <div key={checkin.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  {getStatusIcon(checkin.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {checkin.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {getTimeSince(checkin.timestamp)}
                      </span>
                    </div>
                    {checkin.message && (
                      <p className="text-xs text-gray-600 mt-1">{checkin.message}</p>
                    )}
                  </div>
                  {checkin.latitude && checkin.longitude && (
                    <MapPin className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Check-in Modal */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {getStatusIcon(selectedStatus)}
                <h2 className="text-xl font-semibold text-gray-900 capitalize">
                  {selectedStatus.replace('_', ' ')} Check-in
                </h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message (optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Provide additional details about your situation..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="include_location"
                      checked={includeLocation}
                      onChange={(e) => setIncludeLocation(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="include_location" className="ml-2 block text-sm text-gray-700">
                      Include my current location
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="notify_contacts"
                      checked={notifyContacts}
                      onChange={(e) => setNotifyContacts(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="notify_contacts" className="ml-2 block text-sm text-gray-700">
                      Notify my emergency contacts
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsCheckinModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleSubmitCheckin(selectedStatus, message, includeLocation, notifyContacts)}
                    disabled={isSubmitting}
                    className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                      selectedStatus === 'emergency' 
                        ? 'bg-red-600 hover:bg-red-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Send Check-in
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
