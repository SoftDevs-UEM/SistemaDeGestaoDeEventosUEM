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
  const { isAuthenticated, user, userType } = useAuth();

  // ✅ FUNÇÃO MELHORADA: Filtrar eventos baseado no status e usuário
  const filterEventsByStatusAndUser = useCallback((events: PublicEvent[], user: any, userType: string) => {
    if (!userType || userType === 'estudante') {
      // Para estudantes: mostrar apenas eventos ativos OU eventos em que estão inscritos
      return events.filter(event => 
        event.status === 'ativo' || 
        event.status === 'pendente' ||
        (event.status === 'cancelado' && event.user_is_registered)
      );
    }
    
    if (userType === 'promotor') {
      // Para promotores: mostrar todos os eventos que criaram + eventos ativos/pendentes
      return events.filter(event => 
        event.promoter_id === user?.id || 
        event.status === 'ativo' || 
        event.status === 'pendente'
      );
    }
    
    if (userType === 'admin') {
      // Para admin: mostrar todos os eventos
      return events;
    }
    
    // Para usuários não logados: mostrar apenas eventos ativos
    return events.filter(event => event.status === 'ativo');
  }, []);

  const loadPublicEvents = useCallback(async () => {
    try {
      console.log('🔄 Carregando eventos públicos...');
      setLoading(true);
      setError(null);
      
      const data = await publicEventService.list();
      console.log(`✅ ${data.length} eventos públicos carregados do contexto`);
      
      // Filtrar eventos baseado no status e usuário
      const filteredEvents = filterEventsByStatusAndUser(data, user, userType);
      
      console.log(`✅ ${filteredEvents.length} eventos após filtro por status`);
      setEvents(filteredEvents);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos públicos:', err);
      
      setError('Não foi possível carregar os eventos. Tente novamente mais tarde.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filterEventsByStatusAndUser, user, userType]);

  const loadEvents = useCallback(async () => {
    try {
      console.log('🔐 Carregando eventos...');
      await loadPublicEvents();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar eventos';
      console.error('❌ Erro ao carregar eventos:', err);
      setError(errorMessage);
    }
  }, [loadPublicEvents]);

  // ✅ FUNÇÃO CORRIGIDA: updateEvent com melhor tratamento de erro
  const updateEvent = async (id: number, data: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('✏️ Atualizando evento na API:', { id, data });
      
      // ✅ VALIDAÇÃO DO ID
      if (!id || isNaN(id)) {
        throw new Error('ID do evento inválido');
      }

      // ✅ PREPARAR DADOS PARA ATUALIZAÇÃO
      const updateData: any = {};
      
      // Apenas incluir campos que foram fornecidos
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.date !== undefined) updateData.date = data.date;
      if (data.time !== undefined) updateData.time = data.time;
      if (data.location !== undefined) updateData.location = data.location.trim();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.max_participants !== undefined) updateData.max_participants = parseInt(data.max_participants);
      if (data.target_audience !== undefined) updateData.target_audience = data.target_audience.trim();
      if (data.requirements !== undefined) updateData.requirements = data.requirements.trim();
      if (data.image !== undefined) updateData.image = data.image;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.deleted_at !== undefined) updateData.deleted_at = data.deleted_at;

      console.log('📤 Dados enviados para atualização:', updateData);

      // ✅ TENTAR DIFERENTES ENDPOINTS DA API
      let response;
      try {
        // Tentar endpoint principal primeiro
        response = await api.put(`/events/${id}`, updateData);
        console.log('✅ Evento atualizado com sucesso via PUT /events/:id');
      } catch (putError: any) {
        // Se falhar, tentar endpoint alternativo
        console.log('🔄 Tentando endpoint alternativo...');
        response = await api.patch(`/events/${id}`, updateData);
        console.log('✅ Evento atualizado com sucesso via PATCH /events/:id');
      }
      
      if (response && response.data) {
        console.log('✅ Evento atualizado com sucesso:', response.data);
        
        // ✅ ATUALIZAR ESTADO LOCAL IMEDIATAMENTE
        setEvents(prevEvents => 
          prevEvents.map(event => 
            event.id === id 
              ? { ...event, ...updateData }
              : event
          )
        );
        
        // ✅ RECARREGAR EVENTOS PARA GARANTIR SINCRONIZAÇÃO
        setTimeout(() => {
          loadEvents();
        }, 500);
        
      } else {
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Erro detalhado ao atualizar evento:', err);
      
      let errorMessage = 'Erro ao atualizar evento';
      
      if (err.response) {
        // Erro da API
        const { status, data } = err.response;
        
        if (status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para editar este evento.';
        } else if (status === 404) {
          errorMessage = 'Evento não encontrado.';
        } else if (status === 422) {
          // Erros de validação
          const validationErrors = data.errors ? Object.values(data.errors).flat().join(', ') : data.message;
          errorMessage = `Dados inválidos: ${validationErrors}`;
        } else if (status === 500) {
          // ✅ MELHOR TRATAMENTO PARA ERRO 500
          if (data && data.message) {
            errorMessage = `Erro do servidor: ${data.message}`;
          } else {
            errorMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
          }
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.request) {
        // Erro de rede
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: any): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('📝 Criando evento na API:', data);
      
      if (!data.title || !data.description || !data.date) {
        throw new Error('Dados do evento incompletos');
      }

      const eventData = {
        title: data.title.trim(),
        description: data.description.trim(),
        date: data.date,
        time: data.time || '18:00',
        location: data.location?.trim() || 'Local a definir',
        type: data.type || 'academico',
        category: data.category || 'outros',
        max_participants: parseInt(data.max_participants) || 50,
        target_audience: data.target_audience?.trim() || '',
        requirements: data.requirements?.trim() || '',
        image: data.image || '',
        status: data.status || 'pendente'
      };

      console.log('📤 Dados enviados para criação:', eventData);

      const response = await api.post('/events', eventData);
      
      if (response.data) {
        console.log('✅ Evento criado com sucesso:', response.data);
        await loadEvents();
      } else {
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Erro detalhado ao criar evento:', err);
      
      let errorMessage = 'Erro ao criar evento';
      
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para criar eventos.';
        } else if (status === 422) {
          const validationErrors = data.errors ? Object.values(data.errors).flat().join(', ') : data.message;
          errorMessage = `Dados inválidos: ${validationErrors}`;
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Excluindo evento na API:', id);
      
      if (!id || isNaN(id)) {
        throw new Error('ID do evento inválido');
      }

      const response = await api.delete(`/events/${id}`);
      
      if (response.data) {
        console.log('✅ Evento excluído com sucesso:', response.data);
        await loadEvents();
      } else {
        throw new Error('Resposta inválida do servidor');
      }
      
    } catch (err: any) {
      console.error('❌ Erro detalhado ao excluir evento:', err);
      
      let errorMessage = 'Erro ao excluir evento';
      
      if (err.response) {
        const { status, data } = err.response;
        
        if (status === 401) {
          errorMessage = 'Não autorizado. Faça login novamente.';
        } else if (status === 403) {
          errorMessage = 'Acesso negado. Você não tem permissão para excluir este evento.';
        } else if (status === 404) {
          errorMessage = 'Evento não encontrado.';
        } else if (status === 422) {
          errorMessage = data?.message || 'Não é possível excluir este evento.';
        } else if (status === 500) {
          errorMessage = 'Erro interno do servidor. Tente novamente.';
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      
      // Aplicar filtro de status após busca
      const filteredData = filterEventsByStatusAndUser(data, user, userType);
      setEvents(filteredData);
      
      return filteredData;
    } catch (err: any) {
      console.error('❌ Erro ao buscar eventos:', err);
      
      let errorMessage = 'Erro ao buscar eventos';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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
      
      // Aplicar filtro de status
      const filteredData = filterEventsByStatusAndUser(data, user, userType);
      return filteredData;
    } catch (err: any) {
      console.error('❌ Erro ao buscar eventos por tipo:', err);
      
      let errorMessage = 'Erro ao buscar eventos por tipo';
      
      if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
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

  useEffect(() => {
    console.log(`📊 Eventos no contexto: ${events.length} eventos`);
    console.log(`👤 Tipo de usuário: ${userType}`);
  }, [events, userType]);

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