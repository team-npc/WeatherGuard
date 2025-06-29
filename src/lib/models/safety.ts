import { getDatabase } from '../database';
import { SafetyCheckin, WeatherAlert, DisasterEvent, Notification, CheckinStatus, AlertSeverity, DisasterType } from '../../types';

export class SafetyCheckinModel {
  static async create(checkinData: Omit<SafetyCheckin, 'id' | 'timestamp'>): Promise<SafetyCheckin> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO safety_checkins (user_id, status, message, latitude, longitude)
       VALUES (?, ?, ?, ?, ?)`,
      [
        checkinData.user_id,
        checkinData.status,
        checkinData.message || null,
        checkinData.latitude || null,
        checkinData.longitude || null
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<SafetyCheckin> {
    const db = await getDatabase();
    
    const checkin = await db.get(
      'SELECT * FROM safety_checkins WHERE id = ?',
      [id]
    );

    if (!checkin) {
      throw new Error('Safety check-in not found');
    }

    return checkin;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<SafetyCheckin[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM safety_checkins WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?',
      [userId, limit]
    );
  }

  static async findLatestByUserId(userId: number): Promise<SafetyCheckin | null> {
    const db = await getDatabase();
    
    const checkin = await db.get(
      'SELECT * FROM safety_checkins WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    return checkin || null;
  }

  static async findByStatus(status: CheckinStatus, hours: number = 24): Promise<SafetyCheckin[]> {
    const db = await getDatabase();
    
    return await db.all(
      `SELECT * FROM safety_checkins 
       WHERE status = ? AND timestamp > datetime('now', '-${hours} hours')
       ORDER BY timestamp DESC`,
      [status]
    );
  }

  static async findRecentForContacts(userIds: number[], hours: number = 24): Promise<SafetyCheckin[]> {
    const db = await getDatabase();
    
    if (userIds.length === 0) return [];
    
    const placeholders = userIds.map(() => '?').join(',');
    
    return await db.all(
      `SELECT * FROM safety_checkins 
       WHERE user_id IN (${placeholders}) AND timestamp > datetime('now', '-${hours} hours')
       ORDER BY timestamp DESC`,
      userIds
    );
  }
}

export class WeatherAlertModel {
  static async create(alertData: Omit<WeatherAlert, 'id' | 'created_at'>): Promise<WeatherAlert> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO weather_alerts (alert_id, type, severity, title, description, area_description, latitude, longitude, radius_km, start_time, end_time, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alertData.alert_id,
        alertData.type,
        alertData.severity,
        alertData.title,
        alertData.description,
        alertData.area_description || null,
        alertData.latitude || null,
        alertData.longitude || null,
        alertData.radius_km || null,
        alertData.start_time || null,
        alertData.end_time || null,
        alertData.is_active
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<WeatherAlert> {
    const db = await getDatabase();
    
    const alert = await db.get(
      'SELECT * FROM weather_alerts WHERE id = ?',
      [id]
    );

    if (!alert) {
      throw new Error('Weather alert not found');
    }

    return alert;
  }

  static async findActive(): Promise<WeatherAlert[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM weather_alerts WHERE is_active = TRUE ORDER BY severity DESC, created_at DESC'
    );
  }

  static async findByLocation(latitude: number, longitude: number, radiusKm: number = 50): Promise<WeatherAlert[]> {
    const db = await getDatabase();
    
    return await db.all(`
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM weather_alerts 
      WHERE is_active = TRUE AND latitude IS NOT NULL AND longitude IS NOT NULL
      HAVING distance < ?
      ORDER BY severity DESC, distance ASC
    `, [latitude, longitude, latitude, radiusKm]);
  }

  static async deactivate(alertId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE weather_alerts SET is_active = FALSE WHERE alert_id = ?',
      [alertId]
    );
  }

  static async findBySeverity(severity: AlertSeverity): Promise<WeatherAlert[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM weather_alerts WHERE severity = ? AND is_active = TRUE ORDER BY created_at DESC',
      [severity]
    );
  }
}

export class DisasterEventModel {
  static async create(eventData: Omit<DisasterEvent, 'id' | 'created_at'>): Promise<DisasterEvent> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO disaster_events (event_id, type, severity, title, description, latitude, longitude, radius_km, start_time, end_time, source, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        eventData.event_id,
        eventData.type,
        eventData.severity,
        eventData.title,
        eventData.description || null,
        eventData.latitude,
        eventData.longitude,
        eventData.radius_km || null,
        eventData.start_time || null,
        eventData.end_time || null,
        eventData.source || null,
        eventData.is_active
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<DisasterEvent> {
    const db = await getDatabase();
    
    const event = await db.get(
      'SELECT * FROM disaster_events WHERE id = ?',
      [id]
    );

    if (!event) {
      throw new Error('Disaster event not found');
    }

    return event;
  }

  static async findActive(): Promise<DisasterEvent[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM disaster_events WHERE is_active = TRUE ORDER BY severity DESC, created_at DESC'
    );
  }

  static async findByLocation(latitude: number, longitude: number, radiusKm: number = 100): Promise<DisasterEvent[]> {
    const db = await getDatabase();
    
    return await db.all(`
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM disaster_events 
      WHERE is_active = TRUE
      HAVING distance < ?
      ORDER BY severity DESC, distance ASC
    `, [latitude, longitude, latitude, radiusKm]);
  }

  static async findByType(type: DisasterType): Promise<DisasterEvent[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM disaster_events WHERE type = ? AND is_active = TRUE ORDER BY created_at DESC',
      [type]
    );
  }

  static async deactivate(eventId: string): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE disaster_events SET is_active = FALSE WHERE event_id = ?',
      [eventId]
    );
  }
}

export class NotificationModel {
  static async create(notificationData: Omit<Notification, 'id' | 'sent_at'>): Promise<Notification> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO notifications (user_id, type, title, message, data, is_read)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        notificationData.user_id,
        notificationData.type,
        notificationData.title,
        notificationData.message,
        notificationData.data || null,
        notificationData.is_read || false
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<Notification> {
    const db = await getDatabase();
    
    const notification = await db.get(
      'SELECT * FROM notifications WHERE id = ?',
      [id]
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }

  static async findByUserId(userId: number, limit: number = 50): Promise<Notification[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY sent_at DESC LIMIT ?',
      [userId, limit]
    );
  }

  static async markAsRead(id: number): Promise<Notification> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE notifications SET is_read = TRUE WHERE id = ?',
      [id]
    );

    return this.findById(id);
  }

  static async markAllAsRead(userId: number): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [userId]
    );
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const db = await getDatabase();
    
    const result = await db.get(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [userId]
    );

    return result.count;
  }
}
