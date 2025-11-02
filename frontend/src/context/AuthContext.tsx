import React, { createContext, useState, useContext, useEffect } from 'react';

const API_URL = 'http://localhost:8000/api';

interface AuthContextType {
    user: any;
    login: (email: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        // Verificar se usuário está logado ao carregar
        const token = localStorage.getItem('token');
        const usuarioSalvo = localStorage.getItem('usuario');
        
        if (token && usuarioSalvo) {
            try {
                const usuario = JSON.parse(usuarioSalvo);
                setUser(usuario);
            } catch (error) {
                localStorage.removeItem('token');
                localStorage.removeItem('usuario');
                setUser(null);
            }
        }
    }, []);

    const login = (email: string) => {
        // A autenticação real é feita no componente Login
        // Esta função apenas atualiza o estado
        const usuarioSalvo = localStorage.getItem('usuario');
        if (usuarioSalvo) {
            try {
                const usuario = JSON.parse(usuarioSalvo);
                setUser(usuario);
            } catch (error) {
                console.error('Erro ao fazer parse do usuário:', error);
            }
        }
    };

    const logout = () => {
        // Fazer logout no backend (opcional)
        const token = localStorage.getItem('token');
        if (token) {
            fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            }).catch(console.error);
        }
        
        // Limpar localStorage e estado
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};