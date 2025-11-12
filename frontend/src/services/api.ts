import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // ✅ MUDAR PARA CAMINHO RELATIVO (usa o proxy do Vite)
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    withCredentials: true
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('usuarioLogado');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;