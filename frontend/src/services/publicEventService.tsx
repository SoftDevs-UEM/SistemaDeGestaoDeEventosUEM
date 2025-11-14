// services/publicEventService.ts
import api from './api';

export interface PublicEvent {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academico' | 'cultural' | 'desportivo';
  category: string;
  max_participants: number;
  promoter_id: number;
  status: 'pendente' | 'ativo' | 'cancelado' | 'finalizado' | 'concluido';
  image: string;
  requirements: string;
  target_audience: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  participants_count: number;
  participants: number;
  promoter_name: string;
  user_is_registered?: boolean;
}

const handleResponse = (response: any): PublicEvent[] => {
  console.log('📡 Public Events Response status:', response.status);
  console.log('📡 Public Events Response data:', response.data);
  
  let eventsData = response.data;
  
  // ✅ ACEITAR DIFERENTES ESTRUTURAS DE RESPOSTA
  if (response.data && Array.isArray(response.data.data)) {
    eventsData = response.data.data;
    console.log('✅ Estrutura com "data" encontrada');
  }
  else if (Array.isArray(response.data)) {
    eventsData = response.data;
    console.log('✅ Estrutura array direto encontrada');
  }
  else if (response.data && Array.isArray(response.data.events)) {
    eventsData = response.data.events;
    console.log('✅ Estrutura com "events" encontrada');
  }
  else if (!response.data || typeof response.data !== 'object') {
    console.warn('⚠️ Resposta vazia ou inválida da API');
    return [];
  }
  
  if (!Array.isArray(eventsData)) {
    console.warn('⚠️ Estrutura de resposta não reconhecida, retornando array vazio');
    console.log('Tipo recebido:', typeof eventsData);
    return [];
  }
  
  console.log(`✅ ${eventsData.length} eventos processados da API`);
  
  // ✅ MAPEAR OS DADOS PARA O FORMATO PublicEvent COM STATUS CORRETO
  const mappedEvents: PublicEvent[] = eventsData.map((event: any) => {
    // ✅ NORMALIZAR STATUS
    let normalizedStatus: PublicEvent['status'] = 'pendente';
    if (event.status) {
      const statusMap: { [key: string]: PublicEvent['status'] } = {
        'pending': 'pendente',
        'active': 'ativo',
        'cancelled': 'cancelado',
        'canceled': 'cancelado',
        'finished': 'finalizado',
        'completed': 'concluido',
        'concluído': 'concluido'
      };
      normalizedStatus = statusMap[event.status] || event.status;
    }

    return {
      id: event.id,
      title: event.title || 'Sem título',
      description: event.description || '',
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      type: event.type || 'academico',
      category: event.category || '',
      max_participants: event.max_participants || 0,
      promoter_id: event.promoter_id,
      status: normalizedStatus,
      image: event.image || '',
      requirements: event.requirements || '',
      target_audience: event.target_audience || '',
      feedback: event.feedback || '',
      created_at: event.created_at,
      updated_at: event.updated_at,
      deleted_at: event.deleted_at,
      participants_count: event.participants_count || event.participants || 0,
      participants: event.participants || event.participants_count || 0,
      promoter_name: event.promoter_name || event.promoter?.name || 'Promotor',
      user_is_registered: event.user_is_registered || event.is_registered || false,
    };
  });
  
  return mappedEvents;
};

export const publicEventService = {
  async list(): Promise<PublicEvent[]> {
    try {
      console.log('🔄 Buscando eventos públicos da API...');
      const response = await api.get('/events');
      return handleResponse(response);
    } catch (error) {
      console.error('❌ Erro ao carregar eventos públicos:', error);
      throw new Error('Não foi possível carregar os eventos. Tente novamente.');
    }
  },

  async getByType(type: string): Promise<PublicEvent[]> {
    try {
      const response = await api.get(`/events/type/${type}`);
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar eventos por tipo:', error);
      throw error;
    }
  },

  async search(params: { search?: string; type?: string; status?: string; date?: string }): Promise<PublicEvent[]> {
    try {
      const response = await api.get('/events/search', { params });
      return handleResponse(response);
    } catch (error) {
      console.error('Erro ao buscar eventos:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<PublicEvent> {
    try {
      const response = await api.get(`/events/${id}`);
      const eventData = response.data.data || response.data;
      
      // ✅ NORMALIZAR STATUS PARA EVENTO INDIVIDUAL
      if (eventData.status) {
        const statusMap: { [key: string]: PublicEvent['status'] } = {
          'pending': 'pendente',
          'active': 'ativo',
          'cancelled': 'cancelado',
          'canceled': 'cancelado',
          'finished': 'finalizado',
          'completed': 'concluido',
          'concluído': 'concluido'
        };
        eventData.status = statusMap[eventData.status] || eventData.status;
      }
      
      return {
        id: eventData.id,
        title: eventData.title || 'Sem título',
        description: eventData.description || '',
        date: eventData.date,
        time: eventData.time || '',
        location: eventData.location || '',
        type: eventData.type || 'academico',
        category: eventData.category || '',
        max_participants: eventData.max_participants || 0,
        promoter_id: eventData.promoter_id,
        status: eventData.status || 'pendente',
        image: eventData.image || '',
        requirements: eventData.requirements || '',
        target_audience: eventData.target_audience || '',
        feedback: eventData.feedback || '',
        created_at: eventData.created_at,
        updated_at: eventData.updated_at,
        deleted_at: eventData.deleted_at,
        participants_count: eventData.participants_count || eventData.participants || 0,
        participants: eventData.participants || eventData.participants_count || 0,
        promoter_name: eventData.promoter_name || eventData.promoter?.name || 'Promotor',
        user_is_registered: eventData.user_is_registered || eventData.is_registered || false,
      };
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  },

  // ✅ NOVO MÉTODO: Verificar se usuário está inscrito no evento
  async checkUserRegistration(eventId: number): Promise<boolean> {
    try {
      const response = await api.get(`/events/${eventId}/check-registration`);
      return response.data.registered || response.data.is_registered || false;
    } catch (error) {
      console.error(`Error checking registration for event ${eventId}:`, error);
      return false;
    }
  },

  // ✅ NOVO MÉTODO: Obter eventos com filtro de status
  async getEventsWithStatusFilter(userType?: string, userId?: number): Promise<PublicEvent[]> {
    try {
      const allEvents = await this.list();
      
      // ✅ APLICAR FILTRO BASEADO NO TIPO DE USUÁRIO
      return allEvents.filter(event => {
        // Admin vê todos os eventos
        if (userType === 'admin') return true;
        
        // Promotor vê seus eventos + eventos ativos/pendentes
        if (userType === 'promotor') {
          return event.promoter_id === userId || 
                 event.status === 'ativo' || 
                 event.status === 'pendente';
        }
        
        // Estudante vê eventos ativos/pendentes + eventos cancelados em que está inscrito
        if (userType === 'estudante') {
          return event.status === 'ativo' || 
                 event.status === 'pendente' ||
                 (event.status === 'cancelado' && event.user_is_registered);
        }
        
        // Usuário não logado vê apenas eventos ativos
        return event.status === 'ativo';
      });
    } catch (error) {
      console.error('Erro ao filtrar eventos por status:', error);
      throw error;
    }
  }
};