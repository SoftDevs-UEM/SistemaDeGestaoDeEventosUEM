import React, { useEffect, useState } from 'react';
import { useEventos } from '../context/EventosContext';
import './Eventos.css';
import Footer from '../layouts/footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../services/eventService';
import EventModal from '../components/EventModal';

const Eventos = () => {
  const navigate = useNavigate();
  const { events, loadEvents, loading, error } = useEventos();
  const { isAuthenticated, userType, user } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // ✅ FUNÇÃO MELHORADA: Verificar se usuário está inscrito no evento
  const userIsRegisteredInEvent = (evento: Event): boolean => {
    if (!user || !isAuthenticated) return false;
    return evento.user_is_registered || false;
  };

  // ✅ FUNÇÃO MELHORADA: Verificar se evento deve ser mostrado
  const shouldShowEvent = (evento: Event): boolean => {
    // Admin vê todos os eventos
    if (userType === 'admin') return true;
    
    // Promotor vê seus eventos + eventos ativos/pendentes
    if (userType === 'promotor') {
      return evento.promoter_id === user?.id || 
             evento.status === 'ativo' || 
             evento.status === 'pendente';
    }
    
    // Estudante vê eventos ativos/pendentes + eventos cancelados em que está inscrito
    if (userType === 'estudante') {
      return evento.status === 'ativo' || 
             evento.status === 'pendente' ||
             (evento.status === 'cancelado' && userIsRegisteredInEvent(evento));
    }
    
    // Usuário não logado vê apenas eventos ativos
    return evento.status === 'ativo';
  };

  // Filtrar eventos baseado nas regras
  const filteredEvents = events.filter(shouldShowEvent);

  const getParticipantesCount = (evento: Event): number => {
    return evento.participants_count || evento.participants || 0;
  };

  const getOcupacaoPercentual = (evento: Event): number => {
    const participantes = getParticipantesCount(evento);
    const maxParticipantes = evento.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  const handleParticiparClick = (evento: Event) => {
    if (!isAuthenticated) {
      localStorage.setItem('eventoParaInscricao', JSON.stringify(evento));
      navigate('/login');
    } else if (userType === 'estudante') {
      navigate('/registrar', { state: { event: evento } });
    } else if (userType === 'promotor' || userType === 'admin') {
      navigate('/organizadores');
    }
  };

  const handleVerDetalhes = (evento: Event) => {
    setSelectedEvent(evento);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // ✅ FUNÇÃO PARA OBTER BADGE DE STATUS
  const getStatusBadge = (evento: Event) => {
    const statusConfig = {
      ativo: { label: 'Ativo', class: 'status-ativo', icon: '🟢' },
      pendente: { label: 'Pendente', class: 'status-pendente', icon: '🟡' },
      cancelado: { label: 'Cancelado', class: 'status-cancelado', icon: '🔴' },
      concluido: { label: 'Concluído', class: 'status-concluido', icon: '✅' }
    };

    const config = statusConfig[evento.status as keyof typeof statusConfig] || statusConfig.pendente;
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
        {evento.status === 'cancelado' && userIsRegisteredInEvent(evento) && (
          <span className="registered-badge"> (Inscrito)</span>
        )}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="eventos-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eventos-container">
        <div className="error-container">
          <h3>Erro ao carregar eventos</h3>
          <p>{error}</p>
          <button onClick={loadEvents} className="btn-primary">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="eventos-container">
      {/* Hero Section */}
      <section className="eventos-hero">
        <div className="eventos-hero-content">
          <h1>Todos os Eventos</h1>
          <p>Descubra e participe dos eventos da comunidade académica</p>
          <div className="events-count">
            {filteredEvents.length} de {events.length} eventos disponíveis
            {userType === 'admin' && <span> (Visão Admin)</span>}
            {userType === 'promotor' && <span> (Meus eventos + Ativos)</span>}
            {userType === 'estudante' && <span> (Ativos + Inscritos)</span>}
          </div>
        </div>
      </section>

      {/* Lista de Eventos */}
      <section className="eventos-list-section">
        <div className="container">
          <h2 className="section-title">
            Todos os <span className="highlight">Eventos</span>
          </h2>
          <p className="section-subtitle">
            Explore todos os eventos disponíveis ({filteredEvents.length} eventos)
          </p>

          {filteredEvents.length === 0 ? (
            <div className="no-events">
              <div className="no-events-content">
                <div className="no-events-icon">📅</div>
                <h3>Nenhum evento disponível</h3>
                <p>
                  {events.length > 0 
                    ? 'Não há eventos que correspondam aos seus critérios de visualização.'
                    : 'Novos eventos serão adicionados em breve'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map((evento: Event) => {
                const participantesCount = getParticipantesCount(evento);
                const ocupacaoPercentual = getOcupacaoPercentual(evento);
                const isUserRegistered = userIsRegisteredInEvent(evento);
                const isEventCanceled = evento.status === 'cancelado';
                
                return (
                  <div key={evento.id} className={`event-card ${isEventCanceled ? 'event-canceled' : ''}`}>
                    <div className="event-image">
                      <img 
                        src={evento.image || '/default-event-image.jpg'} 
                        alt={evento.title}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-event-image.jpg';
                        }}
                      />
                      <div className="event-category-badge">
                        {evento.category}
                      </div>
                      
                      {/* Badge de Status */}
                      <div className="event-status-overlay">
                        {getStatusBadge(evento)}
                      </div>

                      {/* Barra de progresso na imagem */}
                      <div className="event-ocupacao-overlay">
                        <div className="ocupacao-info">
                          <span>{Math.round(ocupacaoPercentual)}% ocupado</span>
                          <span>{participantesCount}/{evento.max_participants}</span>
                        </div>
                        <div className="ocupacao-progress-mini">
                          <div 
                            className={`ocupacao-fill ${ocupacaoPercentual >= 90 ? 'high' : ocupacaoPercentual >= 70 ? 'medium' : 'low'}`}
                            style={{ width: `${ocupacaoPercentual}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="event-overlay"></div>
                    </div>
                    <div className="event-info">
                      <h3>{evento.title}</h3>
                      <p className="event-description">
                        {evento.description && evento.description.length > 100 
                          ? `${evento.description.substring(0, 100)}...` 
                          : evento.description || 'Descrição não disponível'
                        }
                      </p>
                      <div className="event-meta">
                        <span>
                          <i className="fas fa-calendar-alt"></i> 
                          {new Date(evento.date).toLocaleDateString('pt-BR')} {evento.time && `às ${evento.time}`}
                        </span>
                        <span>
                          <i className="fas fa-map-marker-alt"></i> {evento.location}
                        </span>
                        <span className="participants-info">
                          <i className="fas fa-users"></i> 
                          {participantesCount} / {evento.max_participants} participantes
                          <span className="ocupacao-badge">
                            {Math.round(ocupacaoPercentual)}% ocupado
                          </span>
                        </span>
                      </div>
                      <div className="event-buttons">
                        <button 
                          className={`event-btn ${isEventCanceled ? 'btn-canceled' : ''}`}
                          onClick={() => handleParticiparClick(evento)}
                          disabled={ocupacaoPercentual >= 100 || isEventCanceled}
                          title={isEventCanceled ? 'Evento cancelado' : ocupacaoPercentual >= 100 ? 'Evento lotado' : 'Participar do evento'}
                        >
                          {isEventCanceled ? 'Cancelado' : 
                           ocupacaoPercentual >= 100 ? 'Lotado' : 
                           isAuthenticated && userType === 'estudante' ? 'Participar' : 'Participar'}
                        </button>
                        <button 
                          className="btn-secondary" 
                          onClick={() => handleVerDetalhes(evento)}
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalhes do Evento */}
      <EventModal
        event={selectedEvent}
        isOpen={showEventModal}
        onClose={closeModal}
        onRegister={() => selectedEvent && handleParticiparClick(selectedEvent)}
      />

      <Footer />
    </div>
  );
};

export default Eventos;