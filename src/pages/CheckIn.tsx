import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/apiSelector';
import { ArrowLeft, Camera, CheckCircle, X, AlertCircle, Loader2, User, Mail, Phone, Calendar, Clock, MapPin } from 'lucide-react';
import type { Registration } from '../types';

const CheckIn: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [lastScanned, setLastScanned] = useState<Registration | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyCheckedIn, setIsAlreadyCheckedIn] = useState(false);
  const qrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const isCleaningRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, user, navigate]);

  // Função auxiliar para limpar o scanner de forma segura
  const cleanupScanner = async () => {
    if (isCleaningRef.current || !qrCodeRef.current) {
      return;
    }

    isCleaningRef.current = true;
    const scanner = qrCodeRef.current;

    try {
      // Tentar parar o scanner
      await scanner.stop();
    } catch (err: any) {
      // Ignorar erros de "scanner já parado" ou "elemento não encontrado"
      const errorMsg = err?.message || err?.toString() || '';
      if (
        !errorMsg.includes('not a child') &&
        !errorMsg.includes('already stopped') &&
        !errorMsg.includes('No QR code') &&
        !errorMsg.includes('NotFoundException')
      ) {
        console.warn('Aviso ao parar scanner:', errorMsg);
      }
    }

    try {
      // Limpar o DOM de forma segura
      await scanner.clear();
    } catch (err: any) {
      // Ignorar erros de limpeza do DOM
      const errorMsg = err?.message || err?.toString() || '';
      if (
        !errorMsg.includes('not a child') &&
        !errorMsg.includes('NotFoundException')
      ) {
        console.warn('Aviso ao limpar scanner:', errorMsg);
      }
    }

    qrCodeRef.current = null;
    isCleaningRef.current = false;
  };

  useEffect(() => {
    return () => {
      // Limpar scanner ao desmontar
      if (qrCodeRef.current) {
        cleanupScanner().catch(() => {
          // Ignorar erros no cleanup durante desmontagem
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startScanning = async () => {
    if (!scannerRef.current) return;

    try {
      // Limpar scanner anterior se existir
      await cleanupScanner();

      setError(null);
      setScanning(true);

      // Aguardar um pouco para garantir que o DOM está pronto e limpo
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verificar se o elemento ainda existe e limpar conteúdo residual
      const element = document.getElementById('qr-reader');
      if (!element) {
        console.error('Elemento qr-reader não encontrado');
        setScanning(false);
        return;
      }

      // Limpar qualquer conteúdo residual do elemento
      element.innerHTML = '';

      const qrCode = new Html5Qrcode('qr-reader');
      qrCodeRef.current = qrCode;

      await qrCode.start(
        {
          facingMode: 'environment', // Câmera traseira
        },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleQRCodeScanned(decodedText);
        },
        (_errorMessage) => {
          // Ignorar erros de leitura (normal durante a varredura)
        }
      );
    } catch (err: any) {
      console.error('Erro ao iniciar scanner:', err);
      setError('Erro ao acessar a câmera. Verifique as permissões.');
      setScanning(false);
      qrCodeRef.current = null;
      toast.error('Erro ao acessar a câmera');
    }
  };

  const stopScanning = async () => {
    await cleanupScanner();
    setScanning(false);
    setError(null);
  };

  const handleQRCodeScanned = async (registrationId: string) => {
    // Evitar processar o mesmo QR code múltiplas vezes
    if (processing || (lastScanned && lastScanned.id === registrationId)) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Parar o scanner temporariamente de forma segura
      if (qrCodeRef.current) {
        try {
          await qrCodeRef.current.stop();
        } catch (stopErr: any) {
          // Ignorar erros ao parar (pode já estar parado)
          const errorMsg = stopErr?.message || stopErr?.toString() || '';
          if (
            !errorMsg.includes('not a child') &&
            !errorMsg.includes('already stopped') &&
            !errorMsg.includes('NotFoundException')
          ) {
            console.warn('Aviso ao parar scanner:', errorMsg);
          }
        }
      }

      // Buscar informações da inscrição primeiro
      const registration = await api.getRegistrationById(registrationId);

      if (!registration) {
        setError('Inscrição não encontrada');
        toast.error('❌ Inscrição não encontrada');
        setProcessing(false);
        // Reiniciar scanner após um delay
        setTimeout(async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          startScanning();
        }, 2000);
        return;
      }

      // Verificar se o pagamento foi aprovado
      if (registration.payment_status !== 'approved') {
        setError('Pagamento não aprovado');
        toast.warning('⚠️ Pagamento não aprovado. Check-in não permitido.');
        setProcessing(false);
        setTimeout(async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          startScanning();
        }, 2000);
        return;
      }

      // Verificar se já está feito
      if (registration.checked_in) {
        setLastScanned(registration);
        setIsAlreadyCheckedIn(true);
        setProcessing(false);
        toast.info(`ℹ️ Check-in já foi realizado para ${registration.name}!`);
        // Reiniciar scanner após um delay
        setTimeout(async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          startScanning();
        }, 2000);
        return;
      }

      // Fazer check-in apenas (não remove se já estiver feito)
      try {
        const updated = await api.checkInOnly(registrationId);
        setLastScanned(updated);
        setIsAlreadyCheckedIn(false);
        setProcessing(false);
        toast.success(`✅ Check-in realizado para ${updated.name}!`);
        // Reiniciar scanner após um delay
        setTimeout(async () => {
          await new Promise(resolve => setTimeout(resolve, 300));
          startScanning();
        }, 2000);
      } catch (checkInErr: any) {
        // Se o erro for que já está feito, mostrar dados embaixo
        if (checkInErr.response?.status === 400 && checkInErr.response?.data?.registration) {
          setLastScanned(checkInErr.response.data.registration);
          setIsAlreadyCheckedIn(true);
          setProcessing(false);
          toast.info(`ℹ️ Check-in já foi realizado para ${checkInErr.response.data.registration.name}!`);
          // Reiniciar scanner após um delay
          setTimeout(async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            startScanning();
          }, 2000);
        } else {
          throw checkInErr;
        }
      }
    } catch (err: any) {
      console.error('Erro ao processar check-in:', err);
      const errorMessage =
        err.response?.data?.error ||
        err.message ||
        'Erro ao processar check-in';
      setError(errorMessage);
      toast.error(errorMessage);

      setProcessing(false);
      // Reiniciar scanner após um delay
      setTimeout(async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        startScanning();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gradient-to-b from-[#F5F5DC] to-white">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar para Admin</span>
          </button>

          <h1 className="text-4xl mb-2 text-gray-800">Check-in por QR Code</h1>
          <p className="text-gray-600">
            Aponte a câmera para o QR code do ingresso
          </p>
        </div>

        {/* Scanner Area */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#E8DCC4] shadow-lg mb-6">
          <div className="relative">
            <div
              id="qr-reader"
              ref={scannerRef}
              className={`w-full rounded-lg overflow-hidden ${
                scanning ? 'min-h-[400px]' : 'min-h-[200px] bg-gray-100 flex items-center justify-center'
              }`}
            >
              {!scanning && !processing && (
                <div className="text-center p-8">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Clique em "Iniciar Scanner" para começar
                  </p>
                </div>
              )}
            </div>
            {processing && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-lg">
                <div className="bg-white rounded-xl p-6 text-center">
                  <Loader2 className="w-12 h-12 text-[#B8860B] animate-spin mx-auto mb-4" />
                  <p className="text-gray-800 font-medium">Processando...</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-4 mt-6 justify-center">
            {!scanning ? (
              <button
                onClick={startScanning}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Camera className="w-5 h-5" />
                <span>Iniciar Scanner</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                <span>Parar Scanner</span>
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-900 font-semibold">Erro</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Last Scanned Info */}
        {lastScanned && lastScanned.checked_in && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-[#E8DCC4] shadow-lg mb-6">
            <h2 className="text-2xl mb-4 text-gray-800 flex items-center gap-2">
              <CheckCircle
                className={`w-6 h-6 ${
                  isAlreadyCheckedIn ? 'text-blue-600' : 'text-green-600'
                }`}
              />
              {isAlreadyCheckedIn ? 'Check-in Já Realizado' : 'Check-in Realizado!'}
            </h2>

            {/* Aviso se já estava feito */}
            {isAlreadyCheckedIn && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-blue-900 font-semibold mb-1">Check-in já realizado anteriormente</p>
                  <p className="text-blue-700 text-sm">
                    Este participante já realizou o check-in. Nenhuma alteração foi feita.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Informações Pessoais */}
              <div className="bg-[#F5F5DC] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
                    <p className="text-gray-800 font-medium">{lastScanned.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </p>
                    <p className="text-gray-800 font-medium break-all">{lastScanned.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </p>
                    <p className="text-gray-800 font-medium">{lastScanned.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CPF</p>
                    <p className="text-gray-800 font-medium">{lastScanned.cpf || 'Não informado'}</p>
                  </div>
                  {lastScanned.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </p>
                      <p className="text-gray-800 font-medium">{lastScanned.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Check-in */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Check-in
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Realizado
                    </span>
                  </div>
                  {lastScanned.checked_in_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Data do Check-in
                      </p>
                      <p className="text-gray-800 font-medium">
                        {new Date(lastScanned.checked_in_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Pagamento */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      lastScanned.payment_status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : lastScanned.payment_status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {lastScanned.payment_status === 'approved' && '✓ Aprovado'}
                      {lastScanned.payment_status === 'pending' && '⏱ Pendente'}
                      {lastScanned.payment_status === 'rejected' && '✗ Rejeitado'}
                    </span>
                  </div>
                  {lastScanned.payment_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Data do Pagamento</p>
                      <p className="text-gray-800 font-medium">
                        {new Date(lastScanned.payment_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Instruções
          </h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">1.</span>
              <span>
                Clique em "Iniciar Scanner" e permita o acesso à câmera
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">2.</span>
              <span>
                Aponte a câmera para o QR code do ingresso do participante
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">3.</span>
              <span>
                O check-in será processado automaticamente quando o QR code for
                lido
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 font-bold">4.</span>
              <span>
                Apenas ingressos com pagamento aprovado podem fazer check-in
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
