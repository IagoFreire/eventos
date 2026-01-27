import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import type { Registration, RegistrationAnswer, RegistrationQuestion } from '../types';
import { api } from '../services/apiSelector';
import { ArrowLeft, Search, Edit2, X, CheckCircle, Circle, User, Trash2, Calendar, CreditCard, DollarSign, FileText, Mail, Phone, Clock, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';
import Loading from '../components/Loading';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<Registration | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsRegistration, setSelectedDetailsRegistration] = useState<Registration | null>(null);
  const [registrationAnswers, setRegistrationAnswers] = useState<RegistrationAnswer[]>([]);
  const [registrationQuestions, setRegistrationQuestions] = useState<RegistrationQuestion[]>([]);
  const [loadingAnswers, setLoadingAnswers] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadRegistrations();
  }, [isAuthenticated, user, navigate]);

  // Ref para armazenar o timer do debounce
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Função de debounce para atualizar o searchTerm
  const handleSearchChange = (value: string) => {
    // Limpar timer anterior se existir
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Se o valor estiver vazio, atualizar imediatamente
    if (value === '') {
      setSearchTerm('');
      return;
    }

    // Criar novo timer
    debounceTimerRef.current = setTimeout(() => {
      setSearchTerm(value);
    }, 500);
  };

  // Cleanup do timer quando componente desmontar
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Bloquear scroll do body quando modais estiverem abertos
  useEffect(() => {
    if (isEditModalOpen || isDeleteModalOpen || isDetailsModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup: restaurar scroll quando componente desmontar
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen, isDeleteModalOpen, isDetailsModalOpen]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getRegistrations();
      setRegistrations(data);
    } catch (error: any) {
      console.error('❌ Erro ao carregar inscrições:', error);
      
      if (error.response?.status === 401) {
        toast.error('🔒 Sessão expirada. Faça login novamente.');
        navigate('/login');
      } else {
        let errorMessage = 'Erro ao carregar inscrições.';
        if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        toast.error(errorMessage, { autoClose: 5000 });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (registration: Registration) => {
    try {
      const updated = await api.checkIn(registration.id);
      setRegistrations(registrations.map(r => 
        r.id === updated.id ? updated : r
      ));
      
      // Mensagem baseada no novo status
      if (updated.checked_in) {
        toast.success(`✅ Check-in realizado para ${registration.name}!`);
      } else {
        toast.info(`↩️ Check-in removido para ${registration.name}`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao fazer check-in:', error);
      
      let errorMessage = 'Erro ao processar check-in. Tente novamente.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
        
        // Traduzir erros comuns
        if (errorMessage.includes('payment')) {
          errorMessage = '⚠️ Check-in permitido apenas para pagamentos aprovados!';
        }
      }
      
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  const handleEdit = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsEditModalOpen(true);
  };

  const handleRowClick = async (registration: Registration, e: React.MouseEvent) => {
    // Não abrir modal se clicar em botões ou links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    setSelectedDetailsRegistration(registration);
    setIsDetailsModalOpen(true);
    setLoadingAnswers(true);
    
    try {
      // Buscar a inscrição completa com respostas
      const fullRegistration: any = await api.getRegistrationById(registration.id);
      
      // Se a inscrição tiver respostas (answers), usar elas
      if (fullRegistration.answers && Array.isArray(fullRegistration.answers)) {
        setRegistrationAnswers(fullRegistration.answers);
        
        // Buscar as perguntas para exibir o texto completo
        if (fullRegistration.event_id) {
          const questions = await api.getRegistrationQuestions(fullRegistration.event_id);
          setRegistrationQuestions(questions);
        }
      } else {
        setRegistrationAnswers([]);
        setRegistrationQuestions([]);
      }
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
      setRegistrationAnswers([]);
      setRegistrationQuestions([]);
    } finally {
      setLoadingAnswers(false);
    }
  };

  const handleDeleteClick = (registration: Registration) => {
    setRegistrationToDelete(registration);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!registrationToDelete) return;

    try {
      await api.deleteRegistration(registrationToDelete.id);
      setRegistrations(registrations.filter(r => r.id !== registrationToDelete.id));
      setIsDeleteModalOpen(false);
      setRegistrationToDelete(null);
      toast.success(`🗑️ Inscrição de ${registrationToDelete.name} excluída com sucesso!`);
    } catch (error: any) {
      console.error('❌ Erro ao excluir inscrição:', error);
      
      let errorMessage = 'Erro ao excluir inscrição. Tente novamente.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRegistration) return;

    try {
      const updated = await api.updateRegistration(selectedRegistration.id, selectedRegistration);
      setRegistrations(registrations.map(r => 
        r.id === updated.id ? updated : r
      ));
      setIsEditModalOpen(false);
      setSelectedRegistration(null);
      toast.success('Inscrição atualizada com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar inscrição:', error);
      
      let errorMessage = 'Erro ao atualizar inscrição. Tente novamente.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error(errorMessage, { autoClose: 5000 });
    }
  };

  // Função de ordenação
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Se já está ordenando por esta coluna, inverte a direção
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Se é uma nova coluna, define como ascendente
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Memoizar a filtragem para evitar recálculos desnecessários
  const filteredRegistrations = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    
    return registrations.filter(reg => {
      // Otimizar busca: só fazer toLowerCase uma vez
      const matchesSearch = searchTerm === '' || 
        reg.name.toLowerCase().includes(searchLower) ||
        reg.email.toLowerCase().includes(searchLower) ||
        reg.cpf.includes(searchTerm);

      const matchesStatus = 
        filterStatus === 'all' ||
        (filterStatus === 'checked_in' && reg.checked_in) ||
        (filterStatus === 'not_checked_in' && !reg.checked_in) ||
        reg.payment_status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchTerm, filterStatus]);

  // Memoizar a ordenação para evitar recálculos desnecessários
  const sortedRegistrations = useMemo(() => {
    if (!sortColumn) return filteredRegistrations;

    return [...filteredRegistrations].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortColumn) {
        case 'status':
          aValue = a.checked_in ? 1 : 0;
          bValue = b.checked_in ? 1 : 0;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'cpf':
          aValue = a.cpf || '';
          bValue = b.cpf || '';
          break;
        case 'payment':
          // Ordenar por status: approved > pending > rejected
          const paymentOrder = { approved: 3, pending: 2, rejected: 1 };
          aValue = paymentOrder[a.payment_status] || 0;
          bValue = paymentOrder[b.payment_status] || 0;
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRegistrations, sortColumn, sortDirection]);

  // Calcular paginação
  const totalPages = Math.ceil(sortedRegistrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRegistrations = sortedRegistrations.slice(startIndex, endIndex);

  // Resetar para primeira página quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortColumn, sortDirection]);

  // Funções de navegação
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Função para renderizar ícone de ordenação
  const renderSortIcon = (column: string) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-400" />;
    }
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-4 h-4 ml-1 text-[#B8860B]" />
      : <ArrowDown className="w-4 h-4 ml-1 text-[#B8860B]" />;
  };

  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.payment_status === 'approved').length,
    pending: registrations.filter(r => r.payment_status === 'pending').length,
    checkedIn: registrations.filter(r => r.checked_in).length,
  };

  // Função para formatar data/hora no fuso horário do Brasil
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Função para formatar data/hora de forma mais legível no mobile
  const formatDateTimeMobile = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Verificar se é hoje
    const isToday = date.toDateString() === today.toDateString();
    // Verificar se é ontem
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const time = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
    
    if (isToday) {
      return `Hoje às ${time}`;
    } else if (isYesterday) {
      return `Ontem às ${time}`;
    } else {
      const dateFormatted = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
        timeZone: 'America/Sao_Paulo'
      });
      return `${dateFormatted} às ${time}`;
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <div className="hidden md:flex gap-3">
              <button
                onClick={() => navigate('/admin/checkin')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Check-in QR Code</span>
              </button>
              <button
                onClick={() => navigate('/admin/configuracoes')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span>Configurações</span>
              </button>
            </div>
          </div>

          <h1 className="text-4xl mb-2 text-gray-800">Painel de Administração</h1>
          <p className="text-gray-600">Gerencie as inscrições do evento</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Total de Inscritos</p>
                <p className="text-2xl md:text-3xl text-gray-800 font-semibold">{stats.total}</p>
              </div>
              <User className="w-8 h-8 md:w-10 md:h-10 text-[#B8860B]" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Pagamentos Aprovados</p>
                <p className="text-2xl md:text-3xl text-green-600 font-semibold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Pagamentos Pendentes</p>
                <p className="text-2xl md:text-3xl text-orange-600 font-semibold">{stats.pending}</p>
              </div>
              <Circle className="w-8 h-8 md:w-10 md:h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm text-gray-600 mb-1">Check-ins Realizados</p>
                <p className="text-2xl md:text-3xl text-green-600 font-semibold">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="w-8 h-8 md:w-10 md:h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-[#E8DCC4] shadow-lg mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                defaultValue={searchTerm}
                onChange={(e) => {
                  const value = e.target.value;
                  handleSearchChange(value);
                }}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50 text-sm md:text-base"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </button>
              <button
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  filterStatus === 'approved' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('approved')}
              >
                Aprovados
              </button>
              <button
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  filterStatus === 'pending' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('pending')}
              >
                Pendentes
              </button>
              <button
                className={`px-3 md:px-4 py-2 rounded-lg transition-colors text-sm md:text-base ${
                  filterStatus === 'checked_in' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('checked_in')}
              >
                Com Check-in
              </button>
            </div>
          </div>
        </div>

        {/* Registrations - Cards on Mobile, Table on Desktop */}
        {filteredRegistrations.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">Nenhuma inscrição encontrada</p>
          </div>
        ) : (
          <>
            {/* Cards View - Mobile */}
            <div className="md:hidden space-y-4">
              {paginatedRegistrations.map((registration) => (
                <div
                  key={registration.id}
                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg p-4 space-y-3"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (!target.closest('button')) {
                      handleRowClick(registration, e);
                    }
                  }}
                >
                  {/* Header do Card */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">{registration.name}</h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckIn(registration);
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all ${
                            registration.checked_in
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {registration.checked_in ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Check-in Feito</span>
                            </>
                          ) : (
                            <>
                              <Circle className="w-3.5 h-3.5" />
                              <span>Check-in Pendente</span>
                            </>
                          )}
                        </button>
                        <span className={`px-2.5 py-1 rounded-full text-xs ${
                          registration.payment_status === 'approved' 
                            ? 'bg-green-100 text-green-700' 
                            : registration.payment_status === 'pending'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {registration.payment_status === 'approved' && '✓ Aprovado'}
                          {registration.payment_status === 'pending' && '⏱ Pendente'}
                          {registration.payment_status === 'rejected' && '✗ Rejeitado'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(registration);
                        }}
                        className="p-2 bg-[#F5F5DC] text-[#B8860B] rounded-lg hover:bg-[#E8DCC4] transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(registration);
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Informações do Card */}
                  <div className="pt-2 border-t border-[#E8DCC4]">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">{registration.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">CPF:</span>
                        <span className="text-gray-600">{registration.cpf}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-gray-600">
                          {formatDateTimeMobile(registration.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table View - Desktop */}
            <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F5F5DC]">
                    <tr>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {renderSortIcon('status')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Nome
                          {renderSortIcon('name')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Telefone
                          {renderSortIcon('phone')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('cpf')}
                      >
                        <div className="flex items-center">
                          CPF
                          {renderSortIcon('cpf')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('payment')}
                      >
                        <div className="flex items-center">
                          Pagamento
                          {renderSortIcon('payment')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-4 text-left text-gray-700 cursor-pointer hover:bg-[#E8DCC4]/50 transition-colors select-none"
                        onClick={() => handleSort('created_at')}
                      >
                        <div className="flex items-center">
                          Data/Hora
                          {renderSortIcon('created_at')}
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRegistrations.map((registration) => (
                      <tr 
                        key={registration.id} 
                        className="border-t border-[#E8DCC4] hover:bg-[#F5F5DC]/30 cursor-pointer transition-colors"
                        onClick={(e) => handleRowClick(registration, e)}
                      >
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleCheckIn(registration)}
                            title={registration.checked_in ? 'Clique para remover check-in' : 'Clique para fazer check-in'}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm transition-all hover:scale-105 ${
                              registration.checked_in
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            }`}
                          >
                            {registration.checked_in ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Feito</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-4 h-4" />
                                <span>Pendente</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-gray-800">{registration.name}</td>
                        <td className="px-6 py-4 text-gray-600">{registration.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{registration.cpf}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            registration.payment_status === 'approved' 
                              ? 'bg-green-100 text-green-700' 
                              : registration.payment_status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {registration.payment_status === 'approved' && '✓ Aprovado'}
                            {registration.payment_status === 'pending' && '⏱ Pendente'}
                            {registration.payment_status === 'rejected' && '✗ Rejeitado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>
                              {formatDateTime(registration.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(registration)}
                              className="p-2 bg-[#F5F5DC] text-[#B8860B] rounded-lg hover:bg-[#E8DCC4] transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(registration)}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Controles de Paginação */}
            {totalPages > 1 && (
              <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg p-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  {/* Informações da paginação */}
                  <div className="text-sm text-gray-600">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, sortedRegistrations.length)} de {sortedRegistrations.length} inscrições
                  </div>

                  {/* Seletor de itens por página */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Itens por página:</label>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white text-sm"
                    >
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="20">20</option>
                      <option value="50">50</option>
                      <option value="100">100</option>
                    </select>
                  </div>

                  {/* Navegação de páginas */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-[#E8DCC4] hover:bg-[#F5F5DC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber: number;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNumber}
                            onClick={() => goToPage(pageNumber)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === pageNumber
                                ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white'
                                : 'border border-[#E8DCC4] hover:bg-[#F5F5DC] text-gray-700'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-[#E8DCC4] hover:bg-[#F5F5DC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Próxima página"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && selectedRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsEditModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-gray-800">Editar Inscrição</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Nome</label>
                <input
                  type="text"
                  value={selectedRegistration.name}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={selectedRegistration.email}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      email: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Telefone</label>
                <input
                  type="tel"
                  value={selectedRegistration.phone}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      phone: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-2">Status do Pagamento</label>
                <select
                  value={selectedRegistration.payment_status}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      payment_status: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-[#E8DCC4] rounded-lg focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 border border-[#E8DCC4] text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveEdit}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-2 rounded-lg hover:shadow-lg transition-all"
              >
                Salvar
              </button>
            </div>
            </div>
          </div>
        )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && registrationToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="bg-white rounded-2xl p-8 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-gray-800">Confirmar Exclusão</h2>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <Trash2 className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-900 font-semibold mb-1">
                      Atenção! Esta ação não pode ser desfeita.
                    </p>
                    <p className="text-red-700 text-sm">
                      Todos os dados da inscrição serão permanentemente excluídos.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-gray-700">
                <p><strong>Nome:</strong> {registrationToDelete.name}</p>
                <p><strong>E-mail:</strong> {registrationToDelete.email}</p>
                <p><strong>CPF:</strong> {registrationToDelete.cpf}</p>
                <p><strong>Status:</strong> {
                  registrationToDelete.payment_status === 'approved' ? '✓ Aprovado' :
                  registrationToDelete.payment_status === 'pending' ? '⏱ Pendente' :
                  '✗ Rejeitado'
                }</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 border border-[#E8DCC4] text-gray-700 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            </div>
            </div>
          </div>
        )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedDetailsRegistration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setIsDetailsModalOpen(false)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header Fixo */}
            <div className="flex justify-between items-center p-8 pb-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl text-gray-800 font-bold">Detalhes da Inscrição</h2>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="overflow-y-auto flex-1 px-8 py-6">
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
                    <p className="text-gray-800 font-medium">{selectedDetailsRegistration.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </p>
                    <p className="text-gray-800 font-medium">{selectedDetailsRegistration.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      Telefone
                    </p>
                    <p className="text-gray-800 font-medium">{selectedDetailsRegistration.phone || 'Não informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CPF</p>
                    <p className="text-gray-800 font-medium">{selectedDetailsRegistration.cpf || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Informações de Pagamento */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Informações de Pagamento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status do Pagamento</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDetailsRegistration.payment_status === 'approved' 
                        ? 'bg-green-100 text-green-700' 
                        : selectedDetailsRegistration.payment_status === 'pending'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedDetailsRegistration.payment_status === 'approved' && '✓ Aprovado'}
                      {selectedDetailsRegistration.payment_status === 'pending' && '⏱ Pendente'}
                      {selectedDetailsRegistration.payment_status === 'rejected' && '✗ Rejeitado'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Método de Pagamento</p>
                    <p className="text-gray-800 font-medium flex items-center gap-2">
                      {selectedDetailsRegistration.selected_payment_method === 'pix' ? '📱 PIX' : 
                       selectedDetailsRegistration.selected_payment_method === 'credit_card' ? '💳 Cartão de Crédito' : 
                       selectedDetailsRegistration.selected_payment_method || 'Não informado'}
                    </p>
                  </div>
                  {selectedDetailsRegistration.payment_amount && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Valor Pago
                      </p>
                      <p className="text-gray-800 font-medium text-lg text-green-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedDetailsRegistration.payment_amount)}
                      </p>
                    </div>
                  )}
                  {selectedDetailsRegistration.payment_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Data do Pagamento
                      </p>
                      <p className="text-gray-800 font-medium">
                        {formatDateTime(selectedDetailsRegistration.payment_date)}
                      </p>
                    </div>
                  )}
                  {selectedDetailsRegistration.payment_id && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">ID do Pagamento</p>
                      <p className="text-gray-800 font-medium font-mono text-sm break-all">
                        {selectedDetailsRegistration.payment_id}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informações de Check-in */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Check-in
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedDetailsRegistration.checked_in
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {selectedDetailsRegistration.checked_in ? (
                        <>
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Realizado
                        </>
                      ) : (
                        <>
                          <Circle className="w-4 h-4 inline mr-1" />
                          Pendente
                        </>
                      )}
                    </span>
                  </div>
                  {selectedDetailsRegistration.checked_in_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Data do Check-in
                      </p>
                      <p className="text-gray-800 font-medium">
                        {formatDateTime(selectedDetailsRegistration.checked_in_date)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Respostas das Perguntas */}
              {loadingAnswers ? (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-center py-4">
                    <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-3 text-gray-600">Carregando respostas...</span>
                  </div>
                </div>
              ) : registrationAnswers.length > 0 ? (
                <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Respostas das Perguntas
                  </h3>
                  <div className="space-y-4">
                    {registrationAnswers.map((answer) => {
                      const question = registrationQuestions.find(q => q.id === answer.question_id);
                      return (
                        <div key={answer.id} className="bg-white rounded-lg p-4 border border-purple-200">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            {question?.question_text || 'Pergunta não encontrada'}
                          </p>
                          <div className="text-gray-800">
                            {answer.answer_text ? (
                              <p className="text-base">{answer.answer_text}</p>
                            ) : answer.answer_options && answer.answer_options.length > 0 ? (
                              <div className="space-y-1">
                                {answer.answer_options.map((option, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-purple-600" />
                                    <span className="text-base">{option}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">Sem resposta</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {/* Informações do Sistema */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Informações do Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">ID da Inscrição</p>
                    <p className="text-gray-800 font-medium font-mono text-sm break-all">
                      {selectedDetailsRegistration.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Data de Criação
                    </p>
                    <p className="text-gray-800 font-medium">
                      {formatDateTime(selectedDetailsRegistration.created_at)}
                    </p>
                  </div>
                </div>
              </div>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="flex gap-4 p-8 pt-6 border-t border-gray-200 flex-shrink-0">
              <button
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleEdit(selectedDetailsRegistration);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#F5F5DC] text-[#B8860B] py-3 rounded-lg hover:bg-[#E8DCC4] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar</span>
              </button>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="flex-1 border border-[#E8DCC4] text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
