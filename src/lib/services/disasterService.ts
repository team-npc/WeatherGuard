import axios from 'axios';
import { DisasterEvent, DisasterType } from '../../types';
import { DisasterEventModel } from '../models/safety';

// Enhanced interfaces for global disaster data
interface WildfireData {
  features: Array<{
    attributes: {
      OBJECTID: number;
      INCIDENT_NAME: string;
      INCIDENT_ACRES_BURNED: number;
      INCIDENT_DATE_CREATED: string;
      INCIDENT_COUNTY: string;
      INCIDENT_STATE: string;
      INCIDENT_LONGITUDE: number;
      INCIDENT_LATITUDE: number;
      INCIDENT_CONTAINMENT_PCT: number;
      INCIDENT_DESCRIPTION: string;
    };
  }>;
}

interface PoliticalUnrestData {
  data: Array<{
    id: string;
    event_type: string;
    event_date: string;
    country: string;
    admin1: string;
    admin2: string;
    location: string;
    latitude: number;
    longitude: number;
    fatalities: number;
    notes: string;
    source: string;
  }>;
}

interface TrafficIncidentData {
  incidents: Array<{
    id: string;
    type: string;
    description: string;
    location: {
      lat: number;
      lng: number;
      address: string;
    };
    severity: string;
    startTime: string;
    estimatedEndTime?: string;
    source: string;
  }>;
}

interface EarthquakeData {
  type: string;
  features: Array<{
    id: string;
    properties: {
      mag: number;
      place: string;
      time: number;
      updated: number;
      tz: number;
      url: string;
      detail: string;
      felt: number;
      cdi: number;
      mmi: number;
      alert: string;
      status: string;
      tsunami: number;
      sig: number;
      net: string;
      code: string;
      ids: string;
      sources: string;
      types: string;
      nst: number;
      dmin: number;
      rms: number;
      gap: number;
      magType: string;
      type: string;
      title: string;
    };
    geometry: {
      type: string;
      coordinates: [number, number, number];
    };
  }>;
}

