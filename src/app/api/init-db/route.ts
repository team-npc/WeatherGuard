import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In a real implementation, this would initialize the database
    // For the demo, we'll return mock success
    
    const mockUsers = [
      {
        id: 1,
        email: 'john.doe@example.com',
        name: 'John Doe',
        phone: '+1-555-0123'
      },
      {
        id: 2,
        email: 'jane.smith@example.com',
        name: 'Jane Smith',
        phone: '+1-555-0125'
      }
    ];

    return NextResponse.json({
      success: true,
      message: 'Database initialized and seeded successfully',
      data: {
        users: mockUsers,
        message: 'Sample data created successfully'
      }
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
