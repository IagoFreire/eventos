import pool from '../config/database.js';
import { RegistrationQuestion } from '../types/index.js';

export class RegistrationQuestionModel {
  // Buscar todas as perguntas de um evento
  static async findByEventId(eventId: string): Promise<RegistrationQuestion[]> {
    const result = await pool.query(
      `SELECT id, event_id, question_text, question_type, options, is_required, display_order,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM registration_questions WHERE event_id = $1 ORDER BY display_order ASC, created_at ASC`,
      [eventId]
    );
    return result.rows.map(row => ({
      ...row,
      options: row.options || []
    }));
  }

  // Buscar pergunta por ID
  static async findById(id: string): Promise<RegistrationQuestion | null> {
    const result = await pool.query(
      `SELECT id, event_id, question_text, question_type, options, is_required, display_order,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM registration_questions WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    return {
      ...result.rows[0],
      options: result.rows[0].options || []
    };
  }

  // Criar nova pergunta
  static async create(question: Omit<RegistrationQuestion, 'id' | 'created_at' | 'updated_at'>): Promise<RegistrationQuestion> {
    const result = await pool.query(
      `INSERT INTO registration_questions (event_id, question_text, question_type, options, is_required, display_order)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6)
       RETURNING id, event_id, question_text, question_type, options, is_required, display_order,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      [
        question.event_id,
        question.question_text,
        question.question_type,
        JSON.stringify(question.options || []),
        question.is_required,
        question.display_order
      ]
    );
    return {
      ...result.rows[0],
      options: result.rows[0].options || []
    };
  }

  // Atualizar pergunta
  static async update(id: string, question: Partial<Omit<RegistrationQuestion, 'id' | 'event_id' | 'created_at' | 'updated_at'>>): Promise<RegistrationQuestion | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(question).forEach(([key, value]) => {
      if (value !== undefined) {
        if (key === 'options') {
          fields.push(`${key} = $${paramCount}::jsonb`);
          values.push(JSON.stringify(value));
        } else {
          fields.push(`${key} = $${paramCount}`);
          values.push(value);
        }
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE registration_questions SET ${fields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, event_id, question_text, question_type, options, is_required, display_order,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      values
    );

    if (!result.rows[0]) return null;
    return {
      ...result.rows[0],
      options: result.rows[0].options || []
    };
  }

  // Deletar pergunta
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM registration_questions WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Reordenar perguntas
  static async reorder(eventId: string, questionIds: string[]): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (let i = 0; i < questionIds.length; i++) {
        await client.query(
          'UPDATE registration_questions SET display_order = $1 WHERE id = $2 AND event_id = $3',
          [i, questionIds[i], eventId]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}
