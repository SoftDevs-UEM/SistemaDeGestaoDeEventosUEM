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
import RegistrarEvento from './components/RegistrarEvento';
import HomeAdmin from './pages/HomeAdmin';
import HomePromotor from './pages/HomePromotor';
import HomeEstudante from './pages/HomeEstudante';
import Organizadores from './pages/Organizadores';
import Estatisticas from './pages/Estatisticas';

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
        {/* <Route path="/organizadores/estatisticas" element={<Estatisticas />} /> */}
        
        <Route path="/organizadores/criar-evento" element={<CriarEvento />} />
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

  if (!isAuthenticated || !userType || !allowedUserTypes.includes(userType)) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

function App() {
  return (
    <EventosProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </EventosProvider>
  );
}

export default App;