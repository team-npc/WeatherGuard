import express from 'express';
import axios from 'axios';
import { WeatherAlertModel } from '../../src/lib/models/safety';
import { ApiResponse, WeatherData, WeatherAlert } from '../../src/types';

const router = express.Router();

// Weather API configuration with fallback strategies
const WEATHER_APIS = {
  primary: {
    name: 'OpenWeatherMap',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
    apiKey: process.env.OPENWEATHER_API_KEY || 'demo_key',
    timeout: 5000
  },
  secondary: {
    name: 'WeatherAPI',
    baseUrl: 'https://api.weatherapi.com/v1',
    apiKey: process.env.WEATHERAPI_KEY || 'demo_key',
    timeout: 5000
  },
  tertiary: {
    name: 'National Weather Service',
    baseUrl: 'https://api.weather.gov',
    apiKey: null, // NWS API is free and doesn't require a key
    timeout: 8000
  }
};

// Weather API resilience helper
async function fetchWeatherWithFallback(latitude: number, longitude: number): Promise<WeatherData> {
  const errors: string[] = [];

  // Try primary API (OpenWeatherMap)
  try {
    const response = await axios.get(`${WEATHER_APIS.primary.baseUrl}/weather`, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: WEATHER_APIS.primary.apiKey,
        units: 'imperial'
      },
      timeout: WEATHER_APIS.primary.timeout
    });

    return transformOpenWeatherData(response.data, latitude, longitude);
  } catch (error) {
    errors.push(`${WEATHER_APIS.primary.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Try secondary API (WeatherAPI)
  try {
    const response = await axios.get(`${WEATHER_APIS.secondary.baseUrl}/current.json`, {
      params: {
        key: WEATHER_APIS.secondary.apiKey,
        q: `${latitude},${longitude}`,
        aqi: 'no'
      },
      timeout: WEATHER_APIS.secondary.timeout
    });

    return transformWeatherAPIData(response.data, latitude, longitude);
  } catch (error) {
    errors.push(`${WEATHER_APIS.secondary.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Try tertiary API (National Weather Service)
  try {
    // First get the grid point
    const pointResponse = await axios.get(`${WEATHER_APIS.tertiary.baseUrl}/points/${latitude},${longitude}`, {
      timeout: WEATHER_APIS.tertiary.timeout
    });

    const gridId = pointResponse.data.properties.gridId;
    const gridX = pointResponse.data.properties.gridX;
    const gridY = pointResponse.data.properties.gridY;

    // Get current conditions
    const forecastResponse = await axios.get(`${WEATHER_APIS.tertiary.baseUrl}/gridpoints/${gridId}/${gridX},${gridY}/forecast`, {
      timeout: WEATHER_APIS.tertiary.timeout
    });

    return transformNWSData(forecastResponse.data, latitude, longitude);
  } catch (error) {
    errors.push(`${WEATHER_APIS.tertiary.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // If all APIs fail, return mock data with error information
  return {
    location: { lat: latitude, lon: longitude, name: 'Unknown Location' },
    current: {
      temp: 72,
      feels_like: 75,
      humidity: 50,
      pressure: 1013,
      visibility: 10,
      wind_speed: 5,
      wind_direction: 180,
      weather: {
        main: 'Unknown',
        description: 'Weather data temporarily unavailable',
        icon: '01d'
      }
    },
    alerts: [{
      id: 0,
      alert_id: 'API_ERROR',
      type: 'System Alert',
      severity: 'minor' as const,
      title: 'Weather Data Unavailable',
      description: `Unable to fetch weather data. Errors: ${errors.join('; ')}`,
      created_at: new Date().toISOString(),
      is_active: true
    }]
  };
}

// Data transformation functions
function transformOpenWeatherData(data: any, lat: number, lon: number): WeatherData {
  return {
    location: {
      lat,
      lon,
      name: data.name || 'Unknown Location'
    },
    current: {
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      visibility: data.visibility ? Math.round(data.visibility / 1609.34) : 10, // Convert to miles
      wind_speed: Math.round(data.wind.speed),
      wind_direction: data.wind.deg || 0,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      }
    }
  };
}

function transformWeatherAPIData(data: any, lat: number, lon: number): WeatherData {
  return {
    location: {
      lat,
      lon,
      name: data.location.name
    },
    current: {
      temp: Math.round(data.current.temp_f),
      feels_like: Math.round(data.current.feelslike_f),
      humidity: data.current.humidity,
      pressure: Math.round(data.current.pressure_mb),
      visibility: Math.round(data.current.vis_miles),
      wind_speed: Math.round(data.current.wind_mph),
      wind_direction: data.current.wind_degree,
      weather: {
        main: data.current.condition.text,
        description: data.current.condition.text,
        icon: '01d' // Default icon
      }
    }
  };
}

function transformNWSData(data: any, lat: number, lon: number): WeatherData {
  const current = data.properties.periods[0];
  return {
    location: {
      lat,
      lon,
      name: 'NWS Location'
    },
    current: {
      temp: current.temperature,
      feels_like: current.temperature,
      humidity: 50, // NWS doesn't provide humidity in basic forecast
      pressure: 1013, // Default
      visibility: 10, // Default
      wind_speed: parseInt(current.windSpeed?.split(' ')[0]) || 0,
      wind_direction: 180, // Default
      weather: {
        main: current.shortForecast,
        description: current.detailedForecast,
        icon: '01d'
      }
    }
  };
}

// Routes

// Get current weather for coordinates
router.get('/current', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      } as ApiResponse<never>);
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      } as ApiResponse<never>);
    }

    const weatherData = await fetchWeatherWithFallback(latitude, longitude);
    
    res.json({
      success: true,
      data: weatherData
    } as ApiResponse<WeatherData>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weather data'
    } as ApiResponse<never>);
  }
});

// Get weather alerts for location
router.get('/alerts', async (req, res) => {
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
    const radiusKm = radius ? parseFloat(radius as string) : 50;

    if (isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid coordinates'
      } as ApiResponse<never>);
    }

    const alerts = await WeatherAlertModel.findByLocation(latitude, longitude, radiusKm);
    
    res.json({
      success: true,
      data: alerts
    } as ApiResponse<WeatherAlert[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch weather alerts'
    } as ApiResponse<never>);
  }
});

// Get all active weather alerts
router.get('/alerts/active', async (req, res) => {
  try {
    const alerts = await WeatherAlertModel.findActive();
    
    res.json({
      success: true,
      data: alerts
    } as ApiResponse<WeatherAlert[]>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch active alerts'
    } as ApiResponse<never>);
  }
});

// Create weather alert (for testing/admin purposes)
router.post('/alerts', async (req, res) => {
  try {
    const alertData = req.body;
    
    if (!alertData.alert_id || !alertData.type || !alertData.severity || !alertData.title) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: alert_id, type, severity, title'
      } as ApiResponse<never>);
    }

    const alert = await WeatherAlertModel.create({
      ...alertData,
      is_active: alertData.is_active !== undefined ? alertData.is_active : true
    });
    
    res.status(201).json({
      success: true,
      data: alert,
      message: 'Weather alert created successfully'
    } as ApiResponse<WeatherAlert>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create weather alert'
    } as ApiResponse<never>);
  }
});

// Deactivate weather alert
router.post('/alerts/:alertId/deactivate', async (req, res) => {
  try {
    const alertId = req.params.alertId;
    
    await WeatherAlertModel.deactivate(alertId);
    
    res.json({
      success: true,
      message: 'Weather alert deactivated successfully'
    } as ApiResponse<never>);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate weather alert'
    } as ApiResponse<never>);
  }
});

// API health check endpoint
router.get('/health', async (req, res) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    apis: {} as Record<string, { status: string; responseTime?: number; error?: string }>
  };

  // Test each weather API
  for (const [key, api] of Object.entries(WEATHER_APIS)) {
    const startTime = Date.now();
    try {
      let testUrl = '';
      if (key === 'primary') {
        testUrl = `${api.baseUrl}/weather?lat=33.2098&lon=-87.5692&appid=${api.apiKey}&units=imperial`;
      } else if (key === 'secondary') {
        testUrl = `${api.baseUrl}/current.json?key=${api.apiKey}&q=33.2098,-87.5692&aqi=no`;
      } else {
        testUrl = `${api.baseUrl}/points/33.2098,-87.5692`;
      }

      await axios.get(testUrl, { timeout: 3000 });
      healthStatus.apis[key] = {
        status: 'healthy',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      healthStatus.apis[key] = {
        status: 'unhealthy',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  res.json({
    success: true,
    data: healthStatus
  } as ApiResponse<typeof healthStatus>);
});

export default router;
