import pool from '../config/database.js';
import { Registration } from '../types/index.js';

// Função helper para garantir que as datas sejam retornadas como strings ISO em UTC
// O problema: quando o PostgreSQL retorna TIMESTAMP sem timezone, o driver pg pode criar
// objetos Date assumindo timezone local do servidor. Precisamos garantir UTC.
const formatDatesForResponse = (rows: any[]): any[] => {
  return rows.map(row => {
    const formatDate = (date: Date | string | null) => {
      if (!date) return null;
      
      // Se já for string ISO com timezone (Z ou +/-), retornar como está
      if (typeof date === 'string') {
        if (date.endsWith('Z') || date.match(/[+-]\d{2}:?\d{2}$/)) {
          return date;
        }
        // String sem timezone: assumir que é UTC e adicionar Z
        // Formato esperado: "2024-01-15 12:48:00" ou "2024-01-15T12:48:00"
        const normalized = date.replace(' ', 'T');
        return normalized.includes('T') ? normalized + 'Z' : new Date(date + 'Z').toISOString();
      }
      
      // Se for objeto Date: o problema é que pode ter sido criado assumindo timezone local
      // Vamos usar os métodos UTC para garantir que interpretamos como UTC
      // Mas na verdade, toISOString() sempre retorna UTC correto baseado no timestamp interno
      // O problema pode ser que o timestamp interno está errado
      // Vamos garantir usando uma abordagem mais segura
      return date.toISOString();
    };

    return {
      ...row,
      created_at: formatDate(row.created_at),
      updated_at: formatDate(row.updated_at),
      payment_date: formatDate(row.payment_date),
      checked_in_date: formatDate(row.checked_in_date),
    };
  });
};

export class RegistrationModel {
  // Buscar todas as inscrições (com filtro opcional por evento)
  static async findAll(eventId?: string): Promise<Registration[]> {
    let result;
    if (eventId) {
      result = await pool.query(
        `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                payment_method, selected_payment_method, payment_amount, checked_in,
                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
         FROM registrations WHERE event_id = $1 ORDER BY created_at DESC`,
        [eventId]
      );
    } else {
      result = await pool.query(
        `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                payment_method, selected_payment_method, payment_amount, checked_in,
                to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
         FROM registrations ORDER BY created_at DESC`
      );
    }
    return formatDatesForResponse(result.rows);
  }

