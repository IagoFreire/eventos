import { Router } from 'express';
import { RegistrationQuestionController } from '../controllers/registration-question.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Rotas públicas
router.get('/event/:eventId', RegistrationQuestionController.getByEventId);
router.get('/:id', RegistrationQuestionController.getById);

// Rotas protegidas (admin apenas)
router.post('/', authenticateToken, requireAdmin, RegistrationQuestionController.create);
router.put('/:id', authenticateToken, requireAdmin, RegistrationQuestionController.update);
router.delete('/:id', authenticateToken, requireAdmin, RegistrationQuestionController.delete);
router.put('/event/:eventId/reorder', authenticateToken, requireAdmin, RegistrationQuestionController.reorder);

export default router;
