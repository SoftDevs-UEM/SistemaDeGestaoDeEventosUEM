// services/eventService.ts
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
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
  promoter?: {
    id: number;
    name: string;
    email: string;
  };
  registrations_count?: number;
}

class EventService {
  async list(): Promise<Event[]> {
    const response = await api.get('/events');
    return response.data;
  }

  async create(data: Omit<Event, 'id'>): Promise<Event> {
    const response = await api.post('/events', data);
    return response.data;
  }

  async update(id: number, data: Partial<Event>): Promise<Event> {
    const response = await api.put(`/events/${id}`, data);
    return response.data;
  }

  async delete(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  }

  async restore(id: number): Promise<Event> {
    const response = await api.post(`/events/${id}/restore`);
    return response.data;
  }

  async getArchived(): Promise<Event[]> {
    const response = await api.get('/events/archived');
    return response.data;
  }

  async search(params: {
    search?: string;
    type?: string;
    status?: string;
    date?: string;
  }): Promise<Event[]> {
    const response = await api.get('/events/search', { params });
    return response.data;
  }

  async getByType(type: string): Promise<Event[]> {
    const response = await api.get(`/events/type/${type}`);
    return response.data;
  }
}

export const eventService = new EventService();