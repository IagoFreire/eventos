import { Router } from 'express';
import { body } from 'express-validator';
import { PaymentController } from '../controllers/payment.controller.js';
import { validate } from '../middleware/validation.js';

const router = Router();

// Validações
const paymentValidation = [
  body('registration_id').notEmpty().withMessage('ID da inscrição é obrigatório'),
  body('transaction_amount').isNumeric().withMessage('Valor deve ser numérico'),
  body('payment_method_id').notEmpty().withMessage('Método de pagamento é obrigatório'),
  body('payer.email').isEmail().withMessage('Email do pagador inválido'),
];

// Rotas
router.get('/installments', PaymentController.getInstallments);
router.post('/', paymentValidation, validate, PaymentController.create);
router.get('/:id', PaymentController.getStatus);
router.post('/webhook', PaymentController.webhook);

export default router;
