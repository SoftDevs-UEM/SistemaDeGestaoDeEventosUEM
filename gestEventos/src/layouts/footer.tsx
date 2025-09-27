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

        {/* Container principal com 4 colunas alinhadas horizontalmente */}
        <div className="footer-main-sections">
          {/* Coluna 1: Emblema UEM e Contato */}
          <div className="footer-section">
            <div className="uem-emblem">
              <img src="src/assets/logo.png" alt="UEM Logo" />
              <h4>Universidade Eduardo Mondlane</h4>
            </div>
            <div className="contact-info">
              <p>
                <strong>Campus Universitário Principal</strong>
              </p>
              <p>Av. Julius Nyerere, nr. 3453</p>
              <p>Maputo – Moçambique</p>
              <p className="contact-phone">+258 (21) 430239</p>
              <p className="contact-email">cecoma@uem.ac.mz</p>
            </div>
            <div className="social-links">
              <a href="https://www.facebook.com/uemmoc/" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com/uemmoz" aria-label="Twitter">
                <i className="fab fa-twitter"></i>
              </a>
              <a
                href="https://www.instagram.com/explore/locations/2094126717488002/universidade-eduardo-mondlane-em-maputo/"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.youtube.com/uemmoz" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/universidade-eduardo-mondlane"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
             
          </div>

          {/* Coluna 2: Ensino */}
          <div className="footer-section">
            <h4>Ensino</h4>
            <ul>
              <li>
                <a href="/estudar-na-uem">Estudar na UEM</a>
              </li>
              <li>
                <a href="/financiamento">Financiamento</a>
              </li>
              <li>
                <a href="/informacao-estudantes">Informação para Estudantes</a>
              </li>
              <li>
                <a href="/estudantes-internacionais">
                  Estudantes Internacionais
                </a>
              </li>
            </ul>
             
          </div>

          {/* Coluna 3: Investigação & Extensão */}
          <div className="footer-section">
            <h4>Investigação & Extensão</h4>
            <ul>
              <li>
                <a href="/investigacao">Investigação</a>
              </li>
              <li>
                <a href="/extensao">Extensão</a>
              </li>
              <li>
                <a href="/direcao-cientifica">Direcção Científica</a>
              </li>
              <li>
                <a href="/centro-extensao">Centro de Extensão</a>
              </li>
              <li>
                <a href="/actividades-em-curso">Actividades em curso</a>
              </li>
              <li>
                <a href="/propriedade-intelectual">
                  Propriedade intelectual e Direitos do autor
                </a>
              </li>
              <li>
                <a href="/extensao-inovacao">Extensão e Inovação na UEM</a>
              </li>
            </ul>
          </div>

          {/* Coluna 4: Cultura & Desporto */}
          <div className="footer-section">
            <h4>Cultura & Desporto</h4>
            <ul>
              <li>
                <a href="/museu-historia-natural">Museu de História Natural</a>
              </li>
              <li>
                <a href="/museu-moeda">
                  Museu Nacional da Moeda | Casa Amarela
                </a>
              </li>
              <li>
                <a href="/colecao-arte">Colecção e Galeria de Arte</a>
              </li>
              <li>
                <a href="/orquestra">Orquestra da UEM</a>
              </li>
              <li>
                <a href="/centro-cultural">Centro Cultural Universitário</a>
              </li>
              <li>
                <a href="/fortaleza">Fortaleza de Maputo</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Universidade Eduardo Mondlane.
            Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
