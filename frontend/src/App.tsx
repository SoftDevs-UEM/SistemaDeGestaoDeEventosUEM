import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './layouts/navbar';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { EventosProvider } from './context/EventosContext';

import CriarEvento from './pages/CriarEvento';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Eventos from './pages/Eventos';
import Login from './pages/Login';
import RegistrarEvento from './components/RegistrarEvento';
import HomeAdmin from './pages/HomeAdmin';
import HomePromotor from './pages/HomePromotor';
import HomeEstudante from './pages/HomeEstudante';
import Organizadores from './pages/Organizadores';
import CadastrarPromotor from './pages/CadastrarPromotor';
import AdminDashboard from './pages/AdminDashboard';

// Tipo de usuário permitido
type UserType = 'estudante' | 'docente' | 'cta' | 'admin' | 'promotor';

// ✅ Componente para redirecionamento pós-login - APENAS redireciona promotores e estudantes
const HomeRedirect = () => {
  const { userType, isAuthenticated } = useAuth();
  
  // Se não estiver autenticado, mostra a página inicial normal
  if (!isAuthenticated) {
    return <Home />;
  }
  
  // Se estiver autenticado, redireciona APENAS promotores e estudantes
  // Admin pode acessar a página inicial normalmente
  switch (userType) {
    case 'promotor':
      return <Navigate to="/organizadores" replace />;
    case 'estudante':
      return <Navigate to="/estudante" replace />;
    case 'admin':
    case 'docente':
    case 'cta':
    default:
      return <Home />; // Admin e outros veem a página inicial
  }
};

// ✅ Componente de rotas principais
const AppContent = React.memo(() => {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  // useMemo evita re-renderizações desnecessárias do conjunto de rotas
  const routes = useMemo(() => (
    <Routes>
      {/* Rota principal - acessível para TODOS, incluindo admin */}
      <Route 
        path="/" 
        element={<HomeRedirect />} 
      />
      
      <Route path="/sobre" element={<Sobre />} />
      <Route path="/contacto" element={<Contact />} />
      <Route path="/eventos" element={<Eventos />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<RegistrarEvento />} />
      
      {/* Rotas públicas para todos os usuários */}
      <Route path="/admin" element={<HomeAdmin />} />
      <Route path="/promotor" element={<HomePromotor />} />
      <Route path="/estudante" element={<HomeEstudante />} />
      
      {/* Rotas protegidas - Admin tem acesso a tudo */}
      <Route 
        path="/admin/dashboard" 
        element={
          <ProtectedRoute allowedUserTypes={['admin', 'promotor']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />      
      <Route 
        path="/admin/cadastrar-promotor" 
        element={
          <ProtectedRoute allowedUserTypes={['admin']}>
            <CadastrarPromotor />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizadores/criar-evento" 
        element={
          <ProtectedRoute allowedUserTypes={['promotor', 'admin']}>
            <CriarEvento />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizadores" 
        element={
          <ProtectedRoute allowedUserTypes={['promotor', 'admin']}>
            <Organizadores />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organizadores/configuracoes" 
        element={
          <ProtectedRoute allowedUserTypes={['promotor', 'admin']}>
            <Organizadores />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/criar-evento" 
        element={
          <ProtectedRoute allowedUserTypes={['promotor', 'admin']}>
            <CriarEvento />
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas que apenas admin pode acessar */}
      <Route 
        path="/admin/gestao-usuarios" 
        element={
          <ProtectedRoute allowedUserTypes={['admin']}>
            <div>Gestão de Usuários - Apenas Admin</div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/relatorios" 
        element={
          <ProtectedRoute allowedUserTypes={['admin']}>
            <div>Relatórios - Apenas Admin</div>
          </ProtectedRoute>
        } 
      />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  ), []);

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      {routes}
    </div>
  );
});

// ✅ Proteção de rotas
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedUserTypes: UserType[]; 
}> = ({ children, allowedUserTypes }) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  
  // Admin tem acesso a tudo
  if (userType === 'admin') {
    return <>{children}</>;
  }
  
  // Para outros usuários, verificar se têm permissão
  if (!userType || !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// ✅ App principal
function App() {
  return (
    <AuthProvider>
      <EventosProvider>
        <Router>
          <AppContent />
        </Router>
      </EventosProvider>
    </AuthProvider>
  );
}

export default App;