import express from 'express';
import { UserModel } from '../../src/lib/models/user';
import { ApiResponse, User, NotificationPreferences } from '../../src/types';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await UserModel.findAll();
    res.json({
      success: true,
      data: users
    } as ApiResponse<User[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch users'
    } as ApiResponse<never>);
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const user = await UserModel.findById(id);
    res.json({
      success: true,
      data: user
    } as ApiResponse<User>);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch user'
      } as ApiResponse<never>);
    }
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, name, phone, emergency_contact_name, emergency_contact_phone, notification_preferences } = req.body;

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: 'Email and name are required'
      } as ApiResponse<never>);
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      } as ApiResponse<never>);
    }

    const userData = {
      email,
      name,
      phone,
      emergency_contact_name,
      emergency_contact_phone,
      notification_preferences: notification_preferences || {
        weather: true,
        emergency: true,
        checkin: true
      }
    };

    const user = await UserModel.create(userData);
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    } as ApiResponse<User>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create user'
    } as ApiResponse<never>);
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const updates = req.body;
    const user = await UserModel.update(id, updates);
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    } as ApiResponse<User>);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update user'
      } as ApiResponse<never>);
    }
  }
});

// Update notification preferences
router.put('/:id/notifications', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const preferences: NotificationPreferences = req.body;
    
    if (typeof preferences.weather !== 'boolean' || 
        typeof preferences.emergency !== 'boolean' || 
        typeof preferences.checkin !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'Invalid notification preferences format'
      } as ApiResponse<never>);
    }

    const user = await UserModel.updateNotificationPreferences(id, preferences);
    
    res.json({
      success: true,
      data: user,
      message: 'Notification preferences updated successfully'
    } as ApiResponse<User>);
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      res.status(404).json({
        success: false,
        error: 'User not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update notification preferences'
      } as ApiResponse<never>);
    }
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    await UserModel.delete(id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete user'
    } as ApiResponse<never>);
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters long'
      } as ApiResponse<never>);
    }

    const users = await UserModel.searchByNameOrEmail(query);
    res.json({
      success: true,
      data: users
    } as ApiResponse<User[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search users'
    } as ApiResponse<never>);
  }
});

export default router;
