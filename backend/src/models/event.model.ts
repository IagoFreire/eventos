import pool from '../config/database.js';
import { Event, EventSettings, EventDate } from '../types/index.js';

export class EventModel {
  // Buscar todos os eventos
  static async findAll(): Promise<Event[]> {
    const result = await pool.query(
      `SELECT id, title, description, date, location, price, image_url, max_participants,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM events ORDER BY date DESC`
    );
    // Buscar datas para cada evento
    const eventsWithDates = await Promise.all(
      result.rows.map(async (event) => {
        const dates = await this.findDatesByEventId(event.id);
        return { ...event, dates };
      })
    );
    return eventsWithDates;
  }

  // Buscar evento por ID
  static async findById(id: string): Promise<Event | null> {
    const result = await pool.query(
      `SELECT id, title, description, date, location, price, image_url, max_participants,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM events WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    
    // Buscar datas do evento
    const dates = await this.findDatesByEventId(id);
    return {
      ...result.rows[0],
      dates
    };
  }

  // Criar novo evento
  static async create(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Criar evento
      const eventResult = await client.query(
        `INSERT INTO events (title, description, date, location, price, image_url, max_participants)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, title, description, date, location, price, image_url, max_participants,
                   to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                   to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
        [event.title, event.description, event.date, event.location, event.price, event.image_url, event.max_participants]
      );
      const newEvent = eventResult.rows[0];
      
      // Criar data inicial se não houver datas fornecidas
      const datesToCreate = event.dates && event.dates.length > 0 
        ? event.dates.map(d => d.date)
        : [event.date];
      
      if (datesToCreate.length > 0) {
        const placeholders = datesToCreate.map((_, index) => `($1, $${index + 2})`).join(', ');
        const params = [newEvent.id, ...datesToCreate];
        await client.query(
          `INSERT INTO event_dates (event_id, date) VALUES ${placeholders}`,
          params
        );
      }
      
      await client.query('COMMIT');
      
      // Retornar evento com datas
      return await this.findById(newEvent.id) || newEvent;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
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
      `UPDATE events SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} 
       RETURNING id, title, description, date, location, price, image_url, max_participants,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
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
      `SELECT id, event_id, event_subtitle, event_time, event_title_image_url, event_title_background_image_url, 
              event_title_text_color, event_title_button_color, event_title_button_text_color, event_title_font_weight,
              included_items, church_name, church_contact_phone, church_contact_email,
              church_instagram, church_facebook, church_website,
              show_contact, show_social, show_contact_phone, show_contact_email,
              show_social_instagram, show_social_facebook, show_social_website,
              confirmed_participants, contact_phones,
              show_included_items, show_confirmed_participants, show_available_spots,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM event_settings WHERE event_id = $1`,
      [eventId]
    );
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      ...row,
      included_items: typeof row.included_items === 'string' 
        ? JSON.parse(row.included_items) 
        : row.included_items,
      confirmed_participants: typeof row.confirmed_participants === 'string'
        ? JSON.parse(row.confirmed_participants)
        : (row.confirmed_participants || []),
      contact_phones: typeof row.contact_phones === 'string'
        ? JSON.parse(row.contact_phones)
        : (row.contact_phones || [])
    };
  }

  // Criar ou atualizar configurações do evento
  static async upsertSettings(settings: Partial<EventSettings> & { event_id: string }): Promise<EventSettings> {
    const result = await pool.query(
      `INSERT INTO event_settings (
        event_id, event_subtitle, event_time, event_title_image_url, event_title_background_image_url, event_title_text_color, event_title_button_color, event_title_button_text_color, event_title_font_weight, included_items,
        church_name, church_contact_phone, church_contact_email,
        church_instagram, church_facebook, church_website,
        show_contact, show_social,
        show_contact_phone, show_contact_email,
        show_social_instagram, show_social_facebook, show_social_website,
        confirmed_participants, contact_phones,
        show_included_items, show_confirmed_participants, show_available_spots
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
      ON CONFLICT (event_id)
      DO UPDATE SET
        event_subtitle = EXCLUDED.event_subtitle,
        event_time = EXCLUDED.event_time,
        event_title_image_url = EXCLUDED.event_title_image_url,
        event_title_background_image_url = EXCLUDED.event_title_background_image_url,
        event_title_text_color = EXCLUDED.event_title_text_color,
        event_title_button_color = EXCLUDED.event_title_button_color,
        event_title_button_text_color = EXCLUDED.event_title_button_text_color,
        event_title_font_weight = EXCLUDED.event_title_font_weight,
        included_items = EXCLUDED.included_items,
        church_name = EXCLUDED.church_name,
        church_contact_phone = EXCLUDED.church_contact_phone,
        church_contact_email = EXCLUDED.church_contact_email,
        church_instagram = EXCLUDED.church_instagram,
        church_facebook = EXCLUDED.church_facebook,
        church_website = EXCLUDED.church_website,
        show_contact = EXCLUDED.show_contact,
        show_social = EXCLUDED.show_social,
        show_contact_phone = EXCLUDED.show_contact_phone,
        show_contact_email = EXCLUDED.show_contact_email,
        show_social_instagram = EXCLUDED.show_social_instagram,
        show_social_facebook = EXCLUDED.show_social_facebook,
        show_social_website = EXCLUDED.show_social_website,
        confirmed_participants = EXCLUDED.confirmed_participants,
        contact_phones = EXCLUDED.contact_phones,
        show_included_items = EXCLUDED.show_included_items,
        show_confirmed_participants = EXCLUDED.show_confirmed_participants,
        show_available_spots = EXCLUDED.show_available_spots,
        updated_at = NOW()
      RETURNING id, event_id, event_subtitle, event_time, event_title_image_url, event_title_background_image_url, 
                event_title_text_color, event_title_button_color, event_title_button_text_color, event_title_font_weight,
                included_items, church_name, church_contact_phone, church_contact_email,
                church_instagram, church_facebook, church_website,
                show_contact, show_social, show_contact_phone, show_contact_email,
                show_social_instagram, show_social_facebook, show_social_website,
                confirmed_participants, contact_phones,
                show_included_items, show_confirmed_participants, show_available_spots,
                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      [
        settings.event_id,
        settings.event_subtitle,
        settings.event_time,
        settings.event_title_image_url,
        settings.event_title_background_image_url,
        settings.event_title_text_color,
        settings.event_title_button_color,
        settings.event_title_button_text_color,
        settings.event_title_font_weight,
        JSON.stringify(settings.included_items || []),
        settings.church_name,
        settings.church_contact_phone,
        settings.church_contact_email,
        settings.church_instagram,
        settings.church_facebook,
        settings.church_website,
        settings.show_contact ?? true,
        settings.show_social ?? true,
        settings.show_contact_phone ?? true,
        settings.show_contact_email ?? true,
        settings.show_social_instagram ?? true,
        settings.show_social_facebook ?? true,
        settings.show_social_website ?? true,
        JSON.stringify(settings.confirmed_participants || []),
        JSON.stringify(settings.contact_phones || []),
        settings.show_included_items ?? true,
        settings.show_confirmed_participants ?? true,
        settings.show_available_spots ?? true,
      ]
    );
    
    const row = result.rows[0];
    return {
      ...row,
      included_items: typeof row.included_items === 'string' 
        ? JSON.parse(row.included_items) 
        : row.included_items,
      confirmed_participants: typeof row.confirmed_participants === 'string'
        ? JSON.parse(row.confirmed_participants)
        : (row.confirmed_participants || []),
      contact_phones: typeof row.contact_phones === 'string'
        ? JSON.parse(row.contact_phones)
        : (row.contact_phones || [])
    };
  }

