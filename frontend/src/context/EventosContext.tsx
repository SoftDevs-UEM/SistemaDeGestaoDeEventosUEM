// context/EventosContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { publicEventService, type PublicEvent } from '../services/publicEventService';
import { useAuth } from './AuthContext';
import api from '../services/api';

interface EventContextType {
  events: PublicEvent[];
  loading: boolean;
  error: string | null;
  loadEvents: () => Promise<void>;
  loadPublicEvents: () => Promise<void>;
  createEvent: (data: any) => Promise<void>;
  updateEvent: (id: number, data: any) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
  searchEvents: (params: { search?: string; type?: string; status?: string; date?: string }) => Promise<void>;
  getEventsByType: (type: string) => Promise<PublicEvent[]>;
}

const EventosContext = createContext<EventContextType | undefined>(undefined);

export function EventosProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const loadPublicEvents = useCallback(async () => {
    try {
      console.log('🔄 Carregando eventos públicos...');
      setLoading(true);
      setError(null);
      
      const data = await publicEventService.list();
      console.log(`✅ ${data.length} eventos públicos carregados do contexto`);
      
      // Filtrar apenas eventos ativos e não deletados
      const activeEvents = data.filter(event => 
        event.status !== 'cancelado' && 
        !event.deleted_at &&
        new Date(event.date) >= new Date()
      );
      
      console.log(`✅ ${activeEvents.length} eventos ativos após filtro`);
      setEvents(activeEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos públicos:', err);
      
      setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    if (!isAuthenticated) {
      console.log('👤 Usuário não autenticado, usando eventos públicos');
      await loadPublicEvents();
      return;
    }

    try {
      console.log('🔐 Usuário autenticado, carregando eventos...');
      await loadPublicEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos:', err);
      setError(errorMessage);
    }
  }, [isAuthenticated, loadPublicEvents]);

  // ✅ CORREÇÃO: createEvent fazendo chamada REAL para a API
  const createEvent = async (data: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Criando evento na API:', data);
      
      // ✅ CHAMADA REAL PARA A API
      const response = await api.post('/events', data);
      console.log('✅ Evento criado com sucesso:', response.data);
      
      // Recarregar eventos após criar
      await loadEvents();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao criar evento';
      setError(errorMessage);
      console.error('❌ Erro ao criar evento:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: updateEvent fazendo chamada REAL para a API
  const updateEvent = async (id: number, data: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('✏️ Atualizando evento na API:', id, data);
      
      // ✅ CHAMADA REAL PARA A API
      const response = await api.put(`/events/${id}`, data);
      console.log('✅ Evento atualizado com sucesso:', response.data);
      
      // Recarregar eventos após atualizar
      await loadEvents();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao atualizar evento';
      setError(errorMessage);
      console.error('❌ Erro ao atualizar evento:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ✅ CORREÇÃO: deleteEvent fazendo chamada REAL para a API
  const deleteEvent = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Excluindo evento na API:', id);
      
      // ✅ CHAMADA REAL PARA A API
      const response = await api.delete(`/events/${id}`);
      console.log('✅ Evento excluído com sucesso:', response.data);
      
      // Recarregar eventos após excluir
      await loadEvents();
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Erro ao excluir evento';
      setError(errorMessage);
      console.error('❌ Erro ao excluir evento:', err);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const searchEvents = async (params: { search?: string; type?: string; status?: string; date?: string }) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando eventos com parâmetros:', params);
      const data = await publicEventService.search(params);
      setEvents(data);
      
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

  const getEventsByType = async (type: string): Promise<PublicEvent[]> => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🎯 Buscando eventos do tipo: ${type}`);
      const data = await publicEventService.getByType(type);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar eventos por tipo';
      setError(errorMessage);
      console.error('Error getting events by type:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const value: EventContextType = {
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