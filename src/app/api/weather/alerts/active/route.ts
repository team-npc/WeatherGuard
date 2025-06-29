import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock weather alerts for demo
    const mockAlerts = [
      {
        id: 1,
        alert_id: 'NWS-SEVERE-THUNDERSTORM-001',
        type: 'Severe Thunderstorm Warning',
        severity: 'severe',
        title: 'Severe Thunderstorm Warning for Tuscaloosa County',
        description: 'A severe thunderstorm warning has been issued for Tuscaloosa County until 8:00 PM. Expect heavy rain, strong winds up to 60 mph, and possible hail.',
        area_description: 'Tuscaloosa County, Alabama',
        latitude: 33.2098,
        longitude: -87.5692,
        radius_km: 25,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours from now
        created_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 2,
        alert_id: 'NWS-TORNADO-WATCH-002',
        type: 'Tornado Watch',
        severity: 'extreme',
        title: 'Tornado Watch for West Alabama',
        description: 'Conditions are favorable for tornado development. Stay alert and be prepared to take shelter.',
        area_description: 'West Alabama including Tuscaloosa, Birmingham metro areas',
        latitude: 33.5207,
        longitude: -86.8025,
        radius_km: 100,
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
        created_at: new Date().toISOString(),
        is_active: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockAlerts
    });
  } catch (error) {
    console.error('Weather alerts API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch weather alerts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
