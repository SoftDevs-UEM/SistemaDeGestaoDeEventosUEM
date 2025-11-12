// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserType = 'estudante' | 'promotor' | 'admin' | null;

interface UserPayload {
  id?: number;
  name?: string;
  email?: string;
  tipo?: UserType;
  nome?: string;
  telefone?: string;
  nr_estudante?: string;
  curso?: string;
  departamento?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  user: UserPayload | null;
  login: (user: UserPayload) => Promise<void> | void;
  logout: () => Promise<void> | void;
  updateUserProfile: (userData: Partial<UserPayload>) => Promise<{ success: boolean; message: string }>;
  changePassword: (passwordData: { current_password: string; new_password: string; new_password_confirmation: string }) => Promise<{ success: boolean; message: string }>;
  loadUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [user, setUser] = useState<UserPayload | null>(null);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('❌ Nenhum token encontrado');
        return;
      }

      // ✅ PRIMEIRO: Buscar dados atualizados da API
      console.log('🔄 Buscando dados atualizados do usuário...');
      const response = await api.get('/user');
      const apiUser = response.data;
      
      if (apiUser && apiUser.id) {
        const userToSave = {
          id: apiUser.id,
          name: apiUser.name || apiUser.nome,
          email: apiUser.email,
          tipo: apiUser.tipo,
          nome: apiUser.nome,
          telefone: apiUser.telefone,
          nr_estudante: apiUser.nr_estudante,
          curso: apiUser.curso,
          departamento: apiUser.departamento,
          created_at: apiUser.created_at, // ✅ GARANTIR QUE ESTÁ SENDO RETORNADO
          updated_at: apiUser.updated_at, // ✅ GARANTIR QUE ESTÁ SENDO RETORNADO
        };
        
        localStorage.setItem('usuarioLogado', JSON.stringify(userToSave));
        setUser(userToSave);
        console.log('✅ Dados do usuário atualizados:', userToSave);
      }
    } catch (error) {
      console.error('❌ Erro ao buscar dados atualizados do usuário:', error);
      // Se falhar, usar dados do localStorage
      const savedUser = localStorage.getItem('usuarioLogado');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      }
    }
  };

  const updateUserProfile = async (userData: Partial<UserPayload>) => {
    try {
      console.log('🔄 Atualizando perfil do usuário:', userData);
      
      const response = await api.put('/promoter/profile', userData);
      
      if (response.data.user) {
        const updatedUser = response.data.user;
        const userToSave = {
          id: updatedUser.id,
          name: updatedUser.name || updatedUser.nome,
          email: updatedUser.email,
          tipo: updatedUser.tipo,
          nome: updatedUser.nome,
          telefone: updatedUser.telefone,
          nr_estudante: updatedUser.nr_estudante,
          curso: updatedUser.curso,
          departamento: updatedUser.departamento,
          created_at: updatedUser.created_at || user?.created_at, // ✅ MANTER created_at existente
          updated_at: updatedUser.updated_at, // ✅ NOVA DATA DE ATUALIZAÇÃO
        };
        
        localStorage.setItem('usuarioLogado', JSON.stringify(userToSave));
        setUser(userToSave);
        
        console.log('✅ Perfil atualizado com sucesso:', userToSave);
        return { success: true, message: response.data.message || 'Perfil atualizado com sucesso!' };
      }
    } catch (error: any) {
      console.error('❌ Erro ao atualizar perfil:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erro ao atualizar perfil';
      return { success: false, message: errorMessage };
    }
    
    return { success: false, message: 'Erro desconhecido ao atualizar perfil' };
  };

  const changePassword = async (passwordData: { current_password: string; new_password: string; new_password_confirmation: string }) => {
    try {
      console.log('🔄 Alterando senha...');
      
      const response = await api.put('/promoter/password', passwordData);
      
      console.log('✅ Senha alterada com sucesso');
      return { success: true, message: response.data.message || 'Senha alterada com sucesso!' };
    } catch (error: any) {
      console.error('❌ Erro ao alterar senha:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'Erro ao alterar senha';
      return { success: false, message: errorMessage };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('usuarioLogado');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('🔄 Restaurando sessão do localStorage:', userData);
        
        // ✅ VERIFICAR SE TEM DATAS, SE NÃO, BUSCAR DA API
        if (!userData.created_at || !userData.updated_at) {
          console.log('⚠️ Datas não encontradas no localStorage, buscando da API...');
          fetchCurrentUser();
        } else {
          setUser(userData);
          setUserType(userData?.tipo ?? null);
          setIsAuthenticated(true);
          
          // ✅ SEMPRE CARREGAR DADOS ATUALIZADOS PARA GARANTIR DATAS CORRETAS
          setTimeout(() => {
            loadUserData();
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Erro ao restaurar sessão:', error);
        fetchCurrentUser();
      }
    } else if (token) {
      fetchCurrentUser();
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/user');
      const u = res.data;
      console.log('👤 Usuário da API:', u);
      
      if (!u.id) {
        console.error('❌ API não retornou ID do usuário:', u);
        throw new Error('ID do usuário não encontrado na resposta da API');
      }
      
      const userToSave = {
        id: u.id,
        name: u.name || u.nome,
        email: u.email,
        tipo: u.tipo,
        nome: u.nome,
        telefone: u.telefone,
        nr_estudante: u.nr_estudante,
        curso: u.curso,
        departamento: u.departamento,
        created_at: u.created_at, // ✅ GARANTIR QUE ESTÁ SENDO SALVO
        updated_at: u.updated_at, // ✅ GARANTIR QUE ESTÁ SENDO SALVO
      };
      
      localStorage.setItem('usuarioLogado', JSON.stringify(userToSave));
      console.log('💾 Usuário salvo no localStorage:', userToSave);
      
      setUser(userToSave);
      setUserType(userToSave.tipo ?? null);
      setIsAuthenticated(true);
      
    } catch (error) {
      console.error('❌ Erro ao buscar usuário:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('usuarioLogado');
      setUser(null);
      setUserType(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (u: UserPayload) => {
    console.log('🔐 Fazendo login com usuário:', u);
    
    if (!u.id) {
      console.error('❌ Tentativa de login sem ID:', u);
      throw new Error('ID do usuário é obrigatório para login');
    }
    
    const userToSave = {
      id: u.id,
      name: u.name || u.nome,
      email: u.email,
      tipo: u.tipo,
      nome: u.nome,
      telefone: u.telefone,
      nr_estudante: u.nr_estudante,
      curso: u.curso,
      departamento: u.departamento,
      created_at: u.created_at, // ✅ SALVAR DATAS NO LOGIN
      updated_at: u.updated_at, // ✅ SALVAR DATAS NO LOGIN
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
    localStorage.removeItem('usuarioLogado');
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userType, 
      user, 
      login, 
      logout,
      updateUserProfile,
      changePassword,
      loadUserData
    }}>
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