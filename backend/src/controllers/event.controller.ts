import { Request, Response } from 'express';
import { EventModel } from '../models/event.model.js';
import { RegistrationModel } from '../models/registration.model.js';
import { AuthRequest } from '../middleware/auth.js';

export class EventController {
  // Buscar todos os eventos
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventModel.findAll();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar evento por ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const event = await EventModel.findById(id);
      
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar estatísticas do evento
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Buscar evento
      const event = await EventModel.findById(id);
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Buscar estatísticas de inscrições
      const totalRegistrations = await RegistrationModel.countByEvent(id);
      const approvedRegistrations = await RegistrationModel.countApprovedByEvent(id);
      
      // Calcular vagas disponíveis
      const maxParticipants = event.max_participants || 0;
      const availableSpots = maxParticipants > 0 ? maxParticipants - approvedRegistrations : null;
      const percentageFilled = maxParticipants > 0 ? Math.round((approvedRegistrations / maxParticipants) * 100) : 0;
      const isFull = maxParticipants > 0 && approvedRegistrations >= maxParticipants;

      res.json({
        event_id: id,
        total_registrations: totalRegistrations,
        approved_registrations: approvedRegistrations,
        max_participants: maxParticipants,
        available_spots: availableSpots,
        percentage_filled: percentageFilled,
        is_full: isFull
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Criar novo evento
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const event = await EventModel.create(req.body);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar evento
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dates, ...eventData } = req.body;
      
      // Atualizar dados do evento
      const event = await EventModel.update(id, eventData);
      
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Se datas foram fornecidas, atualizar as datas do evento
      if (dates !== undefined && Array.isArray(dates)) {
        // Normalizar datas: extrair apenas o valor date se for um objeto
        const normalizedDates = dates.map((date: any) => {
          if (typeof date === 'string' || date instanceof Date) {
            return date;
          }
          if (date && typeof date === 'object' && date.date) {
            return date.date;
          }
          return date;
        });
        await EventModel.updateEventDates(id, normalizedDates);
      }

      // Retornar evento atualizado com datas
      const updatedEvent = await EventModel.findById(id);
      res.json(updatedEvent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Deletar evento
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const deleted = await EventModel.delete(id);
      
      if (!deleted) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar configurações do evento
  static async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const settings = await EventModel.findSettings(id);
      
      if (!settings) {
        res.status(404).json({ error: 'Configurações não encontradas' });
        return;
      }

      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar configurações do evento
  static async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const settings = await EventModel.upsertSettings({
        event_id: id,
        ...req.body,
      });

      res.json(settings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Buscar datas do evento
  static async getDates(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const dates = await EventModel.findDatesByEventId(id);
      res.json(dates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar datas do evento
  static async updateDates(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { dates } = req.body;

      if (!Array.isArray(dates)) {
        res.status(400).json({ error: 'Datas devem ser um array' });
        return;
      }

      // Normalizar datas: extrair apenas o valor date se for um objeto
      const normalizedDates = dates.map((date: any) => {
        if (typeof date === 'string' || date instanceof Date) {
          return date;
        }
        if (date && typeof date === 'object' && date.date) {
          return date.date;
        }
        return date;
      });

      const updatedDates = await EventModel.updateEventDates(id, normalizedDates);
      res.json(updatedDates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
