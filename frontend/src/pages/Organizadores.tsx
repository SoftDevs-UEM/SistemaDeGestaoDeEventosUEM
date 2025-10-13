import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEventos } from '../context/EventosContext';
import { useAuth } from '../context/AuthContext';
import './Organizadores.css';

const Organizadores = () => {
  const { eventos } = useEventos();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Filtrar eventos do organizador atual
  const meusEventos = eventos.filter(evento => evento.organizadorId === user?.id);
  
  // Estatísticas básicas
  const estatisticas = {
    totalEventos: meusEventos.length,
    eventosAtivos: meusEventos.filter(e => new Date(e.date) > new Date()).length,
    totalParticipantes: meusEventos.reduce((acc, evento) => acc + evento.participants, 0),
    taxaOcupacao: meusEventos.length > 0 
      ? (meusEventos.reduce((acc, evento) => acc + evento.participants, 0) / 
         meusEventos.reduce((acc, evento) => acc + evento.maxParticipants, 0) * 100).toFixed(1)
      : 0
  };

  // Próximos eventos
  const proximosEventos = meusEventos
    .filter(evento => new Date(evento.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3);

  return (
    <div className="organizadores-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="container">
          <h1>Dashboard do Organizador</h1>
          <p>Gerencie seus eventos e acompanhe o desempenho</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="container">
          <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
              <nav className="sidebar-nav">
                <button 
                  className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  📊 Visão Geral
                </button>
                <Link to="/organizadores/criar-evento" className="nav-item">
                  ➕ Criar Evento
                </Link>
                <button 
                  className={`nav-item ${activeTab === 'meus-eventos' ? 'active' : ''}`}
                  onClick={() => setActiveTab('meus-eventos')}
                >
                  📅 Meus Eventos
                </button>
                <button 
                  className={`nav-item ${activeTab === 'estatisticas' ? 'active' : ''}`}
                  onClick={() => setActiveTab('estatisticas')}
                >
                  📈 Estatísticas
                </button>
                <button 
                  className={`nav-item ${activeTab === 'configuracoes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('configuracoes')}
                >
                  ⚙️ Configurações
                </button>
              </nav>

              {/* Card de Ações Rápidas */}
              <div className="quick-actions">
                <h3>Ações Rápidas</h3>
                <Link to="/organizadores/criar-evento" className="quick-action-btn">
                  Criar Novo Evento
                </Link>
                <button className="quick-action-btn">
                  Exportar Dados
                </button>
                <button className="quick-action-btn">
                  Ver Inscrições
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="dashboard-main">
              {/* Visão Geral */}
              {activeTab === 'overview' && (
                <div className="tab-content">
                  <h2>Visão Geral</h2>
                  
                  {/* Cards de Estatísticas */}
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon">📅</div>
                      <div className="stat-info">
                        <h3>{estatisticas.totalEventos}</h3>
                        <p>Total de Eventos</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">✅</div>
                      <div className="stat-info">
                        <h3>{estatisticas.eventosAtivos}</h3>
                        <p>Eventos Ativos</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">👥</div>
                      <div className="stat-info">
                        <h3>{estatisticas.totalParticipantes}</h3>
                        <p>Total Participantes</p>
                      </div>
                    </div>
                    
                    <div className="stat-card">
                      <div className="stat-icon">📈</div>
                      <div className="stat-info">
                        <h3>{estatisticas.taxaOcupacao}%</h3>
                        <p>Taxa de Ocupação</p>
                      </div>
                    </div>
                  </div>

                  {/* Próximos Eventos */}
                  <div className="upcoming-events">
                    <h3>Próximos Eventos</h3>
                    {proximosEventos.length > 0 ? (
                      <div className="events-list">
                        {proximosEventos.map(evento => (
                          <div key={evento.id} className="event-card">
                            <img src={evento.image} alt={evento.title} />
                            <div className="event-info">
                              <h4>{evento.title}</h4>
                              <p>📅 {new Date(evento.date).toLocaleDateString('pt-BR')}</p>
                              <p>👥 {evento.participants}/{evento.maxParticipants} participantes</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="no-events">Nenhum evento próximo agendado.</p>
                    )}
                  </div>

                  {/* Ações Recomendadas */}
                  <div className="recommended-actions">
                    <h3>Ações Recomendadas</h3>
                    <div className="actions-list">
                      <div className="action-item">
                        <span>🎯</span>
                        <div>
                          <h4>Crie seu primeiro evento</h4>
                          <p>Comece a compartilhar suas atividades com a comunidade</p>
                        </div>
                        <Link to="/organizadores/criar-evento" className="action-btn">
                          Criar Evento
                        </Link>
                      </div>
                      
                      <div className="action-item">
                        <span>📊</span>
                        <div>
                          <h4>Verifique as estatísticas</h4>
                          <p>Acompanhe o desempenho dos seus eventos</p>
                        </div>
                        <button 
                          className="action-btn"
                          onClick={() => setActiveTab('estatisticas')}
                        >
                          Ver Estatísticas
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Meus Eventos */}
              {activeTab === 'meus-eventos' && (
                <div className="tab-content">
                  <h2>Meus Eventos</h2>
                  <div className="events-management">
                    {/* Aqui vai a lista completa de eventos com opções de editar/excluir */}
                  </div>
                </div>
              )}

              {/* Estatísticas */}
              {activeTab === 'estatisticas' && (
                <div className="tab-content">
                  <h2>Estatísticas Detalhadas</h2>
                  {/* Gráficos e estatísticas detalhadas */}
                </div>
              )}

              {/* Configurações */}
              {activeTab === 'configuracoes' && (
                <div className="tab-content">
                  <h2>Configurações do Organizador</h2>
                  {/* Configurações de perfil e preferências */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organizadores;