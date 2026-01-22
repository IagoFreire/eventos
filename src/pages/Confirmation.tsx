import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRegistration } from '../contexts/RegistrationContext';
import { useEvent } from '../contexts/EventContext';
import type { Registration } from '../types';
import { api } from '../services/apiSelector';
import { ArrowLeft, Download, Printer, CheckCircle, Calendar, MapPin, Clock, QrCode } from 'lucide-react';
import Loading from '../components/Loading';

const Confirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { registrationId, formData } = useRegistration();
  const { currentEvent } = useEvent();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const ticketRef = useRef<HTMLDivElement>(null);

  const regId = searchParams.get('id') || registrationId;

  useEffect(() => {
    loadRegistration();
  }, [regId]);

  const loadRegistration = async () => {
    if (!regId) {
      navigate('/');
      return;
    }

    setLoading(true);
    try {
      const registrations = await api.getRegistrations();
      const found = registrations.find(r => r.id === regId);
      
      if (found) {
        setRegistration(found);
      } else {
        // Se não encontrou, usar dados do contexto
        if (formData.name) {
          setRegistration({
            id: regId,
            ...formData,
            payment_status: 'approved',
            checked_in: false,
            created_at: new Date().toISOString(),
          } as Registration);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar inscrição:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Em um aplicativo real, isso geraria um PDF do ingresso para download.');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (!registration) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl mb-4 text-gray-800">Inscrição não encontrada</h1>
          <p className="text-gray-600 mb-6">Não foi possível encontrar os dados da inscrição.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white px-6 py-3 rounded-full hover:shadow-lg transition-all"
          >
            Voltar para o início
          </button>
        </div>
      </div>
    );
  }

  const event = currentEvent || {
    title: 'Retiro Espiritual 2026',
    date: '2026-03-15T09:00:00',
    location: 'Centro de Retiros Nova Vida - Serra da Mantiqueira, MG',
    price: 350.00,
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Message */}
        <div className="text-center mb-8 print:hidden">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-gray-800">Inscrição Confirmada!</h1>
          <p className="text-xl text-gray-600 mb-2">
            Obrigado por se inscrever, <strong>{registration.name}</strong>!
          </p>
          <p className="text-gray-600">
            Seu ingresso foi gerado e enviado para <strong>{registration.email}</strong>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-8 print:hidden">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-[#E8DCC4] rounded-full hover:bg-white hover:border-[#D4AF37] transition-colors shadow-md"
          >
            <Printer className="w-5 h-5 text-[#B8860B]" />
            <span className="text-gray-700">Imprimir Ingresso</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-full hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            <span>Baixar Ingresso (PDF)</span>
          </button>
        </div>

        {/* Ticket */}
        <div ref={ticketRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-[#E8DCC4] mb-8">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <span className="text-2xl text-[#B8860B]">✝</span>
                </div>
                <span className="text-xl">Igreja Comunidade</span>
              </div>
              <h2 className="text-3xl mb-2">{event.title}</h2>
              <p className="text-white/90">Ingresso de Participação</p>
            </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Event Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm text-gray-500 mb-2">PARTICIPANTE</h3>
                  <p className="text-xl text-gray-800">{registration.name}</p>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 mb-3">DATA E HORÁRIO</h3>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#B8860B] mt-0.5" />
                      <div>
                        <p className="text-gray-800">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-[#B8860B] mt-0.5" />
                      <div>
                        <p className="text-gray-800">{formatDateTime(event.date)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm text-gray-500 mb-3">LOCAL</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#B8860B] mt-0.5" />
                    <div>
                      <p className="text-gray-800">{event.location.split(' - ')[0]}</p>
                      {event.location.includes(' - ') && (
                        <p className="text-gray-600 text-sm">{event.location.split(' - ')[1]}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - QR Code and Ticket Info */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-6 rounded-2xl border-2 border-[#E8DCC4] mb-4">
                  {/* QR Code Placeholder */}
                  <div className="w-48 h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <QrCode className="w-24 h-24 text-gray-400" />
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjMDAwIj48cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjYwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTAwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTQwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTgwIiB5PSIyMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMjAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxMDAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxODAiIHk9IjYwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIyMCIgeT0iMTAwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSI2MCIgeT0iMTAwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxNDAiIHk9IjEwMCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTgwIiB5PSIxMDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjIwIiB5PSIxNDAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjEwMCIgeT0iMTQwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxODAiIHk9IjE0MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMjAiIHk9IjE4MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iNjAiIHk9IjE4MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PHJlY3QgeD0iMTAwIiB5PSIxODAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIvPjxyZWN0IHg9IjE0MCIgeT0iMTgwIiB3aWR0aD0iMjAiIGhlaWdodD0iMjAiLz48cmVjdCB4PSIxODAiIHk9IjE4MCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIi8+PC9nPjwvc3ZnPg==')] opacity-40" />
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-1">Código do Ingresso</p>
                  <p className="text-lg text-gray-800 font-mono tracking-wider">
                    {registration.id.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="border-t-2 border-dashed border-[#E8DCC4] pt-6">
              <h3 className="text-sm text-gray-500 mb-3">INFORMAÇÕES IMPORTANTES</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-1">•</span>
                  <span>Apresente este ingresso (impresso ou digital) na entrada do evento</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-1">•</span>
                  <span>Chegue com 30 minutos de antecedência para facilitar o check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-1">•</span>
                  <span>Traga um documento de identificação com foto</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#B8860B] mt-1">•</span>
                  <span>Material de apoio será entregue no primeiro dia do evento</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-[#F5F5DC] px-8 py-4 border-t border-[#E8DCC4]">
            <div className="flex flex-col md:flex-row justify-between items-center gap-2">
              <div className="text-sm text-gray-600">
                <span>Inscrição realizada em: </span>
                <span className="text-gray-800">
                  {registration.created_at ? new Date(registration.created_at).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                <span>Contato: </span>
                <span className="text-gray-800">{registration.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="text-center print:hidden">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/80 border border-[#E8DCC4] rounded-full hover:bg-white hover:border-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#B8860B]" />
            <span className="text-gray-700">Voltar para Página Inicial</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;
