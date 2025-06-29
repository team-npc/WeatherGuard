// Comprehensive test suite for WeatherService
// Tests API resilience, error handling, and offline functionality

import { weatherService } from '../../lib/services/weatherService';
import { WeatherData } from '../../types';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(require('axios'));

// Mock navigator for offline testing
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset navigator.onLine to true before each test
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });
    // Clear cache
    weatherService['cache'].clear();
  });

  describe('getCurrentWeather', () => {
    const testLat = 33.2098;
    const testLon = -87.5692;

    it('should return cached data when available', async () => {
      // Pre-populate cache
      const cachedData: WeatherData = {
        location: { lat: testLat, lon: testLon, name: 'Test Location' },
        current: {
          temp: 75,
          feels_like: 78,
          humidity: 60,
          pressure: 1013,
          visibility: 10,
          wind_speed: 5,
          wind_direction: 180,
          weather: { main: 'Clear', description: 'clear sky', icon: '01d' }
        }
      };

      weatherService['setCache'](`weather_current_${testLat}_${testLon}`, cachedData);

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      expect(result).toEqual(cachedData);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should handle offline mode gracefully', async () => {
      // Set offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(result).toBeDefined();
      expect(result.location.lat).toBe(testLat);
      expect(result.location.lon).toBe(testLon);
      expect(result.current.weather.description).toContain('Offline mode');
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should try OpenWeatherMap API first when online', async () => {
      const mockResponse = {
        data: {
          coord: { lat: testLat, lon: testLon },
          name: 'Tuscaloosa',
          main: {
            temp: 75,
            feels_like: 78,
            humidity: 60,
            pressure: 1013
          },
          wind: { speed: 5, deg: 180 },
          visibility: 16093,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('openweathermap.org'),
        expect.objectContaining({
          params: expect.objectContaining({
            lat: testLat,
            lon: testLon,
            units: 'imperial'
          })
        })
      );
      expect(result.current.temp).toBe(75);
    });

    it('should fallback to WeatherAPI when OpenWeatherMap fails', async () => {
      // Mock OpenWeatherMap failure
      mockedAxios.get
        .mockRejectedValueOnce(new Error('OpenWeatherMap API Error'))
        .mockResolvedValueOnce({
          data: {
            location: { lat: testLat, lon: testLon, name: 'Tuscaloosa' },
            current: {
              temp_f: 75,
              feelslike_f: 78,
              humidity: 60,
              pressure_in: 29.92,
              vis_miles: 10,
              wind_mph: 5,
              wind_degree: 180,
              condition: { text: 'Clear', icon: '//cdn.weatherapi.com/weather/64x64/day/113.png' }
            }
          }
        });

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(result.current.temp).toBe(75);
    });

    it('should return mock data when all APIs fail', async () => {
      // Mock all API failures
      mockedAxios.get.mockRejectedValue(new Error('All APIs failed'));

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(result).toBeDefined();
      expect(result.location.lat).toBe(testLat);
      expect(result.location.lon).toBe(testLon);
      expect(result.current.temp).toBeDefined();
    });

    it('should handle rate limiting correctly', async () => {
      // Simulate rate limiting by making multiple rapid calls
      const promises = Array(10).fill(null).map(() => 
        weatherService.getCurrentWeather(testLat, testLon)
      );

      mockedAxios.get.mockResolvedValue({
        data: {
          coord: { lat: testLat, lon: testLon },
          name: 'Tuscaloosa',
          main: { temp: 75, feels_like: 78, humidity: 60, pressure: 1013 },
          wind: { speed: 5, deg: 180 },
          visibility: 16093,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      });

      const results = await Promise.all(promises);
      
      // Should not exceed rate limits
      expect(results).toHaveLength(10);
      results.forEach(result => expect(result).toBeDefined());
    });

    it('should handle network timeouts', async () => {
      // Mock timeout
      mockedAxios.get.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      // Should return mock data on timeout
      expect(result).toBeDefined();
      expect(result.current.temp).toBeDefined();
    });
  });

  describe('API Health Monitoring', () => {
    it('should check API health status', async () => {
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('openweathermap')) {
          return Promise.resolve({ status: 200 });
        }
        if (url.includes('weatherapi')) {
          return Promise.resolve({ status: 200 });
        }
        return Promise.reject(new Error('API down'));
      });

      const health = await weatherService.checkHealth();
      
      expect(health).toBeDefined();
      expect(health.timestamp).toBeDefined();
      expect(health.apis).toBeDefined();
    });
  });

  describe('Caching', () => {
    it('should cache successful API responses', async () => {
      const mockResponse = {
        data: {
          coord: { lat: testLat, lon: testLon },
          name: 'Tuscaloosa',
          main: { temp: 75, feels_like: 78, humidity: 60, pressure: 1013 },
          wind: { speed: 5, deg: 180 },
          visibility: 16093,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      // First call should hit API
      await weatherService.getCurrentWeather(testLat, testLon);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await weatherService.getCurrentWeather(testLat, testLon);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

    it('should expire cache after TTL', async () => {
      const mockResponse = {
        data: {
          coord: { lat: testLat, lon: testLon },
          name: 'Tuscaloosa',
          main: { temp: 75, feels_like: 78, humidity: 60, pressure: 1013 },
          wind: { speed: 5, deg: 180 },
          visibility: 16093,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      // Mock cache TTL to be very short for testing
      const originalTTL = weatherService['CACHE_TTL'];
      weatherService['CACHE_TTL'] = 1; // 1ms

      await weatherService.getCurrentWeather(testLat, testLon);
      
      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      
      // Restore original TTL
      weatherService['CACHE_TTL'] = originalTTL;
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(result).toBeDefined();
      expect(result.current.weather.description).toContain('unavailable');
    });

    it('should handle API key errors', async () => {
      mockedAxios.get.mockRejectedValue({ 
        response: { status: 401, data: { message: 'Invalid API key' } }
      });

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(result).toBeDefined();
      expect(result.current.temp).toBeDefined();
    });

    it('should handle server errors (5xx)', async () => {
      mockedAxios.get.mockRejectedValue({ 
        response: { status: 500, data: { message: 'Internal Server Error' } }
      });

      const result = await weatherService.getCurrentWeather(testLat, testLon);
      
      expect(result).toBeDefined();
      expect(result.current.temp).toBeDefined();
    });
  });

  describe('Global Location Support', () => {
    const globalLocations = [
      { lat: 51.5074, lon: -0.1278, name: 'London' },
      { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
      { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
      { lat: 40.7128, lon: -74.0060, name: 'New York' }
    ];

    it('should handle weather requests for global locations', async () => {
      const mockResponse = {
        data: {
          coord: { lat: 0, lon: 0 },
          name: 'Global Location',
          main: { temp: 70, feels_like: 72, humidity: 50, pressure: 1013 },
          wind: { speed: 3, deg: 90 },
          visibility: 10000,
          weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }]
        }
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      for (const location of globalLocations) {
        const result = await weatherService.getCurrentWeather(location.lat, location.lon);
        expect(result).toBeDefined();
        expect(result.current.temp).toBeDefined();
      }
    });
  });

  describe('Emergency Scenarios', () => {
    it('should prioritize emergency functionality when APIs fail', async () => {
      // Simulate complete API failure
      mockedAxios.get.mockRejectedValue(new Error('Complete system failure'));

      // Set offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await weatherService.getCurrentWeather(testLat, testLon);

      // Should still return usable data for emergency situations
      expect(result).toBeDefined();
      expect(result.location).toBeDefined();
      expect(result.current).toBeDefined();
      expect(result.current.temp).toBeGreaterThan(0);
    });

    it('should provide emergency weather alerts when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const result = await weatherService.getCurrentWeather(testLat, testLon);

      expect(result.alerts).toBeDefined();
      expect(result.alerts?.length).toBeGreaterThan(0);
      expect(result.alerts?.[0].title).toContain('Offline');
    });
  });
});
