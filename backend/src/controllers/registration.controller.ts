import { Request, Response } from 'express';
import { RegistrationModel } from '../models/registration.model.js';
import { EventModel } from '../models/event.model.js';
import { RegistrationAnswerModel } from '../models/registration-answer.model.js';
import { RegistrationQuestionModel } from '../models/registration-question.model.js';
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
      
      // Log detalhado da requisição "Já Paguei"
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔍 [JÁ PAGUEI] Verificação de pagamento iniciada');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📋 Informações da Requisição:');
      console.log('   ID da Inscrição:', id);
      console.log('   Método HTTP:', req.method);
      console.log('   URL:', req.url);
      console.log('   Path:', req.path);
      console.log('   IP do Cliente:', req.ip || req.socket.remoteAddress);
      console.log('   X-Forwarded-For:', req.headers['x-forwarded-for'] || 'não informado');
      console.log('   X-Real-IP:', req.headers['x-real-ip'] || 'não informado');
      console.log('   User-Agent:', req.headers['user-agent'] || 'não informado');
      console.log('   Origin:', req.headers.origin || 'não informado');
      console.log('   Referer:', req.headers.referer || 'não informado');
      console.log('   Accept:', req.headers.accept || 'não informado');
      console.log('   Content-Type:', req.headers['content-type'] || 'não informado');
      console.log('   Authorization:', req.headers.authorization ? 'presente' : 'não presente');
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      const registration = await RegistrationModel.findById(id);
      
      if (!registration) {
        console.log('❌ [JÁ PAGUEI] Inscrição não encontrada');
        console.log('═══════════════════════════════════════════════════════════');
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      console.log('✅ [JÁ PAGUEI] Inscrição encontrada:');
      console.log('   Nome:', registration.name);
      console.log('   Email:', registration.email);
      console.log('   CPF:', registration.cpf);
      console.log('   Event ID:', registration.event_id);
      console.log('   Status do Pagamento:', registration.payment_status);
      console.log('   Payment ID:', registration.payment_id || 'não informado');
      console.log('   Payment Method:', registration.payment_method || 'não informado');
      console.log('   Payment Amount:', registration.payment_amount || 'não informado');
      console.log('   Check-in:', registration.checked_in ? 'Sim' : 'Não');
      console.log('   Criado em:', registration.created_at);
      console.log('   Atualizado em:', registration.updated_at);

      // Buscar respostas das perguntas customizadas
      const answers = await RegistrationAnswerModel.findByRegistrationId(id);
      console.log('   Respostas customizadas:', answers.length, 'resposta(s)');
      
      console.log('📊 [JÁ PAGUEI] Resultado da verificação:');
      if (registration.payment_status === 'approved') {
        console.log('   ✅ PAGAMENTO APROVADO - Usuário pode avançar');
      } else if (registration.payment_status === 'pending') {
        console.log('   ⏳ PAGAMENTO PENDENTE - Aguardando confirmação');
      } else if (registration.payment_status === 'rejected') {
        console.log('   ❌ PAGAMENTO REJEITADO - Requer nova tentativa');
      } else {
        console.log('   ⚠️ STATUS DESCONHECIDO:', registration.payment_status);
      }
      console.log('═══════════════════════════════════════════════════════════');
      
      res.json({
        ...registration,
        answers
      });
    } catch (error: any) {
      console.error('❌ [JÁ PAGUEI] Erro ao verificar pagamento:');
      console.error('   Erro:', error.message);
      console.error('   Stack:', error.stack);
      console.log('═══════════════════════════════════════════════════════════');
      res.status(500).json({ error: error.message });
    }
  }

  // Criar nova inscrição
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { event_id, name, email, phone, cpf } = req.body;

      // Verificar se o evento existe
      const event = await EventModel.findById(event_id);
      if (!event) {
        res.status(404).json({ error: 'Evento não encontrado' });
        return;
      }

      // Verificar se já existe inscrição com esse CPF para o evento
      const existingByCpf = await RegistrationModel.findByCpfAndEvent(cpf, event_id);
      if (existingByCpf) {
        // Se a inscrição existente está pendente, permitir sobrescrever (deletar a antiga)
        if (existingByCpf.payment_status === 'pending') {
          console.log(`🔄 Sobrescrevendo inscrição pendente para CPF ${cpf} no evento ${event_id}`);
          await RegistrationModel.delete(existingByCpf.id);
        } else {
          // Se está aprovada ou rejeitada, não permitir sobrescrever
          res.status(400).json({ 
            error: 'CPF já inscrito neste evento com pagamento processado. Não é possível sobrescrever.' 
          });
          return;
        }
      }

      // Verificar se já existe inscrição com esse email para o evento
      const existingByEmail = await RegistrationModel.findByEmailAndEvent(email, event_id);
      if (existingByEmail) {
        // Se a inscrição existente está pendente, permitir sobrescrever (deletar a antiga)
        if (existingByEmail.payment_status === 'pending') {
          console.log(`🔄 Sobrescrevendo inscrição pendente para email ${email} no evento ${event_id}`);
          await RegistrationModel.delete(existingByEmail.id);
        } else {
          // Se está aprovada ou rejeitada, não permitir sobrescrever
          res.status(400).json({ 
            error: 'Email já inscrito neste evento com pagamento processado. Não é possível sobrescrever.' 
          });
          return;
        }
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
      });

      // Salvar respostas das perguntas customizadas, se houver
      const { answers } = req.body;
      if (answers && Array.isArray(answers) && answers.length > 0) {
        // Buscar todas as perguntas do evento para validar
        const questions = await RegistrationQuestionModel.findByEventId(event_id);
        const questionMap = new Map(questions.map(q => [q.id, q]));

        // Preparar respostas para salvar
        const answersToSave = answers
          .filter((answer: any) => questionMap.has(answer.question_id))
          .map((answer: any) => {
            const question = questionMap.get(answer.question_id)!;
            return {
              registration_id: registration.id,
              question_id: answer.question_id,
              answer_text: question.question_type === 'text' ? answer.answer_text : null,
              answer_options: (question.question_type === 'multiple_choice' && answer.answer_options) 
                ? answer.answer_options 
                : (question.question_type === 'single_choice' && answer.answer_text)
                  ? [answer.answer_text]
                  : []
            };
          });

        if (answersToSave.length > 0) {
          await RegistrationAnswerModel.createMany(answersToSave);
        }
      }

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

  // Fazer check-in apenas (não remove se já estiver feito) - usado pelo QR code
  static async checkInOnly(req: AuthRequest, res: Response): Promise<void> {
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

      // Verificar se já está feito
      if (existing.checked_in) {
        res.status(400).json({ 
          error: 'Check-in já realizado',
          registration: existing 
        });
        return;
      }

      // Marcar check-in apenas
      const registration = await RegistrationModel.checkInOnly(id);
      if (!registration) {
        res.status(400).json({ error: 'Check-in já realizado' });
        return;
      }
      
      res.json(registration);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Atualizar método de pagamento (rota pública - usuário atualiza sua própria inscrição)
  static async updatePaymentMethod(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { payment_method } = req.body;

      if (!payment_method || payment_method === null || payment_method === undefined) {
        res.status(400).json({ error: 'Método de pagamento é obrigatório' });
        return;
      }

      if (payment_method !== 'pix' && payment_method !== 'credit_card') {
        res.status(400).json({ error: 'Método de pagamento inválido. Use "pix" ou "credit_card"' });
        return;
      }

      // Usar selected_payment_method ao invés de payment_method
      const registration = await RegistrationModel.update(id, { selected_payment_method: payment_method });
      
      if (!registration) {
        res.status(404).json({ error: 'Inscrição não encontrada ou nenhum campo foi atualizado' });
        return;
      }
      
      res.json(registration);
    } catch (error: any) {
      console.error('❌ Erro ao atualizar método de pagamento:', error);
      console.error('Stack:', error.stack);
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

  // Verificar status de pagamento (público - usado pelo botão "Já Paguei")
  static async checkPaymentStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Log detalhado da requisição "Já Paguei"
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔍 [JÁ PAGUEI] Verificação de pagamento iniciada');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('📋 Informações da Requisição:');
      console.log('   ID da Inscrição:', id);
      console.log('   Método HTTP:', req.method);
      console.log('   URL:', req.url);
      console.log('   Path:', req.path);
      console.log('   IP do Cliente:', req.ip || req.socket.remoteAddress);
      console.log('   X-Forwarded-For:', req.headers['x-forwarded-for'] || 'não informado');
      console.log('   X-Real-IP:', req.headers['x-real-ip'] || 'não informado');
      console.log('   User-Agent:', req.headers['user-agent'] || 'não informado');
      console.log('   Origin:', req.headers.origin || 'não informado');
      console.log('   Referer:', req.headers.referer || 'não informado');
      console.log('   Accept:', req.headers.accept || 'não informado');
      console.log('   Content-Type:', req.headers['content-type'] || 'não informado');
      console.log('   Authorization:', req.headers.authorization ? 'presente' : 'não presente');
      console.log('   Timestamp:', new Date().toISOString());
      console.log('   Timezone:', Intl.DateTimeFormat().resolvedOptions().timeZone);
      
      const registration = await RegistrationModel.findById(id);
      
      if (!registration) {
        console.log('❌ [JÁ PAGUEI] Inscrição não encontrada');
        console.log('═══════════════════════════════════════════════════════════');
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      console.log('✅ [JÁ PAGUEI] Inscrição encontrada:');
      console.log('   Nome:', registration.name);
      console.log('   Email:', registration.email);
      console.log('   CPF:', registration.cpf);
      console.log('   Telefone:', registration.phone || 'não informado');
      console.log('   Event ID:', registration.event_id);
      console.log('   Status do Pagamento:', registration.payment_status);
      console.log('   Payment ID:', registration.payment_id || 'não informado');
      console.log('   Payment Method:', registration.payment_method || 'não informado');
      console.log('   Payment Amount:', registration.payment_amount || 'não informado');
      console.log('   Check-in:', registration.checked_in ? 'Sim' : 'Não');
      console.log('   Criado em:', registration.created_at);
      console.log('   Atualizado em:', registration.updated_at);

      // Buscar respostas das perguntas customizadas
      const answers = await RegistrationAnswerModel.findByRegistrationId(id);
      console.log('   Respostas customizadas:', answers.length, 'resposta(s)');
      
      console.log('📊 [JÁ PAGUEI] Resultado da verificação:');
      if (registration.payment_status === 'approved') {
        console.log('   ✅ PAGAMENTO APROVADO - Usuário pode avançar');
      } else if (registration.payment_status === 'pending') {
        console.log('   ⏳ PAGAMENTO PENDENTE - Aguardando confirmação');
      } else if (registration.payment_status === 'rejected') {
        console.log('   ❌ PAGAMENTO REJEITADO - Requer nova tentativa');
      } else {
        console.log('   ⚠️ STATUS DESCONHECIDO:', registration.payment_status);
      }
      console.log('═══════════════════════════════════════════════════════════');
      
      // Retornar apenas informações necessárias (sem respostas para segurança)
      res.json({
        id: registration.id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        cpf: registration.cpf,
        event_id: registration.event_id,
        payment_status: registration.payment_status,
        payment_id: registration.payment_id,
        payment_method: registration.payment_method,
        payment_amount: registration.payment_amount,
        checked_in: registration.checked_in,
        created_at: registration.created_at,
        updated_at: registration.updated_at,
      });
    } catch (error: any) {
      console.error('❌ [JÁ PAGUEI] Erro ao verificar pagamento:');
      console.error('   Erro:', error.message);
      console.error('   Stack:', error.stack);
      console.log('═══════════════════════════════════════════════════════════');
      res.status(500).json({ error: error.message });
    }
  }

  // Simular pagamento (apenas em desenvolvimento/teste - hardcoded)
  static async simulatePayment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { amount } = req.body;
      
      const registration = await RegistrationModel.findById(id);
      
      if (!registration) {
        res.status(404).json({ error: 'Inscrição não encontrada' });
        return;
      }

      // Hardcode: definir como pago no banco de dados
      const paymentId = registration.payment_id || `simulated-${Date.now()}`;
      const paymentMethod = registration.payment_method || 'pix';
      // Usar o valor fornecido no body, ou o existente no registro, ou undefined
      const paymentAmount = amount !== undefined ? Number(amount) : (registration.payment_amount || undefined);

      // Atualizar status de pagamento para approved
      await RegistrationModel.updatePaymentStatus(
        id,
        'approved',
        paymentId,
        paymentMethod,
        paymentAmount
      );

      // Retornar a inscrição atualizada
      const updatedRegistration = await RegistrationModel.findById(id);
      
      res.json({
        id: updatedRegistration?.id,
        name: updatedRegistration?.name,
        email: updatedRegistration?.email,
        phone: updatedRegistration?.phone,
        cpf: updatedRegistration?.cpf,
        event_id: updatedRegistration?.event_id,
        payment_status: updatedRegistration?.payment_status,
        payment_id: updatedRegistration?.payment_id,
        payment_method: updatedRegistration?.payment_method,
        payment_amount: updatedRegistration?.payment_amount,
        checked_in: updatedRegistration?.checked_in,
        created_at: updatedRegistration?.created_at,
        updated_at: updatedRegistration?.updated_at,
      });
    } catch (error: any) {
      console.error('❌ [SIMULAR PAGAMENTO] Erro ao simular pagamento:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
