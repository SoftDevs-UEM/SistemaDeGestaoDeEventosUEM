import './EventModal.css';
import React from 'react';

const EventModal = ({ event, isOpen, onClose, onRegister }) => {
  if (!isOpen || !event) return null;

  // Previne o scroll da página quando o modal está aberto
  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  const handleRegister = () => {
    onRegister(event);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  // Funções para obter dados de participantes
  const getParticipantesCount = () => {
    return event.participants_count || event.participants || 0;
  };

  const getOcupacaoPercentual = () => {
    const participantes = getParticipantesCount();
    const maxParticipantes = event.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  const participantesCount = getParticipantesCount();
  const ocupacaoPercentual = getOcupacaoPercentual();
  const isEventFull = ocupacaoPercentual >= 100;
  const vagasLivres = event.max_participants - participantesCount;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content no-scroll" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Compacto */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="header-top">
              <span className="event-category">{event.category}</span>
              <div className="event-status">
                {isEventFull ? (
                  <span className="status-badge full">Lotado</span>
                ) : (
                  <span className="status-badge available">{vagasLivres} vagas</span>
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

        {/* Modal Body - Layout Ultra Compacto */}
        <div className="modal-body compact">
          {/* ✅ SEÇÃO UNIFICADA: Informações Principais */}
          <div className="main-info-grid">
            {/* Coluna 1: Estatísticas e Progresso */}
            <div className="info-column">
              <div className="stats-card">
                <h3>
                  <i className="fas fa-chart-bar"></i>
                  Participação
                </h3>
                <div className="stats-grid">
                  <div className="stat-item">
                    <div className="stat-number">{participantesCount}</div>
                    <div className="stat-label">Inscritos</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{vagasLivres}</div>
                    <div className="stat-label">Vagas Livres</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{Math.round(ocupacaoPercentual)}%</div>
                    <div className="stat-label">Ocupação</div>
                  </div>
                </div>
                
                {/* Barra de Progresso Compacta */}
                <div className="progress-section">
                  <div className="progress-info">
                    <span>{participantesCount}/{event.max_participants} participantes</span>
                    <span>{Math.round(ocupacaoPercentual)}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={`progress-fill ${ocupacaoPercentual >= 90 ? 'high' : ocupacaoPercentual >= 70 ? 'medium' : 'low'}`}
                      style={{ width: `${ocupacaoPercentual}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coluna 2: Informações do Evento */}
            <div className="info-column">
              <div className="details-card">
                <h3>
                  <i className="fas fa-info-circle"></i>
                  Detalhes
                </h3>
                <div className="details-list">
                  <div className="detail-item">
                    <i className="fas fa-calendar-check"></i>
                    <div>
                      <strong>Data</strong>
                      <span>{new Date(event.date).toLocaleDateString('pt-BR', { 
                        weekday: 'short', 
                        day: 'numeric',
                        month: 'short'
                      })}</span>
                    </div>
                  </div>
                  
                  {event.time && (
                    <div className="detail-item">
                      <i className="fas fa-clock"></i>
                      <div>
                        <strong>Horário</strong>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="detail-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>Local</strong>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  
                  <div className="detail-item">
                    <i className="fas fa-tag"></i>
                    <div>
                      <strong>Categoria</strong>
                      <span>{event.category}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ DESCRIÇÃO COMPACTA */}
          <div className="description-section compact">
            <h3>
              <i className="fas fa-align-left"></i>
              Sobre o Evento
            </h3>
            <p className="compact-description">
              {event.description && event.description.length > 150 
                ? `${event.description.substring(0, 150)}...` 
                : event.description || 'Descrição não disponível'
              }
            </p>
          </div>

          {/* ✅ INFORMAÇÕES ADICIONAIS CONDICIONAIS - Só mostra se existirem */}
          {(event.target_audience || event.requirements) && (
            <div className="additional-info compact">
              <h3>
                <i className="fas fa-list-alt"></i>
                Informações Adicionais
              </h3>
              <div className="additional-grid">
                {event.target_audience && (
                  <div className="additional-item">
                    <strong>Público-Alvo:</strong>
                    <span>{event.target_audience}</span>
                  </div>
                )}
                {event.requirements && (
                  <div className="additional-item">
                    <strong>Requisitos:</strong>
                    <span>{event.requirements}</span>
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
            className={`btn-modal-primary ${isEventFull ? 'disabled' : ''}`} 
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