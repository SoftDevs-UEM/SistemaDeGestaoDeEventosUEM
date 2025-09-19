import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import './navbar.css'

export default function Navbar() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);
  
  const handleLoginClick = () => {
    setIsVisible(false); // Faz a navbar desaparecer
    navigate("/login"); // redireciona para a rota /login
  };

  // Se a navbar não estiver visível, retorna null
  if (!isVisible) {
    return null;
  }

  return (
    <>
{/* 
<nav className="navbar" id="navbar">
        <div className="logo">
          <Link to="/">
            <img src="src/assets/logo.png" alt="UEM Logo" />
          </Link>
        </div>
       
     
      </nav> */}


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
        <button className="btn-login" onClick={handleLoginClick}>
          Entrar
        </button>
      </nav>
    </>
  );
}