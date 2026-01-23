import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-toastify';
import { QRCodeSVG } from 'qrcode.react';
import { Search, Download, Printer, Calendar, Clock, MapPin, QrCode } from 'lucide-react';
import { api } from '../services/apiSelector';
import { getEvent } from '../services/api';
import type { Registration, Event } from '../types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const MeuIngresso: React.FC = () => {
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleSearch = async () => {
    if (!cpf || cpf.replace(/\D/g, '').length !== 11) {
      toast.error('Por favor, insira um CPF válido');
      return;
    }

    setLoading(true);
    try {
      const cleanCpf = cpf.replace(/\D/g, '');
      console.log('Buscando inscrições para CPF:', cleanCpf);
      
      const data = await api.getRegistrationsByCpf(cleanCpf);
      console.log('Inscrições encontradas:', data);
      
      setRegistrations(data);
      
      if (data.length === 0) {
        toast.info('Nenhuma inscrição aprovada encontrada para este CPF. Verifique se o pagamento foi confirmado.');
      } else if (data.length === 1) {
        // Se houver apenas uma, carregar automaticamente
        await loadRegistration(data[0]);
      }
    } catch (error: any) {
      console.error('Erro ao buscar inscrições:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao buscar inscrições. Tente novamente.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadRegistration = async (registration: Registration) => {
    try {
      const eventData = await getEvent(registration.event_id);
      setEvent(eventData);
      setSelectedRegistration(registration);
    } catch (error: any) {
      console.error('Erro ao carregar evento:', error);
      toast.error('Erro ao carregar informações do evento');
    }
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

  const handlePrintReact = useReactToPrint({
    contentRef: ticketRef,
    documentTitle: `Ingresso - ${event?.title || ''} - ${selectedRegistration?.name || ''}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 20mm;
      }
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
        .print-ticket .grid {
          display: grid !important;
        }
        .print-ticket [class*="grid-cols-3"] {
          grid-template-columns: 2fr 1fr !important;
        }
        .print-ticket [class*="col-span-2"] {
          grid-column: span 1 !important;
        }
        .print-ticket .grid-cols-1 {
          grid-template-columns: 2fr 1fr !important;
        }
      }
    `,
  });

  const handlePrint = () => {
    if (!ticketRef.current) {
      toast.error('Ingresso não encontrado. Aguarde o carregamento.');
      return;
    }
    handlePrintReact();
  };

  const handleDownload = async () => {
    if (!ticketRef.current || !selectedRegistration) {
      toast.error('Ingresso não encontrado.');
      return;
    }

    try {
      setLoading(true);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: true,
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF('p', 'mm', 'a4');
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const sanitizedName = selectedRegistration.name.split(' ')[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const sanitizedTitle = (event?.title || '').replace(/\s+/g, '-').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const fileName = `ingresso-${sanitizedTitle}-${sanitizedName}.pdf`;
      
      pdf.save(fileName);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl mb-8 text-gray-800">Meu Ingresso</h1>

        {/* Formulário de busca */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
                placeholder="000.000.000-00"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Search className="w-5 h-5" />
                <span>{loading ? 'Buscando...' : 'Buscar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de inscrições (se houver múltiplas) */}
        {registrations.length > 1 && !selectedRegistration && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg mb-8">
            <h2 className="text-2xl mb-4 text-gray-800">Seus Ingressos</h2>
            <div className="space-y-4">
              {registrations.map((reg) => (
                <div
                  key={reg.id}
                  className="p-4 border border-[#E8DCC4] rounded-lg hover:border-[#D4AF37] transition-colors cursor-pointer"
                  onClick={() => loadRegistration(reg)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{reg.name}</p>
                      <p className="text-sm text-gray-600">ID: {reg.id}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadRegistration(reg);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Ver Ingresso
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingresso */}
        {selectedRegistration && event && (
          <div>
            {/* Botões de ação */}
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-white/80 border border-[#E8DCC4] rounded-full hover:bg-white hover:border-[#D4AF37] transition-colors shadow-md"
              >
                <Printer className="w-5 h-5 text-[#B8860B]" />
                <span className="text-gray-700">Imprimir Ingresso</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span>{loading ? 'Gerando PDF...' : 'Baixar Ingresso (PDF)'}</span>
              </button>
            </div>

            {/* Ticket */}
            <div ref={ticketRef} className="print-ticket bg-white rounded-xl border-3 border-[#D4AF37] overflow-hidden shadow-xl mb-8 max-w-2xl mx-auto">
              {/* Header do Ingresso */}
              <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white p-3 text-center">
                <h3 className="text-xl font-bold">{event.title}</h3>
                <p className="text-sm opacity-90">Ingresso Digital</p>
              </div>

              {/* Corpo do Ingresso */}
              <div className="p-4">
                {/* Layout compacto: Informações lado a lado */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {/* Coluna 1: Dados do Participante */}
                  <div className="md:col-span-2">
                    <div className="space-y-2 text-gray-700">
                      <div>
                        <p className="text-sm text-gray-500">Nome:</p>
                        <p className="font-medium text-sm">{selectedRegistration.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">CPF:</p>
                        <p className="font-medium text-sm">{selectedRegistration.cpf}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">E-mail:</p>
                        <p className="font-medium text-sm break-all">{selectedRegistration.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Telefone:</p>
                        <p className="font-medium text-sm">{selectedRegistration.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Coluna 2: QR Code */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-40 h-40 bg-white rounded flex items-center justify-center border-2 border-[#E8DCC4] p-2 mb-1">
                      {selectedRegistration.id ? (
                        <QRCodeSVG
                          value={selectedRegistration.id}
                          size={150}
                          level="H"
                          includeMargin={false}
                          fgColor="#B8860B"
                          bgColor="#FFFFFF"
                        />
                      ) : (
                        <QrCode className="w-16 h-16 text-[#B8860B]" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 text-center leading-tight">
                      Apresente na entrada
                    </p>
                  </div>
                </div>

                {/* Informações do Evento */}
                <div className="border-t border-[#E8DCC4] pt-3 mb-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Data:</p>
                        <p className="font-medium text-sm">{formatDate(event.date)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Horário:</p>
                        <p className="font-medium text-sm">09h00</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#B8860B] flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Local:</p>
                        <p className="font-medium text-sm">{event.location}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ID do Ingresso */}
                <div className="border-t border-[#E8DCC4] pt-2">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-gray-500 mb-0.5">ID do Ingresso:</p>
                      <p className="font-mono text-sm text-[#B8860B] font-bold break-all">
                        {selectedRegistration.id}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      Emitido: {formatDateTime(selectedRegistration.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeuIngresso;
