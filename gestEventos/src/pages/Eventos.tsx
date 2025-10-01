// Eventos.tsx
import React, { useState, useEffect } from 'react';
import './Eventos.css';
import Footer from '../layouts/footer';
import EventModal from '../components/EventModal';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const Eventos = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const location = useLocation();

  useEffect(() => {
    // Verifica se há uma âncora na URL
    if (location.hash === '#eventos-section') {
      const element = document.getElementById('eventos-section');
      if (element) {
        // Scroll suave para a seção
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);



  const navigate = useNavigate();

  const handleParticiparClick = (event) => {
    navigate('/registrar', { state: { event } });
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
    const eventCategories = [
      { id: 'todos', name: 'Todos os Eventos', icon: '🎉', count: 42 },
      { id: 'cientificos', name: 'Científicos', icon: '🔬', count: 12 },
      { id: 'culturais', name: 'Culturais', icon: '🎭', count: 8 },
      { id: 'cursos', name: 'Cursos', icon: '📚', count: 15 },
      { id: 'workshops', name: 'Workshops', icon: '🛠️', count: 10 },
      { id: 'palestras', name: 'Palestras', icon: '🎤', count: 20 },
      { id: 'desportivos', name: 'Desportivos', icon: '⚽', count: 7 },
    ];

    const allEvents = [
      {
        id: 1,
        title: 'Conferência de Ciência e Tecnologia',
        date: '15 Out 2023',
        time: '09:00 - 17:00',
        location: 'Auditório Principal',
        image:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'cientificos',
        attendees: 250,
        description: 'Uma conferência sobre os avanços mais recentes em ciência e tecnologia com palestrantes internacionais.',
        participants: 45,
        maxParticipants: 200
      },
      {
        id: 2,
        title: 'Festival Cultural Universitário',
        date: '22 Out 2023',
        time: '14:00 - 22:00',
        location: 'Pátio Central',
        image:
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'culturais',
        attendees: 180,
        description: 'Celebração da diversidade cultural com música, dança, comida and exposições de arte.',
        participants: 28,
        maxParticipants: 150
      },
      {
        id: 3,
        title: 'Workshop de Empreendedorismo',
        date: '30 Out 2023',
        time: '10:00 - 16:00',
        location: 'Sala de Conferências',
        image:
          'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'workshops',
        attendees: 120,
        description: 'Aprenda a transformar suas ideias em negócios de sucesso com especialistas em empreendedorismo.',
        participants: 32,
        maxParticipants: 50
      },
      {
        id: 4,
        title: 'Curso de Introdução à Programação',
        date: '5-7 Nov 2023',
        time: '14:00 - 18:00',
        location: 'Laboratório de Informática',
        image:
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'cursos',
        attendees: 90,
        description: 'Curso intensivo para iniciantes que desejam aprender os fundamentos da programação.',
        participants: 25,
        maxParticipants: 30
      },
      {
        id: 5,
        title: 'Palestra sobre Sustentabilidade',
        date: '12 Nov 2023',
        time: '18:00 - 20:00',
        location: 'Auditório de Ciências',
        image:
          'https://images.unsplash.com/photo-1569163139394-de44aa9a21dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'palestras',
        attendees: 150,
        description: 'Discussão sobre práticas sustentáveis e seu impacto no meio ambiente e na sociedade.',
        participants: 85,
        maxParticipants: 200
      },
      {
        id: 6,
        title: 'Torneio de Futebol Universitário',
        date: '19 Nov 2023',
        time: '09:00 - 17:00',
        location: 'Campo Desportivo',
        image:
          'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'desportivos',
        attendees: 200,
        description: 'Competição entre faculdades para determinar a melhor equipa de futebol da universidade.',
        participants: 150,
        maxParticipants: 200
      },
      {
        id: 7,
        title: 'Feira de Emprego e Estágios',
        date: '25 Nov 2023',
        time: '10:00 - 16:00',
        location: 'Pavilhão Multiusos',
        image:
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'workshops',
        attendees: 300,
        description: 'Conheça as melhores oportunidades de emprego e estágio com empresas líderes do mercado.',
        participants: 120,
        maxParticipants: 300
      },
      {
        id: 8,
        title: 'Noite de Poesia e Música',
        date: '3 Dez 2023',
        time: '19:00 - 23:00',
        location: 'Jardim das Letras',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        category: 'culturais',
        attendees: 120,
        description: 'Uma noite especial dedicada à poesia, música acústica e expressões artísticas.',
        participants: 45,
        maxParticipants: 100
      },
    ];

    // Ordenar eventos por data (mais recentes primeiro)
    const sortedEvents = [...allEvents].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Top 5 eventos mais participados
    const topEvents = [...allEvents]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);

    setCategories(eventCategories);
    setEvents(sortedEvents);
    setPopularEvents(topEvents);
  }, []);

  const filteredEvents =
    activeCategory === 'todos'
      ? events
      : events.filter((event) => event.category === activeCategory);

  return (
    <div className="eventos-container">
      {/* Hero Section */}
      <section className="eventos-hero">
        <div className="eventos-hero-content">
          <h1>Eventos UEM</h1>
          <p>
            Descubra e participe nos eventos da Universidade Eduardo Mondlane
          </p>
          <div className="hero-buttons">
            <button className="btn-primaryy">Explorar Eventos</button>
            <button className="btn-secondaryy">Criar Evento</button>
          </div>
        </div>
      </section>

      {/* Categorias de Eventos */}
      <section className="eventos-categories">
        <div className="container">
          <h2 className="section-title">
            Explore por <span className="highlight">Categorias</span>
          </h2>
          <p className="section-subtitle">
            Filtre os eventos por área de interesse
          </p>

          <div className="categories-grid">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="category-icon">{category.icon}</div>
                <h3>{category.name}</h3>
                <p>{category.count} eventos</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lista de Eventos */}
      <section className="eventos-list-section" id="eventos-section">
  <div className="container">
    <h2 className="section-title">
      {activeCategory === 'todos'
        ? 'Todos os Eventos'
        : categories.find((c) => c.id === activeCategory)?.name}
    </h2>
    <p className="section-subtitle">
      Confira nossa agenda completa de eventos acadêmicos
    </p>

    <div className="events-grid">
      {filteredEvents.map((event) => (
        <div key={event.id} className="event-card">
          <div className="event-image">
            <img src={event.image} alt={event.title} />
            <div className="event-category-badge">
              {categories.find((c) => c.id === event.category)?.icon}
              {categories.find((c) => c.id === event.category)?.name}
            </div>
          </div>
          <div className="event-info">
            <h3>{event.title}</h3>
            <p className="event-description">{event.description}</p>
            <div className="event-meta">
              <div className="event-detail">
                <i className="fas fa-calendar-alt"></i>
                <span>{event.date}</span>
              </div>
              <div className="event-detail">
                <i className="fas fa-clock"></i>
                <span>{event.time}</span>
              </div>
              <div className="event-detail">
                <i className="fas fa-map-marker-alt"></i>
                <span>{event.location}</span>
              </div>
              <div className="event-detail">
                <i className="fas fa-users"></i>
                <span>{event.attendees} participantes</span>
              </div>
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
                  <div className="event-category-badge">
                    {categories.find((c) => c.id === event.category)?.icon}
                    {categories.find((c) => c.id === event.category)?.name}
                  </div>
                </div>
                <div className="event-info">
                  <h3>{event.title}</h3>
                  <div className="event-meta">
                    <div className="event-detail">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{event.date}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{event.location}</span>
                    </div>
                    <div className="event-detail">
                      <i className="fas fa-users"></i>
                      <span>{event.attendees} participantes</span>
                    </div>
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

export default Eventos;