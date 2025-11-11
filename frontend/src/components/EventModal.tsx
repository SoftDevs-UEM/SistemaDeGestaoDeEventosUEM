import './EventModal.css';
import React from 'react';

const EventModal = ({ event, isOpen, onClose, onRegister }) => {
  if (!isOpen || !event) return null;

  // Previne o scroll da página quando o modal está aberto - CORRIGIDO
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    // Cleanup para garantir que a classe seja removida
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleRegister = () => {
    onRegister(event);
  };

  // Função específica para fechar apenas quando clicar no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Função específica para o botão fechar - CORRIGIDO (única definição)
  const handleCloseClick = () => {
    onClose();
  };

  const progressPercentage = event.registrations_count && event.max_participants 
    ? (event.registrations_count / event.max_participants) * 100 
    : 0;

  const isEventFull = event.registrations_count >= event.max_participants;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Compacto */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="header-top">
              <span className="event-category">{event.category}</span>
              <div className="event-status">
                {isEventFull ? (
                  <span className="status-badge full">Lotado</span>
                ) : (
                  <span className="status-badge available">Vagas Disponíveis</span>
                )}
              </div>
            </div>
            <h2>{event.title}</h2>
            <div className="event-details-modal">
              <span>
                <i className="fas fa-calendar-alt"></i> 
                {new Date(event.date).toLocaleDateString('pt-BR')}
                {event.time && ` às ${event.time}`}
              </span>
              <span>
                <i className="fas fa-map-marker-alt"></i> 
                {event.location}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body - Layout Compacto */}
        <div className="modal-body">
          {/* Progress Bar Compacta */}
          <div className="participants-progress-compact">
            <div className="progress-info-compact">
              <span className="progress-text">
                <i className="fas fa-users"></i>
                {event.registrations_count || 0} de {event.max_participants} participantes
              </span>
              <span className="progress-percentage">
                {Math.round(progressPercentage)}% preenchido
              </span>
            </div>
            <div className="progress-bar-compact">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Descrição do Evento */}
          <div className="description-section">
            <h3>
              <i className="fas fa-info-circle"></i>
              Sobre o Evento
            </h3>
            <p>{event.description || 'Descrição não disponível'}</p>
          </div>

          {/* Grid de Informações Compacto */}
          <div className="event-info-grid-compact">
            <div className="info-column">
              <div className="info-item-compact">
                <div className="info-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="info-content">
                  <label>Data Completa</label>
                  <span>{new Date(event.date).toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
              </div>

              {event.time && (
                <div className="info-item-compact">
                  <div className="info-icon">
                    <i className="fas fa-clock"></i>
                  </div>
                  <div className="info-content">
                    <label>Horário</label>
                    <span>{event.time}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="info-column">
              <div className="info-item-compact">
                <div className="info-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div className="info-content">
                  <label>Localização</label>
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="info-item-compact">
                <div className="info-icon">
                  <i className="fas fa-tag"></i>
                </div>
                <div className="info-content">
                  <label>Categoria</label>
                  <span>{event.category}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {(event.organizer || event.contact_email) && (
            <div className="additional-info">
              <h3>
                <i className="fas fa-building"></i>
                Informações Adicionais
              </h3>
              <div className="additional-grid">
                {event.organizer && (
                  <div className="additional-item">
                    <strong>Organizador:</strong>
                    <span>{event.organizer}</span>
                  </div>
                )}
                {event.contact_email && (
                  <div className="additional-item">
                    <strong>Contacto:</strong>
                    <span>{event.contact_email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Fixo */}
        <div className="modal-footer">
          <button className="btn-modal-secondary" onClick={handleCloseClick}>
            <i className="fas fa-times"></i>
            Fechar
          </button>
          <button 
            className="btn-modal-primary" 
            onClick={handleRegister}
            disabled={isEventFull}
          >
            <i className="fas fa-user-plus"></i>
            {isEventFull ? 'Evento Lotado' : 'Inscrever-se Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;