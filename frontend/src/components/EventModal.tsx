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

  // ✅ FUNÇÕES ATUALIZADAS: Usar participants_count ou participants
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

  // ✅ DEBUG: Log para verificar dados
  React.useEffect(() => {
    if (isOpen && event) {
      console.log('🔍 EventModal Debug:', {
        title: event.title,
        participants: event.participants,
        participants_count: event.participants_count,
        max_participants: event.max_participants,
        ocupacao: `${ocupacaoPercentual}%`,
        isFull: isEventFull
      });
    }
  }, [isOpen, event]);

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
          {/* ✅ ATUALIZADO: Progress Bar Compacta com dados corretos */}
          <div className="participants-progress-compact">
            <div className="progress-info-compact">
              <span className="progress-text">
                <i className="fas fa-users"></i>
                {participantesCount} de {event.max_participants} participantes
                {/* ✅ DEBUG INFO - pode remover depois */}
                <small className="debug-info">
                  {event.participants_count !== undefined && ` (count: ${event.participants_count})`}
                  {event.participants !== undefined && ` (db: ${event.participants})`}
                </small>
              </span>
              <span className="progress-percentage">
                {Math.round(ocupacaoPercentual)}% ocupado
              </span>
            </div>
            <div className="progress-bar-compact">
              <div 
                className={`progress-fill ${ocupacaoPercentual >= 90 ? 'high' : ocupacaoPercentual >= 70 ? 'medium' : 'low'}`}
                style={{ width: `${ocupacaoPercentual}%` }}
              ></div>
            </div>
          </div>

          {/* ✅ NOVA SEÇÃO: Estatísticas de Ocupação Detalhadas */}
          <div className="ocupacao-detailed-section">
            <h3>
              <i className="fas fa-chart-bar"></i>
              Estatísticas de Ocupação
            </h3>
            <div className="ocupacao-stats-grid">
              <div className="ocupacao-stat">
                <div className="stat-value">{participantesCount}</div>
                <div className="stat-label">Inscritos</div>
              </div>
              <div className="ocupacao-stat">
                <div className="stat-value">{event.max_participants - participantesCount}</div>
                <div className="stat-label">Vagas Livres</div>
              </div>
              <div className="ocupacao-stat">
                <div className="stat-value">{Math.round(ocupacaoPercentual)}%</div>
                <div className="stat-label">Ocupação</div>
              </div>
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

          {/* ✅ ATUALIZADO: Informações de Capacidade */}
          <div className="capacity-info">
            <h3>
              <i className="fas fa-chart-pie"></i>
              Capacidade do Evento
            </h3>
            <div className="capacity-details">
              <div className="capacity-item">
                <strong>Total de Vagas:</strong>
                <span>{event.max_participants} participantes</span>
              </div>
              <div className="capacity-item">
                <strong>Inscrições Confirmadas:</strong>
                <span>{participantesCount} participantes</span>
              </div>
              <div className="capacity-item">
                <strong>Status:</strong>
                <span className={`status-text ${isEventFull ? 'full' : 'available'}`}>
                  {isEventFull ? 'Evento Lotado' : 'Inscrições Abertas'}
                </span>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          {(event.target_audience || event.requirements || event.organizer || event.contact_email) && (
            <div className="additional-info">
              <h3>
                <i className="fas fa-building"></i>
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