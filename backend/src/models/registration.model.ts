import pool from '../config/database.js';
import { Registration } from '../types/index.js';

export class RegistrationModel {
  // Buscar todas as inscrições (com filtro opcional por evento)
  static async findAll(eventId?: string): Promise<Registration[]> {
    if (eventId) {
      const result = await pool.query(
        'SELECT * FROM registrations WHERE event_id = $1 ORDER BY created_at DESC',
        [eventId]
      );
      return result.rows;
    }
    
    const result = await pool.query(
      'SELECT * FROM registrations ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Buscar inscrição por ID
  static async findById(id: string): Promise<Registration | null> {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  // Buscar inscrição por CPF e evento
  static async findByCpfAndEvent(cpf: string, eventId: string): Promise<Registration | null> {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE cpf = $1 AND event_id = $2',
      [cpf, eventId]
    );
    return result.rows[0] || null;
  }

  // Buscar inscrição por email e evento
  static async findByEmailAndEvent(email: string, eventId: string): Promise<Registration | null> {
    const result = await pool.query(
      'SELECT * FROM registrations WHERE email = $1 AND event_id = $2',
      [email, eventId]
    );
    return result.rows[0] || null;
  }

  // Criar nova inscrição
  static async create(registration: Omit<Registration, 'id' | 'created_at' | 'updated_at' | 'checked_in' | 'payment_status'>): Promise<Registration> {
    const result = await pool.query(
      `INSERT INTO registrations (event_id, name, email, phone, cpf, address, payment_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending')
       RETURNING *`,
      [registration.event_id, registration.name, registration.email, registration.phone, registration.cpf, registration.address]
    );
    return result.rows[0];
  }

  // Atualizar inscrição
  static async update(id: string, registration: Partial<Registration>): Promise<Registration | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(registration).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE registrations SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0] || null;
  }

  // Atualizar status de pagamento
  static async updatePaymentStatus(id: string, paymentStatus: string, paymentId?: string): Promise<Registration | null> {
    const result = await pool.query(
      'UPDATE registrations SET payment_status = $1, payment_id = $2 WHERE id = $3 RETURNING *',
      [paymentStatus, paymentId, id]
    );
    return result.rows[0] || null;
  }

  // Fazer check-in
  static async checkIn(id: string): Promise<Registration | null> {
    const result = await pool.query(
      'UPDATE registrations SET checked_in = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0] || null;
  }

  // Deletar inscrição
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM registrations WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Contar inscrições por evento
  static async countByEvent(eventId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = $1',
      [eventId]
    );
    return parseInt(result.rows[0].count);
  }

  // Contar inscrições aprovadas por evento
  static async countApprovedByEvent(eventId: string): Promise<number> {
    const result = await pool.query(
      "SELECT COUNT(*) as count FROM registrations WHERE event_id = $1 AND payment_status = 'approved'",
      [eventId]
    );
    return parseInt(result.rows[0].count);
  }
}
