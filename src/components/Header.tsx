import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { api } from '../services/apiSelector';
import type { EventSettings } from '../types';

const Header: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const eventId = '1';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await api.getEventSettings(eventId);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const churchName = settings?.church_name || 'Igreja Evangélica';

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-[#E8DCC4] sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
            <span className="text-white text-xl">✝</span>
          </div>
          <span className="text-xl text-[#B8860B] font-semibold">{churchName}</span>
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-[#B8860B] transition-colors"
          >
            Início
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
      </div>
    </header>
  );
};

export default Header;
