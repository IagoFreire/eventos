import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { EventSettings } from '../types';
import { api } from '../services/apiSelector';
import { useEvent } from './EventContext';

interface SettingsContextType {
  settings: EventSettings | null;
  loading: boolean;
  loadSettings: (eventId?: string) => Promise<void>;
  updateSettings: (eventId: string, newSettings: Partial<EventSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentEvent, eventsLoaded } = useEvent();

  useEffect(() => {
    // Quando o evento atual for carregado, buscar suas configurações
    if (eventsLoaded && currentEvent) {
      loadSettings(currentEvent.id);
    } else if (eventsLoaded) {
      setLoading(false);
    }
  }, [currentEvent, eventsLoaded]);

  const loadSettings = async (eventId?: string) => {
    const idToUse = eventId || currentEvent?.id;
    if (!idToUse) return;
    
    setLoading(true);
    try {
      const settingsData = await api.getEventSettings(idToUse);
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
