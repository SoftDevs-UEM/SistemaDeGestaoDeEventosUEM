import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Sobre.css';
import Footer from '../layouts/footer';

const Sobre = () => {
  const location = useLocation();
  const scrollExecuted = useRef(false);

  useEffect(() => {
    // Verifica se há uma seção para scroll e evita execução múltipla
    if (location.state?.scrollToSection && !scrollExecuted.current) {
      const sectionId = location.state.scrollToSection;
      
      scrollExecuted.current = true;
      
      // Pequeno delay para garantir que a página carregou
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          // Calcula a posição considerando a navbar fixa
          const navbarHeight = 60; // Altura aproximada da navbar
          const elementPosition = element.offsetTop - navbarHeight;
          
          // Scroll suave para a seção
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
        
        // Limpa o state após o scroll
        window.history.replaceState({}, document.title);
      }, 300);

      return () => clearTimeout(scrollTimer);
    }
  }, [location.state]);

  // Reset do ref quando a localização muda (navegação normal)
  useEffect(() => {
    scrollExecuted.current = false;
  }, [location.pathname]);

  return (
    <div className="sobre-container">
      {/* Hero Section */}
      <section className="sobre-hero">
        <div className="sobre-hero-content">
          <h1>Universidade Eduardo Mondlane</h1>
          <p>
            Excelência Académica, Inovação e Transformação Social desde 1962
          </p>
        </div>
      </section>

      {/* História da UEM */}
      <section className="historia-section section-padding" id="historia">
        <div className="container">
          <div className="historia-content">
            <div className="historia-text">
              <h2>
                Nossa <span className="highlight">História</span>
              </h2>
              <p>
                Fundada em 1962, a Universidade Eduardo Mondlane é a instituição
                de ensino superior mais antiga e prestigiada de Moçambique.
                Nomeada em homenagem ao líder histórico da FRELIMO, a UEM tem
                sido um pilar fundamental no desenvolvimento do país, formando
                gerações de profissionais e líderes que contribuem para o
                progresso nacional.
              </p>
              <p>
                Ao longo dos anos, expandimos nossas faculdades, investimos em
                pesquisa de ponta e estabelecemos parcerias internacionais,
                mantendo sempre o compromisso com a excelência académica e a
                relevância social.
              </p>
            </div>
            <div className="historia-image">
              <img 
                src="src/assets/campus.jpg" 
                alt="Campus da UEM" 
                onError={(e) => {
                  // Fallback para imagem caso a original não carregue
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="mvv-section section-padding" id="missao">
        <div className="container">
          <h2 className="section-title">
            Nossa <span className="highlight">Identidade</span>
          </h2>

          <div className="mvv-grid">
            <div className="mvv-card">
              <div className="mvv-icon">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3>Missão</h3>
              <p>
                Produzir, disseminar e aplicar conhecimento científico e
                tecnológico para a formação de cidadãos competentes, éticos e
                inovadores, capazes de contribuir para o desenvolvimento
                sustentável de Moçambique.
              </p>
            </div>

            <div className="mvv-card">
              <div className="mvv-icon">
                <i className="fas fa-eye"></i>
              </div>
              <h3>Visão</h3>
              <p>
                Ser uma universidade de excelência, reconhecida nacional e
                internacionalmente pela qualidade do ensino, pesquisa e
                extensão, contribuindo para a transformação da sociedade
                moçambicana.
              </p>
            </div>

            <div className="mvv-card">
              <div className="mvv-icon">
                <i className="fas fa-gem"></i>
              </div>
              <h3>Valores</h3>
              <ul>
                <li>Excelência Académica</li>
                <li>Inovação e Criatividade</li>
                <li>Ética e Integridade</li>
                <li>Responsabilidade Social</li>
                <li>Pluralismo e Diversidade</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Números e Estatísticas */}
      <section className="estatisticas-section section-padding" id="equipa">
        <div className="container">
          <h2 className="section-title">
            UEM em <span className="highlight">Números</span>
          </h2>

          <div className="estatisticas-grid">
            <div className="estatistica-item">
              <div className="numero">50,000+</div>
              <div className="label">Estudantes</div>
            </div>
            <div className="estatistica-item">
              <div className="numero">2,000+</div>
              <div className="label">Docentes</div>
            </div>
            <div className="estatistica-item">
              <div className="numero">11</div>
              <div className="label">Faculdades</div>
            </div>
            <div className="estatistica-item">
              <div className="numero">60+</div>
              <div className="label">Cursos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Equipe de Desenvolvimento */}
      <section className="desenvolvedores-section section-padding" id="desenvolvedores">
        <div className="container">
          <h2 className="section-title">
            Equipe de <span className="highlight">Desenvolvimento</span>
          </h2>
          <p className="section-subtitle">
            Os talentosos desenvolvedores por trás desta plataforma
          </p>

          <div className="desenvolvedores-grid">
            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/frank.jpeg" 
                  alt="Frank Francisco" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
              <h3>Frank Francisco</h3>
              <p className="dev-role">Administrador de Base de Dados</p>
              <p className="dev-desc">
                Especialista em administração de bases de dados e otimização de
                performance.
              </p>
              <div className="dev-social">
                <a href="mailto:frank@uem.ac.mz" className="social-link" aria-label="Email">
                  <i className="fas fa-envelope"></i>
                </a>
                <a href="https://linkedin.com/in/frank-francisco" className="social-link" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com/frank-francisco" className="social-link" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>

            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/joao.jpeg" 
                  alt="João Langa" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
              <h3>João Langa</h3>
              <p className="dev-role">FullStack Developer</p>
              <p className="dev-desc">
                Especialista em React.js, TypeScript e desenvolvimento fullstack. 
                Responsável pela arquitetura frontend moderna e experiência do usuário.
              </p>
              <div className="dev-social">
                <a href="mailto:joao.langa@uem.ac.mz" className="social-link" aria-label="Email">
                  <i className="fas fa-envelope"></i>
                </a>
                <a href="https://linkedin.com/in/joao-langa" className="social-link" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com/joao-langa" className="social-link" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>

            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/ussene.jpeg" 
                  alt="Ussene Matato" 
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                  }}
                />
              </div>
              <h3>Ussene Matato</h3>
              <p className="dev-role">Gestor do Projecto</p>
              <p className="dev-desc">
                Responsável por arquitetura e o desenho do sistema, coordenando
                toda a equipe de desenvolvimento.
              </p>
              <div className="dev-social">
                <a href="mailto:ussene.matato@uem.ac.mz" className="social-link" aria-label="Email">
                  <i className="fas fa-envelope"></i>
                </a>
                <a href="https://linkedin.com/in/ussene-matato" className="social-link" aria-label="LinkedIn">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://github.com/ussene-matato" className="social-link" aria-label="GitHub">
                  <i className="fab fa-github"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Sobre;