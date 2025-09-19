import React from 'react'
import './Sobre.css'

const Sobre = () => {
  return (
    <div className="sobre-container">
      {/* Hero Section */}
      <section className="sobre-hero">
        <div className="sobre-hero-content">
          <h1>Universidade Eduardo Mondlane</h1>
          <p>Excelência Académica, Inovação e Transformação Social desde 1962</p>
        </div>
      </section>

      {/* História da UEM */}
      <section className="historia-section">
        <div className="container">
          <div className="historia-content">
            <div className="historia-text">
              <h2>Nossa <span className="highlight">História</span></h2>
              <p>
                Fundada em 1962, a Universidade Eduardo Mondlane é a instituição de ensino superior 
                mais antiga e prestigiada de Moçambique. Nomeada em homenagem ao líder histórico da 
                FRELIMO, a UEM tem sido um pilar fundamental no desenvolvimento do país, formando 
                gerações de profissionais e líderes que contribuem para o progresso nacional.
              </p>
              <p>
                Ao longo dos anos, expandimos nossas faculdades, investimos em pesquisa de ponta e 
                estabelecemos parcerias internacionais, mantendo sempre o compromisso com a excelência 
                académica e a relevância social.
              </p>
            </div>
            <div className="historia-image">
              <img 
                src="src/assets/campus.jpg" 
                alt="Campus da UEM" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Missão, Visão e Valores */}
      <section className="mvv-section">
        <div className="container">
          <h2 className="section-title">Nossa <span className="highlight">Identidade</span></h2>
          
          <div className="mvv-grid">
            <div className="mvv-card">
              <div className="mvv-icon">🎯</div>
              <h3>Missão</h3>
              <p>
                Produzir, disseminar e aplicar conhecimento científico e tecnológico 
                para a formação de cidadãos competentes, éticos e inovadores, capazes 
                de contribuir para o desenvolvimento sustentável de Moçambique.
              </p>
            </div>
            
            <div className="mvv-card">
              <div className="mvv-icon">👁️</div>
              <h3>Visão</h3>
              <p>
                Ser uma universidade de excelência, reconhecida nacional e 
                internacionalmente pela qualidade do ensino, pesquisa e extensão, 
                contribuindo para a transformação da sociedade moçambicana.
              </p>
            </div>
            
            <div className="mvv-card">
              <div className="mvv-icon">💎</div>
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
      <section className="estatisticas-section">
        <div className="container">
          <h2 className="section-title">UEM em <span className="highlight">Números</span></h2>
          
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
      <section className="desenvolvedores-section">
        <div className="container">
          <h2 className="section-title">Equipe de <span className="highlight">Desenvolvimento</span></h2>
          <p className="section-subtitle">Os talentosos desenvolvedores por trás desta plataforma</p>
          
          <div className="desenvolvedores-grid">
            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/frank.jpeg" 
                  alt="Frank Francisco " 
                />
              </div>
              <h3>Frenk Francisco</h3>
              <p className="dev-role">Admistrador de Base de Dados</p>
              <p className="dev-desc">
                Especialista em Admistracao de Base de dados
              </p>
              <div className="dev-social">
                <a href="#" className="social-link">📧</a>
                <a href="#" className="social-link">💼</a>
                <a href="#" className="social-link">🐱</a>
              </div>
            </div>
            
            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/joao.jpeg" 
                  alt="João Langa" 
                />
              </div>
              <h3>João Langa</h3>
              <p className="dev-role">FullStack Developer</p>
              <p className="dev-desc">
                Especialista em Node.js e bancos de dados, garantindo a performance 
                e segurança da plataforma.
              </p>
              <div className="dev-social">
                <a href="#" className="social-link">📧</a>
                <a href="#" className="social-link">💼</a>
                <a href="#" className="social-link">🐱</a>
              </div>
            </div>
            
            <div className="desenvolvedor-card">
              <div className="dev-avatar">
                <img 
                  src="src/assets/ussene.jpeg" 
                  alt="João Langa" 
                />
              </div>
              <h3>Ussene Matato</h3>
              <p className="dev-role">Gestor do Projecto</p>
              <p className="dev-desc">
                Responsável por arquitetura e o desenho do sistema
              </p>
              <div className="dev-social">
                <a href="#" className="social-link">📧</a>
                <a href="#" className="social-link">💼</a>
                <a href="#" className="social-link">🐱</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer da Página Sobre */}
      <footer className="sobre-footer">
        <div className="container">
          <p>© 2023 Universidade Eduardo Mondlane. Todos os direitos reservados.</p>
          <p>Construindo o futuro da educação em Moçambique</p>
        </div>
      </footer>
    </div>
  )
}

export default Sobre