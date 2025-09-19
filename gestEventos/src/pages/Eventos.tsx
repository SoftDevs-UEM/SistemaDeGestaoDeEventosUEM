// Eventos.tsx (com a newsletter adicionada)
import React, { useState, useEffect } from 'react';
import './Eventos.css';

const Eventos = () => {
  const [activeCategory, setActiveCategory] = useState('todos');
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [popularEvents, setPopularEvents] = useState([]);

  // Dados de exemplo
  useEffect(() => {
    const eventCategories = [
      { id: 'todos', name: 'Todos os Eventos', icon: '🎉', count: 42 },
      { id: 'cientificos', name: 'Científicos', icon: '🔬', count: 12 },
      { id: 'culturais', name: 'Culturais', icon: '🎭', count: 8 },
      { id: 'cursos', name: 'Cursos', icon: '📚', count: 15 },
      { id: 'workshops', name: 'Workshops', icon: '🛠️', count: 10 },
      { id: 'palestras', name: 'Palestras', icon: '🎤', count: 20 },
      { id: 'desportivos', name: 'Desportivos', icon: '⚽', count: 7 }
    ];

    const allEvents = [
      {
        id: 1,
        title: "Conferência de Ciência e Tecnologia",
        date: "15 Out 2023",
        time: "09:00 - 17:00",
        location: "Auditório Principal",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "cientificos",
        attendees: 250,
        description: "Uma conferência sobre os avanços mais recentes em ciência e tecnologia com palestrantes internacionais."
      },
      {
        id: 2,
        title: "Festival Cultural Universitário",
        date: "22 Out 2023",
        time: "14:00 - 22:00",
        location: "Pátio Central",
        image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "culturais",
        attendees: 180,
        description: "Celebração da diversidade cultural com música, dança, comida e exposições de arte."
      },
      {
        id: 3,
        title: "Workshop de Empreendedorismo",
        date: "30 Out 2023",
        time: "10:00 - 16:00",
        location: "Sala de Conferências",
        image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "workshops",
        attendees: 120,
        description: "Aprenda a transformar suas ideias em negócios de sucesso com especialistas em empreendedorismo."
      },
      {
        id: 4,
        title: "Curso de Introdução à Programação",
        date: "5-7 Nov 2023",
        time: "14:00 - 18:00",
        location: "Laboratório de Informática",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "cursos",
        attendees: 90,
        description: "Curso intensivo para iniciantes que desejam aprender os fundamentos da programação."
      },
      {
        id: 5,
        title: "Palestra sobre Sustentabilidade",
        date: "12 Nov 2023",
        time: "18:00 - 20:00",
        location: "Auditório de Ciências",
        image: "https://images.unsplash.com/photo-1569163139394-de44aa9a21dc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "palestras",
        attendees: 150,
        description: "Discussão sobre práticas sustentáveis e seu impacto no meio ambiente e na sociedade."
      },
      {
        id: 6,
        title: "Torneio de Futebol Universitário",
        date: "19 Nov 2023",
        time: "09:00 - 17:00",
        location: "Campo Desportivo",
        image: "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "desportivos",
        attendees: 200,
        description: "Competição entre faculdades para determinar a melhor equipa de futebol da universidade."
      },
      {
        id: 7,
        title: "Feira de Emprego e Estágios",
        date: "25 Nov 2023",
        time: "10:00 - 16:00",
        location: "Pavilhão Multiusos",
        image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "workshops",
        attendees: 300,
        description: "Conheça as melhores oportunidades de emprego e estágio com empresas líderes do mercado."
      },
      {
        id: 8,
        title: "Noite de Poesia and Música",
        date: "3 Dez 2023",
        time: "19:00 - 23:00",
        location: "Jardim das Letras",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80",
        category: "culturais",
        attendees: 120,
        description: "Uma noite especial dedicada à poesia, música acústica e expressões artísticas."
      }
    ];

    // Ordenar eventos por data (mais recentes primeiro)
    const sortedEvents = [...allEvents].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Top 5 eventos mais participados
    const topEvents = [...allEvents]
      .sort((a, b) => b.attendees - a.attendees)
      .slice(0, 5);

    setCategories(eventCategories);
    setEvents(sortedEvents);
    setPopularEvents(topEvents);
  }, []);

  const filteredEvents = activeCategory === 'todos' 
    ? events 
    : events.filter(event => event.category === activeCategory);

  return (
    <div className="eventos-container">
      {/* Showcase/Banner */}
      <section className="eventos-hero">
        <div className="eventos-hero-content">
          <h1>Eventos UEM</h1>
          <p>Descubra e participe nos eventos da Universidade Eduardo Mondlane</p>
        </div>
      </section>

      <div className="eventos-content">
        {/* Categorias de Eventos */}
        <section className="eventos-categories">
          <h2 className="section-title">Explore por <span className="highlight">Categorias</span></h2>
          <p className="section-subtitle">Filtre os eventos por área de interesse</p>
          
          <div className="categories-filter">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-filter-btn ${activeCategory === category.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
                <span className="event-count">{category.count} eventos</span>
              </button>
            ))}
          </div>
        </section>

        <div className="eventos-layout">
          {/* Lista de Eventos */}
          <section className="eventos-list">
            <h2 className="section-title">
              {activeCategory === 'todos' ? 'Todos os Eventos' : categories.find(c => c.id === activeCategory)?.name}
            </h2>
            
            <div className="events-grid">
              {filteredEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-image">
                    <img src={event.image} alt={event.title} />
                    <div className="event-category-badge">
                      {categories.find(c => c.id === event.category)?.icon} 
                      {categories.find(c => c.id === event.category)?.name}
                    </div>
                  </div>
                  <div className="event-info">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    <div className="event-details">
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
                    <div className="event-actions">
                      <button className="btn-primary">Participar</button>
                      <button className="btn-secondary">Detalhes</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sidebar com Eventos Populares e Últimos Eventos */}
          <aside className="eventos-sidebar">
            {/* Eventos Mais Participados (Top 5) */}
            <div className="sidebar-section">
              <h3>Eventos Mais Participados</h3>
              <div className="popular-events-list">
                {popularEvents.map((event, index) => (
                  <div key={event.id} className="popular-event-item">
                    <span className="popular-event-rank">{index + 1}</span>
                    <div className="popular-event-info">
                      <h4>{event.title}</h4>
                      <p>{event.attendees} participantes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Últimos Eventos */}
            <div className="sidebar-section">
              <h3>Últimos Eventos</h3>
              <div className="recent-events-list">
                {events.slice(0, 4).map(event => (
                  <div key={event.id} className="recent-event-item">
                    <img src={event.image} alt={event.title} />
                    <div className="recent-event-info">
                      <h4>{event.title}</h4>
                      <p>{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Newsletter Section - EXATAMENTE como na Home */}
      <section className="newsletter">
        <div className="container">
          <div className="newsletter-content">
            <h2>Fique por dentro dos eventos</h2>
            <p>Inscreva-se na nossa newsletter para receber atualizações sobre eventos</p>
            <div className="newsletter-form">
              <input type="email" placeholder="Seu melhor e-mail" />
              <button className="newsletter-btn">Subscrever</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Eventos;