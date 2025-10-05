import React, { createContext, useContext, useState } from 'react';

export type UserType = 'estudante' | 'promotor' | 'admin' | null;

interface AuthContextType {
  isAuthenticated: boolean;
  userType: UserType;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);

  const login = (email: string) => {
    if (email === 'estudante@uem.ac.mz') {
      setIsAuthenticated(true);
      setUserType('estudante');
    } else if (email === 'promotor@uem.ac.mz') {
      setIsAuthenticated(true);
      setUserType('promotor');
    } else if (email === 'admin@uem.ac.mz') {
      setIsAuthenticated(true);
      setUserType('admin');
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, login, logout }}>
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
