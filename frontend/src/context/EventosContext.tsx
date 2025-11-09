// context/EventosContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Event } from '../services/eventService';
import { eventService } from '../services/eventService';
import { publicEventService, type PublicEvent } from '../services/publicEventService';
import { useAuth } from './AuthContext';

interface EventContextType {
  events: Event[];
  loading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  loadPublicEvents: () => Promise<void>;
  createEvent: (data: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (id: number, data: Partial<Event>) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  searchEvents: (params: { search?: string; type?: string; status?: string; date?: string }) => Promise<void>;
  getEventsByType: (type: string) => Promise<Event[]>;
}

const EventosContext = createContext<EventContextType | undefined>(undefined);

export function EventosProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Função para carregar eventos públicos (sem autenticação)
  const loadPublicEvents = useCallback(async () => {
    try {
      console.log('🔄 Carregando eventos públicos...');
      setLoading(true);
      setError(null);
      
      const data = await publicEventService.list();
      console.log('✅ Eventos públicos carregados:', data.length);
      
      // Converter PublicEvent para Event (são compatíveis)
      setEvents(data as Event[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos públicos:', err);
      setError(errorMessage);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para carregar eventos com autenticação
  const loadEvents = useCallback(async () => {
    // Se não estiver autenticado, usa eventos públicos
    if (!isAuthenticated) {
      console.log('👤 Usuário não autenticado, usando eventos públicos');
      await loadPublicEvents();
      return;
    }

    try {
      console.log('🔐 Usuário autenticado, carregando eventos com token...');
      setLoading(true);
      setError(null);
      const data = await eventService.list();
      console.log('✅ Eventos autenticados carregados:', data.length);
      setEvents(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos autenticados:', err);
      
      // Se for erro de autenticação, fallback para eventos públicos
      if (errorMessage.includes('autenticação') || errorMessage.includes('Token') || errorMessage.includes('401')) {
        console.log('🔄 Fallback para eventos públicos devido a erro de autenticação');
        await loadPublicEvents();
      } else {
        setError(errorMessage);
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loadPublicEvents]);

  const createEvent = async (data: Omit<Event, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      const newEvent = await eventService.create(data);
      setEvents(prev => [...prev, newEvent]);
      return newEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar evento';
      setError(errorMessage);
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
      return updatedEvent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar evento';
      setError(errorMessage);
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
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar evento';
      setError(errorMessage);
      console.error('Error deleting event:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async (params: { search?: string; type?: string; status?: string; date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar serviço público para busca
      const data = await publicEventService.search(params);
      setEvents(data as Event[]);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos';
      setError(errorMessage);
      console.error('Error searching events:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getEventsByType = async (type: string): Promise<Event[]> => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar serviço público
      const data = await publicEventService.getByType(type);
      return data as Event[];
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos por tipo';
      setError(errorMessage);
      console.error('Error getting events by type:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Carregar eventos quando o componente montar
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Limpar erro após 5 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value = {
    events,
    loading,
    error,
    loadEvents,
    loadPublicEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    searchEvents,
    getEventsByType
  };

  return (
    <EventosContext.Provider value={value}>
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