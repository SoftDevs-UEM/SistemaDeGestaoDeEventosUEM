import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Home.css';
import Footer from '../layouts/footer';
import EventModal from '../components/EventModal';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [heroEvents, setHeroEvents] = useState([]);

  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();

  // Participar: só estudante autenticado pode se inscrever direto
  const handleParticiparClick = (event) => {
    if (!isAuthenticated) {
      // Salva evento para pós-login
      localStorage.setItem('eventoParaInscricao', JSON.stringify(event));
      navigate('/login');
    } else if (userType === 'estudante') {
      navigate('/registrar', { state: { event } });
    } else if (userType === 'promotor') {
      navigate('/promotor');
    } else if (userType === 'admin') {
      navigate('/admin');
    }
  };

  const handleVerDetalhes = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const closeModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
  };

  // Dados de exemplo
  useEffect(() => {
    const heroEventsData = [
      {
        id: 1,
        title: 'Conferência de Ciência e Tecnologia',
        subtitle: 'Inovação e Descobertas Científicas',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Inscrever-se'
      },
      {
        id: 2,
        title: 'Festival Cultural Universitário',
        subtitle: 'Celebrando a Diversidade Cultural',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Explorar'
      },
      {
        id: 3,
        title: 'Workshop de Empreendedorismo',
        subtitle: 'Desenvolva Sua Ideia de Negócio',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        buttonText: 'Participar'
      }
    ];

    const featuredEvents = [
      {
        id: 1,
        title: 'Conferência de Ciência e Tecnologia',
        date: '15 Out 2023',
        location: 'Auditório Principal',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Científico',
        description: 'Uma conferência abrangente sobre os últimos avanços em ciência e tecnologia.',
        participants: 45,
        maxParticipants: 200
      },
      {
        id: 2,
        title: 'Festival Cultural Universitário',
        date: '22 Out 2023',
        location: 'Pátio Central',
        image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Cultural',
        description: 'Celebração da diversidade cultural com apresentações de música, dança e arte.',
        participants: 28,
        maxParticipants: 150
      },
      {
        id: 3,
        title: 'Workshop de Empreendedorismo',
        date: '30 Out 2023',
        location: 'Sala de Conferências',
        image: 'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Workshop',
        description: 'Workshop prático sobre empreendedorismo e desenvolvimento de startups.',
        participants: 32,
        maxParticipants: 50
      },
    ];

  // No useEffect, atualize as categorias para usar apenas cores UEM:
const eventCategories = [
  { id: 1, name: 'Científicos', icon: '🔬', count: 12, color: '#03492a' },
  { id: 2, name: 'Culturais', icon: '🎭', count: 8, color: '#03492a' },
  { id: 3, name: 'Cursos', icon: '📚', count: 15, color: '#03492a' },
  { id: 4, name: 'Workshops', icon: '🛠️', count: 10, color: '#03492a' },
  { id: 5, name: 'Palestras', icon: '🎤', count: 20, color: '#03492a' },
  { id: 6, name: 'Desportivos', icon: '⚽', count: 7, color: '#03492a' },
];

    const popularEventsData = [
      {
        id: 1,
        title: 'Semana de Engenharia 2023',
        date: '5-9 Nov 2023',
        location: 'Faculdade de Engenharia',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 85,
        category: 'Científico',
        description: 'Evento anual da Faculdade de Engenharia.',
        participants: 85,
        maxParticipants: 250
      },
      {
        id: 2,
        title: 'Feira de Emprego',
        date: '18 Nov 2023',
        location: 'Pavilhão Desportivo',
        image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 62,
        category: 'Profissional',
        description: 'Feira de emprego com oportunidades de estágio.',
        participants: 62,
        maxParticipants: 180
      },
      {
        id: 3,
        title: 'Noite de Poesia',
        date: '12 Nov 2023',
        location: 'Jardim das Letras',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 45,
        category: 'Cultural',
        description: 'Noite especial dedicada à poesia.',
        participants: 45,
        maxParticipants: 120
      },
    ];

    setHeroEvents(heroEventsData);
    setEvents(featuredEvents);
    setCategories(eventCategories);
    setPopularEvents(popularEventsData);
  }, []);

  // Auto-rotate para hero carousel
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

  const handleHeroButtonClick = (event) => {
    // Aqui você pode adicionar lógica específica para cada evento do hero
    handleVerDetalhes(event);
  };

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
                
                  <button className="btn-secondary" onClick={() => navigate('/eventos')}>
                    Explorar Todos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Controles do Carrossel */}
        <button className="hero-carousel-btn prev" onClick={prevHeroSlide}>
          <i className="fas fa-chevron-left"></i>
        </button>
        <button className="hero-carousel-btn next" onClick={nextHeroSlide}>
          <i className="fas fa-chevron-right"></i>
        </button>

        {/* Indicadores */}
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
            {categories.map((category) => (
              <div
                key={category.id}
                className="category-card"
                style={{ '--category-color': category.color }}
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

      {/* Eventos Populares */}
      <section className="popular-events">
        <div className="container">
          <h2 className="section-title">
            Eventos <span className="highlight">Populares</span>
          </h2>
          <p className="section-subtitle">
            Os eventos mais procurados pela comunidade académica
          </p>

          <div className="events-grid">
            {popularEvents.map((event) => (
              <div key={event.id} className="event-card">
                <div className="event-image">
                  <img src={event.image} alt={event.title} />
                  <div className="event-overlay"></div>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <div className="event-meta">
                    <span>
                      <i className="fas fa-calendar-alt"></i> {event.date}
                    </span>
                    <span>
                      <i className="fas fa-map-marker-alt"></i> {event.location}
                    </span>
                    <span>
                      <i className="fas fa-users"></i> {event.participants} participantes
                    </span>
                  </div>
                  <div className="event-buttons">
                    <button className="event-btn" onClick={() => handleParticiparClick(event)}>
                      Participar
                    </button>
                    <button className="btn-secondary" onClick={() => handleVerDetalhes(event)}>
                      Detalhes
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de Detalhes do Evento */}
      <EventModal
  event={selectedEvent}
  isOpen={showEventModal}
  onClose={closeModal}
  onRegister={() => handleParticiparClick(selectedEvent)}
/>

      <Footer />
    </div>
  );
};

export default Home;