import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Registration } from '../types';
import { api } from '../services/apiSelector';
import { ArrowLeft, Search, Edit2, Save, X, CheckCircle, Circle, Trash2, User, LogOut } from 'lucide-react';
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

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login');
      return;
    }
    loadRegistrations();
  }, [isAuthenticated, user, navigate]);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getRegistrations();
      setRegistrations(data);
    } catch (error) {
      console.error('Erro ao carregar inscrições:', error);
      if ((error as any)?.response?.status === 401) {
        navigate('/login');
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
    } catch (error) {
      console.error('Erro ao fazer check-in:', error);
      alert('Erro ao fazer check-in. Tente novamente.');
    }
  };

  const handleEdit = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsEditModalOpen(true);
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
    } catch (error) {
      console.error('Erro ao atualizar inscrição:', error);
      alert('Erro ao atualizar inscrição. Tente novamente.');
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
            
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/admin/configuracoes')}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
                <span>Configurações</span>
              </button>
              
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-[#E8DCC4] rounded-lg text-gray-700 hover:bg-white/80 hover:border-[#D4AF37] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          <h1 className="text-4xl mb-2 text-gray-800">Painel de Administração</h1>
          <p className="text-gray-600">Gerencie as inscrições do evento</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total de Inscritos</p>
                <p className="text-3xl text-gray-800">{stats.total}</p>
              </div>
              <User className="w-10 h-10 text-[#B8860B]" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pagamentos Aprovados</p>
                <p className="text-3xl text-green-600">{stats.approved}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Pagamentos Pendentes</p>
                <p className="text-3xl text-orange-600">{stats.pending}</p>
              </div>
              <Circle className="w-10 h-10 text-orange-600" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E8DCC4] shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1">Check-ins Realizados</p>
                <p className="text-3xl text-green-600">{stats.checkedIn}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-[#E8DCC4] shadow-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, e-mail ou CPF..."
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'approved' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('approved')}
              >
                Aprovados
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterStatus === 'pending' 
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white' 
                    : 'bg-white border border-[#E8DCC4] text-gray-700 hover:border-[#D4AF37]'
                }`}
                onClick={() => setFilterStatus('pending')}
              >
                Pendentes
              </button>
              <button
                className={`px-4 py-2 rounded-lg transition-colors ${
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

        {/* Registrations Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E8DCC4] shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F5F5DC]">
                <tr>
                  <th className="px-6 py-4 text-left text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-gray-700">Nome</th>
                  <th className="px-6 py-4 text-left text-gray-700">E-mail</th>
                  <th className="px-6 py-4 text-left text-gray-700">Telefone</th>
                  <th className="px-6 py-4 text-left text-gray-700">CPF</th>
                  <th className="px-6 py-4 text-left text-gray-700">Pagamento</th>
                  <th className="px-6 py-4 text-left text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Nenhuma inscrição encontrada
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((registration) => (
                    <tr key={registration.id} className="border-t border-[#E8DCC4] hover:bg-[#F5F5DC]/30">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleCheckIn(registration)}
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                            registration.checked_in
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {registration.checked_in ? (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Check-in</span>
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
                      <td className="px-6 py-4 text-gray-600">{registration.email}</td>
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
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
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
    </div>
  );
};

export default Admin;
