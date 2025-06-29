import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock disaster events for demo
    const mockDisasterEvents = [
      {
        id: 1,
        event_id: 'USGS-EQ-001',
        type: 'earthquake',
        severity: 'moderate',
        title: 'Magnitude 4.2 Earthquake near Birmingham',
        description: 'A magnitude 4.2 earthquake occurred 15 miles northeast of Birmingham. Light shaking reported.',
        latitude: 33.6839,
        longitude: -86.6493,
        radius_km: 50,
        start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        source: 'USGS',
        created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        id: 2,
        event_id: 'TRAFFIC-I65-001',
        type: 'traffic',
        severity: 'minor',
        title: 'Multi-vehicle accident on I-65',
        description: 'Multi-vehicle accident blocking two lanes on I-65 southbound near Exit 76. Expect delays.',
        latitude: 33.2732,
        longitude: -87.5286,
        radius_km: 5,
        start_time: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
        source: 'Alabama DOT',
        created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        is_active: true
      },
      {
        id: 3,
        event_id: 'FIRE-WALKER-001',
        type: 'fire',
        severity: 'severe',
        title: 'Wildfire in Walker County',
        description: 'Fast-moving wildfire burning 500+ acres in Walker County. Evacuations ordered for nearby communities.',
        latitude: 33.7890,
        longitude: -87.2890,
        radius_km: 15,
        start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        source: 'Alabama Forestry Commission',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_active: true
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockDisasterEvents
    });
  } catch (error) {
    console.error('Disaster events API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch disaster events',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
