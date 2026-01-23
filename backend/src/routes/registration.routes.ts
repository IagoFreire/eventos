import { Router } from 'express';
import { body } from 'express-validator';
import { RegistrationController } from '../controllers/registration.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// Validações
const registrationValidation = [
  body('event_id').notEmpty().withMessage('ID do evento é obrigatório'),
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido'),
  body('phone').notEmpty().withMessage('Telefone é obrigatório'),
  body('cpf').notEmpty().withMessage('CPF é obrigatório'),
  body('address').notEmpty().withMessage('Endereço é obrigatório'),
];

// Rotas públicas
router.post('/', registrationValidation, validate, RegistrationController.create);

// Rotas protegidas (admin apenas)
router.get('/', authenticateToken, requireAdmin, RegistrationController.getAll);
router.get('/:id', authenticateToken, requireAdmin, RegistrationController.getById);
router.put('/:id', authenticateToken, requireAdmin, RegistrationController.update);
router.patch('/:id/checkin', authenticateToken, requireAdmin, RegistrationController.checkIn);
router.delete('/:id', authenticateToken, requireAdmin, RegistrationController.delete);

export default router;
