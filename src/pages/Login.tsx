import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success('✅ Login realizado com sucesso!');
      navigate('/admin');
    } catch (err: any) {
      console.error('❌ Erro ao fazer login:', err);
      
      let errorMessage = 'Credenciais inválidas. Tente novamente.';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        
        // Traduzir erros comuns
        if (errorMessage.includes('Usuário não encontrado')) {
          errorMessage = '👤 Usuário não encontrado. Verifique o e-mail.';
        } else if (errorMessage.includes('Senha incorreta')) {
          errorMessage = '🔒 Senha incorreta. Tente novamente.';
        }
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage, { autoClose: 5000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-[#FAFAFA] via-[#F5F5DC] to-[#E8DCC4]">
      <div className="max-w-md w-full">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-[#B8860B] hover:text-[#D4AF37] transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-[#E8DCC4] shadow-lg">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl mb-2 text-gray-800">Acesso Administrativo</h1>
            <p className="text-gray-600">Entre com suas credenciais para continuar</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50 transition-colors"
                placeholder="seu@email.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-[#E8DCC4] focus:outline-none focus:border-[#D4AF37] bg-white/50 transition-colors pr-12"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#B8860B] transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white py-3 rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          {/* Info about restricted area */}
          <div className="mt-6 p-4 bg-[#F5F5DC] rounded-lg border border-[#E8DCC4]">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Área Restrita</strong>
            </p>
            <p className="text-sm text-gray-600">
              Esta área é exclusiva para administradores da igreja.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
