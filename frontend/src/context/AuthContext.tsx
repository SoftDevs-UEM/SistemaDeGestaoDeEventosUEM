import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export type UserType = 'estudante' | 'promotor' | 'admin' | null;

interface UserPayload {
  id?: number;
  name?: string;
  email?: string;
  tipo?: UserType;
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
    if (!token) return;

    // fetch current user
    api.get('/user')
      .then((res) => {
        const u = res.data;
        setUser(u);
        setUserType(u?.tipo ?? null);
        setIsAuthenticated(true);
      })
      .catch(() => {
        // if token invalid, clear it
        localStorage.removeItem('token');
        setUser(null);
        setUserType(null);
        setIsAuthenticated(false);
      });
  }, []);

  const login = async (u: UserPayload) => {
    // assumes token already saved to localStorage by the caller
    setUser(u);
    setUserType(u?.tipo ?? null);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      // try to call backend logout (optional)
      await api.post('/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserType(null);
    setUser(null);
    // redirect to login optionally
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
