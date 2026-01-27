import { Request, Response } from 'express';
import { RegistrationQuestionModel } from '../models/registration-question.model.js';
import { EventModel } from '../models/event.model.js';
import { AuthRequest } from '../middleware/auth.js';

export class RegistrationQuestionController {
  // Buscar todas as perguntas de um evento
  static async getByEventId(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const questions = await RegistrationQuestionModel.findByEventId(eventId);
      res.json(questions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar pergunta por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const question = await RegistrationQuestionModel.findById(id);
      
      if (!question) {
        res.status(404).json({ error: 'Pergunta não encontrada' });
        return;
      }

      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar nova pergunta
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { event_id, question_text, question_type, options, is_required, display_order } = req.body;

      // Validar campos obrigatórios
      if (!event_id || !question_text || !question_type) {
        res.status(400).json({ error: 'event_id, question_text e question_type são obrigatórios' });
        return;
      }

      // Validar tipo de pergunta
      if (!['text', 'single_choice', 'multiple_choice'].includes(question_type)) {
        res.status(400).json({ error: 'question_type deve ser: text, single_choice ou multiple_choice' });
        return;
      }

      // Validar opções para tipos de escolha
      if ((question_type === 'single_choice' || question_type === 'multiple_choice') && (!options || !Array.isArray(options) || options.length === 0)) {
        res.status(400).json({ error: 'Opções são obrigatórias para perguntas de escolha' });
        return;
      }

      // Verificar se o evento existe
      const event = await EventModel.findById(event_id);
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      const question = await RegistrationQuestionModel.create({
        event_id,
        question_text,
        question_type,
        options: options || [],
        is_required: is_required || false,
        display_order: display_order || 0
      });

      res.status(201).json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar pergunta
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { question_text, question_type, options, is_required, display_order } = req.body;

      // Validar tipo de pergunta se fornecido
      if (question_type && !['text', 'single_choice', 'multiple_choice'].includes(question_type)) {
        res.status(400).json({ error: 'question_type deve ser: text, single_choice ou multiple_choice' });
        return;
      }

      const updateData: any = {};
      if (question_text !== undefined) updateData.question_text = question_text;
      if (question_type !== undefined) updateData.question_type = question_type;
      if (options !== undefined) updateData.options = options;
      if (is_required !== undefined) updateData.is_required = is_required;
      if (display_order !== undefined) updateData.display_order = display_order;

      const question = await RegistrationQuestionModel.update(id, updateData);
      
      if (!question) {
        res.status(404).json({ error: 'Pergunta não encontrada' });
        return;
      }

      res.json(question);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar pergunta
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await RegistrationQuestionModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Pergunta não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Reordenar perguntas
  static async reorder(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const { questionIds } = req.body;

      if (!Array.isArray(questionIds)) {
        res.status(400).json({ error: 'questionIds deve ser um array' });
        return;
      }

      await RegistrationQuestionModel.reorder(eventId, questionIds);
      res.json({ message: 'Perguntas reordenadas com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
