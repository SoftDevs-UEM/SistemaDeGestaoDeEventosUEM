import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./navbar.css";
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [userDropdown, setUserDropdown] = useState(false);
  const { isAuthenticated, logout, userType, user } = useAuth();

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

  const handleUserDropdownToggle = () => {
    setUserDropdown(!userDropdown);
  };

  const handleUserDropdownLeave = () => {
    setUserDropdown(false);
  };

  // Verificar se o usuário é admin para mostrar menu administrativo
  const isAdmin = isAuthenticated && userType === 'admin';
  const isPromotor = isAuthenticated && userType === 'promotor';
  const isEstudante = isAuthenticated && userType === 'estudante';

  // Obter o nome do usuário ou email
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.split(' ')[0]; // Retorna apenas o primeiro nome
    }
    if (user?.email) {
      return user.email.split('@')[0]; // Retorna a parte antes do @ do email
    }
    return 'Usuário';
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
                  {isAuthenticated && (
                    <Link to="/minhas-inscricoes">Minhas Inscrições</Link>
                  )}
                  <Link to="/eventos">Todos os Eventos</Link>
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

        {/* Área do usuário logado ou botão de login */}
        {isAuthenticated ? (
          <div 
            className="user-area"
            onMouseEnter={handleUserDropdownToggle}
            onMouseLeave={handleUserDropdownLeave}
          >
            <div className="user-info">
              <div className="user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <span className="user-name">{getUserDisplayName()}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            
            {/* Dropdown do usuário */}
            <div className={`user-dropdown ${userDropdown ? 'active' : ''}`}>
              <div className="user-dropdown-header">
                <div className="user-welcome">Olá, {getUserDisplayName()}!</div>
                <div className="user-email">{user?.email}</div>
              </div>
              
              <div className="user-dropdown-links">
                {isEstudante && (
                  <Link to="/minhas-inscricoes" className="user-dropdown-link">
                    <i className="fas fa-ticket-alt"></i>
                    Minhas Inscrições
                  </Link>
                )}
                
                <div className="dropdown-divider"></div>
                
                <button 
                  onClick={handleLogoutClick}
                  className="user-dropdown-link logout-btn"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  Sair
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button className="btn-login" onClick={handleLoginClick}>
            ENTRAR
          </button>
        )}
      </nav>
    </>
  );
}