import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import './Home.css';
import Footer from '../layouts/footer';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/Eventos'); // redireciona para a rota /login
  };

  // Dados de exemplo
  useEffect(() => {
    const featuredEvents = [
      {
        id: 1,
        title: 'Conferência de Ciência e Tecnologia',
        date: '15 Out 2023',
        location: 'Auditório Principal',
        image:
          'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Científico',
      },
      {
        id: 2,
        title: 'Festival Cultural Universitário',
        date: '22 Out 2023',
        location: 'Pátio Central',
        image:
          'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Cultural',
      },
      {
        id: 3,
        title: 'Workshop de Empreendedorismo',
        date: '30 Out 2023',
        location: 'Sala de Conferências',
        image:
          'https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
        category: 'Workshop',
      },
    ];

    const eventCategories = [
      { id: 1, name: 'Científicos', icon: '🔬', count: 12, color: '#4CAF50' },
      { id: 2, name: 'Culturais', icon: '🎭', count: 8, color: '#9C27B0' },
      { id: 3, name: 'Cursos', icon: '📚', count: 15, color: '#2196F3' },
      { id: 4, name: 'Workshops', icon: '🛠️', count: 10, color: '#FF9800' },
      { id: 5, name: 'Palestras', icon: '🎤', count: 20, color: '#F44336' },
      { id: 6, name: 'Desportivos', icon: '⚽', count: 7, color: '#3F51B5' },
    ];

    const popularEventsData = [
      {
        id: 1,
        title: 'Semana de Engenharia 2023',
        date: '5-9 Nov 2023',
        location: 'Faculdade de Engenharia',
        image:
          'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 250,
      },
      {
        id: 2,
        title: 'Feira de Emprego',
        date: '18 Nov 2023',
        location: 'Pavilhão Desportivo',
        image:
          'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 180,
      },
      {
        id: 3,
        title: 'Noite de Poesia',
        date: '12 Nov 2023',
        location: 'Jardim das Letras',
        image:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 120,
      },
      {
        id: 4,
        title: 'Hackathon UEM 2023',
        date: '25-26 Nov 2023',
        location: 'Laboratório de Informática',
        image:
          'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80',
        attendees: 90,
      },
    ];

    setEvents(featuredEvents);
    setCategories(eventCategories);
    setPopularEvents(popularEventsData);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % events.length);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentSlide, events.length]);

  const nextSlide = () => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % events.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prevSlide) => (prevSlide - 1 + events.length) % events.length
    );
  };

  return (
    <div className="home-container">
      {/* Hero Section - SEM padding-top para remover o espaço branco */}
      <section className="hero">
        <div className="hero-content">
          <h1>Universidade Eduardo Mondlane</h1>
          <p>Bem-vindo ao portal de eventos da UEM</p>
          <div className="hero-buttons">
            <button className="btn-primary" onClick={handleLoginClick}>
              Explorar Eventos
            </button>
            <button className="btn-secondary">Saber Mais</button>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </section>

      {/* Carrossel de Eventos em Destaque */}
      <section className="featured-events">
        <div className="container">
          <h2 className="section-title">
            Eventos em <span className="highlight">Destaque</span>
          </h2>
          <p className="section-subtitle">
            Descubra os eventos mais esperados da Universidade
          </p>

          <div className="carousel">
            <button className="carousel-btn prev" onClick={prevSlide}>
              <i className="fas fa-chevron-left"></i>
            </button>

            <div
              className="carousel-content"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {events.map((event, index) => (
                <div key={event.id} className="carousel-slide">
                  <div className="slide-image">
                    <img src={event.image} alt={event.title} />
                    <div className="slide-overlay"></div>
                  </div>
                  <div className="slide-content">
                    <span className="event-category">{event.category}</span>
                    <h3>{event.title}</h3>
                    <div className="event-details">
                      <span>
                        <i className="fas fa-calendar-alt"></i> {event.date}
                      </span>
                      <span>
                        <i className="fas fa-map-marker-alt"></i>{' '}
                        {event.location}
                      </span>
                    </div>
                    <button className="event-btn">Ver Detalhes</button>
                  </div>
                </div>
              ))}
            </div>

            <button className="carousel-btn next" onClick={nextSlide}>
              <i className="fas fa-chevron-right"></i>
            </button>

            <div className="carousel-indicators">
              {events.map((_, index) => (
                <button
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(index)}
                ></button>
              ))}
            </div>
          </div>
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
                      <i className="fas fa-users"></i> {event.attendees}{' '}
                      participantes
                    </span>
                  </div>
                  <button className="event-btn">Participar</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
