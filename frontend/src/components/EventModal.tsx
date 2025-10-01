import React from 'react';
import './EventModal.css';

const EventModal = ({ event, isOpen, onClose, onRegister }) => {
  if (!isOpen || !event) return null;

  const handleRegister = () => {
    onRegister(event); // Passa o evento para a função
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button> */}
        
        <div className="modal-header">
          <img src={event.image} alt={event.title} />
          <div className="modal-header-content">
            <span className="event-category">{event.category}</span>
            <h2>{event.title}</h2>
            <div className="event-details-modal">
              <span>
                <i className="fas fa-calendar-alt"></i> {event.date}
              </span>
              <span>
                <i className="fas fa-map-marker-alt"></i> {event.location}
              </span>
              <span>
                <i className="fas fa-users"></i> {event.participants} / {event.maxParticipants} participantes
              </span>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <h3>Descrição</h3>
          <p>{event.description}</p>
          
          <div className="participants-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${(event.participants / event.maxParticipants) * 100}%` 
                }}
              ></div>
            </div>
            <span>{event.participants} de {event.maxParticipants} vagas preenchidas</span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Fechar
          </button>
          <button 
            className="btn-primary" 
            onClick={handleRegister}
            disabled={event.participants >= event.maxParticipants}
          >
            {event.participants >= event.maxParticipants ? 'Lotado' : 'Inscrever-se'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;