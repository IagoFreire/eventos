import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import type { Registration } from '../types';
import { api } from '../services/apiSelector';
import { ArrowLeft, Search, Edit2, X, CheckCircle, Circle, User, Trash2, Calendar, CreditCard, DollarSign, FileText, Mail, Phone, MapPin, Clock } from 'lucide-react';
import Loading from '../components/Loading';

const Admin: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [registrationToDelete, setRegistrationToDelete] = useState<Registration | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDetailsRegistration, setSelectedDetailsRegistration] = useState<Registration | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadRegistrations();
  }, [isAuthenticated, user, navigate]);

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

  const handleRowClick = (registration: Registration, e: React.MouseEvent) => {
    // Não abrir modal se clicar em botões ou links
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    setSelectedDetailsRegistration(registration);
    setIsDetailsModalOpen(true);
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

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = 
      reg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reg.cpf.includes(searchTerm);

    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'checked_in' && reg.checked_in) ||
      (filterStatus === 'not_checked_in' && !reg.checked_in) ||
      reg.payment_status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    approved: registrations.filter(r => r.payment_status === 'approved').length,
    pending: registrations.filter(r => r.payment_status === 'pending').length,
    checkedIn: registrations.filter(r => r.checked_in).length,
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              {filteredRegistrations.map((registration) => (
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
                  <div className="space-y-2 pt-2 border-t border-[#E8DCC4]">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{registration.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">CPF:</span>
                      <span className="text-gray-600">{registration.cpf}</span>
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
                      <th className="px-6 py-4 text-left text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-gray-700">Nome</th>
                      <th className="px-6 py-4 text-left text-gray-700">Telefone</th>
                      <th className="px-6 py-4 text-left text-gray-700">CPF</th>
                      <th className="px-6 py-4 text-left text-gray-700">Pagamento</th>
                      <th className="px-6 py-4 text-left text-gray-700">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRegistrations.map((registration) => (
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
                  {selectedDetailsRegistration.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        Endereço
                      </p>
                      <p className="text-gray-800 font-medium">{selectedDetailsRegistration.address}</p>
                    </div>
                  )}
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
                  {selectedDetailsRegistration.payment_method && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Método de Pagamento</p>
                      <p className="text-gray-800 font-medium flex items-center gap-2">
                        {selectedDetailsRegistration.payment_method === 'pix' ? '📱 PIX' : 
                         selectedDetailsRegistration.payment_method === 'credit_card' ? '💳 Cartão de Crédito' : 
                         selectedDetailsRegistration.payment_method}
                      </p>
                    </div>
                  )}
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
                        {new Date(selectedDetailsRegistration.payment_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
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
                        {new Date(selectedDetailsRegistration.checked_in_date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

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
                      {new Date(selectedDetailsRegistration.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
