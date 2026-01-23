import { Request, Response } from 'express';
import { RegistrationModel } from '../models/registration.model.js';
import { EventModel } from '../models/event.model.js';
import { AuthRequest } from '../middleware/auth.js';

export class RegistrationController {
  // Buscar todas as inscrições (com filtro opcional)
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { event_id } = req.query;
      const registrations = await RegistrationModel.findAll(event_id as string);
      res.json(registrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar inscrição por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.findById(id);
      
      if (!registration) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar nova inscrição
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { event_id, name, email, phone, cpf, address } = req.body;

      // Verificar se o evento existe
      const event = await EventModel.findById(event_id);
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Verificar se já existe inscrição com esse CPF para o evento
      const existingByCpf = await RegistrationModel.findByCpfAndEvent(cpf, event_id);
      if (existingByCpf) {
        res.status(400).json({ error: 'CPF já inscrito neste evento' });
        return;
      }

      // Verificar se já existe inscrição com esse email para o evento
      const existingByEmail = await RegistrationModel.findByEmailAndEvent(email, event_id);
      if (existingByEmail) {
        res.status(400).json({ error: 'Email já inscrito neste evento' });
        return;
      }

      // Verificar limite de participantes
      if (event.max_participants) {
        const count = await RegistrationModel.countApprovedByEvent(event_id);
        if (count >= event.max_participants) {
          res.status(400).json({ error: 'Evento com vagas esgotadas' });
          return;
        }
      }

      const registration = await RegistrationModel.create({
        event_id,
        name,
        email,
        phone,
        cpf,
        address,
      });

      res.status(201).json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar inscrição
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const registration = await RegistrationModel.update(id, req.body);
      
      if (!registration) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Fazer check-in
  // Toggle check-in (marca ou desmarca)
  static async checkIn(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Verificar se a inscrição existe e o pagamento foi aprovado
      const existing = await RegistrationModel.findById(id);
      if (!existing) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      if (existing.payment_status !== 'approved') {
        res.status(400).json({ error: 'Check-in permitido apenas para inscrições com pagamento aprovado' });
        return;
      }

      // Faz o toggle (marca ou desmarca)
      const registration = await RegistrationModel.checkIn(id);
      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar inscrição
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await RegistrationModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar inscrições aprovadas por CPF (público)
  static async getByCpf(req: Request, res: Response): Promise<void> {
    try {
      const { cpf } = req.query;
      
      if (!cpf) {
        res.status(400).json({ error: 'CPF é obrigatório' });
        return;
      }

      // Normaliza o CPF removendo formatação
      const normalizedCpf = (cpf as string).replace(/\D/g, '');
      
      console.log('Buscando inscrições para CPF normalizado:', normalizedCpf);
      
      const registrations = await RegistrationModel.findApprovedByCpf(normalizedCpf);
      
      console.log(`Encontradas ${registrations.length} inscrições aprovadas para CPF ${normalizedCpf}`);
      
      res.json(registrations);
    } catch (error: any) {
      console.error('Erro ao buscar inscrições por CPF:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar inscrição pendente por email e evento (público)
  static async getPendingByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email, event_id } = req.query;
      
      if (!email || !event_id) {
        res.status(400).json({ error: 'Email e event_id são obrigatórios' });
        return;
      }

      const registration = await RegistrationModel.findPendingByEmailAndEvent(
        email as string,
        event_id as string
      );
      
      if (!registration) {
        res.status(404).json({ error: 'Nenhuma inscrição pendente encontrada' });
        return;
      }

      res.json(registration);
    } catch (error: any) {
      console.error('Erro ao buscar inscrição pendente:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
