import api from './api';

export interface Event {
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
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado' | 'finalizado';
  image?: string;
  requirements?: string;
  target_audience: string;
  feedback?: string;
  promoter?: {
    id: number;
    name: string;
    email: string;
  };
}

// Para criar evento, não precisa de id e alguns campos são opcionais
export interface EventCreateInput {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academico' | 'cultural' | 'desportivo';
  category: string;
  max_participants: number;
  promoter_id: number;
  image?: string;
  requirements?: string;
  target_audience: string;
  // status não é enviado no create, é definido automaticamente como 'pendente'
}

export const eventService = {
  // Listar todos os eventos
  list: async (): Promise<Event[]> => {
    const res = await api.get('/events');
    return res.data;
  },

  // Criar novo evento
  create: async (data: EventCreateInput): Promise<Event> => {
    const res = await api.post('/events', data);
    return res.data;
  },

  // Obter um evento específico
  get: async (id: number): Promise<Event> => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },

  // Atualizar um evento
  update: async (id: number, data: Partial<EventCreateInput>): Promise<Event> => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },

  // Deletar um evento
  delete: async (id: number): Promise<void> => {
    await api.delete(`/events/${id}`);
  },

  // Obter eventos por tipo
  getByType: async (type: string): Promise<Event[]> => {
    const res = await api.get(`/events/type/${type}`);
    return res.data;
  },

  // Obter eventos por status
  getByStatus: async (status: string): Promise<Event[]> => {
    const res = await api.get(`/events/status/${status}`);
    return res.data;
  },

  // Atualizar status do evento (admin)
  updateStatus: async (id: number, status: 'aprovado' | 'rejeitado', feedback?: string): Promise<Event> => {
    const res = await api.post(`/events/${id}/status`, { status, feedback });
    return res.data;
  },

  // Buscar eventos
  search: async (params: {
    search?: string;
    type?: string;
    status?: string;
    date?: string;
  }): Promise<Event[]> => {
    const res = await api.get('/events/search', { params });
    return res.data;
  }
};