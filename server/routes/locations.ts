import express from 'express';
import { StaticLocationModel, LiveLocationModel } from '../../src/lib/models/location';
import { ApiResponse, StaticLocation, LiveLocation, LocationType } from '../../src/types';

const router = express.Router();

// Static Locations Routes

// Get all static locations for a user
router.get('/static/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const locations = await StaticLocationModel.findByUserId(userId);
    res.json({
      success: true,
      data: locations
    } as ApiResponse<StaticLocation[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch locations'
    } as ApiResponse<never>);
  }
});

// Get static locations by type for a user
router.get('/static/user/:userId/type/:type', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const type = req.params.type as LocationType;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    if (!['home', 'work', 'school', 'family', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location type'
      } as ApiResponse<never>);
    }

    const locations = await StaticLocationModel.findByUserIdAndType(userId, type);
    res.json({
      success: true,
      data: locations
    } as ApiResponse<StaticLocation[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch locations'
    } as ApiResponse<never>);
  }
});

// Create new static location
router.post('/static', async (req, res) => {
  try {
    const { user_id, name, type, address, latitude, longitude, is_primary } = req.body;

    if (!user_id || !name || !type || !address || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, name, type, address, latitude, longitude'
      } as ApiResponse<never>);
    }

    if (!['home', 'work', 'school', 'family', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location type'
      } as ApiResponse<never>);
    }

    const locationData = {
      user_id,
      name,
      type,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      is_primary: is_primary || false
    };

    const location = await StaticLocationModel.create(locationData);
    res.status(201).json({
      success: true,
      data: location,
      message: 'Location created successfully'
    } as ApiResponse<StaticLocation>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create location'
    } as ApiResponse<never>);
  }
});

// Update static location
router.put('/static/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      } as ApiResponse<never>);
    }

    const updates = req.body;
    if (updates.latitude !== undefined) {
      updates.latitude = parseFloat(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      updates.longitude = parseFloat(updates.longitude);
    }

    const location = await StaticLocationModel.update(id, updates);
    res.json({
      success: true,
      data: location,
      message: 'Location updated successfully'
    } as ApiResponse<StaticLocation>);
  } catch (error) {
    if (error instanceof Error && error.message === 'Location not found') {
      res.status(404).json({
        success: false,
        error: 'Location not found'
      } as ApiResponse<never>);
    } else {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update location'
      } as ApiResponse<never>);
    }
  }
});

// Delete static location
router.delete('/static/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid location ID'
      } as ApiResponse<never>);
    }

    await StaticLocationModel.delete(id);
    res.json({
      success: true,
      message: 'Location deleted successfully'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete location'
    } as ApiResponse<never>);
  }
});

// Find nearby static locations
router.get('/static/nearby', async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      } as ApiResponse<never>);
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const radiusKm = radius ? parseFloat(radius as string) : 10;

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusKm)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates or radius'
      } as ApiResponse<never>);
    }

    const locations = await StaticLocationModel.findNearby(latitude, longitude, radiusKm);
    res.json({
      success: true,
      data: locations
    } as ApiResponse<StaticLocation[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to find nearby locations'
    } as ApiResponse<never>);
  }
});

// Live Location Routes

// Get active live location for a user
router.get('/live/user/:userId/active', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const location = await LiveLocationModel.findActiveByUserId(userId);
    res.json({
      success: true,
      data: location
    } as ApiResponse<LiveLocation | null>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch live location'
    } as ApiResponse<never>);
  }
});

// Create/update live location
router.post('/live', async (req, res) => {
  try {
    const { user_id, latitude, longitude, accuracy, battery_level } = req.body;

    if (!user_id || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: user_id, latitude, longitude'
      } as ApiResponse<never>);
    }

    const locationData = {
      user_id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy ? parseFloat(accuracy) : undefined,
      is_active: true,
      battery_level: battery_level ? parseInt(battery_level) : undefined
    };

    const location = await LiveLocationModel.create(locationData);
    res.status(201).json({
      success: true,
      data: location,
      message: 'Live location updated successfully'
    } as ApiResponse<LiveLocation>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update live location'
    } as ApiResponse<never>);
  }
});

// Deactivate live location sharing for a user
router.post('/live/user/:userId/deactivate', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    await LiveLocationModel.deactivateUserLocations(userId);
    res.json({
      success: true,
      message: 'Live location sharing deactivated'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate live location'
    } as ApiResponse<never>);
  }
});

// Get recent live locations for a user
router.get('/live/user/:userId/recent', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
    
    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      } as ApiResponse<never>);
    }

    const locations = await LiveLocationModel.findRecentByUserId(userId, hours);
    res.json({
      success: true,
      data: locations
    } as ApiResponse<LiveLocation[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch recent locations'
    } as ApiResponse<never>);
  }
});

export default router;
