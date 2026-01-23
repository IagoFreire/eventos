import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { LogOut, Menu, X, CheckCircle, Edit2, Home, Ticket, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { settings, loading: loadingSettings } = useSettings();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const churchName = settings?.church_name || 'Igreja Evangélica';

  // Fechar menu ao clicar em um link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Fechar menu ao redimensionar a tela (se voltar para desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Bloquear scroll do body quando menu estiver aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8DCC4] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2" onClick={handleLinkClick}>
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
              <span className="text-white text-xl">✝</span>
            </div>
            {loadingSettings ? (
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <span className="text-xl text-[#B8860B] font-semibold">{churchName}</span>
            )}
          </Link>
          
          {/* Menu Desktop */}
          <nav className="hidden md:flex items-center gap-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-[#B8860B] transition-colors"
            >
              Início
            </Link>
            <Link 
              to="/meu-ingresso" 
              className="text-gray-700 hover:text-[#B8860B] transition-colors"
            >
              Meu Ingresso
            </Link>
            {isAuthenticated && user?.role === 'admin' && (
              <Link 
                to="/admin" 
                className="text-gray-700 hover:text-[#B8860B] transition-colors"
              >
                Administração
              </Link>
            )}
            {isAuthenticated ? (
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-4 py-2 bg-white/60 border border-[#E8DCC4] rounded-lg text-gray-700 hover:bg-white/80 hover:border-[#D4AF37] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            ) : (
              <Link 
                to="/login" 
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </nav>

          {/* Botão Menu Mobile */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-[#B8860B] transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Overlay Mobile */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Menu Mobile */}
      <nav 
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header do Menu Mobile */}
          <div className="flex items-center justify-between p-6 border-b border-[#E8DCC4]">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✝</span>
              </div>
              {loadingSettings ? (
                <div className="w-28 h-5 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <span className="text-lg text-[#B8860B] font-semibold">{churchName}</span>
              )}
            </div>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 text-gray-700 hover:text-[#B8860B] transition-colors"
              aria-label="Fechar menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Links do Menu Mobile */}
          <div className="flex-1 overflow-y-auto py-6">
            <div className="flex flex-col">
              <Link
                to="/"
                onClick={handleLinkClick}
                className="px-6 py-4 text-gray-700 hover:bg-[#F5F5DC] hover:text-[#B8860B] transition-colors border-b border-gray-100 flex items-center gap-3"
              >
                <Home className="w-5 h-5" />
                <span>Início</span>
              </Link>
              <Link
                to="/meu-ingresso"
                onClick={handleLinkClick}
                className="px-6 py-4 text-gray-700 hover:bg-[#F5F5DC] hover:text-[#B8860B] transition-colors border-b border-gray-100 flex items-center gap-3"
              >
                <Ticket className="w-5 h-5" />
                <span>Meu Ingresso</span>
              </Link>
              {isAuthenticated && user?.role === 'admin' && (
                <>
                  <Link
                    to="/admin"
                    onClick={handleLinkClick}
                    className="px-6 py-4 text-gray-700 hover:bg-[#F5F5DC] hover:text-[#B8860B] transition-colors border-b border-gray-100 flex items-center gap-3"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Administração</span>
                  </Link>
                  <Link
                    to="/admin/checkin"
                    onClick={handleLinkClick}
                    className="px-6 py-4 text-gray-700 hover:bg-[#F5F5DC] hover:text-[#B8860B] transition-colors border-b border-gray-100 flex items-center gap-3"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Check-in QR Code</span>
                  </Link>
                  <Link
                    to="/admin/configuracoes"
                    onClick={handleLinkClick}
                    className="px-6 py-4 text-gray-700 hover:bg-[#F5F5DC] hover:text-[#B8860B] transition-colors border-b border-gray-100 flex items-center gap-3"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Configurações</span>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Footer do Menu Mobile */}
          <div className="p-6 border-t border-[#E8DCC4] bg-gray-50">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#E8DCC4] rounded-lg text-gray-700 hover:bg-white/80 hover:border-[#D4AF37] transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sair</span>
              </button>
            ) : (
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="block w-full text-center px-4 py-3 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;
