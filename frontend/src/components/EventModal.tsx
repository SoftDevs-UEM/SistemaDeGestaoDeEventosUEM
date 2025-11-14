import './EventModal.css';
import React from 'react';

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  max_participants: number;
  status: 'pendente' | 'ativo' | 'cancelado' | 'finalizado' | 'concluido';
  image: string;
  requirements: string;
  target_audience: string;
  promoter_name: string;
  participants_count: number;
  participants: number;
  user_is_registered?: boolean;
}

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onRegister: (event: Event) => void;
}

const EventModal: React.FC<EventModalProps> = ({ event, isOpen, onClose, onRegister }) => {
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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = () => {
    onClose();
  };

  // ✅ FUNÇÕES PARA OBTER DADOS DE PARTICIPANTES
  const getParticipantesCount = () => {
    return event.participants_count || event.participants || 0;
  };

  const getOcupacaoPercentual = () => {
    const participantes = getParticipantesCount();
    const maxParticipantes = event.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  // ✅ FUNÇÃO PARA OBTER BADGE DE STATUS
  const getStatusBadge = () => {
    const statusConfig = {
      ativo: { label: 'Ativo', class: 'status-ativo', icon: '🟢' },
      pendente: { label: 'Pendente', class: 'status-pendente', icon: '🟡' },
      cancelado: { label: 'Cancelado', class: 'status-cancelado', icon: '🔴' },
      finalizado: { label: 'Finalizado', class: 'status-concluido', icon: '✅' },
      concluido: { label: 'Concluído', class: 'status-concluido', icon: '✅' }
    };

    const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.pendente;
    
    return (
      <span className={`status-badge ${config.class}`}>
        {config.icon} {config.label}
        {event.status === 'cancelado' && event.user_is_registered && (
          <span className="registered-badge"> (Inscrito)</span>
        )}
      </span>
    );
  };

  const participantesCount = getParticipantesCount();
  const ocupacaoPercentual = getOcupacaoPercentual();
  const isEventFull = ocupacaoPercentual >= 100;
  const vagasLivres = event.max_participants - participantesCount;
  const isEventCanceled = event.status === 'cancelado';
  const isEventFinished = event.status === 'finalizado' || event.status === 'concluido';

  // ✅ VERIFICAR SE USUÁRIO PODE SE INSCREVER
  const canRegister = !isEventFull && !isEventCanceled && !isEventFinished;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content no-scroll" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header Compacto */}
        <div className="modal-header">
          <div className="modal-header-content">
            <div className="header-top">
              <span className="event-category">{event.category}</span>
              <div className="event-status">
                {getStatusBadge()}
                {isEventFull && <span className="status-badge full">Lotado</span>}
                {!isEventFull && !isEventCanceled && !isEventFinished && (
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
              {event.promoter_name && (
                <span>
                  <i className="fas fa-user-tie"></i>
                  {event.promoter_name}
                </span>
              )}
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
                        month: 'short',
                        year: 'numeric'
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

                  <div className="detail-item">
                    <i className="fas fa-users"></i>
                    <div>
                      <strong>Público-Alvo</strong>
                      <span>{event.target_audience || 'Todos os públicos'}</span>
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
              {event.description || 'Descrição não disponível'}
            </p>
          </div>

          {/* ✅ INFORMAÇÕES ADICIONAIS CONDICIONAIS - Só mostra se existirem */}
          {event.requirements && (
            <div className="additional-info compact">
              <h3>
                <i className="fas fa-list-alt"></i>
                Informações Adicionais
              </h3>
              <div className="additional-grid">
                <div className="additional-item">
                  <strong>Requisitos:</strong>
                  <span>{event.requirements}</span>
                </div>
              </div>
            </div>
          )}

          {/* ✅ MENSAGENS DE STATUS ESPECIAIS */}
          {isEventCanceled && (
            <div className="status-message canceled">
              <i className="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Evento Cancelado</strong>
                <p>
                  {event.user_is_registered 
                    ? 'Este evento foi cancelado. Você está inscrito e receberá mais informações em breve.'
                    : 'Este evento foi cancelado e não está mais disponível para inscrições.'
                  }
                </p>
              </div>
            </div>
          )}

          {isEventFinished && (
            <div className="status-message finished">
              <i className="fas fa-flag-checkered"></i>
              <div>
                <strong>Evento Concluído</strong>
                <p>Este evento já foi realizado e não está mais disponível para inscrições.</p>
              </div>
            </div>
          )}

          {isEventFull && !isEventCanceled && !isEventFinished && (
            <div className="status-message full">
              <i className="fas fa-users-slash"></i>
              <div>
                <strong>Evento Lotado</strong>
                <p>Todas as vagas foram preenchidas. Não é possível fazer novas inscrições.</p>
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
            className={`btn-modal-primary ${!canRegister ? 'disabled' : ''}`} 
            onClick={handleRegister}
            disabled={!canRegister}
            title={
              isEventCanceled ? 'Evento cancelado' :
              isEventFinished ? 'Evento já realizado' :
              isEventFull ? 'Evento lotado' :
              'Inscrever-se no evento'
            }
          >
            <i className="fas fa-user-plus"></i>
            {isEventCanceled ? 'Evento Cancelado' :
             isEventFinished ? 'Evento Concluído' :
             isEventFull ? 'Evento Lotado' :
             'Inscrever-se Agora'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventModal;