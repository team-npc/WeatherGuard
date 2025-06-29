import express from 'express';
import { SafetyCheckinModel, NotificationModel } from '../../src/lib/models/safety';
import { ContactModel } from '../../src/lib/models/contact';
import { ApiResponse, SafetyCheckin, Notification, CheckinStatus } from '../../src/types';

const router = express.Router();

// Safety Check-in Routes

// Get safety check-ins for a user
router.get('/checkins/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const checkins = await SafetyCheckinModel.findByUserId(userId, limit);
    res.json({
      success: true,
      data: checkins
    } as ApiResponse<SafetyCheckin[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch safety check-ins'
    } as ApiResponse<never>);
  }
});

// Get latest safety check-in for a user
router.get('/checkins/user/:userId/latest', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const checkin = await SafetyCheckinModel.findLatestByUserId(userId);
    res.json({
      success: true,
      data: checkin
    } as ApiResponse<SafetyCheckin | null>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch latest safety check-in'
    } as ApiResponse<never>);
  }
});

// Create safety check-in
router.post('/checkins', async (req, res) => {
  try {
    const { user_id, status, message, latitude, longitude, notify_contacts } = req.body;

    if (!user_id || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, status'
      } as ApiResponse<never>);
    }

    if (!['safe', 'need_help', 'emergency'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: safe, need_help, or emergency'
      } as ApiResponse<never>);
    }

    const checkinData = {
      user_id,
      status: status as CheckinStatus,
      message: message || undefined,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined
    };

    const checkin = await SafetyCheckinModel.create(checkinData);

    // If requested, notify emergency contacts
    if (notify_contacts && (status === 'need_help' || status === 'emergency')) {
      try {
        await notifyEmergencyContacts(user_id, checkin);
      } catch (notifyError) {
        console.error('Failed to notify emergency contacts:', notifyError);
        // Don't fail the check-in if notification fails
      }
    }

    res.status(201).json({
      success: true,
      data: checkin,
      message: 'Safety check-in created successfully'
    } as ApiResponse<SafetyCheckin>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create safety check-in'
    } as ApiResponse<never>);
  }
});

// Get safety check-ins by status
router.get('/checkins/status/:status', async (req, res) => {
  try {
    const status = req.params.status as CheckinStatus;
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    
    if (!['safe', 'need_help', 'emergency'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: safe, need_help, or emergency'
      } as ApiResponse<never>);
    }

    const checkins = await SafetyCheckinModel.findByStatus(status, hours);
    res.json({
      success: true,
      data: checkins
    } as ApiResponse<SafetyCheckin[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch safety check-ins by status'
    } as ApiResponse<never>);
  }
});

// Get recent safety check-ins for user's contacts
router.get('/checkins/user/:userId/contacts', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    // Get user's contacts who can share location
    const contacts = await ContactModel.findLocationSharingContacts(userId);
    const contactUserIds = contacts
      .filter(contact => contact.contact_user_id)
      .map(contact => contact.contact_user_id!);

    if (contactUserIds.length === 0) {
      return res.json({
        success: true,
        data: []
      } as ApiResponse<SafetyCheckin[]>);
    }

    const checkins = await SafetyCheckinModel.findRecentForContacts(contactUserIds, hours);
    res.json({
      success: true,
      data: checkins
    } as ApiResponse<SafetyCheckin[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch contacts safety check-ins'
    } as ApiResponse<never>);
  }
});

// Notification Routes

// Get notifications for a user
router.get('/notifications/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const notifications = await NotificationModel.findByUserId(userId, limit);
    res.json({
      success: true,
      data: notifications
    } as ApiResponse<Notification[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch notifications'
    } as ApiResponse<never>);
  }
});

// Get unread notification count for a user
router.get('/notifications/user/:userId/unread-count', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const count = await NotificationModel.getUnreadCount(userId);
    res.json({
      success: true,
      data: { count }
    } as ApiResponse<{ count: number }>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch unread notification count'
    } as ApiResponse<never>);
  }
});

// Mark notification as read
router.post('/notifications/:id/read', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification ID'
      } as ApiResponse<never>);
    }

    const notification = await NotificationModel.markAsRead(id);
    res.json({
      success: true,
      data: notification,
      message: 'Notification marked as read'
    } as ApiResponse<Notification>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Notification not found') {
      res.status(404).json({
        success: false,
        error: 'Notification not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark notification as read'
      } as ApiResponse<never>);
    }
  }
});

// Mark all notifications as read for a user
router.post('/notifications/user/:userId/read-all', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    await NotificationModel.markAllAsRead(userId);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark all notifications as read'
    } as ApiResponse<never>);
  }
});

// Create notification (for system use)
router.post('/notifications', async (req, res) => {
  try {
    const { user_id, type, title, message, data } = req.body;

    if (!user_id || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, type, title, message'
      } as ApiResponse<never>);
    }

    const notificationData = {
      user_id,
      type,
      title,
      message,
      data: data ? JSON.stringify(data) : undefined,
      is_read: false
    };

    const notification = await NotificationModel.create(notificationData);
    res.status(201).json({
      success: true,
      data: notification,
      message: 'Notification created successfully'
    } as ApiResponse<Notification>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create notification'
    } as ApiResponse<never>);
  }
});

// Helper function to notify emergency contacts
async function notifyEmergencyContacts(userId: number, checkin: SafetyCheckin) {
  try {
    const emergencyContacts = await ContactModel.findEmergencyContacts(userId);
    
    for (const contact of emergencyContacts) {
      if (contact.contact_user_id) {
        const statusText = checkin.status === 'need_help' ? 'needs help' : 'has an emergency';
        const locationText = checkin.latitude && checkin.longitude 
          ? ` at coordinates ${checkin.latitude.toFixed(4)}, ${checkin.longitude.toFixed(4)}`
          : '';
        
        await NotificationModel.create({
          user_id: contact.contact_user_id,
          type: 'emergency_checkin',
          title: `Emergency Alert: ${contact.name}`,
          message: `${contact.name} ${statusText}${locationText}. ${checkin.message || ''}`,
          data: JSON.stringify({
            checkin_id: checkin.id,
            contact_id: contact.id,
            status: checkin.status,
            latitude: checkin.latitude,
            longitude: checkin.longitude
          }),
          is_read: false
        });
      }
    }
  } catch (error) {
    console.error('Error notifying emergency contacts:', error);
    throw error;
  }
}

export default router;
