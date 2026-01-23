import pool from '../config/database.js';
import { Event, EventSettings } from '../types/index.js';

export class EventModel {
  // Buscar todos os eventos
  static async findAll(): Promise<Event[]> {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY date DESC'
    );
    return result.rows;
  }

  // Buscar evento por ID
  static async findById(id: string): Promise<Event | null> {
    const result = await pool.query(
      'SELECT * FROM events WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Criar novo evento
  static async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const result = await pool.query(
      `INSERT INTO events (title, description, date, location, price, image_url, max_participants)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [event.title, event.description, event.date, event.location, event.price, event.image_url, event.max_participants]
    );
    return result.rows[0];
  }

  // Atualizar evento
  static async update(id: string, event: Partial<Event>): Promise<Event | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(event).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE events SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Deletar evento
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM events WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Buscar configurações do evento
  static async findSettings(eventId: string): Promise<EventSettings | null> {
    const result = await pool.query(
      'SELECT * FROM event_settings WHERE event_id = $1',
      [eventId]
    );
    return result.rows[0] || null;
  }

  // Criar ou atualizar configurações do evento
  static async upsertSettings(settings: Partial<EventSettings> & { event_id: string }): Promise<EventSettings> {
    const result = await pool.query(
      `INSERT INTO event_settings (
        event_id, event_subtitle, event_time, included_items,
        church_name, church_contact_phone, church_contact_email,
        church_instagram, church_facebook, church_website
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (event_id)
      DO UPDATE SET
        event_subtitle = EXCLUDED.event_subtitle,
        event_time = EXCLUDED.event_time,
        included_items = EXCLUDED.included_items,
        church_name = EXCLUDED.church_name,
        church_contact_phone = EXCLUDED.church_contact_phone,
        church_contact_email = EXCLUDED.church_contact_email,
        church_instagram = EXCLUDED.church_instagram,
        church_facebook = EXCLUDED.church_facebook,
        church_website = EXCLUDED.church_website,
        updated_at = NOW()
      RETURNING *`,
      [
        settings.event_id,
        settings.event_subtitle,
        settings.event_time,
        JSON.stringify(settings.included_items || []),
        settings.church_name,
        settings.church_contact_phone,
        settings.church_contact_email,
        settings.church_instagram,
        settings.church_facebook,
        settings.church_website,
      ]
    );
    
    const row = result.rows[0];
    return {
      ...row,
      included_items: typeof row.included_items === 'string' 
        ? JSON.parse(row.included_items) 
        : row.included_items
    };
  }
}
