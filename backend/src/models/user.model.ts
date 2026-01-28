import pool from '../config/database.js';
import bcrypt from 'bcryptjs';
import { User } from '../types/index.js';

export class UserModel {
  // Buscar todos os usuários
  static async findAll(): Promise<User[]> {
    const result = await pool.query(
      `SELECT id, email, role,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM users ORDER BY created_at DESC`
    );
    return result.rows;
  }

  // Buscar usuário por ID
  static async findById(id: string): Promise<User | null> {
    const result = await pool.query(
      `SELECT id, email, role,
              to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
              to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at
       FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // Buscar usuário por email (incluindo senha para autenticação)
  static async findByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  // Criar novo usuário
  static async create(email: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)
       RETURNING id, email, role,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      [email, hashedPassword, role]
    );
    return result.rows[0];
  }

  // Verificar senha
  static async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    // Retornar usuário sem o password_hash
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Atualizar usuário
  static async update(id: string, data: Partial<User>): Promise<User | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'updated_at' && key !== 'password_hash') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) return null;

    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${paramCount} 
       RETURNING id, email, role,
                 to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as created_at,
                 to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') as updated_at`,
      values
    );

    return result.rows[0] || null;
  }

  // Atualizar senha
  static async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, id]
    );
    return (result.rowCount || 0) > 0;
  }

  // Deletar usuário
  static async delete(id: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    return (result.rowCount || 0) > 0;
  }
}
