import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { isAuthenticated, logout } = useAuth();

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleLogoutClick = () => {
    logout();
    navigate("/");
  };

  const handleDropdownEnter = (dropdownName) => {
    setActiveDropdown(dropdownName);
  };

  const handleDropdownLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Barra superior com idioma e atalhos */}
      <div className="topbar">
        <div className="left-links">
          <span>EN</span> | <span>PT</span>
        </div>
        <div className="right-links">
          <a href="#">Facebook</a>
          <a href="#">YouTube</a>
          <a href="#">| Webmail</a>
        </div>
      </div>

      {/* Barra intermédia - logotipo + pesquisa */}
      <div className="midbar">
        <div className="logo">
          <Link to="/">
            <img src="src/assets/logo.png" alt="UEM Logo" />
          </Link>
        </div>
        <div className="search-box">
          <input type="text" placeholder="Procurar eventos..." />
          <button>🔍</button>
        </div>
      </div>

      {/* Navbar principal - Links centralizados */}
      <nav className="navbar" id="navbar">
        {/* Links centralizados */}
        <div className="nav-links">
          <Link to="/">Página Inicial</Link>
          
          <div 
            className="dropdown-container"
            onMouseEnter={() => handleDropdownEnter('eventos')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link to="/eventos" className="dropdown-toggle">
              Eventos 
            </Link>
            <div className={`dropdown-menu ${activeDropdown === 'eventos' ? 'active' : ''}`}>
              <Link to="/eventos/proximos">Próximos Eventos</Link>
              <Link to="/eventos/passados">Eventos Passados</Link>
              <Link to="/eventos/inscricoes">Minhas Inscrições</Link>
              <Link to="/eventos/categorias">Categorias</Link>
              <Link to="/eventos/calendario">Calendário</Link>
            </div>
          </div>

          <div 
            className="dropdown-container"
            onMouseEnter={() => handleDropdownEnter('sobre')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link to="/sobre" className="dropdown-toggle">
              Sobre Nós 
            </Link>
            <div className={`dropdown-menu ${activeDropdown === 'sobre' ? 'active' : ''}`}>
              <Link to="/sobre/historia">História</Link>
              <Link to="/sobre/missao">Missão e Visão</Link>
              <Link to="/sobre/equipa">Nossa Equipa</Link>
              <Link to="/sobre/parceiros">Parceiros</Link>
            </div>
          </div>

          <div 
            className="dropdown-container"
            onMouseEnter={() => handleDropdownEnter('organizadores')}
            onMouseLeave={handleDropdownLeave}
          >
            <Link to="/organizadores" className="dropdown-toggle">
              Para Organizadores 
            </Link>
            <div className={`dropdown-menu ${activeDropdown === 'organizadores' ? 'active' : ''}`}>
              <Link to="/organizadores/criar-evento">Criar Evento</Link>
              <Link to="/organizadores/meus-eventos">Meus Eventos</Link>
              <Link to="/organizadores/estatisticas">Estatísticas</Link>
              <Link to="/organizadores/directrizes">Directrizes</Link>
            </div>
          </div>

          <Link to="/contacto">Contacto</Link>
        </div>

        {/* Botão Entrar/Sair posicionado absolutamente à direita */}
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