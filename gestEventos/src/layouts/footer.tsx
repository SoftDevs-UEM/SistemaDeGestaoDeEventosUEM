// Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Seção Newsletter */}
        <div className="footer-newsletter">
          <h3>junte-se à comunidade</h3>
          <div className="newsletter-form">
            <input type="email" placeholder="Insira o seu email" />
            <button className="newsletter-submit">SUBSCREVER</button>
          </div>
        </div>

        {/* Links do Footer - MESMA LINHA (LADO A LADO) */}
        <div className="footer-links">
          {/* Coluna Ensino */}
          <div className="footer-column">
            <h4>Ensino</h4>
            <ul>
              <li><a href="/estudar-na-uem">Estudar na UEM</a></li>
              <li><a href="/financiamento">Financiamento</a></li>
              <li><a href="/informacao-estudantes">Informação para Estudantes</a></li>
              <li><a href="/estudantes-internacionais">Estudantes Internacionais</a></li>
            </ul>
          </div>

          {/* Coluna Investigação & Extensão */}
          <div className="footer-column">
            <h4>Investigação & Extensão</h4>
            <ul>
              <li><a href="/investigacao">Investigação</a></li>
              <li><a href="/extensao">Extensão</a></li>
              <li><a href="/direcao-cientifica">Direcção Científica</a></li>
              <li><a href="/centro-extensao">Centro de Extensão</a></li>
              <li><a href="/actividades-em-curso">Actividades em curso</a></li>
              <li><a href="/propriedade-intelectual">Propriedade intelectual e Direitos do autor</a></li>
              <li><a href="/extensao-inovacao">Extensão e Inovação na UEM</a></li>
            </ul>
          </div>

          {/* Coluna Cultura & Desporto */}
          <div className="footer-column">
            <h4>Cultura & Desporto</h4>
            <ul>
              <li><a href="/museu-historia-natural">Museu de História Natural</a></li>
              <li><a href="/museu-moeda">Museu Nacional da Moeda | Casa Amarela</a></li>
              <li><a href="/colecao-arte">Colecção e Galerias de Arte</a></li>
              <li><a href="/orquestra">Orquestra da UEM</a></li>
              <li><a href="/centro-cultural">Centro Cultural Universitário</a></li>
              <li><a href="/fortaleza">Fortaleza de Maputo</a></li>
            </ul>
          </div>
        </div>

        {/* Informações de Contato */}
        <div className="footer-contact">
          <div className="contact-info">
            <h4>Campus Universitário Principal</h4>
            <p>Av. Julius Nyerere, nr. 3453</p>
            <p>Maputo – Moçambique</p>
            <p className="contact-phone">+258 (21) 430229</p>
            <p className="contact-email">cscoma@uem.ac.mx</p>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Universidade Eduardo Mondlane. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;