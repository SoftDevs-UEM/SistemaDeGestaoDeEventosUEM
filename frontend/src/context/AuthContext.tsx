import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserType = 'estudante' | 'promotor' | 'admin' | null;

interface UserPayload {
  id?: number;
  name?: string;
  email?: string;
  tipo?: UserType;
  // ✅ ADICIONAR campos que podem vir do backend
  nome?: string;
  telefone?: string;
  nr_estudante?: string;
  curso?: string;
  departamento?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  user: UserPayload | null;
  login: (user: UserPayload) => Promise<void> | void;
  logout: () => Promise<void> | void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [user, setUser] = useState<UserPayload | null>(null);

  // On mount, try to restore session from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuarioLogado'); // ✅ Buscar usuário salvo
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔄 Restaurando sessão do localStorage:', userData);
        
        // ✅ VERIFICAR SE TEM ID
        if (!userData.id) {
          console.warn('⚠️ Usuário salvo sem ID, buscando da API...');
          // Se não tem ID, buscar da API
          fetchCurrentUser();
        } else {
          setUser(userData);
          setUserType(userData?.tipo ?? null);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
        fetchCurrentUser();
      }
    } else if (token) {
      // Se tem token mas não tem usuário salvo, buscar da API
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/user');
      const u = res.data;
      console.log('👤 Usuário da API:', u);
      
      // ✅ GARANTIR que o ID está presente
      if (!u.id) {
        console.error('❌ API não retornou ID do usuário:', u);
        throw new Error('ID do usuário não encontrado na resposta da API');
      }
      
      // ✅ SALVAR usuário completo no localStorage
      const userToSave = {
        id: u.id,
        name: u.name || u.nome,
        email: u.email,
        tipo: u.tipo,
        nome: u.nome,
        telefone: u.telefone,
        nr_estudante: u.nr_estudante,
        curso: u.curso,
        departamento: u.departamento
      };
      
      localStorage.setItem('usuarioLogado', JSON.stringify(userToSave));
      console.log('💾 Usuário salvo no localStorage:', userToSave);
      
      setUser(userToSave);
      setUserType(userToSave.tipo ?? null);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      // Se token invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('usuarioLogado');
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (u: UserPayload) => {
    console.log('🔐 Fazendo login com usuário:', u);
    
    // ✅ GARANTIR que o ID está presente
    if (!u.id) {
      console.error('❌ Tentativa de login sem ID:', u);
      throw new Error('ID do usuário é obrigatório para login');
    }
    
    // ✅ SALVAR usuário completo no localStorage
    const userToSave = {
      id: u.id,
      name: u.name || u.nome,
      email: u.email,
      tipo: u.tipo,
      nome: u.nome,
      telefone: u.telefone,
      nr_estudante: u.nr_estudante,
      curso: u.curso,
      departamento: u.departamento
    };
    
    localStorage.setItem('usuarioLogado', JSON.stringify(userToSave));
    console.log('💾 Usuário salvo no localStorage durante login:', userToSave);
    
    setUser(userToSave);
    setUserType(userToSave.tipo ?? null);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('usuarioLogado'); // ✅ Limpar usuário também
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};