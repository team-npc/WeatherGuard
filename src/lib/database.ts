import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (db) {
    return db;
  }

  db = await open({
    filename: path.join(process.cwd(), 'weather-safety.db'),
    driver: sqlite3.Database
  });

  await initializeDatabase();
  return db;
}

async function initializeDatabase() {
  if (!db) return;

  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      phone TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      notification_preferences TEXT DEFAULT '{"weather":true,"emergency":true,"checkin":true}',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Static locations table (homes, workplaces, important places)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS static_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('home', 'work', 'school', 'family', 'other')),
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      is_primary BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Live location sharing table (for real-time tracking)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS live_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      accuracy REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE,
      battery_level INTEGER,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Emergency contacts and family/friends
  await db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      contact_user_id INTEGER,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      relationship TEXT NOT NULL,
      is_emergency_contact BOOLEAN DEFAULT FALSE,
      can_see_location BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (contact_user_id) REFERENCES users (id) ON DELETE SET NULL
    )
  `);

  // Weather alerts and notifications
  await db.exec(`
    CREATE TABLE IF NOT EXISTS weather_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      area_description TEXT,
      latitude REAL,
      longitude REAL,
      radius_km REAL,
      start_time DATETIME,
      end_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // Safety check-ins
  await db.exec(`
    CREATE TABLE IF NOT EXISTS safety_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('safe', 'need_help', 'emergency')),
      message TEXT,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Disaster events (earthquakes, traffic incidents, etc.)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS disaster_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('earthquake', 'traffic', 'fire', 'flood', 'storm', 'other')),
      severity TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      radius_km REAL,
      start_time DATETIME,
      end_time DATETIME,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_active BOOLEAN DEFAULT TRUE
    )
  `);

  // User notification history
  await db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      data TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create indexes for better performance
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_static_locations_user_id ON static_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_live_locations_user_id ON live_locations(user_id);
    CREATE INDEX IF NOT EXISTS idx_live_locations_timestamp ON live_locations(timestamp);
    CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
    CREATE INDEX IF NOT EXISTS idx_weather_alerts_active ON weather_alerts(is_active);
    CREATE INDEX IF NOT EXISTS idx_weather_alerts_location ON weather_alerts(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_safety_checkins_user_id ON safety_checkins(user_id);
    CREATE INDEX IF NOT EXISTS idx_disaster_events_active ON disaster_events(is_active);
    CREATE INDEX IF NOT EXISTS idx_disaster_events_location ON disaster_events(latitude, longitude);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  `);

  console.log('Database initialized successfully');
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}
