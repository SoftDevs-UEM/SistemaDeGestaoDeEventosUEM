import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './layouts/navbar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventosProvider } from './context/EventosContext';
import CriarEvento from './pages/CriarEvento';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Eventos from './pages/Eventos';
import Login from './pages/Login';
import EventModal from './components/EventModal';
import RegistrarEvento from './components/RegistrarEvento';
import HomeAdmin from './pages/HomeAdmin';
import HomePromotor from './pages/HomePromotor';
import HomeEstudante from './pages/HomeEstudante';
import Organizadores from './pages/Organizadores';
import Estatisticas from './pages/Estatisticas';
import CadastrarPromotor from './pages/CadastrarPromotor';
import AdminDashboard from './pages/AdminDashboard';

// Define o tipo de usuário permitido
type UserType = 'estudante' | 'docente' | 'cta' | 'admin' | 'promotor';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <div className="App">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/contacto" element={<Contact />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registrar" element={<RegistrarEvento />} />
        <Route path="/admin" element={<HomeAdmin />} />
        <Route path="/promotor" element={<HomePromotor />} />
        <Route path="/estudante" element={<HomeEstudante />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute allowedUserTypes={['admin']}>
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
          path="/criar-evento" 
          element={
            <ProtectedRoute allowedUserTypes={['promotor', 'admin']}>
              <CriarEvento />
            </ProtectedRoute>
          } 
        />
        {/* Rota fallback para páginas não encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Componente para proteger rotas
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedUserTypes: UserType[]; 
}> = ({ children, allowedUserTypes }) => {
  const { isAuthenticated, userType } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userType || !allowedUserTypes.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

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