import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Organizadores.css';

type EventStats = {
  totalEventos: number;
  eventosAtivos: number;
  eventosFinalizados: number;
  eventosPendentes: number;
  totalInscricoes: number;
};

type ActiveView = 'dashboard' | 'criar-evento' | 'meus-eventos' | 'estatisticas' | 'configuracoes';

export default function Organizadores() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout } = useAuth();
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [eventStats, setEventStats] = useState<EventStats>({
    totalEventos: 0,
    eventosAtivos: 0,
    eventosFinalizados: 0,
    eventosPendentes: 0,
    totalInscricoes: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados para o formulário de criar evento
  const [eventoData, setEventoData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    image: '',
    category: '',
    description: '',
    maxParticipants: '',
    dataInicio: '',
    dataFim: '',
    endereco: '',
    cidade: '',
    coordenadas: {
      lat: '',
      lng: ''
    }
  });
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState({ lat: -25.9664, lng: 32.5806 });
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
  React.useEffect(() => {
    if (!isAuthenticated || (userType !== 'promotor' && userType !== 'admin')) {
      navigate('/login');
    }
  }, [isAuthenticated, userType, navigate]);

  // Carregar estatísticas
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = () => {
    setLoading(true);
    
    // Simular carregamento de dados
    setTimeout(() => {
      const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]');
      
      // Filtrar eventos do organizador atual (simulação)
      const meusEventos = eventos;
      
      // Estatísticas de eventos
      const eventosAtivos = meusEventos.filter((e: any) => 
        new Date(e.dataFim) >= new Date() && new Date(e.dataInicio) <= new Date()
      );
      const eventosFinalizados = meusEventos.filter((e: any) => new Date(e.dataFim) < new Date());
      const eventosPendentes = meusEventos.filter((e: any) => !e.aprovado);

      setEventStats({
        totalEventos: meusEventos.length,
        eventosAtivos: eventosAtivos.length,
        eventosFinalizados: eventosFinalizados.length,
        eventosPendentes: eventosPendentes.length,
        totalInscricoes: inscricoes.filter((i: any) => 
          meusEventos.some((e: any) => e.id === i.eventoId)
        ).length
      });

      // Eventos recentes (últimos 5)
      setRecentEvents(meusEventos.slice(-5).reverse());
      setLoading(false);
    }, 1000);
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
      image: '',
      category: '',
      description: '',
      maxParticipants: '',
      dataInicio: '',
      dataFim: '',
      endereco: '',
      cidade: '',
      coordenadas: {
        lat: '',
        lng: ''
      }
    });
    setShowMap(false);
    setSuccess(false);
  };

  // Função para lidar com mudanças nos campos do evento
  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEventoData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setEventoData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Função para criar evento
  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    // Validações básicas
    if (!eventoData.title || !eventoData.category || !eventoData.date || 
        !eventoData.time || !eventoData.location || !eventoData.description || 
        !eventoData.maxParticipants) {
      alert('Preencha todos os campos obrigatórios.');
      setFormLoading(false);
      return;
    }

    // Combinar data e hora
    const dataInicio = new Date(`${eventoData.date}T${eventoData.time}`);
    const dataFim = new Date(dataInicio.getTime() + 2 * 60 * 60 * 1000); // +2 horas

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Criar objeto do evento
    const novoEvento = {
      id: Date.now().toString(),
      titulo: eventoData.title,
      categoria: eventoData.category,
      dataInicio: dataInicio.toISOString(),
      dataFim: dataFim.toISOString(),
      descricao: eventoData.description,
      localizacao: eventoData.location,
      endereco: eventoData.endereco,
      cidade: eventoData.cidade,
      image: eventoData.image,
      vagas: parseInt(eventoData.maxParticipants),
      coordenadas: eventoData.coordenadas,
      organizadorId: 'current-user-id',
      aprovado: userType === 'admin',
      inscricoes: 0,
      participantes: 0,
      dataCriacao: new Date().toISOString()
    };

    // Salvar no localStorage
    const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
    eventos.push(novoEvento);
    localStorage.setItem('eventos', JSON.stringify(eventos));

    // Limpar formulário e mostrar sucesso
    setEventoData({
      title: '',
      date: '',
      time: '',
      location: '',
      image: '',
      category: '',
      description: '',
      maxParticipants: '',
      dataInicio: '',
      dataFim: '',
      endereco: '',
      cidade: '',
      coordenadas: {
        lat: '',
        lng: ''
      }
    });
    
    setSuccess(true);
    setFormLoading(false);
    
    // Resetar mensagem de sucesso após 3 segundos
    setTimeout(() => {
      setSuccess(false);
    }, 3000);
    
    loadStatistics(); // Recarregar estatísticas
  };

  // Função para selecionar coordenadas no mapa
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Simular coordenadas (em produção, usar uma API de mapas real)
    const lat = (-25.9664 + (y / rect.height - 0.5) * 0.01).toFixed(6);
    const lng = (32.5806 + (x / rect.width - 0.5) * 0.01).toFixed(6);
    
    setEventoData(prev => ({
      ...prev,
      coordenadas: { lat, lng }
    }));
    
    setMapCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
  };

  // Função para usar localização atual
  const handleUsarLocalizacaoAtual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude.toFixed(6);
          const lng = position.coords.longitude.toFixed(6);
          
          setEventoData(prev => ({
            ...prev,
            coordenadas: { lat, lng }
          }));
          
          setMapCoords({ lat: parseFloat(lat), lng: parseFloat(lng) });
          alert(`Localização definida: ${lat}, ${lng}`);
        },
        (error) => {
          alert('Não foi possível obter a localização atual.');
          console.error('Erro de geolocalização:', error);
        }
      );
    } else {
      alert('Geolocalização não suportada pelo navegador.');
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

          <div className="stat-card inscription-stat">
            <div className="stat-icon">📝</div>
            <div className="stat-info">
              <h3>Total de Inscrições</h3>
              <span className="stat-number">{eventStats.totalInscricoes}</span>
              <span className="stat-change">
                Média: {eventStats.totalEventos > 0 ? 
                  Math.round(eventStats.totalInscricoes / eventStats.totalEventos) : 0
                } por evento
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
            {recentEvents.map((evento, index) => (
              <div key={index} className="event-card-full">
                <div className="event-avatar">
                  {evento.titulo ? evento.titulo.charAt(0).toUpperCase() : 'E'}
                </div>
                <div className="event-info">
                  <div className="event-header">
                    <h3>{evento.titulo || 'Evento'}</h3>
                    <span className={`event-status ${
                      new Date(evento.dataFim) < new Date() ? 'finished' : 
                      new Date(evento.dataInicio) <= new Date() ? 'active' : 'pending'
                    }`}>
                      {new Date(evento.dataFim) < new Date() ? '✅ Finalizado' : 
                       new Date(evento.dataInicio) <= new Date() ? '🟢 Ativo' : '⏳ Pendente'}
                    </span>
                  </div>
                  <p className="event-description">
                    {evento.descricao || 'Sem descrição disponível'}
                  </p>
                  <div className="event-details">
                    <span>📅 {evento.dataInicio ? new Date(evento.dataInicio).toLocaleDateString('pt-BR') : 'Data não disponível'}</span>
                    <span>📍 {evento.localizacao || 'Local não definido'}</span>
                    <span>👥 {evento.inscricoes || 0} / {evento.vagas || 'N/A'} inscrições</span>
                  </div>
                  <div className="event-actions">
                    <button className="btn-view">
                      👁️ Ver Detalhes
                    </button>
                    <button className="btn-edit">
                      ✏️ Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
    

      {/* Form Section */}
      <div className="criar-evento-content">
        <div className="form-container">
          <form className="event-form" onSubmit={handleCriarEvento}>
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
                  <label htmlFor="date">Data *</label>
                  <input
                    id="date"
                    name="date"
                    type="date"
                    value={eventoData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    required
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
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="maxParticipants">Máx. Participantes *</label>
                  <input
                    id="maxParticipants"
                    name="maxParticipants"
                    type="number"
                    value={eventoData.maxParticipants}
                    onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                    min="1"
                    max="1000"
                    placeholder="Ex: 100"
                    required
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
                  />
                  <small className="helper-text">
                    Cole a URL de uma imagem representativa do evento
                  </small>
                </div>
              </div>
            </div>

            {/* Seção Descrição */}
            <div className="form-section">
              <h2>Descrição do Evento</h2>
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
                />
                <small className="helper-text">
                  Mínimo 100 caracteres. Esta descrição será visível para todos os participantes.
                </small>
              </div>
            </div>

           

            {/* Seção de Mapa */}
            <div className="form-section">
              <h2>📍 Localização no Mapa</h2>
              <div className="map-actions">
                <button 
                  type="button" 
                  className="btn-map"
                  onClick={() => setShowMap(!showMap)}
                >
                  {showMap ? '👁️ Ocultar Mapa' : '🗺️ Mostrar Mapa'}
                </button>
                <button 
                  type="button" 
                  className="btn-location"
                  onClick={handleUsarLocalizacaoAtual}
                >
                  📍 Usar Minha Localização
                </button>
              </div>

              {showMap && (
                <div className="map-container">
                  <div 
                    className="interactive-map"
                    onClick={handleMapClick}
                    title="Clique no mapa para definir a localização"
                  >
                    <div className="map-placeholder">
                      <div className="map-grid">
                        {Array.from({ length: 10 }).map((_, i) =>
                          Array.from({ length: 10 }).map((_, j) =>
                            <div key={`${i}-${j}`} className="map-cell"></div>
                          )
                        )}
                      </div>
                      <div 
                        className="map-marker"
                        style={{
                          left: `${50 + (mapCoords.lng - 32.5806) * 10000}%`,
                          top: `${50 + (mapCoords.lat + 25.9664) * 10000}%`
                        }}
                      >
                        📍
                      </div>
                    </div>
                  </div>
                  
                  <div className="coordinates-display">
                    <div className="coordinate-inputs">
                      <div className="coordinate-group">
                        <label>Latitude</label>
                        <input
                          type="text"
                          value={eventoData.coordenadas.lat}
                          onChange={(e) => handleInputChange('coordenadas.lat', e.target.value)}
                          placeholder="Ex: -25.9664"
                        />
                      </div>
                      <div className="coordinate-group">
                        <label>Longitude</label>
                        <input
                          type="text"
                          value={eventoData.coordenadas.lng}
                          onChange={(e) => handleInputChange('coordenadas.lng', e.target.value)}
                          placeholder="Ex: 32.5806"
                        />
                      </div>
                    </div>
                    {eventoData.coordenadas.lat && eventoData.coordenadas.lng && (
                      <div className="coordinates-info">
                        <span>📍 Coordenadas definidas: {eventoData.coordenadas.lat}, {eventoData.coordenadas.lng}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Preview da Imagem */}
            {eventoData.image && (
              <div className="form-section">
                <h2>Pré-visualização</h2>
                <div className="image-preview">
                  <img src={eventoData.image} alt="Preview do evento" />
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
                  <p>O evento foi criado e está agora visível para a comunidade.</p>
                </div>
              </div>
            )}
          </form>

          {/* Sidebar de Ajuda */}
          <div className="form-sidebar">
            <div className="help-card">
              <h3>💡 Dicas para um bom evento</h3>
              <ul>
                <li>Use um título claro e descritivo</li>
                <li>Selecione a categoria mais apropriada</li>
                <li>Forneça uma descrição detalhada</li>
                <li>Use uma imagem de alta qualidade</li>
                <li>Verifique a capacidade do local</li>
              </ul>
            </div>

            <div className="info-card">
              <h3>📋 Informações Importantes</h3>
              <p>
                Todos os eventos são revisados pela administração antes de serem 
                publicados. Certifique-se de que todas as informações estão correctas.
              </p>
            </div>
          </div>
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
                <th>Status</th>
                <th>Inscrições</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((evento, index) => (
                <tr key={index}>
                  <td>
                    <div className="event-info-cell">
                      <div className="event-avatar small">
                        {evento.titulo ? evento.titulo.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <strong>{evento.titulo || 'Evento'}</strong>
                        <br />
                        <span className="event-category">{evento.categoria || 'Sem categoria'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    {evento.dataInicio ? new Date(evento.dataInicio).toLocaleDateString('pt-BR') : 'N/A'}
                  </td>
                  <td>
                    <span className={`status-badge ${
                      new Date(evento.dataFim) < new Date() ? 'finished' : 
                      new Date(evento.dataInicio) <= new Date() ? 'active' : 'pending'
                    }`}>
                      {new Date(evento.dataFim) < new Date() ? '✅ Finalizado' : 
                       new Date(evento.dataInicio) <= new Date() ? '🟢 Ativo' : '⏳ Pendente'}
                    </span>
                  </td>
                  <td>
                    {evento.inscricoes || 0} / {evento.vagas || 'N/A'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit">
                        ✏️ Editar
                      </button>
                      <button className="btn-delete">
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

  if (loading) {
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
             activeView === 'meus-eventos' ? '📅 Meus Eventos' :
             activeView === 'estatisticas' ? '📊 Estatísticas' :
             '⚙️ Configurações'}
          </h1>
          <p>
            {activeView === 'dashboard' 
              ? 'Gerencie seus eventos e acompanhe o desempenho' 
              : activeView === 'criar-evento'
              ? 'Crie um novo evento para a comunidade acadêmica'
              : activeView === 'meus-eventos'
              ? 'Gerencie todos os seus eventos criados'
              : activeView === 'estatisticas'
              ? 'Acompanhe as estatísticas dos seus eventos'
              : 'Configure suas preferências de organizador'
            }
          </p>
        </div>
        <div className="header-actions">
          {activeView === 'dashboard' && (
            <button className="refresh-btn" onClick={loadStatistics}>
              🔄 Atualizar
            </button>
          )}

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

            <div className="nav-section">
              <h3>📈 Análises</h3>
              <button 
                className={`nav-btn ${activeView === 'estatisticas' ? 'active' : ''}`}
                onClick={() => setActiveView('estatisticas')}
              >
                📊 Estatísticas
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'criar-evento' && renderCriarEventoView()}
          {activeView === 'meus-eventos' && renderMeusEventosView()}
          {activeView === 'estatisticas' && renderDashboardView()}
        </main>
      </div>
    </div>
  );
}