import { useNavigate } from 'react-router-dom';
import React from 'react';
import { Link } from 'react-router-dom';
import './navbar.css';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* 
      <nav className="navbar" id="navbar">
        <div className="logo">
          <Link to="/">
            <img src="src/assets/logo.png" alt="UEM Logo" />
          </Link>
        </div>
      </nav> 
      */}
      <nav className="navbar" id="navbar">
        <div className="logo">
          <Link to="/">
            <img src="src/assets/logo.png" alt="UEM Logo" />
          </Link>
        </div>
        <div className="nav-links">
          <Link to="/">Pagina Inicial</Link>
          <Link to="/eventos">Eventos</Link>
          <Link to="/sobre">Sobre Nós</Link>
          <Link to="/contacto">Contacto</Link>
        </div>
        {isAuthenticated ? (
          <button className="btn-login" onClick={handleLogoutClick}>
            Sair
          </button>
        ) : (
          <button className="btn-login" onClick={handleLoginClick}>
            Entrar
          </button>
        )}
      </nav>
    </>
  );
}
