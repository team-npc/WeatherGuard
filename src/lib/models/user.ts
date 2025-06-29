import { getDatabase } from '../database';
import { User, NotificationPreferences } from '../../types';

export class UserModel {
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO users (email, name, phone, emergency_contact_name, emergency_contact_phone, notification_preferences)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userData.email,
        userData.name,
        userData.phone || null,
        userData.emergency_contact_name || null,
        userData.emergency_contact_phone || null,
        JSON.stringify(userData.notification_preferences)
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<User> {
    const db = await getDatabase();
    
    const user = await db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      throw new Error('User not found');
    }

    return {
      ...user,
      notification_preferences: JSON.parse(user.notification_preferences)
    };
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    
    const user = await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return null;
    }

    return {
      ...user,
      notification_preferences: JSON.parse(user.notification_preferences)
    };
  }

  static async update(id: number, updates: Partial<User>): Promise<User> {
    const db = await getDatabase();
    
    const setClause = [];
    const values = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.phone !== undefined) {
      setClause.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.emergency_contact_name !== undefined) {
      setClause.push('emergency_contact_name = ?');
      values.push(updates.emergency_contact_name);
    }
    if (updates.emergency_contact_phone !== undefined) {
      setClause.push('emergency_contact_phone = ?');
      values.push(updates.emergency_contact_phone);
    }
    if (updates.notification_preferences !== undefined) {
      setClause.push('notification_preferences = ?');
      values.push(JSON.stringify(updates.notification_preferences));
    }

    setClause.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<void> {
    const db = await getDatabase();
    
    await db.run('DELETE FROM users WHERE id = ?', [id]);
  }

  static async findAll(): Promise<User[]> {
    const db = await getDatabase();
    
    const users = await db.all('SELECT * FROM users ORDER BY created_at DESC');

    return users.map(user => ({
      ...user,
      notification_preferences: JSON.parse(user.notification_preferences)
    }));
  }

  static async updateNotificationPreferences(id: number, preferences: NotificationPreferences): Promise<User> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE users SET notification_preferences = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(preferences), id]
    );

    return this.findById(id);
  }

  static async searchByNameOrEmail(query: string): Promise<User[]> {
    const db = await getDatabase();
    
    const users = await db.all(
      'SELECT * FROM users WHERE name LIKE ? OR email LIKE ? ORDER BY name',
      [`%${query}%`, `%${query}%`]
    );

    return users.map(user => ({
      ...user,
      notification_preferences: JSON.parse(user.notification_preferences)
    }));
  }
}
