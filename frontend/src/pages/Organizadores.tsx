import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEventos } from '../context/EventosContext';
import './Organizadores.css';

type EventStats = {
  totalEventos: number;
  eventosAtivos: number;
  eventosFinalizados: number;
};

type ActiveView = 'dashboard' | 'criar-evento' | 'meus-eventos';

export default function Organizadores() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout, user } = useAuth();
  const { 
    events, 
    loading, 
    createEvent, 
    deleteEvent,
    loadEvents 
  } = useEventos();
  
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [eventStats, setEventStats] = useState<EventStats>({
    totalEventos: 0,
    eventosAtivos: 0,
    eventosFinalizados: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // Estados para o formulário de criar evento
  const [eventoData, setEventoData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'academico' as 'academico' | 'cultural' | 'desportivo',
    category: '',
    description: '',
    max_participants: '',
    target_audience: '',
    image: '',
    requirements: ''
  });
  
  const [success, setSuccess] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const categories = [
    { value: 'cientificos', label: '🔬 Científicos' },
    { value: 'culturais', label: '🎭 Culturais' },
    { value: 'cursos', label: '📚 Cursos' },
    { value: 'workshops', label: '🛠️ Workshops' },
    { value: 'palestras', label: '🎤 Palestras' },
    { value: 'desportivos', label: '⚽ Desportivos' },
    { value: 'social', label: '🎉 Social' },
    { value: 'academico', label: '🏛️ Académico' },
  ];

  // Redirecionar se não for promotor ou admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userType !== 'promotor' && userType !== 'admin') {
      navigate('/');
      return;
    }
    
    loadStatistics();
  }, [isAuthenticated, userType, navigate, events]);

  const loadStatistics = () => {
    setStatsLoading(true);
    
    try {
      // Filtrar eventos do promotor logado
      const meusEventos = events.filter(event => 
        event.promoter_id === user?.id || userType === 'admin'
      );
      
      // Estatísticas baseadas apenas na data (sem status)
      const eventosAtivos = meusEventos.filter(event => 
        new Date(event.date) >= new Date()
      );
      
      const eventosFinalizados = meusEventos.filter(event => 
        new Date(event.date) < new Date()
      );

      setEventStats({
        totalEventos: meusEventos.length,
        eventosAtivos: eventosAtivos.length,
        eventosFinalizados: eventosFinalizados.length
      });

      // Eventos recentes (últimos 5) - ordenados por data de criação
      const eventosOrdenados = [...meusEventos].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentEvents(eventosOrdenados.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setEventStats({
        totalEventos: 0,
        eventosAtivos: 0,
        eventosFinalizados: 0
      });
      setRecentEvents([]);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setEventoData({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'academico',
      category: '',
      description: '',
      max_participants: '',
      target_audience: '',
      image: '',
      requirements: ''
    });
    setSuccess(false);
  };

  // Função para lidar com mudanças nos campos do evento
// No seu componente Organizadores, adicione validação para a imagem
const handleInputChange = (field: string, value: string) => {
  // Validação específica para campo de imagem
  if (field === 'image') {
    // Se for uma string base64 muito longa, trunque ou mostre erro
    if (value.startsWith('data:image') && value.length > 10000) {
      alert('A imagem é muito grande. Por favor, use uma imagem com tamanho menor ou um URL de imagem.');
      return;
    }
  }
  
  setEventoData(prev => ({
    ...prev,
    [field]: value
  }));
};

  // Função para criar evento usando o contexto
  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      // Validar campos obrigatórios
      if (!eventoData.title || !eventoData.description || !eventoData.date || 
          !eventoData.time || !eventoData.location || !eventoData.type || 
          !eventoData.category || !eventoData.max_participants || !eventoData.target_audience) {
        alert('Preencha todos os campos obrigatórios.');
        return;
      }

      // Usar o contexto para criar o evento
      await createEvent({
        title: eventoData.title,
        description: eventoData.description,
        date: eventoData.date,
        time: eventoData.time,
        location: eventoData.location,
        type: eventoData.type,
        category: eventoData.category,
        max_participants: parseInt(eventoData.max_participants),
        promoter_id: user.id,
        target_audience: eventoData.target_audience,
        image: eventoData.image || null,
        requirements: eventoData.requirements || null
        // Sem status - evento é listado imediatamente
      });

      // Limpar formulário e mostrar sucesso
      setEventoData({
        title: '',
        date: '',
        time: '',
        location: '',
        type: 'academico',
        category: '',
        description: '',
        max_participants: '',
        target_audience: '',
        image: '',
        requirements: ''
      });
      
      setSuccess(true);
      
      // Resetar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
        setActiveView('dashboard');
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar evento. Tente novamente.');
    } finally {
      setFormLoading(false);
    }
  };

  // Função para excluir evento
  const handleExcluirEvento = async (eventId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await deleteEvent(eventId);
        loadStatistics(); // Recarregar estatísticas
      } catch (error) {
        console.error('Erro ao excluir evento:', error);
        alert('Erro ao excluir evento.');
      }
    }
  };

  const formatarData = (dataString: string) => {
    return new Date(dataString).toLocaleDateString('pt-BR');
  };

  // Verificar se evento está ativo ou finalizado baseado na data
  const getEventoState = (evento: any) => {
    const hoje = new Date();
    const dataEvento = new Date(evento.date);
    
    if (dataEvento < hoje) {
      return { class: 'evento-finalizado', label: '✅ Finalizado', icon: '✅' };
    } else {
      return { class: 'evento-ativo', label: '🟢 Ativo', icon: '🟢' };
    }
  };

  const renderDashboardView = () => (
    <>
      {/* Estatísticas de Eventos */}
      <section className="stats-section">
        <h2>📊 Estatísticas dos Meus Eventos</h2>
        <div className="stats-grid">
          <div className="stat-card event-stat">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Total de Eventos</h3>
              <span className="stat-number">{eventStats.totalEventos}</span>
              <span className="stat-change">
                {eventStats.eventosAtivos} ativos
              </span>
            </div>
          </div>

          <div className="stat-card active-event-stat">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <h3>Eventos Ativos</h3>
              <span className="stat-number">{eventStats.eventosAtivos}</span>
              <span className="stat-percentage">
                {eventStats.totalEventos > 0 ? 
                  Math.round((eventStats.eventosAtivos / eventStats.totalEventos) * 100) : 0
                }% do total
              </span>
            </div>
          </div>

          <div className="stat-card finished-event-stat">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Eventos Finalizados</h3>
              <span className="stat-number">{eventStats.eventosFinalizados}</span>
              <span className="stat-percentage">
                {eventStats.totalEventos > 0 ? 
                  Math.round((eventStats.eventosFinalizados / eventStats.totalEventos) * 100) : 0
                }% do total
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos Recentes */}
      <section className="recent-events-full">
        <div className="section-header">
          <h2>🆕 Eventos Recentes</h2>
          <span className="section-badge">{recentEvents.length} eventos</span>
        </div>

        {recentEvents.length > 0 ? (
          <div className="events-list-full">
            {recentEvents.map((evento) => {
              const estado = getEventoState(evento);
              return (
                <div key={evento.id} className="event-card-full">
                  <div className="event-avatar">
                    {evento.title ? evento.title.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="event-info">
                    <div className="event-header">
                      <h3>{evento.title}</h3>
                      <span className={`event-state ${estado.class}`}>
                        {estado.icon} {estado.label}
                      </span>
                    </div>
                    <p className="event-description">
                      {evento.description.length > 150 
                        ? `${evento.description.substring(0, 150)}...` 
                        : evento.description
                      }
                    </p>
                    <div className="event-details">
                      <span>📅 {formatarData(evento.date)} às {evento.time}</span>
                      <span>📍 {evento.location}</span>
                      <span>👥 {evento.registrations_count || 0} / {evento.max_participants} inscrições</span>
                      <span>🏷️ {evento.category} • {evento.type}</span>
                    </div>
                    <div className="event-actions">
                      <button className="btn-view" onClick={() => navigate(`/eventos/${evento.id}`)}>
                        👁️ Ver Detalhes
                      </button>
                      <button className="btn-edit" onClick={() => {/* Implementar edição */}}>
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-events-full">
            <div className="no-events-content">
              <div className="no-events-icon">📅</div>
              <h3>Nenhum evento criado ainda</h3>
              <p>Comece criando seu primeiro evento para a comunidade académica</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('criar-evento')}
              >
                ➕ Criar Primeiro Evento
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );

  const renderCriarEventoView = () => (
    <div className="criar-evento-container">
      {/* Header */}
      <div className="criar-evento-header">
        <button onClick={handleBackToDashboard} className="back-button">
          ← Voltar para Dashboard
        </button>
        <h1>➕ Criar Novo Evento</h1>
      </div>

      {/* Form Section */}
      <div className="criar-evento-content">
        <div className="form-container">
          <form className="event-form" onSubmit={handleCriarEvento}>
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Carregando...</p>
              </div>
            )}

            {/* Seção Principal */}
            <div className="form-section">
              <h2>Informações Básicas</h2>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="title">Título do Evento *</label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={eventoData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Ex: Conferência de Tecnologia 2024"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="category">Categoria *</label>
                  <select
                    id="category"
                    name="category"
                    value={eventoData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    required
                    disabled={formLoading}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="type">Tipo de Evento *</label>
                  <select
                    id="type"
                    name="type"
                    value={eventoData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    required
                    disabled={formLoading}
                  >
                    <option value="academico">Académico</option>
                    <option value="cultural">Cultural</option>
                    <option value="desportivo">Desportivo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="date">Data *</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={eventoData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="time">Hora *</label>
                  <input
                    id="time"
                    name="time"
                    type="time"
                    value={eventoData.time}
                    onChange={(e) => handleInputChange('time', e.target.value)}
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="location">Local *</label>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={eventoData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="Ex: Auditório Principal, UEM"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="max_participants">Máx. Participantes *</label>
                  <input
                    id="max_participants"
                    name="max_participants"
                    type="number"
                    value={eventoData.max_participants}
                    onChange={(e) => handleInputChange('max_participants', e.target.value)}
                    min="1"
                    max="1000"
                    placeholder="Ex: 100"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="target_audience">Público-Alvo *</label>
                  <input
                    id="target_audience"
                    name="target_audience"
                    type="text"
                    value={eventoData.target_audience}
                    onChange={(e) => handleInputChange('target_audience', e.target.value)}
                    placeholder="Ex: Estudantes de Engenharia, Comunidade Académica"
                    required
                    disabled={formLoading}
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="image">Imagem do Evento (URL)</label>
                  <input
                    id="image"
                    name="image"
                    type="url"
                    value={eventoData.image}
                    onChange={(e) => handleInputChange('image', e.target.value)}
                    placeholder="https://exemplo.com/imagem-evento.jpg"
                    disabled={formLoading}
                  />
                  <small className="helper-text">
                    Cole a URL de uma imagem representativa do evento
                  </small>
                </div>
              </div>
            </div>

            {/* Seção Descrição */}
            <div className="form-section">
              <h2>Descrição e Requisitos</h2>
              <div className="form-group full-width">
                <label htmlFor="description">Descrição Detalhada *</label>
                <textarea
                  id="description"
                  name="description"
                  value={eventoData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva o evento em detalhes: objetivos, público-alvo, programação, palestrantes, etc."
                  rows={6}
                  required
                  disabled={formLoading}
                />
                <small className="helper-text">
                  Mínimo 100 caracteres. Esta descrição será visível para todos os participantes.
                </small>
              </div>

              <div className="form-group full-width">
                <label htmlFor="requirements">Requisitos para Participação</label>
                <textarea
                  id="requirements"
                  name="requirements"
                  value={eventoData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="Ex: Trazer computador próprio, Conhecimentos básicos em programação"
                  rows={3}
                  disabled={formLoading}
                />
              </div>
            </div>

            {/* Preview da Imagem */}
            {eventoData.image && (
              <div className="form-section">
                <h2>Pré-visualização</h2>
                <div className="image-preview">
                  <img src={eventoData.image} alt="Preview do evento" onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-event-image.jpg';
                  }} />
                  <p>Pré-visualização da imagem do evento</p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={handleBackToDashboard}
                disabled={formLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={formLoading}
              >
                {formLoading ? (
                  <>
                    <div className="loading-spinner"></div>
                    Cadastrando...
                  </>
                ) : (
                  'Cadastrar Evento'
                )}
              </button>
            </div>

            {/* Mensagem de Sucesso */}
            {success && (
              <div className="success-message">
                <div className="success-icon">✓</div>
                <div>
                  <h3>Evento cadastrado com sucesso!</h3>
                  <p>O evento foi criado e já está disponível para visualização.</p>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );

  const renderMeusEventosView = () => (
    <div className="management-view">
      <div className="management-header">
        <h2>📅 Meus Eventos</h2>
        <span className="total-badge">{eventStats.totalEventos} eventos</span>
      </div>

      <div className="events-table-container">
        {recentEvents.length > 0 ? (
          <table className="events-table">
            <thead>
              <tr>
                <th>Evento</th>
                <th>Data</th>
                <th>Estado</th>
                <th>Inscrições</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((evento) => {
                const estado = getEventoState(evento);
                return (
                  <tr key={evento.id}>
                    <td>
                      <div className="event-info-cell">
                        <div className="event-avatar small">
                          {evento.title ? evento.title.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div>
                          <strong>{evento.title}</strong>
                          <br />
                          <span className="event-category">{evento.category} • {evento.type}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      {formatarData(evento.date)} às {evento.time}
                    </td>
                    <td>
                      <span className={`event-state ${estado.class}`}>
                        {estado.icon} {estado.label}
                      </span>
                    </td>
                    <td>
                      {evento.registrations_count || 0} / {evento.max_participants}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-edit" onClick={() => {/* Implementar edição */}}>
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleExcluirEvento(evento.id)}
                          disabled={evento.registrations_count > 0}
                        >
                          🗑️ Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>Nenhum evento criado ainda</p>
            <button 
              className="btn-primary"
              onClick={() => setActiveView('criar-evento')}
            >
              ➕ Criar Primeiro Evento
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (statsLoading) {
    return (
      <div className="organizadores-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando seus eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="organizadores-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>
            {activeView === 'dashboard' ? '👨‍🏫 Dashboard do Organizador' : 
             activeView === 'criar-evento' ? '➕ Criar Evento' :
             '📅 Meus Eventos'}
          </h1>
          <p>
            {activeView === 'dashboard' 
              ? 'Gerencie seus eventos e acompanhe o desempenho' 
              : activeView === 'criar-evento'
              ? 'Crie um novo evento para a comunidade acadêmica'
              : 'Gerencie todos os seus eventos criados'
            }
          </p>
        </div>
        <div className="header-actions">
          {activeView === 'dashboard' && (
            <button className="refresh-btn" onClick={loadStatistics}>
              🔄 Atualizar
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3>📊 Dashboard</h3>
              <button 
                className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveView('dashboard')}
              >
                🏠 Visão Geral
              </button>
            </div>

            <div className="nav-section">
              <h3>📅 Gestão de Eventos</h3>
              <button 
                className={`nav-btn ${activeView === 'criar-evento' ? 'active' : ''}`}
                onClick={() => setActiveView('criar-evento')}
              >
                ➕ Criar Evento
              </button>
              <button 
                className={`nav-btn ${activeView === 'meus-eventos' ? 'active' : ''}`}
                onClick={() => setActiveView('meus-eventos')}
              >
                📋 Meus Eventos
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'criar-evento' && renderCriarEventoView()}
          {activeView === 'meus-eventos' && renderMeusEventosView()}
        </main>
      </div>
    </div>
  );
}