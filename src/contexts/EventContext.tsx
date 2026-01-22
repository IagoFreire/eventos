import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Event } from '../types';
import { api } from '../services/apiSelector';

interface EventContextType {
  events: Event[];
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  loadEvent: (eventId: string) => Promise<void>;
  loadEvents: () => Promise<void>;
  loading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(false);

  const loadEvent = async (eventId: string) => {
    setLoading(true);
    try {
      const event = await api.getEvent(eventId);
      setCurrentEvent(event);
    } catch (error) {
      console.error('Erro ao carregar evento:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const eventsList = await api.getEvents();
      setEvents(eventsList);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        currentEvent,
        setCurrentEvent,
        loadEvent,
        loadEvents,
        loading,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
