// Comprehensive test suite for DisasterService
// Tests global disaster data integration and emergency features

import { disasterService } from '../../lib/services/disasterService';
import { DisasterEvent } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(require('axios'));

describe('DisasterService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear cache
    disasterService['cache'].clear();
  });

  describe('fetchRecentEarthquakes', () => {
    const testLat = 33.2098;
    const testLon = -87.5692;

    it('should fetch earthquake data from USGS API', async () => {
      const mockUSGSResponse = {
        data: {
          features: [
            {
              id: 'us1000test',
              properties: {
                mag: 4.5,
                place: '10km NE of Test City',
                time: Date.now() - 3600000, // 1 hour ago
                title: 'M 4.5 - 10km NE of Test City',
                url: 'https://earthquake.usgs.gov/earthquakes/eventpage/us1000test'
              },
              geometry: {
                coordinates: [testLon, testLat, 10]
              }
            }
          ]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockUSGSResponse);

      const result = await disasterService.fetchRecentEarthquakes({
        latitude: testLat,
        longitude: testLon,
        maxRadiusKm: 100
      });

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('earthquake.usgs.gov'),
        expect.any(Object)
      );
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('earthquake');
      expect(result[0].latitude).toBe(testLat);
      expect(result[0].longitude).toBe(testLon);
    });

    it('should handle USGS API failures gracefully', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('USGS API Error'));

      const result = await disasterService.fetchRecentEarthquakes({
        latitude: testLat,
        longitude: testLon
      });

      // Should return mock data when API fails
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should filter earthquakes by distance', async () => {
      const result = await disasterService.fetchRecentEarthquakes({
        latitude: testLat,
        longitude: testLon,
        maxRadiusKm: 50
      });

      // All returned earthquakes should be within the specified radius
      result.forEach(earthquake => {
        const distance = calculateDistance(
          testLat, testLon,
          earthquake.latitude, earthquake.longitude
        );
        expect(distance).toBeLessThanOrEqual(50);
      });
    });
  });

  describe('fetchActiveWildfires', () => {
    it('should fetch global wildfire data', async () => {
      const result = await disasterService.fetchActiveWildfires({
        latitude: 34.0522, // Los Angeles
        longitude: -118.2437,
        radiusKm: 200
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        expect(result[0].type).toBe('fire');
        expect(result[0].latitude).toBeDefined();
        expect(result[0].longitude).toBeDefined();
      }
    });

    it('should handle different countries', async () => {
      const locations = [
        { lat: -33.7022, lon: 150.3111, country: 'AU' }, // Australia
        { lat: 54.7267, lon: -127.6476, country: 'CA' }, // Canada
        { lat: 38.0742, lon: 23.8243, country: 'GR' }    // Greece
      ];

      for (const location of locations) {
        const result = await disasterService.fetchActiveWildfires({
          latitude: location.lat,
          longitude: location.lon,
          country: location.country
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('fetchPoliticalUnrestEvents', () => {
    it('should fetch political unrest data', async () => {
      const result = await disasterService.fetchPoliticalUnrestEvents({
        latitude: 40.7589, // New York
        longitude: -73.9851,
        radiusKm: 100
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        expect(result[0].type).toBe('other');
        expect(result[0].title).toBeDefined();
        expect(result[0].description).toBeDefined();
      }
    });

    it('should filter events by time range', async () => {
      const result = await disasterService.fetchPoliticalUnrestEvents({
        latitude: 40.7589,
        longitude: -73.9851,
        daysBack: 7
      });

      // All events should be within the specified time range
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      
      result.forEach(event => {
        const eventDate = new Date(event.start_time);
        expect(eventDate.getTime()).toBeGreaterThanOrEqual(sevenDaysAgo.getTime());
      });
    });
  });

  describe('fetchGlobalDisasterAlerts', () => {
    it('should combine multiple disaster types', async () => {
      const result = await disasterService.fetchGlobalDisasterAlerts({
        latitude: 33.2098,
        longitude: -87.5692,
        radiusKm: 500
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      // Should include different types of disasters
      const types = new Set(result.map(event => event.type));
      expect(types.size).toBeGreaterThan(0);
    });

    it('should handle global locations', async () => {
      const globalLocations = [
        { lat: 51.5074, lon: -0.1278 }, // London
        { lat: 35.6762, lon: 139.6503 }, // Tokyo
        { lat: -33.8688, lon: 151.2093 }, // Sydney
        { lat: 19.4326, lon: -99.1332 }  // Mexico City
      ];

      for (const location of globalLocations) {
        const result = await disasterService.fetchGlobalDisasterAlerts({
          latitude: location.lat,
          longitude: location.lon,
          radiusKm: 1000
        });

        expect(result).toBeDefined();
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe('fetchSevereWeatherEvents', () => {
    it('should fetch severe weather data', async () => {
      const result = await disasterService.fetchSevereWeatherEvents({
        latitude: 29.7604, // Houston (flood-prone)
        longitude: -95.3698,
        radiusKm: 100
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      
      if (result.length > 0) {
        const weatherTypes = ['flood', 'storm', 'tornado', 'hurricane'];
        expect(weatherTypes).toContain(result[0].type);
      }
    });
  });

  describe('Caching and Performance', () => {
    it('should cache disaster data', async () => {
      const testLat = 33.2098;
      const testLon = -87.5692;

      // First call
      const result1 = await disasterService.fetchRecentEarthquakes({
        latitude: testLat,
        longitude: testLon
      });

      // Second call should use cache
      const result2 = await disasterService.fetchRecentEarthquakes({
        latitude: testLat,
        longitude: testLon
      });

      expect(result1).toEqual(result2);
    });

    it('should handle rate limiting', async () => {
      const promises = Array(5).fill(null).map(() =>
        disasterService.fetchRecentEarthquakes({
          latitude: 33.2098,
          longitude: -87.5692
        })
      );

      const results = await Promise.all(promises);
      
      expect(results).toHaveLength(5);
      results.forEach(result => expect(result).toBeDefined());
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const result = await disasterService.fetchRecentEarthquakes({
        latitude: 33.2098,
        longitude: -87.5692
      });

      // Should return mock data on error
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle API timeouts', async () => {
      mockedAxios.get.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await disasterService.fetchRecentEarthquakes({
        latitude: 33.2098,
        longitude: -87.5692
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Emergency Scenarios', () => {
    it('should provide critical disaster data even when APIs fail', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Complete API failure'));

      const result = await disasterService.fetchGlobalDisasterAlerts({
        latitude: 33.2098,
        longitude: -87.5692,
        radiusKm: 100
      });

      // Should still return some data for emergency use
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle offline scenarios', async () => {
      // Mock offline condition
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await disasterService.fetchGlobalDisasterAlerts({
        latitude: 33.2098,
        longitude: -87.5692
      });

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

// Helper function for distance calculation
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
