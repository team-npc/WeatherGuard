import { getDatabase } from '../database';
import { Contact } from '../../types';

export class ContactModel {
  static async create(contactData: Omit<Contact, 'id' | 'created_at'>): Promise<Contact> {
    const db = await getDatabase();
    
    const result = await db.run(
      `INSERT INTO contacts (user_id, contact_user_id, name, email, phone, relationship, is_emergency_contact, can_see_location)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        contactData.user_id,
        contactData.contact_user_id || null,
        contactData.name,
        contactData.email || null,
        contactData.phone || null,
        contactData.relationship,
        contactData.is_emergency_contact,
        contactData.can_see_location
      ]
    );

    return this.findById(result.lastID!);
  }

  static async findById(id: number): Promise<Contact> {
    const db = await getDatabase();
    
    const contact = await db.get(
      'SELECT * FROM contacts WHERE id = ?',
      [id]
    );

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  }

  static async findByUserId(userId: number): Promise<Contact[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM contacts WHERE user_id = ? ORDER BY is_emergency_contact DESC, name ASC',
      [userId]
    );
  }

  static async findEmergencyContacts(userId: number): Promise<Contact[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM contacts WHERE user_id = ? AND is_emergency_contact = TRUE ORDER BY name ASC',
      [userId]
    );
  }

  static async findLocationSharingContacts(userId: number): Promise<Contact[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM contacts WHERE user_id = ? AND can_see_location = TRUE ORDER BY name ASC',
      [userId]
    );
  }

  static async update(id: number, updates: Partial<Contact>): Promise<Contact> {
    const db = await getDatabase();
    
    const setClause = [];
    const values = [];

    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.email !== undefined) {
      setClause.push('email = ?');
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      setClause.push('phone = ?');
      values.push(updates.phone);
    }
    if (updates.relationship !== undefined) {
      setClause.push('relationship = ?');
      values.push(updates.relationship);
    }
    if (updates.is_emergency_contact !== undefined) {
      setClause.push('is_emergency_contact = ?');
      values.push(updates.is_emergency_contact);
    }
    if (updates.can_see_location !== undefined) {
      setClause.push('can_see_location = ?');
      values.push(updates.can_see_location);
    }

    values.push(id);

    await db.run(
      `UPDATE contacts SET ${setClause.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  static async delete(id: number): Promise<void> {
    const db = await getDatabase();
    
    await db.run('DELETE FROM contacts WHERE id = ?', [id]);
  }

  static async findMutualContacts(userId1: number, userId2: number): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.get(
      `SELECT COUNT(*) as count FROM contacts 
       WHERE (user_id = ? AND contact_user_id = ?) 
       OR (user_id = ? AND contact_user_id = ?)`,
      [userId1, userId2, userId2, userId1]
    );

    return result.count > 0;
  }

  static async findContactsWhoCanSeeUser(userId: number): Promise<Contact[]> {
    const db = await getDatabase();
    
    return await db.all(
      'SELECT * FROM contacts WHERE contact_user_id = ? AND can_see_location = TRUE',
      [userId]
    );
  }

  static async searchContacts(userId: number, query: string): Promise<Contact[]> {
    const db = await getDatabase();
    
    return await db.all(
      `SELECT * FROM contacts 
       WHERE user_id = ? AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)
       ORDER BY name ASC`,
      [userId, `%${query}%`, `%${query}%`, `%${query}%`]
    );
  }

  static async linkToUser(contactId: number, contactUserId: number): Promise<Contact> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE contacts SET contact_user_id = ? WHERE id = ?',
      [contactUserId, contactId]
    );

    return this.findById(contactId);
  }

  static async unlinkFromUser(contactId: number): Promise<Contact> {
    const db = await getDatabase();
    
    await db.run(
      'UPDATE contacts SET contact_user_id = NULL WHERE id = ?',
      [contactId]
    );

    return this.findById(contactId);
  }
}