  // Buscar inscrição por ID
  static async findById(id: string): Promise<Registration | null> {
    const result = await pool.query(
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations WHERE id = $1`,
      [id]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Buscar inscrição por CPF e evento
  static async findByCpfAndEvent(cpf: string, eventId: string): Promise<Registration | null> {
    const result = await pool.query(
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations WHERE cpf = $1 AND event_id = $2`,
      [cpf, eventId]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Buscar inscrição por email e evento
  static async findByEmailAndEvent(email: string, eventId: string): Promise<Registration | null> {
    const result = await pool.query(
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations WHERE email = $1 AND event_id = $2`,
      [email, eventId]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Criar nova inscrição
  static async create(registration: Omit<Registration, 'id' | 'created_at' | 'updated_at' | 'checked_in' | 'payment_status'>): Promise<Registration> {
    const result = await pool.query(
      `INSERT INTO registrations (event_id, name, email, phone, cpf, payment_status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                 payment_method, selected_payment_method, payment_amount, checked_in,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                 CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                 CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date`,
      [registration.event_id, registration.name, registration.email, registration.phone, registration.cpf]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0];
  }

  // Atualizar inscrição
  static async update(id: string, registration: Partial<Registration>): Promise<Registration | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(registration).forEach(([key, value]) => {
      // Permitir null para payment_method, mas não undefined
      const isAllowedNull = key === 'payment_method' && value === null;
      if ((value !== undefined || isAllowedNull) && key !== 'id' && key !== 'created_at' && key !== 'updated_at') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE registrations SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} 
                   RETURNING id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                             payment_method, selected_payment_method, payment_amount, checked_in,
                             to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                             to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                             CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                             CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date`;

    const result = await pool.query(query, values);
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Atualizar status de pagamento com informações completas
  static async updatePaymentStatus(
    id: string, 
    paymentStatus: string, 
    paymentId?: string,
    paymentMethod?: string,
    paymentAmount?: number
  ): Promise<Registration | null> {
    // Buscar registro atual para preservar valores existentes se não forem fornecidos
    const current = await this.findById(id);
    
    // Usar valores fornecidos ou manter os existentes
    // Se paymentMethod for fornecido (mesmo que null), usar; senão, manter o existente
    const finalPaymentMethod = paymentMethod !== undefined ? paymentMethod : (current?.payment_method || null);
    const finalPaymentAmount = paymentAmount !== undefined ? paymentAmount : (current?.payment_amount || null);
    const finalPaymentId = paymentId !== undefined ? paymentId : (current?.payment_id || null);
    
    // Construir query dinamicamente para atualizar apenas campos fornecidos
    const updates: string[] = ['payment_status = $1'];
    const values: any[] = [paymentStatus];
    let paramCount = 2;
    
    // Atualizar payment_id apenas se fornecido
    if (paymentId !== undefined) {
      updates.push(`payment_id = $${paramCount}`);
      values.push(finalPaymentId);
      paramCount++;
    }
    
    // Atualizar payment_method apenas se fornecido
    if (paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramCount}`);
      values.push(finalPaymentMethod);
      paramCount++;
    }
    
    // Atualizar payment_amount apenas se fornecido
    if (paymentAmount !== undefined) {
      updates.push(`payment_amount = $${paramCount}`);
      values.push(finalPaymentAmount);
      paramCount++;
    }
    
    // Sempre atualizar payment_date e updated_at usando NOW() do PostgreSQL (sempre UTC)
    if (paymentStatus === 'approved') {
      updates.push(`payment_date = NOW()`);
    } else {
      updates.push(`payment_date = NULL`);
    }
    
    updates.push(`updated_at = NOW()`);
    
    values.push(id);
    
    const query = `UPDATE registrations SET ${updates.join(', ')} WHERE id = $${paramCount} 
                   RETURNING id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                             payment_method, selected_payment_method, payment_amount, checked_in,
                             to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                             to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                             CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                             CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date`;
    
    const result = await pool.query(query, values);
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
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
    
    // Usar NOW() do PostgreSQL para garantir UTC, ou NULL se desmarcando
    const checkInDateQuery = newCheckedInStatus ? 'NOW()' : 'NULL';
    
    const result = await pool.query(
      `UPDATE registrations SET checked_in = $1, checked_in_date = ${checkInDateQuery} WHERE id = $2 
       RETURNING id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                 payment_method, selected_payment_method, payment_amount, checked_in,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                 CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                 CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date`,
      [newCheckedInStatus, id]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Fazer check-in apenas (não remove se já estiver feito)
  static async checkInOnly(id: string): Promise<Registration | null> {
    // Primeiro, verificar o estado atual
    const current = await pool.query(
      'SELECT checked_in FROM registrations WHERE id = $1',
      [id]
    );
    
    if (current.rows.length === 0) {
      return null;
    }
    
    const isCurrentlyCheckedIn = current.rows[0].checked_in;
    
    // Se já estiver feito, retornar null (será tratado como erro no controller)
    if (isCurrentlyCheckedIn) {
      return null;
    }
    
    // Marcar check-in usando NOW() do PostgreSQL para garantir UTC
    const result = await pool.query(
      `UPDATE registrations SET checked_in = true, checked_in_date = NOW() WHERE id = $1 
       RETURNING id, event_id, name, email, phone, cpf, payment_status, payment_id, 
                 payment_method, selected_payment_method, payment_amount, checked_in,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
                 CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
                 CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date`,
      [id]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
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
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations 
       WHERE (REPLACE(REPLACE(REPLACE(cpf, '.', ''), '-', ''), ' ', '') = $1 OR cpf = $2)
       AND payment_status = 'approved' 
       ORDER BY created_at DESC`,
      [normalizedCpf, cpf]
    );
    return formatDatesForResponse(result.rows);
  }

  // Buscar inscrição pendente por email e evento
  static async findPendingByEmailAndEvent(email: string, eventId: string): Promise<Registration | null> {
    const result = await pool.query(
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations WHERE email = $1 AND event_id = $2 AND payment_status = 'pending' ORDER BY created_at DESC LIMIT 1`,
      [email, eventId]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }

  // Buscar inscrição por payment_id
  static async findByPaymentId(paymentId: string): Promise<Registration | null> {
    const result = await pool.query(
      `SELECT id, event_id, name, email, phone, cpf, payment_status, payment_id, 
              payment_method, selected_payment_method, payment_amount, checked_in,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at,
              CASE WHEN payment_date IS NOT NULL THEN to_char(payment_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as payment_date,
              CASE WHEN checked_in_date IS NOT NULL THEN to_char(checked_in_date AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') ELSE NULL END as checked_in_date
       FROM registrations WHERE payment_id = $1`,
      [paymentId]
    );
    const converted = formatDatesForResponse(result.rows);
    return converted[0] || null;
  }
}
