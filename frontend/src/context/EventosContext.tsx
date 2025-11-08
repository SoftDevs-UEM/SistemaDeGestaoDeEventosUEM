import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Event } from '../services/eventService';
import { eventService } from '../services/eventService';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  createEvent: (data: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: number, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  approveEvent: (id: number, feedback?: string) => Promise<void>;
  rejectEvent: (id: number, feedback?: string) => Promise<void>;
  searchEvents: (params: { search?: string; type?: string; status?: string; date?: string }) => Promise<void>;
}

const EventosContext = createContext<EventContextType | undefined>(undefined);

export function EventosProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { userType } = useAuth();

  // Use useCallback para evitar recriação da função
  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.list();
      setEvents(data);
    } catch (err) {
      setError('Erro ao carregar eventos');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEvent = async (data: Omit<Event, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await eventService.create(data);
      setEvents(prev => [...prev, newEvent]);
    } catch (err) {
      setError('Erro ao criar evento');
      console.error('Error creating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: number, data: Partial<Event>) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await eventService.update(id, data);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Erro ao atualizar evento');
      console.error('Error updating event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await eventService.delete(id);
      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError('Erro ao deletar evento');
      console.error('Error deleting event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveEvent = async (id: number, feedback?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await eventService.updateStatus(id, 'aprovado', feedback);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Erro ao aprovar evento');
      console.error('Error approving event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectEvent = async (id: number, feedback?: string) => {
    try {
      setLoading(true);
      setError(null);
      const updatedEvent = await eventService.updateStatus(id, 'rejeitado', feedback);
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
    } catch (err) {
      setError('Erro ao rejeitar evento');
      console.error('Error rejecting event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async (params: { search?: string; type?: string; status?: string; date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventService.search(params);
      setEvents(data);
    } catch (err) {
      setError('Erro ao buscar eventos');
      console.error('Error searching events:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (userType) {
    loadEvents();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userType]);


  return (
    <EventosContext.Provider value={{
      events,
      loading,
      error,
      loadEvents,
      createEvent,
      updateEvent,
      deleteEvent,
      approveEvent,
      rejectEvent,
      searchEvents
    }}>
      {children}
    </EventosContext.Provider>
  );
}

export function useEventos() {
  const context = useContext(EventosContext);
  if (!context) {
    throw new Error('useEventos must be used within EventosProvider');
  }
  return context;
}