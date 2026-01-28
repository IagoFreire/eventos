import pool from '../config/database.js';
import { RegistrationAnswer } from '../types/index.js';

export class RegistrationAnswerModel {
  // Buscar todas as respostas de uma inscrição
  static async findByRegistrationId(registrationId: string): Promise<RegistrationAnswer[]> {
    const result = await pool.query(
      `SELECT id, registration_id, question_id, answer_text, answer_options,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM registration_answers WHERE registration_id = $1`,
      [registrationId]
    );
    return result.rows.map(row => ({
      ...row,
      answer_options: row.answer_options || []
    }));
  }

  // Buscar resposta por ID
  static async findById(id: string): Promise<RegistrationAnswer | null> {
    const result = await pool.query(
      `SELECT id, registration_id, question_id, answer_text, answer_options,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM registration_answers WHERE id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    return {
      ...result.rows[0],
      answer_options: result.rows[0].answer_options || []
    };
  }

  // Criar ou atualizar resposta
  static async upsert(answer: Omit<RegistrationAnswer, 'id' | 'created_at' | 'updated_at'>): Promise<RegistrationAnswer> {
    const result = await pool.query(
      `INSERT INTO registration_answers (registration_id, question_id, answer_text, answer_options)
       VALUES ($1, $2, $3, $4::jsonb)
       ON CONFLICT (registration_id, question_id)
       DO UPDATE SET
         answer_text = EXCLUDED.answer_text,
         answer_options = EXCLUDED.answer_options,
         updated_at = NOW()
       RETURNING id, registration_id, question_id, answer_text, answer_options,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      [
        answer.registration_id,
        answer.question_id,
        answer.answer_text || null,
        JSON.stringify(answer.answer_options || [])
      ]
    );
    return {
      ...result.rows[0],
      answer_options: result.rows[0].answer_options || []
    };
  }

  // Criar múltiplas respostas
  static async createMany(answers: Omit<RegistrationAnswer, 'id' | 'created_at' | 'updated_at'>[]): Promise<RegistrationAnswer[]> {
    if (answers.length === 0) return [];

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const createdAnswers: RegistrationAnswer[] = [];
      
      for (const answer of answers) {
        const result = await client.query(
          `INSERT INTO registration_answers (registration_id, question_id, answer_text, answer_options)
           VALUES ($1, $2, $3, $4::jsonb)
           ON CONFLICT (registration_id, question_id)
           DO UPDATE SET
             answer_text = EXCLUDED.answer_text,
             answer_options = EXCLUDED.answer_options,
             updated_at = NOW()
           RETURNING id, registration_id, question_id, answer_text, answer_options,
                     to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                     to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
          [
            answer.registration_id,
            answer.question_id,
            answer.answer_text || null,
            JSON.stringify(answer.answer_options || [])
          ]
        );
        createdAnswers.push({
          ...result.rows[0],
          answer_options: result.rows[0].answer_options || []
        });
      }
      
      await client.query('COMMIT');
      return createdAnswers;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Deletar resposta
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM registration_answers WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Deletar todas as respostas de uma inscrição
  static async deleteByRegistrationId(registrationId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM registration_answers WHERE registration_id = $1',
      [registrationId]
    );
    return (result.rowCount || 0) > 0;
  }
}
