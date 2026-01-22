import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">✝</div>
            <h1>Administração</h1>
            <p>Acesse o painel administrativo</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="login-button"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>

            <div className="login-footer">
              <a href="#" className="forgot-password">Esqueceu sua senha?</a>
            </div>
          </form>

          <div className="back-home">
            <button onClick={() => navigate('/')} className="back-button">
              ← Voltar para página inicial
            </button>
          </div>
        </div>

        <div className="login-info">
          <h2>Área Restrita</h2>
          <p>Esta área é exclusiva para administradores da igreja.</p>
          <ul>
            <li>✓ Gerenciar inscrições</li>
            <li>✓ Realizar check-in</li>
            <li>✓ Visualizar relatórios</li>
            <li>✓ Editar informações dos eventos</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
