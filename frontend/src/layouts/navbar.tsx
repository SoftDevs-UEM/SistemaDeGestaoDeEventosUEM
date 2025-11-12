import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const { isAuthenticated, logout, userType } = useAuth();

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

  // Verificar se o usuário é admin para mostrar menu administrativo
  const isAdmin = isAuthenticated && userType === 'admin';
  const isPromotor = isAuthenticated && userType === 'promotor';

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
          {/* Se for admin, mostrar apenas os menus administrativos */}
          {isAdmin ? (
            <>
              {/* Menu Para Organizadores - para admin */}
              <Link to="/organizadores">
                Para Organizadores
              </Link>

              {/* Menu Administrativo - apenas para admin */}
              <Link to="/admin/dashboard">
                Administração
              </Link>
            </>
          ) : isPromotor ? (
            /* Se for promotor, mostrar apenas os menus específicos */
            <>
              {/* Menu Para Organizadores - apenas para promotores */}
              <Link to="/organizadores">
                Organizadores
              </Link>
            </>
          ) : (
            /* Menu normal para não-autenticados e outros usuários (estudante, docente, cta) */
            <>
              <Link to="/">Página Inicial</Link>
              
              <div 
                className="dropdown-container"
                onMouseEnter={() => handleDropdownEnter('eventos')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link to="/eventos" className="dropdown-toggle">
                  Eventos <span className="dropdown-arrow">▼</span>
                </Link>
                <div className={`dropdown-menu ${activeDropdown === 'eventos' ? 'active' : ''}`}>
                  <Link to="/eventos/proximos">Próximos Eventos</Link>
                  <Link to="/eventos/passados">Eventos Passados</Link>
                  <Link to="/eventos/inscricoes">Minhas Inscrições</Link>
                  <Link to="/eventos/categorias">Categorias</Link>
                </div>
              </div>

              <div 
                className="dropdown-container"
                onMouseEnter={() => handleDropdownEnter('sobre')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link to="/sobre" className="dropdown-toggle">
                  Sobre Nós <span className="dropdown-arrow">▼</span>
                </Link>
                <div className={`dropdown-menu ${activeDropdown === 'sobre' ? 'active' : ''}`}>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => navigate('/sobre', { state: { scrollToSection: 'historia' } })}
                  >
                    História
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => navigate('/sobre', { state: { scrollToSection: 'missao' } })}
                  >
                    Missão e Visão
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => navigate('/sobre', { state: { scrollToSection: 'equipa' } })}
                  >
                    Nossa Equipa
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => navigate('/sobre', { state: { scrollToSection: 'desenvolvedores' } })}
                  >
                    Desenvolvedores
                  </button>
                </div>
              </div>

              <Link to="/contacto">Contacto</Link>
            </>
          )}
        </div>

        {/* Botão Entrar/Sair estilizado como o do footer */}
        {isAuthenticated ? (
          <button className="btn-login-footer-style" onClick={handleLogoutClick}>
            SAIR
          </button>
        ) : (
          <button className="btn-login-footer-style" onClick={handleLoginClick}>
            ENTRAR
          </button>
        )}
      </nav>
    </>
  );
}