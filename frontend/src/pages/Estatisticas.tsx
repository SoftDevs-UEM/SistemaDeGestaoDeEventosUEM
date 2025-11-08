import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEventos } from '../context/EventosContext';
import { useAuth } from '../context/AuthContext';
import './Estatisticas.css';

const Estatisticas = () => {
  const { eventos } = useEventos();
  const { user } = useAuth();
  const [periodo, setPeriodo] = useState('30dias');
  const [dadosCarregando, setDadosCarregando] = useState(true);

  // Filtrar eventos do organizador atual
  const meusEventos = eventos.filter(evento => evento.organizadorId === user?.id);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => setDadosCarregando(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Calcular estatísticas
  const calcularEstatisticas = () => {
    const agora = new Date();
    let eventosFiltrados = meusEventos;

    // Filtrar por período
    switch (periodo) {
      case '7dias':
        const seteDiasAtras = new Date(agora.setDate(agora.getDate() - 7));
        eventosFiltrados = meusEventos.filter(e => new Date(e.date) >= seteDiasAtras);
        break;
      case '30dias':
        const trintaDiasAtras = new Date(agora.setDate(agora.getDate() - 30));
        eventosFiltrados = meusEventos.filter(e => new Date(e.date) >= trintaDiasAtras);
        break;
      case '90dias':
        const noventaDiasAtras = new Date(agora.setDate(agora.getDate() - 90));
        eventosFiltrados = meusEventos.filter(e => new Date(e.date) >= noventaDiasAtras);
        break;
      case 'ano':
        const inicioAno = new Date(agora.getFullYear(), 0, 1);
        eventosFiltrados = meusEventos.filter(e => new Date(e.date) >= inicioAno);
        break;
      default:
        eventosFiltrados = meusEventos;
    }

    const estatisticas = {
      totalEventos: eventosFiltrados.length,
      eventosConcluidos: eventosFiltrados.filter(e => new Date(e.date) < new Date()).length,
      eventosFuturos: eventosFiltrados.filter(e => new Date(e.date) >= new Date()).length,
      totalParticipantes: eventosFiltrados.reduce((acc, e) => acc + (e.participants || 0), 0),
      capacidadeTotal: eventosFiltrados.reduce((acc, e) => acc + (e.maxParticipants || 0), 0),
      taxaOcupacaoGeral: eventosFiltrados.length > 0 
        ? (eventosFiltrados.reduce((acc, e) => acc + (e.participants || 0), 0) / 
           eventosFiltrados.reduce((acc, e) => acc + (e.maxParticipants || 1), 0) * 100).toFixed(1)
        : 0,
      eventosPorCategoria: calcularEventosPorCategoria(eventosFiltrados),
      participacaoMensal: calcularParticipacaoMensal(eventosFiltrados),
      topEventos: eventosFiltrados
        .sort((a, b) => (b.participants || 0) - (a.participants || 0))
        .slice(0, 5),
      taxaCrescimento: calcularTaxaCrescimento(eventosFiltrados)
    };

    return estatisticas;
  };

  const calcularEventosPorCategoria = (eventos) => {
    const categorias = {};
    eventos.forEach(evento => {
      categorias[evento.category] = (categorias[evento.category] || 0) + 1;
    });
    return Object.entries(categorias).map(([categoria, quantidade]) => ({
      categoria,
      quantidade,
      porcentagem: eventos.length > 0 ? ((quantidade / eventos.length) * 100).toFixed(1) : '0'
    }));
  };

  const calcularParticipacaoMensal = (eventos) => {
    const meses = Array.from({ length: 12 }, (_, i) => ({
      mes: new Date(2024, i).toLocaleDateString('pt-BR', { month: 'short' }),
      participantes: 0,
      eventos: 0
    }));

    eventos.forEach(evento => {
      const mes = new Date(evento.date).getMonth();
      if (meses[mes]) {
        meses[mes].participantes += evento.participants || 0;
        meses[mes].eventos += 1;
      }
    });

    return meses;
  };

  const calcularTaxaCrescimento = (eventos) => {
    if (eventos.length < 2) return 0;
    
    const eventosOrdenados = eventos.sort((a, b) => new Date(a.date) - new Date(b.date));
    const metade = Math.floor(eventos.length / 2);
    const primeiroSemestre = eventosOrdenados.slice(0, metade);
    const segundoSemestre = eventosOrdenados.slice(metade);
    
    const mediaPrimeiro = primeiroSemestre.length > 0 ? 
      primeiroSemestre.reduce((acc, e) => acc + (e.participants || 0), 0) / primeiroSemestre.length : 0;
    const mediaSegundo = segundoSemestre.length > 0 ? 
      segundoSemestre.reduce((acc, e) => acc + (e.participants || 0), 0) / segundoSemestre.length : 0;
    
    return mediaPrimeiro > 0 ? ((mediaSegundo - mediaPrimeiro) / mediaPrimeiro * 100).toFixed(1) : 100;
  };

  const estatisticas = calcularEstatisticas();

  if (dadosCarregando) {
    return (
      <div className="organizadores-dashboard">
        <div className="dashboard-content">
          <div className="container">
            <div className="dashboard-layout">
              <div className="dashboard-sidebar">
                {/* Sidebar igual ao dashboard */}
                <nav className="sidebar-nav">
                  <Link to="/organizadores" className="nav-item">
                    📊 Visão Geral
                  </Link>
                  <Link to="/organizadores/criar-evento" className="nav-item">
                    ➕ Criar Evento
                  </Link>
                  <Link to="/organizadores/meus-eventos" className="nav-item">
                    📅 Meus Eventos
                  </Link>
                  <button className="nav-item active">
                    📈 Estatísticas
                  </button>
                  <button className="nav-item">
                    ⚙️ Configurações
                  </button>
                </nav>
              </div>
              
              <div className="dashboard-main">
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Carregando estatísticas...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="organizadores-dashboard">
      <div className="dashboard-content">
        <div className="container">
          <div className="dashboard-layout">
            {/* Sidebar */}
            <div className="dashboard-sidebar">
              <nav className="sidebar-nav">
                <Link to="/organizadores" className="nav-item">
                  📊 Visão Geral
                </Link>
                <Link to="/organizadores/criar-evento" className="nav-item">
                  ➕ Criar Evento
                </Link>
                <Link to="/organizadores/meus-eventos" className="nav-item">
                  📅 Meus Eventos
                </Link>
                <button className="nav-item active">
                  📈 Estatísticas
                </button>
                <button className="nav-item">
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
              <div className="tab-content">
                <div className="estatisticas-header-interno">
                  <h2>📊 Estatísticas Detalhadas</h2>
                  <p>Acompanhe o desempenho dos seus eventos e tome decisões baseadas em dados</p>
                </div>

                {/* Filtros */}
                <div className="filtros-section">
                  <div className="filtro-group">
                    <label>Período:</label>
                    <select 
                      value={periodo} 
                      onChange={(e) => setPeriodo(e.target.value)}
                      className="filtro-select"
                    >
                      <option value="7dias">Últimos 7 dias</option>
                      <option value="30dias">Últimos 30 dias</option>
                      <option value="90dias">Últimos 90 dias</option>
                      <option value="ano">Este ano</option>
                      <option value="todos">Todo o período</option>
                    </select>
                  </div>
                  
                  <div className="resumo-periodo">
                    <span>Mostrando dados de {estatisticas.totalEventos} eventos</span>
                  </div>
                </div>

                {/* Cards de Métricas Principais */}
                <div className="stats-grid expanded">
                  <div className="stat-card highlight">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-info">
                      <h3>{estatisticas.totalEventos}</h3>
                      <p>Total de Eventos</p>
                      <span className="stat-trend positive">
                        ↗ {estatisticas.taxaCrescimento}% crescimento
                      </span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <h3>{estatisticas.totalParticipantes}</h3>
                      <p>Total Participantes</p>
                      <span className="stat-subtitle">
                        {estatisticas.capacidadeTotal} capacidade
                      </span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <h3>{estatisticas.taxaOcupacaoGeral}%</h3>
                      <p>Taxa de Ocupação</p>
                      <span className="stat-subtitle">
                        Média geral
                      </span>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <h3>{estatisticas.eventosConcluidos}</h3>
                      <p>Eventos Concluídos</p>
                      <span className="stat-subtitle">
                        {estatisticas.eventosFuturos} futuros
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid de Visualizações */}
                <div className="visualizacoes-grid">
                  {/* Distribuição por Categoria */}
                  <div className="visualizacao-card">
                    <h3>📂 Distribuição por Categoria</h3>
                    <div className="categorias-list">
                      {estatisticas.eventosPorCategoria.map((item, index) => (
                        <div key={item.categoria} className="categoria-item">
                          <div className="categoria-header">
                            <span className="categoria-nome">
                              {obterIconeCategoria(item.categoria)} {formatarCategoria(item.categoria)}
                            </span>
                            <span className="categoria-stats">
                              {item.quantidade} ({item.porcentagem}%)
                            </span>
                          </div>
                          <div className="categoria-bar">
                            <div 
                              className="categoria-fill"
                              style={{ width: `${item.porcentagem}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Participação Mensal */}
                  <div className="visualizacao-card">
                    <h3>📅 Participação Mensal</h3>
                    <div className="grafico-barras">
                      {estatisticas.participacaoMensal.map((mes, index) => (
                        <div key={index} className="barra-container">
                          <div className="barra-label">{mes.mes}</div>
                          <div className="barra-wrapper">
                            <div 
                              className="barra-participantes"
                              style={{ 
                                height: `${Math.max(10, (mes.participantes / Math.max(1, ...estatisticas.participacaoMensal.map(m => m.participantes))) * 100)}%` 
                              }}
                            >
                              <span className="barra-value">{mes.participantes}</span>
                            </div>
                          </div>
                          <div className="barra-events">{mes.eventos} eventos</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Eventos */}
                  <div className="visualizacao-card">
                    <h3>🏆 Eventos Mais Populares</h3>
                    <div className="top-eventos-list">
                      {estatisticas.topEventos.map((evento, index) => (
                        <div key={evento.id} className="top-evento-item">
                          <div className="evento-rank">
                            <span className={`rank-badge rank-${index + 1}`}>
                              #{index + 1}
                            </span>
                          </div>
                          <div className="evento-info">
                            <h4>{evento.title}</h4>
                            <p>📅 {new Date(evento.date).toLocaleDateString('pt-BR')}</p>
                          </div>
                          <div className="evento-stats">
                            <div className="participantes-count">
                              👥 {evento.participants || 0}
                            </div>
                            <div className="ocupacao">
                              {evento.maxParticipants ? 
                                `${((evento.participants / evento.maxParticipants) * 100).toFixed(0)}% lotação` : 
                                '0% lotação'
                              }
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Insights e Recomendações */}
                  <div className="visualizacao-card insights">
                    <h3>💡 Insights e Recomendações</h3>
                    <div className="insights-list">
                      {estatisticas.taxaOcupacaoGeral < 50 && (
                        <div className="insight-item">
                          <span className="insight-icon">🎯</span>
                          <div>
                            <h4>Oportunidade de Melhoria</h4>
                            <p>Sua taxa de ocupação está baixa. Considere melhorar as estratégias de divulgação.</p>
                          </div>
                        </div>
                      )}
                      
                      {estatisticas.eventosPorCategoria.length > 0 && (
                        <div className="insight-item">
                          <span className="insight-icon">📂</span>
                          <div>
                            <h4>Categoria em Destaque</h4>
                            <p>
                              {formatarCategoria(estatisticas.eventosPorCategoria[0].categoria)} é sua categoria mais popular 
                              ({estatisticas.eventosPorCategoria[0].porcentagem}% dos eventos).
                            </p>
                          </div>
                        </div>
                      )}

                      {estatisticas.taxaCrescimento > 0 && (
                        <div className="insight-item">
                          <span className="insight-icon">📈</span>
                          <div>
                            <h4>Crescimento Positivo</h4>
                            <p>Excelente! Sua audiência está crescendo {estatisticas.taxaCrescimento}% em relação ao período anterior.</p>
                          </div>
                        </div>
                      )}

                      <div className="insight-item">
                        <span className="insight-icon">💡</span>
                        <div>
                          <h4>Próximos Passos</h4>
                          <p>Considere replicar o formato dos seus eventos mais populares para aumentar o engajamento.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="acoes-section">
                  <h3>📋 Ações Baseadas em Dados</h3>
                  <div className="acoes-grid">
                    <button className="acao-btn">
                      📥 Exportar Relatório
                    </button>
                    <button className="acao-btn">
                      📧 Enviar por Email
                    </button>
                    <button className="acao-btn">
                      🖨️ Imprimir
                    </button>
                    <Link to="/organizadores/criar-evento" className="acao-btn highlight">
                      ➕ Criar Novo Evento
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Funções auxiliares
const obterIconeCategoria = (categoria) => {
  const icones = {
    'cientificos': '🔬',
    'culturais': '🎭',
    'cursos': '📚',
    'workshops': '🛠️',
    'palestras': '🎤',
    'desportivos': '⚽',
    'social': '🎉',
    'academico': '🏛️'
  };
  return icones[categoria] || '📁';
};

const formatarCategoria = (categoria) => {
  const formatacoes = {
    'cientificos': 'Científicos',
    'culturais': 'Culturais',
    'cursos': 'Cursos',
    'workshops': 'Workshops',
    'palestras': 'Palestras',
    'desportivos': 'Desportivos',
    'social': 'Social',
    'academico': 'Acadêmico'
  };
  return formatacoes[categoria] || categoria;
};

export default Estatisticas;