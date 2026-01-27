import { Router } from 'express';
import { body } from 'express-validator';
import { EventController } from '../controllers/event.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// Validações
const eventValidation = [
  body('title').notEmpty().withMessage('Título é obrigatório'),
  body('description').notEmpty().withMessage('Descrição é obrigatória'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('location').notEmpty().withMessage('Localização é obrigatória'),
  body('price').isNumeric().withMessage('Preço deve ser numérico'),
];

const settingsValidation = [
  body('church_name').notEmpty().withMessage('Nome da igreja é obrigatório'),
];

// Rotas públicas
router.get('/', EventController.getAll);
router.get('/:id', EventController.getById);
router.get('/:id/stats', EventController.getStats);
router.get('/:id/settings', EventController.getSettings);
router.get('/:id/dates', EventController.getDates);

// Rotas protegidas (admin apenas)
router.post('/', authenticateToken, requireAdmin, eventValidation, validate, EventController.create);
router.put('/:id', authenticateToken, requireAdmin, EventController.update);
router.delete('/:id', authenticateToken, requireAdmin, EventController.delete);
router.put('/:id/settings', authenticateToken, requireAdmin, settingsValidation, validate, EventController.updateSettings);
router.put('/:id/dates', authenticateToken, requireAdmin, EventController.updateDates);

export default router;