  // Métodos para gerenciar datas do evento
  static async findDatesByEventId(eventId: string): Promise<EventDate[]> {
    const result = await pool.query(
      `SELECT id, event_id, date,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM event_dates WHERE event_id = $1 ORDER BY date ASC`,
      [eventId]
    );
    return result.rows;
  }

  static async addEventDate(eventId: string, date: Date | string): Promise<EventDate> {
    const result = await pool.query(
      `INSERT INTO event_dates (event_id, date)
       VALUES ($1, $2)
       ON CONFLICT (event_id, date) DO UPDATE SET updated_at = NOW()
       RETURNING id, event_id, date,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      [eventId, date]
    );
    return result.rows[0];
  }

  static async deleteEventDate(dateId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM event_dates WHERE id = $1',
      [dateId]
    );
    return (result.rowCount || 0) > 0;
  }

  static async updateEventDates(eventId: string, dates: (Date | string)[]): Promise<EventDate[]> {
    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Deletar todas as datas existentes
      await client.query('DELETE FROM event_dates WHERE event_id = $1', [eventId]);
      
      // Inserir novas datas
      if (dates.length > 0) {
        // Construir query com múltiplos valores
        const placeholders = dates.map((_, index) => `($1, $${index + 2})`).join(', ');
        const params = [eventId, ...dates];
        await client.query(
          `INSERT INTO event_dates (event_id, date) VALUES ${placeholders} 
           RETURNING id, event_id, date,
                     to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                     to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
          params
        );
      }
      
      await client.query('COMMIT');
      
      // Retornar as datas atualizadas usando o pool normal
      return await this.findDatesByEventId(eventId);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
