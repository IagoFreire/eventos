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

  // Atualizar status de pagamento com informações completas
  static async updatePaymentStatus(
    id: string, 
    paymentStatus: string, 
    paymentId?: string,
    paymentMethod?: string,
    paymentAmount?: number
  ): Promise<Registration | null> {
    const paymentDate = paymentStatus === 'approved' ? new Date() : null;
    
    const result = await pool.query(
      `UPDATE registrations 
       SET payment_status = $1, 
           payment_id = $2, 
           payment_method = $3,
           payment_amount = $4,
           payment_date = $5
       WHERE id = $6 
       RETURNING *`,
      [paymentStatus, paymentId, paymentMethod, paymentAmount, paymentDate, id]
    );
    return result.rows[0] || null;
  }

  // Fazer check-in
  // Toggle check-in (marca ou desmarca)
  static async checkIn(id: string): Promise<Registration | null> {
    // Primeiro, verificar o estado atual
    const current = await pool.query(
      'SELECT checked_in FROM registrations WHERE id = $1',
      [id]
    );
    
    if (current.rows.length === 0) {
      return null;
    }
    
    const isCurrentlyCheckedIn = current.rows[0].checked_in;
    const newCheckedInStatus = !isCurrentlyCheckedIn;
    const checkInDate = newCheckedInStatus ? new Date() : null;
    
    const result = await pool.query(
      'UPDATE registrations SET checked_in = $1, checked_in_date = $2 WHERE id = $3 RETURNING *',
      [newCheckedInStatus, checkInDate, id]
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

  // Buscar inscrições aprovadas por CPF
  static async findApprovedByCpf(cpf: string): Promise<Registration[]> {
    // Normaliza o CPF removendo formatação para comparação
    const normalizedCpf = cpf.replace(/\D/g, '');
    
    // Busca tanto com formatação quanto sem formatação
    const result = await pool.query(
      `SELECT * FROM registrations 
       WHERE (REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = $1 OR cpf = $2)
       AND payment_status = 'approved' 
       ORDER BY created_at DESC`,
      [normalizedCpf, cpf]
    );
    return result.rows;
  }
}
