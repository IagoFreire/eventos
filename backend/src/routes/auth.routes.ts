import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// Validações
const loginValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('Senha é obrigatória'),
];

const registerValidation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres'),
  body('role').optional().isIn(['admin', 'user']).withMessage('Role inválido'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Senha atual é obrigatória'),
  body('newPassword').isLength({ min: 6 }).withMessage('Nova senha deve ter no mínimo 6 caracteres'),
];

// Rotas públicas
router.post('/login', loginValidation, validate, AuthController.login);

// Rotas protegidas
router.get('/verify', authenticateToken, AuthController.verify);
router.post('/register', authenticateToken, requireAdmin, registerValidation, validate, AuthController.register);
router.post('/change-password', authenticateToken, changePasswordValidation, validate, AuthController.changePassword);

export default router;
