import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.userId);
    
    if (isNaN(userId)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid user ID'
      }, { status: 400 });
    }

    // Mock static locations for demo
    const mockLocations = [
      {
        id: 1,
        user_id: userId,
        name: 'Home',
        type: 'home',
        address: '123 Main St, Tuscaloosa, AL 35401',
        latitude: 33.2098,
        longitude: -87.5692,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: userId,
        name: 'University of Alabama',
        type: 'work',
        address: '739 University Blvd, Tuscaloosa, AL 35401',
        latitude: 33.2119,
        longitude: -87.5447,
        is_primary: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 3,
        user_id: userId,
        name: 'DCH Regional Medical Center',
        type: 'other',
        address: '809 University Blvd E, Tuscaloosa, AL 35401',
        latitude: 33.2065,
        longitude: -87.5253,
        is_primary: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockLocations
    });
  } catch (error) {
    console.error('Static locations API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch static locations',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
