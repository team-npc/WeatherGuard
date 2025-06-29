import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    if (!lat || !lng) {
      return NextResponse.json({
        success: false,
        error: 'Latitude and longitude are required'
      }, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates'
      }, { status: 400 });
    }

    // Mock weather data for demo
    const mockWeatherData = {
      location: {
        lat: latitude,
        lon: longitude,
        name: 'Tuscaloosa, AL'
      },
      current: {
        temp: Math.round(65 + Math.random() * 20), // 65-85°F
        feels_like: Math.round(68 + Math.random() * 20),
        humidity: Math.round(40 + Math.random() * 40), // 40-80%
        pressure: Math.round(1000 + Math.random() * 40), // 1000-1040 mb
        visibility: Math.round(8 + Math.random() * 4), // 8-12 miles
        wind_speed: Math.round(Math.random() * 15), // 0-15 mph
        wind_direction: Math.round(Math.random() * 360),
        weather: {
          main: 'Partly Cloudy',
          description: 'Partly cloudy with chance of afternoon storms',
          icon: '02d'
        }
      },
      alerts: []
    };

    return NextResponse.json({
      success: true,
      data: mockWeatherData
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