class DisasterService {
  // Enhanced API endpoints for global coverage
  private readonly USGS_BASE_URL = process.env.USGS_EARTHQUAKE_URL || 'https://earthquake.usgs.gov/fdsnws/event/1';
  private readonly WILDFIRE_API_URL = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Current_WildlandFire_Perimeters/FeatureServer/0/query';
  private readonly ACLED_API_URL = 'https://api.acleddata.com/acled/read'; // Political unrest data
  private readonly GDACS_API_URL = 'https://www.gdacs.org/gdacsapi/api/events/geteventlist/MAP'; // Global disaster alerts
  private readonly NASA_FIRMS_URL = 'https://firms.modaps.eosdis.nasa.gov/api/area/csv'; // Fire data

  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: any; timestamp: number }> = new Map();

  // Rate limiting for API calls
  private lastApiCall: Map<string, number> = new Map();
  private readonly API_RATE_LIMIT = 1000; // 1 second between calls

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached || Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private async checkRateLimit(apiKey: string): Promise<void> {
    const lastCall = this.lastApiCall.get(apiKey) || 0;
    const timeSinceLastCall = Date.now() - lastCall;

    if (timeSinceLastCall < this.API_RATE_LIMIT) {
      await new Promise(resolve => setTimeout(resolve, this.API_RATE_LIMIT - timeSinceLastCall));
    }

    this.lastApiCall.set(apiKey, Date.now());
  }

  // Enhanced wildfire data fetching with global coverage
  async fetchActiveWildfires(options: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    minAcres?: number;
    country?: string;
  } = {}): Promise<DisasterEvent[]> {
    const {
      latitude,
      longitude,
      radiusKm = 500,
      minAcres = 100,
      country = 'US'
    } = options;

    const cacheKey = `wildfires_${JSON.stringify(options)}`;
    const cached = this.getFromCache<DisasterEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.checkRateLimit('wildfire');

      // For demo purposes, we'll use mock wildfire data with global coverage
      const mockWildfires = await this.getMockWildfireData(options);

      this.setCache(cacheKey, mockWildfires);
      return mockWildfires;
    } catch (error) {
      console.error('Failed to fetch wildfire data:', error);
      return this.getMockWildfireData(options);
    }
  }

  private async getMockWildfireData(options: any): Promise<DisasterEvent[]> {
    // Comprehensive global wildfire mock data
    const globalWildfires: Omit<DisasterEvent, 'id' | 'created_at'>[] = [
      // California Wildfires
      {
        event_id: 'FIRE_CA_001',
        type: 'fire',
        severity: 'severe',
        title: 'Riverside County Fire',
        description: 'Large wildfire burning in Riverside County, 15,000 acres burned, 25% contained',
        latitude: 33.7175,
        longitude: -116.2023,
        radius_km: 25,
        start_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'CAL FIRE',
        is_active: true
      },
      // Australia Bushfires
      {
        event_id: 'FIRE_AU_001',
        type: 'fire',
        severity: 'extreme',
        title: 'Blue Mountains Bushfire',
        description: 'Major bushfire threatening communities in Blue Mountains region',
        latitude: -33.7022,
        longitude: 150.3111,
        radius_km: 40,
        start_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'NSW Rural Fire Service',
        is_active: true
      },
      // Canada Wildfires
      {
        event_id: 'FIRE_CA_BC_001',
        type: 'fire',
        severity: 'severe',
        title: 'British Columbia Forest Fire',
        description: 'Wildfire burning in British Columbia forest region',
        latitude: 54.7267,
        longitude: -127.6476,
        radius_km: 30,
        start_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'BC Wildfire Service',
        is_active: true
      },
      // Mediterranean Fires
      {
        event_id: 'FIRE_GR_001',
        type: 'fire',
        severity: 'moderate',
        title: 'Attica Region Fire',
        description: 'Forest fire in Attica region near Athens',
        latitude: 38.0742,
        longitude: 23.8243,
        radius_km: 15,
        start_time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        source: 'Hellenic Fire Service',
        is_active: true
      }
    ];

    // Filter based on location if provided
    if (options.latitude && options.longitude) {
      return globalWildfires.filter(fire => {
        const distance = this.calculateDistance(
          options.latitude, options.longitude,
          fire.latitude, fire.longitude
        );
        return distance <= (options.radiusKm || 500);
      }).map(fire => ({ ...fire, id: 0, created_at: new Date().toISOString() }));
    }

    return globalWildfires.map(fire => ({ ...fire, id: 0, created_at: new Date().toISOString() }));
  }

  // Political unrest and civil disturbance monitoring
  async fetchPoliticalUnrestEvents(options: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    country?: string;
    daysBack?: number;
  } = {}): Promise<DisasterEvent[]> {
    const {
      latitude,
      longitude,
      radiusKm = 200,
      country,
      daysBack = 7
    } = options;

    const cacheKey = `unrest_${JSON.stringify(options)}`;
    const cached = this.getFromCache<DisasterEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.checkRateLimit('unrest');

      // For demo purposes, using mock political unrest data
      const mockUnrestEvents = await this.getMockUnrestData(options);

      this.setCache(cacheKey, mockUnrestEvents);
      return mockUnrestEvents;
    } catch (error) {
      console.error('Failed to fetch political unrest data:', error);
      return this.getMockUnrestData(options);
    }
  }

  private async getMockUnrestData(options: any): Promise<DisasterEvent[]> {
    // Global political unrest and civil disturbance mock data
    const globalUnrestEvents: Omit<DisasterEvent, 'id' | 'created_at'>[] = [
      {
        event_id: 'UNREST_001',
        type: 'other',
        severity: 'moderate',
        title: 'Peaceful Protest',
        description: 'Large peaceful demonstration in city center, road closures expected',
        latitude: 40.7589,
        longitude: -73.9851,
        radius_km: 5,
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Local Authorities',
        is_active: true
      },
      {
        event_id: 'UNREST_002',
        type: 'other',
        severity: 'severe',
        title: 'Civil Disturbance',
        description: 'Civil unrest reported, avoid downtown area',
        latitude: 34.0522,
        longitude: -118.2437,
        radius_km: 10,
        start_time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        source: 'Emergency Services',
        is_active: true
      }
    ];

    // Filter based on location if provided
    if (options.latitude && options.longitude) {
      return globalUnrestEvents.filter(event => {
        const distance = this.calculateDistance(
          options.latitude, options.longitude,
          event.latitude, event.longitude
        );
        return distance <= (options.radiusKm || 200);
      }).map(event => ({ ...event, id: 0, created_at: new Date().toISOString() }));
    }

    return globalUnrestEvents.map(event => ({ ...event, id: 0, created_at: new Date().toISOString() }));
  }

  // Global disaster alerts from multiple sources
  async fetchGlobalDisasterAlerts(options: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    severityLevel?: string;
  } = {}): Promise<DisasterEvent[]> {
    const {
      latitude,
      longitude,
      radiusKm = 1000,
      severityLevel = 'moderate'
    } = options;

    const cacheKey = `global_disasters_${JSON.stringify(options)}`;
    const cached = this.getFromCache<DisasterEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      await this.checkRateLimit('global_disasters');

      // Combine multiple disaster types
      const [earthquakes, wildfires, unrestEvents, weatherEvents] = await Promise.all([
        this.fetchRecentEarthquakes({ latitude, longitude, maxRadiusKm: radiusKm }),
        this.fetchActiveWildfires({ latitude, longitude, radiusKm }),
        this.fetchPoliticalUnrestEvents({ latitude, longitude, radiusKm }),
        this.fetchSevereWeatherEvents({ latitude, longitude, radiusKm })
      ]);

      const allEvents = [...earthquakes, ...wildfires, ...unrestEvents, ...weatherEvents];

      this.setCache(cacheKey, allEvents);
      return allEvents;
    } catch (error) {
      console.error('Failed to fetch global disaster alerts:', error);
      return [];
    }
  }

  // Severe weather events (floods, storms, etc.)
  async fetchSevereWeatherEvents(options: {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
  } = {}): Promise<DisasterEvent[]> {
    const mockWeatherEvents: Omit<DisasterEvent, 'id' | 'created_at'>[] = [
      {
        event_id: 'WEATHER_FLOOD_001',
        type: 'flood',
        severity: 'severe',
        title: 'Flash Flood Warning',
        description: 'Flash flooding in low-lying areas, avoid travel',
        latitude: 29.7604,
        longitude: -95.3698,
        radius_km: 50,
        start_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        source: 'National Weather Service',
        is_active: true
      },
      {
        event_id: 'WEATHER_STORM_001',
        type: 'storm',
        severity: 'extreme',
        title: 'Severe Thunderstorm',
        description: 'Severe thunderstorm with damaging winds and large hail',
        latitude: 39.7392,
        longitude: -104.9903,
        radius_km: 75,
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        source: 'National Weather Service',
        is_active: true
      }
    ];

    // Filter based on location if provided
    if (options.latitude && options.longitude) {
      return mockWeatherEvents.filter(event => {
        const distance = this.calculateDistance(
          options.latitude, options.longitude,
          event.latitude, event.longitude
        );
        return distance <= (options.radiusKm || 1000);
      }).map(event => ({ ...event, id: 0, created_at: new Date().toISOString() }));
    }

    return mockWeatherEvents.map(event => ({ ...event, id: 0, created_at: new Date().toISOString() }));
  }

  // Utility function to calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async fetchRecentEarthquakes(options: {
    minMagnitude?: number;
    maxMagnitude?: number;
    startTime?: Date;
    endTime?: Date;
    latitude?: number;
    longitude?: number;
    maxRadiusKm?: number;
    limit?: number;
  } = {}): Promise<DisasterEvent[]> {
    const {
      minMagnitude = 2.5,
      maxMagnitude = 10,
      startTime = new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      endTime = new Date(),
      latitude,
      longitude,
      maxRadiusKm = 1000,
      limit = 100
    } = options;

    const cacheKey = `earthquakes_${JSON.stringify(options)}`;
    const cached = this.getFromCache<DisasterEvent[]>(cacheKey);
    if (cached) return cached;

    try {
      const params: any = {
        format: 'geojson',
        starttime: startTime.toISOString().split('T')[0],
        endtime: endTime.toISOString().split('T')[0],
        minmagnitude: minMagnitude,
        maxmagnitude: maxMagnitude,
        limit: limit,
        orderby: 'time-asc'
      };

      // Add location-based filtering if coordinates provided
      if (latitude !== undefined && longitude !== undefined) {
        params.latitude = latitude;
        params.longitude = longitude;
        params.maxradiuskm = maxRadiusKm;
      }

      const response = await axios.get(`${this.USGS_BASE_URL}/query`, {
        params,
        timeout: 15000
      });

      const earthquakeData: EarthquakeData = response.data;
      const events: DisasterEvent[] = [];

      for (const feature of earthquakeData.features) {
        const props = feature.properties;
        const coords = feature.geometry.coordinates;

        // Skip if we already have this earthquake in our database
        try {
          const existing = await DisasterEventModel.findById(feature.id);
          if (existing) continue;
        } catch {
          // Event doesn't exist, continue processing
        }

        const magnitude = props.mag;
        const severity = this.getEarthquakeSeverity(magnitude);

        const event: Omit<DisasterEvent, 'id' | 'created_at'> = {
          event_id: feature.id,
          type: 'earthquake',
          severity,
          title: `Magnitude ${magnitude.toFixed(1)} Earthquake`,
          description: props.title,
          latitude: coords[1],
          longitude: coords[0],
          radius_km: this.getEarthquakeRadius(magnitude),
          start_time: new Date(props.time).toISOString(),
          source: 'USGS',
          is_active: this.isEarthquakeActive(props.time)
        };

        events.push(event as DisasterEvent);
      }

      this.setCache(cacheKey, events);
      return events;
    } catch (error) {
      console.error('Failed to fetch earthquake data:', error);
      throw new Error(`Failed to fetch earthquake data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async storeEarthquakes(events: DisasterEvent[]): Promise<DisasterEvent[]> {
    const storedEvents: DisasterEvent[] = [];

    for (const event of events) {
      try {
        // Check if event already exists
        try {
          await DisasterEventModel.findById(event.event_id);
          continue; // Skip if already exists
        } catch {
          // Event doesn't exist, create it
        }

        const storedEvent = await DisasterEventModel.create(event);
        storedEvents.push(storedEvent);
      } catch (error) {
        console.error(`Failed to store earthquake ${event.event_id}:`, error);
      }
    }

    return storedEvents;
  }

  async createTrafficIncident(data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: string;
    estimatedDuration?: number; // in minutes
    source?: string;
  }): Promise<DisasterEvent> {
    const eventId = `TRAFFIC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const endTime = data.estimatedDuration 
      ? new Date(Date.now() + data.estimatedDuration * 60 * 1000)
      : undefined;

    const event: Omit<DisasterEvent, 'id' | 'created_at'> = {
      event_id: eventId,
      type: 'traffic',
      severity: data.severity,
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      radius_km: this.getTrafficIncidentRadius(data.severity),
      start_time: new Date().toISOString(),
      end_time: endTime?.toISOString(),
      source: data.source || 'Manual Report',
      is_active: true
    };

    return await DisasterEventModel.create(event);
  }

  async createFireIncident(data: {
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    severity: string;
    acresBurned?: number;
    containmentPercent?: number;
    source?: string;
  }): Promise<DisasterEvent> {
    const eventId = `FIRE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const event: Omit<DisasterEvent, 'id' | 'created_at'> = {
      event_id: eventId,
      type: 'fire',
      severity: data.severity,
      title: data.title,
      description: data.description,
      latitude: data.latitude,
      longitude: data.longitude,
      radius_km: this.getFireRadius(data.acresBurned || 0),
      start_time: new Date().toISOString(),
      source: data.source || 'Fire Department',
      is_active: true
    };

    return await DisasterEventModel.create(event);
  }

  async getActiveDisastersNearLocation(
    latitude: number, 
    longitude: number, 
    radiusKm: number = 100
  ): Promise<DisasterEvent[]> {
    const cacheKey = `active_disasters_${latitude}_${longitude}_${radiusKm}`;
    const cached = this.getFromCache<DisasterEvent[]>(cacheKey);
    if (cached) return cached;

    const events = await DisasterEventModel.findByLocation(latitude, longitude, radiusKm);
    this.setCache(cacheKey, events);
    return events;
  }

  async getDisasterStatistics(): Promise<{
    total_active: number;
    by_type: Record<DisasterType, number>;
    by_severity: Record<string, number>;
    recent_24h: number;
    most_severe: DisasterEvent | null;
  }> {
    const activeEvents = await DisasterEventModel.findActive();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stats = {
      total_active: activeEvents.length,
      by_type: {} as Record<DisasterType, number>,
      by_severity: {} as Record<string, number>,
      recent_24h: 0,
      most_severe: null as DisasterEvent | null
    };

    let mostSevereEvent: DisasterEvent | null = null;
    const severityOrder = { 'extreme': 4, 'severe': 3, 'moderate': 2, 'minor': 1 };

    for (const event of activeEvents) {
      // Count by type
      stats.by_type[event.type] = (stats.by_type[event.type] || 0) + 1;
      
      // Count by severity
      stats.by_severity[event.severity] = (stats.by_severity[event.severity] || 0) + 1;
      
      // Count recent events
      if (new Date(event.created_at) > twentyFourHoursAgo) {
        stats.recent_24h++;
      }

      // Find most severe event
      const currentSeverity = severityOrder[event.severity as keyof typeof severityOrder] || 0;
      const mostSevereSeverity = mostSevereEvent 
        ? severityOrder[mostSevereEvent.severity as keyof typeof severityOrder] || 0
        : 0;

      if (currentSeverity > mostSevereSeverity) {
        mostSevereEvent = event;
      }
    }

    stats.most_severe = mostSevereEvent;
    return stats;
  }

  // Helper methods
  private getEarthquakeSeverity(magnitude: number): string {
    if (magnitude >= 8.0) return 'extreme';
    if (magnitude >= 7.0) return 'severe';
    if (magnitude >= 5.0) return 'moderate';
    return 'minor';
  }

  private getEarthquakeRadius(magnitude: number): number {
    // Rough estimate of earthquake impact radius in km
    if (magnitude >= 8.0) return 1000;
    if (magnitude >= 7.0) return 500;
    if (magnitude >= 6.0) return 200;
    if (magnitude >= 5.0) return 100;
    if (magnitude >= 4.0) return 50;
    return 25;
  }

  private getTrafficIncidentRadius(severity: string): number {
    switch (severity.toLowerCase()) {
      case 'extreme': return 10;
      case 'severe': return 5;
      case 'moderate': return 3;
      default: return 1;
    }
  }

  private getFireRadius(acresBurned: number): number {
    // Convert acres to approximate radius in km
    if (acresBurned > 10000) return 50;
    if (acresBurned > 1000) return 20;
    if (acresBurned > 100) return 10;
    return 5;
  }

  private isEarthquakeActive(timestamp: number): boolean {
    // Consider earthquakes active for 24 hours after they occur
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    return timestamp > twentyFourHoursAgo;
  }

  async healthCheck(): Promise<{
    usgs_api: { status: string; responseTime?: number; error?: string };
    database: { status: string; active_events: number };
    cache: { size: number; hit_rate?: number };
  }> {
    const health = {
      usgs_api: { status: 'unknown' as string },
      database: { status: 'unknown' as string, active_events: 0 },
      cache: { size: this.cache.size }
    };

    // Test USGS API
    const startTime = Date.now();
    try {
      await axios.get(`${this.USGS_BASE_URL}/query`, {
        params: {
          format: 'geojson',
          starttime: new Date(Date.now() - 60000).toISOString().split('T')[0], // 1 minute ago
          minmagnitude: 1,
          limit: 1
        },
        timeout: 5000
      });
      health.usgs_api = {
        status: 'healthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      health.usgs_api = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test database
    try {
      const activeEvents = await DisasterEventModel.findActive();
      health.database = {
        status: 'healthy',
        active_events: activeEvents.length
      };
    } catch (error) {
      health.database = {
        status: 'unhealthy',
        active_events: 0
      };
    }

    return health;
  }
}

export const disasterService = new DisasterService();
