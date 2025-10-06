import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Navbar from './layouts/navbar';
import { AuthProvider } from './context/AuthContext';
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
        <Route path="/criar-evento" element={<CriarEvento />} />
        {/* ADICIONE ESTA LINHA: */}
        <Route path="/organizadores/criar-evento" element={<CriarEvento />} />
      </Routes>
    </div>
  );
}

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