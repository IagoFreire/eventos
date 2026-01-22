import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { Registration } from '../types';
import { api } from '../services/apiSelector';
import Loading from '../components/Loading';
import './Admin.css';

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
      // Se houver erro de autenticação, redirecionar para login
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
    <div className="admin">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Painel Administrativo</h1>
          <p>Gerencie as inscrições do evento</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total de Inscrições</p>
            </div>
          </div>
          <div className="stat-card approved">
            <div className="stat-icon">✓</div>
            <div className="stat-info">
              <h3>{stats.approved}</h3>
              <p>Pagamentos Aprovados</p>
            </div>
          </div>
          <div className="stat-card pending">
            <div className="stat-icon">⏱</div>
            <div className="stat-info">
              <h3>{stats.pending}</h3>
              <p>Pagamentos Pendentes</p>
            </div>
          </div>
          <div className="stat-card checked">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{stats.checkedIn}</h3>
              <p>Check-ins Realizados</p>
            </div>
          </div>
        </div>

        <div className="filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={filterStatus === 'all' ? 'active' : ''}
              onClick={() => setFilterStatus('all')}
            >
              Todos
            </button>
            <button
              className={filterStatus === 'approved' ? 'active' : ''}
              onClick={() => setFilterStatus('approved')}
            >
              Aprovados
            </button>
            <button
              className={filterStatus === 'pending' ? 'active' : ''}
              onClick={() => setFilterStatus('pending')}
            >
              Pendentes
            </button>
            <button
              className={filterStatus === 'checked_in' ? 'active' : ''}
              onClick={() => setFilterStatus('checked_in')}
            >
              Com Check-in
            </button>
            <button
              className={filterStatus === 'not_checked_in' ? 'active' : ''}
              onClick={() => setFilterStatus('not_checked_in')}
            >
              Sem Check-in
            </button>
          </div>
        </div>

        <div className="registrations-table">
          {filteredRegistrations.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma inscrição encontrada</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Telefone</th>
                  <th>CPF</th>
                  <th>Status Pagamento</th>
                  <th>Check-in</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map(reg => (
                  <tr key={reg.id}>
                    <td>{reg.name}</td>
                    <td>{reg.email}</td>
                    <td>{reg.phone}</td>
                    <td>{reg.cpf}</td>
                    <td>
                      <span className={`status-badge ${reg.payment_status}`}>
                        {reg.payment_status === 'approved' && '✓ Aprovado'}
                        {reg.payment_status === 'pending' && '⏱ Pendente'}
                        {reg.payment_status === 'rejected' && '✗ Rejeitado'}
                      </span>
                    </td>
                    <td>
                      {reg.checked_in ? (
                        <span className="checked-badge">✓ Realizado</span>
                      ) : (
                        <span className="not-checked-badge">Pendente</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(reg)}
                          title="Editar"
                        >
                          ✎
                        </button>
                        {!reg.checked_in && (
                          <button
                            className="btn-checkin"
                            onClick={() => handleCheckIn(reg)}
                            title="Fazer Check-in"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isEditModalOpen && selectedRegistration && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Editar Inscrição</h2>
              <button
                className="modal-close"
                onClick={() => setIsEditModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={selectedRegistration.name}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={selectedRegistration.email}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={selectedRegistration.phone}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Status do Pagamento</label>
                <select
                  value={selectedRegistration.payment_status}
                  onChange={(e) =>
                    setSelectedRegistration({
                      ...selectedRegistration,
                      payment_status: e.target.value as any,
                    })
                  }
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSaveEdit}>
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
