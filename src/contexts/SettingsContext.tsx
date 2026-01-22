import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { EventSettings } from '../types';
import { api } from '../services/apiSelector';

interface SettingsContextType {
  settings: EventSettings | null;
  loading: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (eventId: string, newSettings: Partial<EventSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const eventId = '1';

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const settingsData = await api.getEventSettings(eventId);
      setSettings(settingsData);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (eventId: string, newSettings: Partial<EventSettings>) => {
    try {
      const updatedSettings = await api.updateEventSettings(eventId, newSettings);
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        loadSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
