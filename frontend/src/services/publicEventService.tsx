// services/publicEventService.ts
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
  
  class PublicEventService {
    private baseURL = 'http://localhost:8000/api';
  
    private async handleResponse(response: Response) {
      console.log('📡 Public Events Response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Erro ao carregar eventos';
        
        try {
          const errorData = await response.json();
          console.error('❌ Public Events Error data:', errorData);
          errorMessage = errorData.error || errorData.message || errorData.errors || errorMessage;
        } catch (parseError) {
          console.error('❌ Erro ao parsear resposta pública:', parseError);
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }
      
      return response.json();
    }
  
    async list(): Promise<PublicEvent[]> {
      try {
        console.log('🔄 Buscando eventos públicos...');
        
        const response = await fetch(`${this.baseURL}/events`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include'
        });
        
        const events = await this.handleResponse(response);
        console.log('✅ Eventos públicos carregados:', events.length);
        return events;
      } catch (error) {
        console.error('❌ Erro no PublicEventService.list:', error);
        throw error;
      }
    }
  
    async getById(id: number): Promise<PublicEvent> {
      try {
        console.log(`🔄 Buscando evento público ID: ${id}...`);
        
        const response = await fetch(`${this.baseURL}/events/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        console.error('❌ Erro no PublicEventService.getById:', error);
        throw error;
      }
    }
  
    async search(params: { search?: string; type?: string; status?: string; date?: string }): Promise<PublicEvent[]> {
      try {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
  
        const response = await fetch(`${this.baseURL}/events/search?${queryParams}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        console.error('❌ Erro no PublicEventService.search:', error);
        throw error;
      }
    }
  
    async getByType(type: string): Promise<PublicEvent[]> {
      try {
        const response = await fetch(`${this.baseURL}/events/type/${type}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        return await this.handleResponse(response);
      } catch (error) {
        console.error('❌ Erro no PublicEventService.getByType:', error);
        throw error;
      }
    }
  }
  
  export const publicEventService = new PublicEventService();