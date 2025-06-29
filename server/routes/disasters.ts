import express from 'express';
import axios from 'axios';
import { DisasterEventModel } from '../../src/lib/models/safety';
import { ApiResponse, DisasterEvent, DisasterType } from '../../src/types';

const router = express.Router();

// Disaster API configuration
const DISASTER_APIS = {
  usgs_earthquakes: {
    name: 'USGS Earthquake API',
    baseUrl: 'https://earthquake.usgs.gov/fdsnws/event/1',
    timeout: 10000
  },
  traffic: {
    name: 'Mock Traffic API',
    // In a real implementation, this would be a traffic API like HERE, MapBox, or Google
    baseUrl: 'https://api.example.com/traffic',
    timeout: 5000
  }
};

// Get all active disaster events
router.get('/active', async (req, res) => {
  try {
    const events = await DisasterEventModel.findActive();
    res.json({
      success: true,
      data: events
    } as ApiResponse<DisasterEvent[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active disaster events'
    } as ApiResponse<never>);
  }
});

// Get disaster events by location
router.get('/location', async (req, res) => {
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
    const radiusKm = radius ? parseFloat(radius as string) : 100;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      } as ApiResponse<never>);
    }

    const events = await DisasterEventModel.findByLocation(latitude, longitude, radiusKm);
    res.json({
      success: true,
      data: events
    } as ApiResponse<DisasterEvent[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch disaster events by location'
    } as ApiResponse<never>);
  }
});

// Get disaster events by type
router.get('/type/:type', async (req, res) => {
  try {
    const type = req.params.type as DisasterType;
    
    if (!['earthquake', 'traffic', 'fire', 'flood', 'storm', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid disaster type'
      } as ApiResponse<never>);
    }

    const events = await DisasterEventModel.findByType(type);
    res.json({
      success: true,
      data: events
    } as ApiResponse<DisasterEvent[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch disaster events by type'
    } as ApiResponse<never>);
  }
});

// Fetch and store earthquake data from USGS
router.post('/earthquakes/fetch', async (req, res) => {
  try {
    const { minMagnitude = 2.5, days = 1 } = req.body;
    
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - days);
    
    const response = await axios.get(`${DISASTER_APIS.usgs_earthquakes.baseUrl}/query`, {
      params: {
        format: 'geojson',
        starttime: startTime.toISOString().split('T')[0],
        minmagnitude: minMagnitude,
        limit: 100
      },
      timeout: DISASTER_APIS.usgs_earthquakes.timeout
    });

    const earthquakes = response.data.features;
    const createdEvents: DisasterEvent[] = [];

    for (const earthquake of earthquakes) {
      const props = earthquake.properties;
      const coords = earthquake.geometry.coordinates;
      
      // Check if we already have this earthquake
      try {
        await DisasterEventModel.findById(props.id);
        continue; // Skip if already exists
      } catch {
        // Earthquake doesn't exist, create it
      }

      const magnitude = props.mag;
      let severity = 'minor';
      if (magnitude >= 7.0) severity = 'extreme';
      else if (magnitude >= 6.0) severity = 'severe';
      else if (magnitude >= 4.0) severity = 'moderate';

      const eventData = {
        event_id: props.id,
        type: 'earthquake' as DisasterType,
        severity,
        title: `Magnitude ${magnitude} Earthquake`,
        description: props.title,
        latitude: coords[1],
        longitude: coords[0],
        radius_km: Math.max(10, magnitude * 10), // Rough estimate of affected area
        start_time: new Date(props.time).toISOString(),
        source: 'USGS',
        is_active: true
      };

      try {
        const event = await DisasterEventModel.create(eventData);
        createdEvents.push(event);
      } catch (createError) {
        console.error('Failed to create earthquake event:', createError);
      }
    }

    res.json({
      success: true,
      data: {
        fetched: earthquakes.length,
        created: createdEvents.length,
        events: createdEvents
      },
      message: `Fetched ${earthquakes.length} earthquakes, created ${createdEvents.length} new events`
    } as ApiResponse<any>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch earthquake data'
    } as ApiResponse<never>);
  }
});

