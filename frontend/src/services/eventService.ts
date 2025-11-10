// services/eventService.ts
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
  created_at?: string;
  updated_at?: string;
  promoter?: {
    id: number;
    name: string;
    email: string;
  };
  registrations_count?: number;
}

export interface CreateEventData {
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
}

class EventService {
  private baseURL = 'http://localhost:8000/api';

  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    
    // Debug: verificar se o token existe
    console.log('🔐 Token no EventService:', token ? 'Presente' : 'Ausente');
    
    if (!token) {
      console.warn('⚠️ Token não encontrado no localStorage');
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private async handleResponse(response: Response) {
    console.log('📡 Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Erro na requisição';
      
      try {
        const errorData = await response.json();
        console.error('❌ Error data:', errorData);
        errorMessage = errorData.error || errorData.message || errorData.errors || errorMessage;
        
        // Tratamento específico para 401
        if (response.status === 401) {
          errorMessage = 'Não autenticado. Faça login novamente.';
          // Limpar token inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Disparar evento para atualizar a UI
          window.dispatchEvent(new Event('storage'));
        }
      } catch (parseError) {
        console.error('❌ Erro ao parsear resposta:', parseError);
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return response.json();
  }

  async list(): Promise<Event[]> {
    try {
      console.log('🔄 Buscando eventos...');
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events`, {
        method: 'GET',
        headers: headers,
        credentials: 'include' // Importante para cookies de sessão
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.list:', error);
      throw error;
    }
  }

  async create(data: CreateEventData): Promise<Event> {
    try {
      console.log('🔄 Criando evento...', data);
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.create:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<Event>): Promise<Event> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/${id}`, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(data),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.update:', error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/${id}`, {
        method: 'DELETE',
        headers: headers,
      });
      
      if (!response.ok) {
        await this.handleResponse(response);
      }
    } catch (error) {
      console.error('❌ Erro no EventService.delete:', error);
      throw error;
    }
  }

  async updateStatus(id: number, status: 'aprovado' | 'rejeitado', feedback?: string): Promise<Event> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/${id}/status`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ status, feedback }),
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.updateStatus:', error);
      throw error;
    }
  }

  async search(params: { search?: string; type?: string; status?: string; date?: string }): Promise<Event[]> {
    try {
      const headers = await this.getAuthHeaders();
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`${this.baseURL}/events/search?${queryParams}`, {
        headers: headers,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.search:', error);
      throw error;
    }
  }

  async getByType(type: string): Promise<Event[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/type/${type}`, {
        headers: headers,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.getByType:', error);
      throw error;
    }
  }

  async getByStatus(status: string): Promise<Event[]> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/status/${status}`, {
        headers: headers,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.getByStatus:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Event> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseURL}/events/${id}`, {
        headers: headers,
      });
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('❌ Erro no EventService.getById:', error);
      throw error;
    }
  }
}

export const eventService = new EventService();