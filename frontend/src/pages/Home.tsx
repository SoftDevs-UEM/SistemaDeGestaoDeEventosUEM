import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEventos } from '../context/EventosContext';
import './Home.css';
import Footer from '../layouts/footer';
import EventModal from '../components/EventModal';
import React, { useEffect, useState, useCallback } from 'react';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [heroEvents, setHeroEvents] = useState([]);

  const navigate = useNavigate();
  const { isAuthenticated, userType, user } = useAuth();
  const { events, loadEvents, loading, error } = useEventos();

  // ✅ FUNÇÃO MELHORADA: Verificar se usuário está inscrito no evento
  const userIsRegisteredInEvent = (evento: any): boolean => {
    if (!user || !isAuthenticated) return false;
    return evento.user_is_registered || false;
  };

  // ✅ FUNÇÃO MELHORADA: Verificar se evento deve ser mostrado
  const shouldShowEvent = (evento: any): boolean => {
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

  const getParticipantesCount = (evento: any): number => {
    return evento.participants_count || evento.participants || 0;
  };

  const getOcupacaoPercentual = (evento: any): number => {
    const participantes = getParticipantesCount(evento);
    const maxParticipantes = evento.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  const handleParticiparClick = useCallback((event) => {
    if (!isAuthenticated) {
      localStorage.setItem('eventoParaInscricao', JSON.stringify(event));
      navigate('/login');
    } else if (userType === 'estudante') {
      navigate('/registrar', { state: { event } });
    } else if (userType === 'promotor' || userType === 'admin') {
      navigate('/organizadores');
    }
  }, [isAuthenticated, userType, navigate]);

  const handleVerDetalhes = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowEventModal(false);
    setSelectedEvent(null);
  }, []);

  useEffect(() => {
    console.log('🏠 Home: Carregando eventos...');
    loadEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      console.log('🏠 Home: Eventos carregados:', events.length);
      console.log('🏠 Home: Eventos filtrados:', filteredEvents.length);
    }
  }, [events.length, filteredEvents.length]);

  useEffect(() => {
    const heroEventsData = [
      {
        id: 1,
        title: 'Conferência de Ciência e Tecnologia',
        subtitle: 'Inovação e Descobertas Científicas',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 2,
        title: 'Festival Cultural Universitário',
        subtitle: 'Celebrando a Diversidade Cultural',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 3,
        title: 'Workshop de Empreendedorismo',
        subtitle: 'Desenvolva Sua Ideia de Negócio',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
      }
    ];

    setHeroEvents(heroEventsData);
  }, []);

  const categories = [
    { id: 1, name: 'Científicos', icon: '🔬', value: 'cientificos', color: '#03492a' },
    { id: 2, name: 'Culturais', icon: '🎭', value: 'culturais', color: '#03492a' },
    { id: 3, name: 'Cursos', icon: '📚', value: 'cursos', color: '#03492a' },
    { id: 4, name: 'Workshops', icon: '🛠️', value: 'workshops', color: '#03492a' },
    { id: 5, name: 'Palestras', icon: '🎤', value: 'palestras', color: '#03492a' },
    { id: 6, name: 'Desportivos', icon: '⚽', value: 'desportivos', color: '#03492a' },
  ];

  const categoriesWithCount = categories.map(category => ({
    ...category,
    count: filteredEvents.filter(event => event.category === category.value).length
  }));

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % heroEvents.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, heroEvents.length]);

  const nextHeroSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % heroEvents.length);
  };

  const prevHeroSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide - 1 + heroEvents.length) % heroEvents.length);
  };

  // ✅ USAR EVENTOS FILTRADOS para featured events
  const featuredEvents = filteredEvents.slice(0, 6);

  // ✅ FUNÇÃO PARA OBTER BADGE DE STATUS
  const getStatusBadge = (evento: any) => {
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
      <div className="home-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando eventos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
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
    <div className="home-container">
      {/* Hero Section com Carrossel */}
      <section className="hero">
        <div className="hero-carousel">
          {heroEvents.map((event, index) => (
            <div
              key={event.id}
              className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
              style={{ backgroundImage: `url(${event.image})` }}
            >
              <div className="hero-overlay"></div>
              <div className="hero-content">
                <h1>{event.title}</h1>
                <p>{event.subtitle}</p>
                <div className="hero-buttons">
                  <button className="btn-hero-primary" onClick={() => navigate('/eventos')}>
                    Ver Eventos
                  </button>
                  <button className="btn-hero-secondary" onClick={() => navigate('/eventos')}>
                    Explorar Todos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button className="hero-carousel-btn prev" onClick={prevHeroSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="hero-carousel-btn next" onClick={nextHeroSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>

        <div className="hero-indicators">
          {heroEvents.map((_, index) => (
            <button
              key={index}
              className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Categorias de Eventos */}
      <section className="event-categories">
        <div className="container">
          <h2 className="section-title">
            Explore por <span className="highlight">Categorias</span>
          </h2>
          <p className="section-subtitle">Encontre eventos do seu interesse</p>

          <div className="categories-grid">
            {categoriesWithCount.map((category) => (
              <div
                key={category.id}
                className="category-card"
                style={{ '--category-color': category.color }}
                onClick={() => navigate('/eventos')}
              >
                <div
                  className="category-icon"
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </div>
                <h3>{category.name}</h3>
                <p>{category.count} eventos</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Eventos em Destaque */}
      <section className="popular-events">
        <div className="container">
          <h2 className="section-title">
            Eventos em <span className="highlight">Destaque</span>
          </h2>
          <p className="section-subtitle">
            Os eventos mais recentes da comunidade académica
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
                <button 
                  className="btn-primary" 
                  onClick={() => navigate('/eventos')}
                >
                  Ver Todos os Eventos
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="events-grid">
                {featuredEvents.map((event) => {
                  const participantesCount = getParticipantesCount(event);
                  const ocupacaoPercentual = getOcupacaoPercentual(event);
                  const isUserRegistered = userIsRegisteredInEvent(event);
                  const isEventCanceled = event.status === 'cancelado';
                  
                  return (
                    <div key={event.id} className={`event-card ${isEventCanceled ? 'event-canceled' : ''}`}>
                      <div className="event-image">
                        <img 
                          src={event.image || '/default-event-image.jpg'} 
                          alt={event.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-event-image.jpg';
                          }}
                        />
                        <div className="event-category-badge">
                          {event.category}
                        </div>
                        
                        {/* Badge de Status */}
                        <div className="event-status-overlay">
                          {getStatusBadge(event)}
                        </div>

                        {/* Barra de progresso na imagem */}
                        <div className="event-ocupacao-overlay">
                          <div className="ocupacao-info">
                            <span>{Math.round(ocupacaoPercentual)}% ocupado</span>
                            <span>{participantesCount}/{event.max_participants}</span>
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
                        <h3>{event.title}</h3>
                        <p className="event-description">
                          {event.description && event.description.length > 100 
                            ? `${event.description.substring(0, 100)}...` 
                            : event.description || 'Descrição não disponível'
                          }
                        </p>
                        <div className="event-meta">
                          <span>
                            <i className="fas fa-calendar-alt"></i> 
                            {new Date(event.date).toLocaleDateString('pt-BR')} {event.time && `às ${event.time}`}
                          </span>
                          <span>
                            <i className="fas fa-map-marker-alt"></i> {event.location}
                          </span>
                          <span className="participants-info">
                            <i className="fas fa-users"></i> 
                            {participantesCount} / {event.max_participants} participantes
                            <span className="ocupacao-badge">
                              {Math.round(ocupacaoPercentual)}% ocupado
                            </span>
                          </span>
                        </div>
                        <div className="event-buttons">
                          <button 
                            className={`event-btn ${isEventCanceled ? 'btn-canceled' : ''}`}
                            onClick={() => handleParticiparClick(event)}
                            disabled={ocupacaoPercentual >= 100 || isEventCanceled}
                            title={isEventCanceled ? 'Evento cancelado' : ocupacaoPercentual >= 100 ? 'Evento lotado' : 'Participar do evento'}
                          >
                            {isEventCanceled ? 'Cancelado' : 
                             ocupacaoPercentual >= 100 ? 'Lotado' : 
                             isAuthenticated && userType === 'estudante' ? 'Participar' : 'Participar'}
                          </button>
                          <button 
                            className="btn-secondary" 
                            onClick={() => handleVerDetalhes(event)}
                          >
                            Ver Detalhes
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredEvents.length > 6 && (
                <div className="view-all-container">
                  <button 
                    className="btn-primary view-all-btn"
                    onClick={() => navigate('/eventos')}
                  >
                    Ver Todos os Eventos ({filteredEvents.length})
                  </button>
                </div>
              )}
            </>
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

export default Home;