// Create disaster event manually
router.post('/', async (req, res) => {
  try {
    const { event_id, type, severity, title, description, latitude, longitude, radius_km, start_time, end_time, source } = req.body;

    if (!event_id || !type || !severity || !title || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: event_id, type, severity, title, latitude, longitude'
      } as ApiResponse<never>);
    }

    if (!['earthquake', 'traffic', 'fire', 'flood', 'storm', 'other'].includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid disaster type'
      } as ApiResponse<never>);
    }

    const eventData = {
      event_id,
      type: type as DisasterType,
      severity,
      title,
      description: description || undefined,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius_km: radius_km ? parseFloat(radius_km) : undefined,
      start_time: start_time || new Date().toISOString(),
      end_time: end_time || undefined,
      source: source || 'Manual',
      is_active: true
    };

    const event = await DisasterEventModel.create(eventData);
    res.status(201).json({
      success: true,
      data: event,
      message: 'Disaster event created successfully'
    } as ApiResponse<DisasterEvent>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create disaster event'
    } as ApiResponse<never>);
  }
});

// Deactivate disaster event
router.post('/:eventId/deactivate', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    
    await DisasterEventModel.deactivate(eventId);
    res.json({
      success: true,
      message: 'Disaster event deactivated successfully'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate disaster event'
    } as ApiResponse<never>);
  }
});

// Create mock traffic incidents for demonstration
router.post('/traffic/mock', async (req, res) => {
  try {
    const { latitude = 33.2098, longitude = -87.5692 } = req.body;
    
    const mockIncidents = [
      {
        event_id: `TRAFFIC-${Date.now()}-1`,
        type: 'traffic' as DisasterType,
        severity: 'moderate',
        title: 'Multi-vehicle accident on I-65',
        description: 'Three-car accident blocking left lane, expect 20-minute delays',
        latitude: latitude + 0.01,
        longitude: longitude + 0.01,
        radius_km: 2,
        start_time: new Date().toISOString(),
        source: 'Traffic Management Center',
        is_active: true
      },
      {
        event_id: `TRAFFIC-${Date.now()}-2`,
        type: 'traffic' as DisasterType,
        severity: 'minor',
        title: 'Road construction on University Blvd',
        description: 'Lane closure for emergency repairs, use alternate routes',
        latitude: latitude - 0.005,
        longitude: longitude + 0.005,
        radius_km: 1,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours
        source: 'City Public Works',
        is_active: true
      }
    ];

    const createdEvents: DisasterEvent[] = [];
    
    for (const incident of mockIncidents) {
      try {
        const event = await DisasterEventModel.create(incident);
        createdEvents.push(event);
      } catch (createError) {
        console.error('Failed to create traffic incident:', createError);
      }
    }

    res.json({
      success: true,
      data: createdEvents,
      message: `Created ${createdEvents.length} mock traffic incidents`
    } as ApiResponse<DisasterEvent[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create mock traffic incidents'
    } as ApiResponse<never>);
  }
});

// Get disaster statistics
router.get('/stats', async (req, res) => {
  try {
    const activeEvents = await DisasterEventModel.findActive();
    
    const stats = {
      total_active: activeEvents.length,
      by_type: {} as Record<string, number>,
      by_severity: {} as Record<string, number>,
      recent_24h: 0
    };

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    activeEvents.forEach(event => {
      // Count by type
      stats.by_type[event.type] = (stats.by_type[event.type] || 0) + 1;
      
      // Count by severity
      stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;
      
      // Count recent events
      if (new Date(event.created_at) > twentyFourHoursAgo) {
        stats.recent_24h++;
      }
    });

    res.json({
      success: true,
      data: stats
    } as ApiResponse<typeof stats>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch disaster statistics'
    } as ApiResponse<never>);
  }
});

export default router;
