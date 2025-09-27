import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import Navbar from './layouts/navbar';
import Contact from './pages/Contact';
import Home from './pages/Home';
import Sobre from './pages/Sobre';
import Eventos from './pages/Eventos';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contacto" element={<Contact />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
