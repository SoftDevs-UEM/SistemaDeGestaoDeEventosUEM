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

  // Função para navegar para seções específicas da página Sobre
  const handleSobreSectionClick = (sectionId: string) => {
    navigate('/sobre', { state: { scrollToSection: sectionId } });
  };

  // Função para navegar para o AdminDashboard com view específica
  const handleAdminNavigation = (view: string) => {
    navigate('/admin/dashboard', { state: { activeView: view } });
  };

  // Verificar se o usuário é admin para mostrar menu administrativo
  const isAdmin = isAuthenticated && userType === 'admin';
  const isPromotor = isAuthenticated && userType === 'promotor';
  const showOrganizadoresMenu = isAuthenticated && (userType === 'promotor' || userType === 'admin');

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
          {/* Se for promotor, mostrar apenas os menus específicos */}
          {isPromotor ? (
            <>
              {/* Menu Para Organizadores - apenas para promotores */}
              <div 
                className="dropdown-container"
                onMouseEnter={() => handleDropdownEnter('organizadores')}
                onMouseLeave={handleDropdownLeave}
              >
                <Link to="/organizadores" >
                  Organizadores
                </Link>
              
            
              </div>

              <Link to="/contacto">Contacto</Link>
            </>
          ) : (
            /* Menu normal para não-promotores (usuários não autenticados, admin, etc.) */
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
                    onClick={() => handleSobreSectionClick('historia')}
                  >
                    História
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => handleSobreSectionClick('missao')}
                  >
                    Missão e Visão
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => handleSobreSectionClick('equipa')}
                  >
                    Nossa Equipa
                  </button>
                  <button 
                    className="dropdown-link-btn"
                    onClick={() => handleSobreSectionClick('desenvolvedores')}
                  >
                    Desenvolvedores
                  </button>
                </div>
              </div>

              {/* Menu Para Organizadores - para admin */}
              {showOrganizadoresMenu && !isPromotor && (
                <div 
                  className="dropdown-container"
                  onMouseEnter={() => handleDropdownEnter('organizadores')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link to="/organizadores" className="dropdown-toggle">
                    Para Organizadores <span className="dropdown-arrow">▼</span>
                  </Link>
                  <div className={`dropdown-menu ${activeDropdown === 'organizadores' ? 'active' : ''}`}>
                    <button 
                      className="dropdown-link-btn"
                      onClick={() => handleAdminNavigation('configuracoes')}
                    >
                      Configurações
                    </button>
                  </div>
                </div>
              )}

              {/* Menu Administrativo - apenas para admin */}
              {isAdmin && (
                <div 
                  className="dropdown-container"
                  onMouseEnter={() => handleDropdownEnter('admin')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link to="/admin/dashboard" className="dropdown-toggle">
                    Administração <span className="dropdown-arrow">▼</span>
                  </Link>
                  <div className={`dropdown-menu ${activeDropdown === 'admin' ? 'active' : ''}`}>
                    <button 
                      className="dropdown-link-btn"
                      onClick={() => handleAdminNavigation('configuracoes')}
                    >
                      Configurações
                    </button>
                  </div>
                </div>
              )}

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