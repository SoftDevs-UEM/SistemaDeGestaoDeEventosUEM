import React from "react";
import './navbar.css'


export default function Navbar() {
  return (
    <>



     <nav className="navbar" id="navbar">
        <div className="logo">
          <img src="src/assets/logo.png" alt="UEM Logo" />
        </div>
        <div className="nav-links">
          <a href="#">Pagina Inicial</a>
          <a href="#">Eventos</a>
          <a href="#">Sobre Nos</a>
          <a href="#">Contacto</a>
        </div>
        <button className="btn-login">Entrar</button>
      </nav>

      <section className="hero">
        Universidade Eduardo Mondlane
      </section>
    </>
  );
}