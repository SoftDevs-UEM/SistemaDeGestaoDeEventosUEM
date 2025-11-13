import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MinhasInscricoes.css';
import Footer from '../layouts/footer';
import api from '../services/api';

interface Registration {
  id: number;
  numero_inscricao: string;
  status: string;
  data_inscricao: string;
  pagamento: string;
  metodo_pagamento: string;
  event: {
    id: number;
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    image: string;
    category: string;
    status: string;
  };
}

const MinhasInscricoes = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser, isAuthenticated } = useAuth();
  
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Estado para mostrar mensagem de sucesso após inscrição
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successData, setSuccessData] = useState<{
    numeroInscricao: string;
    eventTitle: string;
  } | null>(null);

  // Verificar se veio de uma inscrição bem-sucedida
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setShowSuccessMessage(true);
      setSuccessData({
        numeroInscricao: location.state.numeroInscricao,
        eventTitle: location.state.eventTitle
      });
      
      // Limpar o state da navegação
      window.history.replaceState({}, document.title);
      
      // Esconder mensagem após 5 segundos
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // Carregar inscrições do usuário
  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        setLoading(true);
        setError(null);

        let userData = authUser;
        
        // Fallback para localStorage se necessário
        if (!userData || !userData.id) {
          const userStr = localStorage.getItem('usuarioLogado');
          if (userStr) {
            userData = JSON.parse(userStr);
          }
        }

        if (!userData || !userData.id) {
          setError('Usuário não autenticado. Faça login para ver suas inscrições.');
          setLoading(false);
          return;
        }

        console.log('🔄 Carregando inscrições para usuário:', userData.id);
        
        const response = await api.get(`/registrations/user/${userData.id}`);
        
        if (response.data.success) {
          console.log(`✅ ${response.data.data.length} inscrições carregadas`);
          setRegistrations(response.data.data);
        } else {
          throw new Error(response.data.message || 'Erro ao carregar inscrições');
        }

      } catch (err: any) {
        console.error('❌ Erro ao carregar inscrições:', err);
        
        let errorMessage = 'Erro ao carregar suas inscrições. Tente novamente.';
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        } else if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'Erro de conexão. Verifique sua internet.';
        }
        
        setError(errorMessage);
        setRegistrations([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadRegistrations();
    } else {
      setError('Faça login para ver suas inscrições.');
      setLoading(false);
    }
  }, [isAuthenticated, authUser]);

  // Filtrar e pesquisar inscrições
  const filteredRegistrations = registrations.filter(registration => {
    // Filtro por status
    let statusMatch = true;
    if (filter === 'confirmadas') statusMatch = registration.status === 'confirmado';
    if (filter === 'pendentes') statusMatch = registration.status === 'pendente';
    if (filter === 'canceladas') statusMatch = registration.status === 'cancelado';
    
    // Filtro por busca
    const searchMatch = searchTerm === '' || 
      registration.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      registration.numero_inscricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && searchMatch;
  });

  // Formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Formatar hora
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Obter classe do status
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'status-confirmed';
      case 'pendente':
        return 'status-pending';
      case 'cancelado':
        return 'status-cancelled';
      default:
        return 'status-pending';
    }
  };

  // Obter texto do status
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmada';
      case 'pendente':
        return 'Pendente';
      case 'cancelado':
        return 'Cancelada';
      default:
        return status;
    }
  };

  // Verificar se o evento já passou
  const isEventPassed = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  // Cancelar inscrição
  const handleCancelRegistration = async (registrationId: number, eventTitle: string) => {
    alert('🚧 Funcionalidade de cancelamento em desenvolvimento!');
    return;

    try {
      setLoading(true);
      const response = await api.put(`/registrations/${registrationId}/cancel`);
      
      if (response.data.success) {
        // Atualizar a lista local
        setRegistrations(prev => 
          prev.map(reg => 
            reg.id === registrationId 
              ? { ...reg, status: 'cancelado' }
              : reg
          )
        );
        alert('Inscrição cancelada com sucesso!');
      } else {
        throw new Error(response.data.message || 'Erro ao cancelar inscrição');
      }
    } catch (err: any) {
      console.error('Erro ao cancelar inscrição:', err);
      alert(err.response?.data?.message || 'Erro ao cancelar inscrição. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="minhas-inscricoes-page">
        <div className="container">
          <div className="page-container">
            <div className="auth-required-message">
              <i className="fas fa-exclamation-triangle"></i>
              <h2>Acesso Restrito</h2>
              <p>Você precisa estar logado para visualizar suas inscrições.</p>
           
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="minhas-inscricoes-page">
      <div className="container">
        <div className="page-container">
          
          {/* Cabeçalho */}
          <div className="page-header">
            <h1>Minhas Inscrições</h1>
            <p>Acompanhe todos os eventos em que você se inscreveu</p>
          </div>

          {/* Mensagem de Sucesso */}
          {showSuccessMessage && successData && (
            <div className="success-banner">
              <div className="success-content">
                <i className="fas fa-check-circle"></i>
                <div>
                  <h3>Inscrição Realizada com Sucesso!</h3>
                  <p>
                    Você se inscreveu no evento <strong>"{successData.eventTitle}"</strong>
                    <br />
                    Número da inscrição: <strong>{successData.numeroInscricao}</strong>
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="close-banner"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          )}

          {/* Estatísticas */}
          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-icon total">
                <i className="fas fa-list"></i>
              </div>
              <div className="stat-info">
                <span className="stat-number">{registrations.length}</span>
                <span className="stat-label">Total de Inscrições</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon confirmed">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-number">
                  {registrations.filter(r => r.status === 'confirmado').length}
                </span>
                <span className="stat-label">Confirmadas</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon pending">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <span className="stat-number">
                  {registrations.filter(r => r.status === 'pendente').length}
                </span>
                <span className="stat-label">Pendentes</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon cancelled">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-info">
                <span className="stat-number">
                  {registrations.filter(r => r.status === 'cancelado').length}
                </span>
                <span className="stat-label">Canceladas</span>
              </div>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="filters-section">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'todas' ? 'active' : ''}`}
                onClick={() => setFilter('todas')}
              >
                Todas
              </button>
              <button 
                className={`filter-btn ${filter === 'confirmadas' ? 'active' : ''}`}
                onClick={() => setFilter('confirmadas')}
              >
                Confirmadas
              </button>
              <button 
                className={`filter-btn ${filter === 'pendentes' ? 'active' : ''}`}
                onClick={() => setFilter('pendentes')}
              >
                Pendentes
              </button>
              <button 
                className={`filter-btn ${filter === 'canceladas' ? 'active' : ''}`}
                onClick={() => setFilter('canceladas')}
              >
                Canceladas
              </button>
            </div>
            
            <div className="search-box">
              <input 
                type="text" 
                placeholder="Buscar por evento ou número de inscrição..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="registrations-content">
            {loading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <h3>Carregando suas inscrições...</h3>
                <p>Aguarde enquanto buscamos suas informações.</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <i className="fas fa-exclamation-circle"></i>
                <h3>Erro ao carregar inscrições</h3>
                <p>{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn-primary"
                >
                  <i className="fas fa-redo"></i>
                  Tentar Novamente
                </button>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-calendar-times"></i>
                <h3>Nenhuma inscrição encontrada</h3>
                <p>
                  {filter === 'todas' && searchTerm === ''
                    ? 'Você ainda não se inscreveu em nenhum evento.'
                    : `Nenhuma inscrição encontrada.`
                  }
                </p>
              
                {filter === 'todas' && searchTerm === '' && (
                  <button 
                    onClick={() => navigate('/eventos')}
                    className="btn-primary"
                  >
                    <i className="fas fa-calendar-alt"></i>
                    Explorar Eventos
                  </button>
                )}
              </div>
            ) : (
              <div className="registrations-grid">
                {filteredRegistrations.map(registration => (
                  <div key={registration.id} className="registration-card">
                    <div className="card-header">
                      <div className="registration-number">
                        <i className="fas fa-ticket-alt"></i>
                        <span>#{registration.numero_inscricao}</span>
                      </div>
                      <div className={`status-badge ${getStatusClass(registration.status)}`}>
                        {getStatusText(registration.status)}
                      </div>
                    </div>

                    <div className="event-info">
                      <div className="event-image">
                        <img 
                          src={registration.event.image || '/default-event.jpg'} 
                          alt={registration.event.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/default-event.jpg';
                          }}
                        />
                        {isEventPassed(registration.event.date) && (
                          <div className="event-passed-overlay">
                            <span>Evento Realizado</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="event-details">
                        <h3 className="event-title">{registration.event.title}</h3>
                        <p className="event-description">
                          {registration.event.description.length > 120 
                            ? `${registration.event.description.substring(0, 120)}...`
                            : registration.event.description
                          }
                        </p>
                        
                        <div className="event-meta">
                          <div className="meta-item">
                            <i className="fas fa-calendar-alt"></i>
                            <span>{formatDate(registration.event.date)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-clock"></i>
                            <span>{formatTime(registration.event.time)}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <span>{registration.event.location}</span>
                          </div>
                          <div className="meta-item">
                            <i className="fas fa-tag"></i>
                            <span>{registration.event.category}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="registration-details">
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Data da Inscrição:</strong>
                          <span>{formatDate(registration.data_inscricao)}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Método de Pagamento:</strong>
                          <span>{registration.metodo_pagamento}</span>
                        </div>
                      </div>
                      <div className="detail-row">
                        <div className="detail-item">
                          <strong>Número para Pagamento:</strong>
                          <span>{registration.pagamento}</span>
                        </div>
                        <div className="detail-item">
                          <strong>Status do Pagamento:</strong>
                          <span className={`payment-status ${registration.status}`}>
                            {registration.status === 'confirmado' ? 'Pago' : 
                             registration.status === 'pendente' ? 'Pendente' : 'Cancelado'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        onClick={() => navigate(`/eventos/${registration.event.id}`)}
                        className="btn-outline"
                      >
                        <i className="fas fa-eye"></i>
                        Ver Evento
                      </button>
                      
                      {registration.status === 'confirmado' && !isEventPassed(registration.event.date) && (
                        <button 
                          onClick={() => handleCancelRegistration(registration.id, registration.event.title)}
                          className="btn-danger"
                          disabled={loading}
                        >
                          <i className="fas fa-times"></i>
                          {loading ? 'Processando...' : 'Cancelar Inscrição'}
                        </button>
                      )}

                      {registration.status === 'pendente' && (
                        <button 
                          onClick={() => navigate(`/eventos/${registration.event.id}`)}
                          className="btn-primary"
                        >
                          <i className="fas fa-credit-card"></i>
                          Completar Pagamento
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ações Adicionais */}
          {!loading && !error && registrations.length > 0 && (
            <div className="additional-actions">
              <div className="action-card">
                <i className="fas fa-calendar-plus"></i>
                <div>
                  <h4>Encontre mais eventos</h4>
                  <p>Explore nossa lista de eventos disponíveis e participe de novas experiências.</p>
                </div>
                <button 
                  onClick={() => navigate('/eventos')}
                  className="btn-primary"
                >
                  Ver Eventos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MinhasInscricoes;