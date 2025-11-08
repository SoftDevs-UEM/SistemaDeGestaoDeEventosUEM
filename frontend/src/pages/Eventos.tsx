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

  const handleParticiparClick = (eventoId: number) => {
    if (!isAuthenticated) {
      const evento = events.find((e: Event) => e.id === eventoId);
      if (evento) {
        localStorage.setItem('eventoParaInscricao', JSON.stringify(evento));
      }
      navigate('/login');
    } else if (userType === 'estudante') {
      navigate(`/eventos/${eventoId}/registrar`);
    } else if (userType === 'promotor' || userType === 'admin') {
      navigate('/organizadores');
    }
  };

  // Adicione estes estados de loading e error
  if (loading) {
    return (
      <div className="eventos-container">
        <div className="loading">Carregando eventos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eventos-container">
        <div className="error">
          <p>Erro: {error}</p>
          <button onClick={loadEvents}>Tentar novamente</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="eventos-container">
        <div className="eventos">
          {events.length === 0 ? (
            <div className="no-events">
              <p>Nenhum evento disponível no momento.</p>
            </div>
          ) : (
            events.map((evento: Event) => (
              <div key={evento.id} className="evento">
                <img 
                  src={evento.image || '/default-event-image.jpg'} 
                  alt={evento.title} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/default-event-image.jpg';
                  }}
                />
                <h2>{evento.title}</h2>
                <p className="description">{evento.description}</p>
                <p>Data: {new Date(evento.date).toLocaleDateString('pt-BR')}</p>
                <p>Local: {evento.location}</p>
                {isAuthenticated && userType === 'estudante' && (
                  <button onClick={() => handleParticiparClick(evento.id)}>
                    Participar
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Eventos;