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
  status: 'pendente' | 'ativo' | 'cancelado' | 'finalizado';
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
  
  // MAPEAR OS DADOS PARA O FORMATO PublicEvent
  const mappedEvents: PublicEvent[] = eventsData.map((event: any) => ({
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
    status: event.status || 'pendente',
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
  }));
  
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
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar evento:', error);
      throw error;
    }
  }
};