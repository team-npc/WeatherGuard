'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  Check, 
  X, 
  AlertTriangle, 
  Users, 
  MapPin, 
  Cloud,
  Settings,
  Trash2,
  MarkAsRead
} from 'lucide-react';
import { Notification } from '@/types';

interface NotificationCenterProps {
  userId: number;
  className?: string;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency_checkin': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'weather_alert': return <Cloud className="h-5 w-5 text-blue-500" />;
      case 'location_update': return <MapPin className="h-5 w-5 text-green-500" />;
      case 'contact_request': return <Users className="h-5 w-5 text-purple-500" />;
      default: return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMs = now.getTime() - notificationTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  return (
    <div className={`p-4 border-l-4 rounded-lg transition-all ${
      notification.is_read 
        ? 'bg-gray-50 border-gray-300' 
        : 'bg-white border-blue-400 shadow-sm'
    }`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getNotificationIcon(notification.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className={`font-medium ${notification.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h3>
              <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-500' : 'text-gray-600'}`}>
                {notification.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {getTimeAgo(notification.sent_at)}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {!notification.is_read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                title="Delete notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NotificationCenter({ userId, className = '' }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'emergency'>('all');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    loadNotifications();
    
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, [userId]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // Mock notifications for demo
      const mockNotifications: Notification[] = [
        {
          id: 1,
          user_id: userId,
          type: 'emergency_checkin',
          title: 'Emergency Alert: Jane Smith',
          message: 'Jane Smith has an emergency at coordinates 33.2098, -87.5692. Please check on them immediately.',
          data: JSON.stringify({
            checkin_id: 123,
            contact_id: 1,
            status: 'emergency',
            latitude: 33.2098,
            longitude: -87.5692
          }),
          is_read: false,
          sent_at: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
        },
        {
          id: 2,
          user_id: userId,
          type: 'weather_alert',
          title: 'Severe Thunderstorm Warning',
          message: 'A severe thunderstorm warning has been issued for your area. Take shelter immediately.',
          is_read: false,
          sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString() // 30 minutes ago
        },
        {
          id: 3,
          user_id: userId,
          type: 'contact_request',
          title: 'New Contact Request',
          message: 'Mike Johnson wants to add you as an emergency contact.',
          is_read: true,
          sent_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
        },
        {
          id: 4,
          user_id: userId,
          type: 'location_update',
          title: 'Location Sharing Started',
          message: 'You are now sharing your location with your emergency contacts.',
          is_read: true,
          sent_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true }
          : notification
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    try {
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(prev => prev.map(notification => ({ ...notification, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread': return !notification.is_read;
      case 'emergency': return notification.type === 'emergency_checkin';
      default: return true;
    }
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;
  const emergencyCount = notifications.filter(n => n.type === 'emergency_checkin' && !n.is_read).length;

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">
                {unreadCount} unread
                {emergencyCount > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                    {emergencyCount} EMERGENCY
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {!notificationsEnabled && (
              <button
                onClick={requestNotificationPermission}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                title="Enable browser notifications"
              >
                <BellOff className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={() => {/* Open notification settings */}}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              title="Notification settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All', count: notifications.length },
            { id: 'unread', label: 'Unread', count: unreadCount },
            { id: 'emergency', label: 'Emergency', count: emergencyCount }
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

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="flex gap-2 mb-4">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Check className="h-4 w-4" />
                Mark All Read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === 'all' ? 'No notifications' : `No ${filter} notifications`}
              </h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? 'You\'re all caught up! No new notifications.'
                  : `No ${filter} notifications at this time.`
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>

        {/* Browser Notification Status */}
        {!notificationsEnabled && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <BellOff className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-yellow-900 mb-1">Browser Notifications Disabled</h3>
                <p className="text-sm text-yellow-800 mb-3">
                  Enable browser notifications to receive emergency alerts even when the app is closed.
                </p>
                <button
                  onClick={requestNotificationPermission}
                  className="px-3 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
