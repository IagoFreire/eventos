import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { AuthRequest } from '../middleware/auth.js';

export class AuthController {
  // Login
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Verificar credenciais
      const user = await UserModel.verifyPassword(email, password);
      if (!user) {
        res.status(401).json({ error: 'Email ou senha inválidos' });
        return;
      }

      // Gerar token JWT
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        res.status(500).json({ error: 'JWT_SECRET não configurado' });
        return;
      }

      const payload = { id: user.id, email: user.email, role: user.role };
      const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any };
      const token = jwt.sign(payload, jwtSecret, options);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verificar token
  static async verify(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      const user = await UserModel.findById(req.user.id);
      if (!user) {
        res.status(404).json({ error: 'Usuário não encontrado' });
        return;
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Registrar novo usuário (apenas admin pode criar)
  static async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password, role } = req.body;

      // Verificar se o email já existe
      const existing = await UserModel.findByEmail(email);
      if (existing) {
        res.status(400).json({ error: 'Email já cadastrado' });
        return;
      }

      const user = await UserModel.create(email, password, role || 'user');
      res.status(201).json({ user });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Alterar senha
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!req.user) {
        res.status(401).json({ error: 'Não autenticado' });
        return;
      }

      // Verificar senha atual
      const user = await UserModel.verifyPassword(req.user.email, currentPassword);
      if (!user) {
        res.status(401).json({ error: 'Senha atual incorreta' });
        return;
      }

      // Atualizar senha
      await UserModel.updatePassword(req.user.id, newPassword);
      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
