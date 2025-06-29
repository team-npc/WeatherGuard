import { NextRequest, NextResponse } from 'next/server';
import { weatherService } from '@/lib/services/weatherService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Validate required parameters
    if (!lat || !lng || !year || !month) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: lat, lng, year, month'
      }, { status: 400 });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validate parameter values
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coordinates'
      }, { status: 400 });
    }

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json({
        success: false,
        error: 'Invalid year or month'
      }, { status: 400 });
    }

    // Validate year range (Meteostat typically has data from 1970 onwards)
    const currentYear = new Date().getFullYear();
    if (yearNum < 1970 || yearNum > currentYear) {
      return NextResponse.json({
        success: false,
        error: `Year must be between 1970 and ${currentYear}`
      }, { status: 400 });
    }

    // Fetch monthly point data from Meteostat
    const monthlyData = await weatherService.getMonthlyPointData(
      latitude,
      longitude,
      yearNum,
      monthNum
    );

    return NextResponse.json({
      success: true,
      data: monthlyData
    });

  } catch (error) {
    console.error('Meteostat monthly data API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch monthly weather data'
    }, { status: 500 });
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
