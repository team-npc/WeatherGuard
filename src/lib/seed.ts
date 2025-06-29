import { getDatabase } from './database';
import { UserModel } from './models/user';
import { StaticLocationModel } from './models/location';
import { ContactModel } from './models/contact';
import { SafetyCheckinModel, WeatherAlertModel, DisasterEventModel } from './models/safety';

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Create sample users
    const user1 = await UserModel.create({
      email: 'john.doe@example.com',
      name: 'John Doe',
      phone: '+1-555-0123',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '+1-555-0124',
      notification_preferences: {
        weather: true,
        emergency: true,
        checkin: true
      }
    });

    const user2 = await UserModel.create({
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      phone: '+1-555-0125',
      emergency_contact_name: 'Bob Smith',
      emergency_contact_phone: '+1-555-0126',
      notification_preferences: {
        weather: true,
        emergency: true,
        checkin: false
      }
    });

    const user3 = await UserModel.create({
      email: 'mike.johnson@example.com',
      name: 'Mike Johnson',
      phone: '+1-555-0127',
      notification_preferences: {
        weather: true,
        emergency: true,
        checkin: true
      }
    });

    console.log('Created sample users');

    // Create sample static locations
    await StaticLocationModel.create({
      user_id: user1.id,
      name: 'Home',
      type: 'home',
      address: '123 Main St, Tuscaloosa, AL 35401',
      latitude: 33.2098,
      longitude: -87.5692,
      is_primary: true
    });

    await StaticLocationModel.create({
      user_id: user1.id,
      name: 'University of Alabama',
      type: 'work',
      address: '739 University Blvd, Tuscaloosa, AL 35401',
      latitude: 33.2119,
      longitude: -87.5447,
      is_primary: true
    });

    await StaticLocationModel.create({
      user_id: user2.id,
      name: 'Downtown Apartment',
      type: 'home',
      address: '456 Oak Ave, Tuscaloosa, AL 35401',
      latitude: 33.2076,
      longitude: -87.5711,
      is_primary: true
    });

    await StaticLocationModel.create({
      user_id: user2.id,
      name: 'DCH Regional Medical Center',
      type: 'work',
      address: '809 University Blvd E, Tuscaloosa, AL 35401',
      latitude: 33.2065,
      longitude: -87.5253,
      is_primary: true
    });

    await StaticLocationModel.create({
      user_id: user3.id,
      name: 'Northport Home',
      type: 'home',
      address: '789 Pine St, Northport, AL 35476',
      latitude: 33.2290,
      longitude: -87.5773,
      is_primary: true
    });

    console.log('Created sample locations');

    // Create sample contacts
    await ContactModel.create({
      user_id: user1.id,
      contact_user_id: user2.id,
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1-555-0125',
      relationship: 'Friend',
      is_emergency_contact: true,
      can_see_location: true
    });

    await ContactModel.create({
      user_id: user1.id,
      contact_user_id: user3.id,
      name: 'Mike Johnson',
      email: 'mike.johnson@example.com',
      phone: '+1-555-0127',
      relationship: 'Colleague',
      is_emergency_contact: false,
      can_see_location: true
    });

    await ContactModel.create({
      user_id: user2.id,
      contact_user_id: user1.id,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      relationship: 'Friend',
      is_emergency_contact: true,
      can_see_location: true
    });

    console.log('Created sample contacts');

    // Create sample safety check-ins
    await SafetyCheckinModel.create({
      user_id: user1.id,
      status: 'safe',
      message: 'All good at home, weather looks clear',
      latitude: 33.2098,
      longitude: -87.5692
    });

    await SafetyCheckinModel.create({
      user_id: user2.id,
      status: 'safe',
      message: 'At work, monitoring weather conditions',
      latitude: 33.2065,
      longitude: -87.5253
    });

    console.log('Created sample safety check-ins');

    // Create sample weather alerts
    await WeatherAlertModel.create({
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
      is_active: true
    });

    await WeatherAlertModel.create({
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
      is_active: true
    });

    console.log('Created sample weather alerts');

    // Create sample disaster events
    await DisasterEventModel.create({
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
      is_active: true
    });

    await DisasterEventModel.create({
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
      is_active: true
    });

    console.log('Created sample disaster events');

    console.log('Database seeding completed successfully!');
    
    return {
      users: [user1, user2, user3],
      message: 'Sample data created successfully'
    };

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

export async function clearDatabase() {
  const db = await getDatabase();
  
  await db.exec(`
    DELETE FROM notifications;
    DELETE FROM disaster_events;
    DELETE FROM weather_alerts;
    DELETE FROM safety_checkins;
    DELETE FROM contacts;
    DELETE FROM live_locations;
    DELETE FROM static_locations;
    DELETE FROM users;
  `);
  
  console.log('Database cleared successfully');
}
