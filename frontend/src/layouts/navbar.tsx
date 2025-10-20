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

  // Verificar se o usuário é admin para mostrar menu administrativo
  const isAdmin = isAuthenticated && userType === 'admin';
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
              <Link to="/eventos/calendario">Calendário</Link>
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

          {/* Menu Para Organizadores - apenas para promotores e admin */}
          {showOrganizadoresMenu && (
            <div 
              className="dropdown-container"
              onMouseEnter={() => handleDropdownEnter('organizadores')}
              onMouseLeave={handleDropdownLeave}
            >
              <Link to="/organizadores" className="dropdown-toggle">
                Para Organizadores <span className="dropdown-arrow">▼</span>
              </Link>
              <div className={`dropdown-menu ${activeDropdown === 'organizadores' ? 'active' : ''}`}>
                <Link to="/organizadores/criar-evento">Criar Evento</Link>
                <Link to="/organizadores/meus-eventos">Meus Eventos</Link>
                <Link to="/organizadores/estatisticas">Estatísticas</Link>
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
              <Link to="/admin" className="dropdown-toggle">
                Administração <span className="dropdown-arrow">▼</span>
              </Link>
              <div className={`dropdown-menu ${activeDropdown === 'admin' ? 'active' : ''}`}>
                <Link to="/admin/cadastrar-promotor">Cadastrar Promotor</Link>
                <Link to="/admin/gestao-usuarios">Gestão de Usuários</Link>
                <Link to="/admin/relatorios">Relatórios</Link>
                <Link to="/admin/configuracoes">Configurações</Link>
              </div>
            </div>
          )}

          <Link to="/contacto">Contacto</Link>
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