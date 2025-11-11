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
  const { isAuthenticated, userType } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Função para obter número de participantes (com fallback)
  const getParticipantesCount = (evento: Event): number => {
    // Priorizar participants_count (contagem real), depois participants (coluna da tabela)
    return evento.participants_count || evento.participants || 0;
  };

  // Função para calcular porcentagem de ocupação
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
        </div>
      </section>

      {/* Lista de Eventos */}
      <section className="eventos-list-section">
        <div className="container">
          <h2 className="section-title">
            Todos os <span className="highlight">Eventos</span>
          </h2>
          <p className="section-subtitle">
            Explore todos os eventos disponíveis ({events.length} eventos)
          </p>

          {events.length === 0 ? (
            <div className="no-events">
              <div className="no-events-content">
                <div className="no-events-icon">📅</div>
                <h3>Nenhum evento disponível</h3>
                <p>Novos eventos serão adicionados em breve</p>
              </div>
            </div>
          ) : (
            <div className="events-grid">
              {events.map((evento: Event) => {
                const participantesCount = getParticipantesCount(evento);
                const ocupacaoPercentual = getOcupacaoPercentual(evento);
                
                return (
                  <div key={evento.id} className="event-card">
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
                          className="event-btn" 
                          onClick={() => handleParticiparClick(evento)}
                          disabled={ocupacaoPercentual >= 100}
                        >
                          {ocupacaoPercentual >= 100 ? 'Lotado' : 
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