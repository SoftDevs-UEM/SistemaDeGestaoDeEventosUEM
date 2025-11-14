// services/api.ts
import axios from 'axios';

// ✅ CONFIGURAÇÃO ROBUSTA DA API - CORRIGIDA PARA VITE
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ✅ INTERCEPTOR DE REQUESTS
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
    return config;
  },
  (error) => {
    console.error('❌ Erro no request:', error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR DE RESPONSES
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Erro na response:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // ✅ TRATAMENTO ESPECÍFICO PARA ERRO 500
    if (error.response?.status === 500) {
      console.error('🔧 Detalhes do erro 500:', error.response.data);
      
      // Adicionar mensagem mais amigável para o usuário
      if (error.response.data) {
        error.userMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.';
      }
    }
    
    // ✅ TRATAMENTO PARA ERRO DE REDE
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      error.userMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    // ✅ TRATAMENTO PARA TIMEOUT
    if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Tempo de conexão esgotado. Tente novamente.';
    }
    
    return Promise.reject(error);
  }
);

export default api;