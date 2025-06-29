import { getDatabase } from '../database';
import { StaticLocation, LiveLocation, LocationType } from '../../types';

export class StaticLocationModel {
  static async create(locationData: Omit<StaticLocation, 'id' | 'created_at' | 'updated_at'>): Promise<StaticLocation> {
    const db = await getDatabase();
    
    // If this is being set as primary, unset other primary locations for this user
    if (locationData.is_primary) {
      await db.run(
        'UPDATE static_locations SET is_primary = FALSE WHERE user_id = ? AND type = ?',
        [locationData.user_id, locationData.type]
      );
    }
    
    const result = await db.run(
      `INSERT INTO static_locations (user_id, name, type, address, latitude, longitude, is_primary)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        locationData.user_id,
        locationData.name,
        locationData.type,
        locationData.address,
        locationData.latitude,
        locationData.longitude,
        locationData.is_primary
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<StaticLocation> {
    const db = await getDatabase();
    
    const location = await db.get(
      'SELECT * FROM static_locations WHERE id = ?',
      [id]
    );

    if (!location) {
      throw new Error('Location not found');
    }

    return location;
  }

  static async findByUserId(userId: number): Promise<StaticLocation[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM static_locations WHERE user_id = ? ORDER BY is_primary DESC, created_at DESC',
      [userId]
    );
  }

  static async findByUserIdAndType(userId: number, type: LocationType): Promise<StaticLocation[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM static_locations WHERE user_id = ? AND type = ? ORDER BY is_primary DESC, created_at DESC',
      [userId, type]
    );
  }

  static async findPrimaryByUserIdAndType(userId: number, type: LocationType): Promise<StaticLocation | null> {
    const db = await getDatabase();
    
    const location = await db.get(
      'SELECT * FROM static_locations WHERE user_id = ? AND type = ? AND is_primary = TRUE',
      [userId, type]
    );

    return location || null;
  }

  static async update(id: number, updates: Partial<StaticLocation>): Promise<StaticLocation> {
    const db = await getDatabase();
    
    const setClause = [];
    const values = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.type !== undefined) {
      setClause.push('type = ?');
      values.push(updates.type);
    }
    if (updates.address !== undefined) {
      setClause.push('address = ?');
      values.push(updates.address);
    }
    if (updates.latitude !== undefined) {
      setClause.push('latitude = ?');
      values.push(updates.latitude);
    }
    if (updates.longitude !== undefined) {
      setClause.push('longitude = ?');
      values.push(updates.longitude);
    }
    if (updates.is_primary !== undefined) {
      setClause.push('is_primary = ?');
      values.push(updates.is_primary);
      
      // If setting as primary, unset other primary locations
      if (updates.is_primary) {
        const currentLocation = await this.findById(id);
        await db.run(
          'UPDATE static_locations SET is_primary = FALSE WHERE user_id = ? AND type = ? AND id != ?',
          [currentLocation.user_id, currentLocation.type, id]
        );
      }
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE static_locations SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<void> {
    const db = await getDatabase();
    
    await db.run('DELETE FROM static_locations WHERE id = ?', [id]);
  }

  static async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<StaticLocation[]> {
    const db = await getDatabase();
    
    // Using Haversine formula approximation for nearby locations
    return await db.all(`
      SELECT *, 
        (6371 * acos(cos(radians(?)) * cos(radians(latitude)) * 
        cos(radians(longitude) - radians(?)) + sin(radians(?)) * 
        sin(radians(latitude)))) AS distance
      FROM static_locations 
      HAVING distance < ?
      ORDER BY distance
    `, [latitude, longitude, latitude, radiusKm]);
  }
}

export class LiveLocationModel {
  static async create(locationData: Omit<LiveLocation, 'id' | 'timestamp'>): Promise<LiveLocation> {
    const db = await getDatabase();
    
    // Deactivate previous live locations for this user
    await db.run(
      'UPDATE live_locations SET is_active = FALSE WHERE user_id = ?',
      [locationData.user_id]
    );
    
    const result = await db.run(
      `INSERT INTO live_locations (user_id, latitude, longitude, accuracy, is_active, battery_level)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        locationData.user_id,
        locationData.latitude,
        locationData.longitude,
        locationData.accuracy || null,
        locationData.is_active,
        locationData.battery_level || null
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<LiveLocation> {
    const db = await getDatabase();
    
    const location = await db.get(
      'SELECT * FROM live_locations WHERE id = ?',
      [id]
    );

    if (!location) {
      throw new Error('Live location not found');
    }

    return location;
  }

  static async findActiveByUserId(userId: number): Promise<LiveLocation | null> {
    const db = await getDatabase();
    
    const location = await db.get(
      'SELECT * FROM live_locations WHERE user_id = ? AND is_active = TRUE ORDER BY timestamp DESC LIMIT 1',
      [userId]
    );

    return location || null;
  }

  static async findRecentByUserId(userId: number, hours: number = 24): Promise<LiveLocation[]> {
    const db = await getDatabase();
    
    return await db.all(
      `SELECT * FROM live_locations 
       WHERE user_id = ? AND timestamp > datetime('now', '-${hours} hours')
       ORDER BY timestamp DESC`,
      [userId]
    );
  }

  static async deactivateUserLocations(userId: number): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE live_locations SET is_active = FALSE WHERE user_id = ?',
      [userId]
    );
  }

  static async cleanupOldLocations(daysOld: number = 7): Promise<void> {
    const db = await getDatabase();
    
    await db.run(
      `DELETE FROM live_locations 
       WHERE timestamp < datetime('now', '-${daysOld} days')`,
    );
  }

  static async findActiveLocationsForUsers(userIds: number[]): Promise<LiveLocation[]> {
    const db = await getDatabase();
    
    if (userIds.length === 0) return [];
    
    const placeholders = userIds.map(() => '?').join(',');
    
    return await db.all(
      `SELECT * FROM live_locations 
       WHERE user_id IN (${placeholders}) AND is_active = TRUE
       ORDER BY timestamp DESC`,
      userIds
    );
  }
}
