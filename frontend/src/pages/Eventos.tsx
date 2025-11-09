import React, { useEffect } from 'react';
import { useEventos } from '../context/EventosContext';
import './Eventos.css';
import Footer from '../layouts/footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../services/eventService';

const Eventos = () => {
  const navigate = useNavigate();
  const { events, loadEvents, loading, error } = useEventos();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

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
    // Aqui você pode implementar um modal ou navegar para página de detalhes
    console.log('Ver detalhes do evento:', evento);
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
            Explore todos os eventos disponíveis
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
              {events.map((evento: Event) => (
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
                      <span>
                        <i className="fas fa-users"></i> 
                        {evento.registrations_count || 0} / {evento.max_participants} participantes
                      </span>
                    </div>
                    <div className="event-buttons">
                      <button 
                        className="event-btn" 
                        onClick={() => handleParticiparClick(evento)}
                      >
                        {isAuthenticated && userType === 'estudante' ? 'Participar' : 'Ver Detalhes'}
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={() => handleVerDetalhes(evento)}
                      >
                        Mais Info
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Eventos;