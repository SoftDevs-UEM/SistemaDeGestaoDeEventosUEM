import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './RegistrarEvento.css';
import Footer from '../layouts/footer';
import api from '../services/api';

interface Event {
  id: number;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  image: string;
  max_participants: number;
  participants: number;
  status: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  telefone?: string;
  nr_estudante?: string;
  curso?: string;
}

interface Registration {
  id: number;
  numero_inscricao: string;
  status: string;
}

const RegistrarEvento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser, isAuthenticated } = useAuth();
  
  const [event, setEvent] = useState<Event | null>(location.state?.event || null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [existingRegistration, setExistingRegistration] = useState<Registration | null>(null);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const [formData, setFormData] = useState({
    pagamento: '',
    metodoPagamento: '',
  });

  // Carregar dados do usuário e evento
  useEffect(() => {
    const loadUserAndEvent = async () => {
      try {
        let userData: User | null = null;
        
        // Tentar obter usuário do AuthContext primeiro
        if (authUser && authUser.id) {
          userData = authUser as User;
        } else {
          // Fallback para localStorage
          const userStr = localStorage.getItem('usuarioLogado');
          if (userStr) {
            userData = JSON.parse(userStr);
          }
        }

        if (!userData || !userData.id) {
          alert('Usuário não autenticado. Faça login novamente.');
          navigate('/login');
          return;
        }

        setUser(userData);

        // Carregar evento se não veio via state
        if (id && !event) {
          try {
            const response = await api.get(`/events/${id}`);
            if (response.data) {
              setEvent(response.data);
            } else {
              throw new Error('Evento não encontrado');
            }
          } catch (error) {
            console.error('Erro ao carregar evento:', error);
            alert('Evento não encontrado ou não disponível');
            navigate('/eventos');
            return;
          }
        }

        // Verificar se usuário já está inscrito
        if (id && userData.id) {
          try {
            const checkResponse = await api.get(`/registrations/check/${id}/${userData.id}`);
            if (checkResponse.data.is_registered && checkResponse.data.registration) {
              setIsAlreadyRegistered(true);
              setExistingRegistration(checkResponse.data.registration);
            }
          } catch (error) {
            console.log('Erro ao verificar inscrição:', error);
            // Não bloqueia o processo se a verificação falhar
          }
        }

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar informações. Tente novamente.');
        navigate('/eventos');
      }
    };

    loadUserAndEvent();
  }, [id, navigate, authUser, event]);

  // Validar formulário
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    if (!formData.pagamento.trim()) {
      errors.pagamento = 'Número de pagamento é obrigatório';
    } else if (!/^[\d\s\+\-\(\)]{8,}$/.test(formData.pagamento)) {
      errors.pagamento = 'Número de pagamento inválido';
    }

    if (!formData.metodoPagamento) {
      errors.metodoPagamento = 'Método de pagamento é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      alert('Erro: Não foi possível identificar seu usuário. Faça login novamente.');
      navigate('/login');
      return;
    }

    if (!event || !event.id) {
      alert('Erro: Evento não encontrado.');
      return;
    }

    if (isAlreadyRegistered && existingRegistration) {
      alert(`Você já está inscrito neste evento!\n\nNúmero da inscrição: ${existingRegistration.numero_inscricao}`);
      navigate('/minhas-inscricoes');
      return;
    }

    if (availableSpots <= 0) {
      alert('Desculpe, este evento está lotado. Não há vagas disponíveis no momento.');
      return;
    }

    // Validar formulário
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const registrationData = {
        event_id: event.id,
        user_id: user.id,
        pagamento: formData.pagamento.trim(),
        metodo_pagamento: formData.metodoPagamento
      };

      console.log('🎯 Enviando inscrição:', registrationData);

      const response = await api.post('/registrations', registrationData);
      
      if (response.data.success) {
        const numeroInscricao = response.data.numero_inscricao;
        
        alert(`✅ Inscrição realizada com sucesso!\n\n📝 Número da inscrição: ${numeroInscricao}\n\nGuarde este número para referência futura.`);
        
        // Navegar para minhas inscrições com estado
        navigate('/minhas-inscricoes', { 
          state: { 
            registrationSuccess: true,
            numeroInscricao: numeroInscricao,
            eventTitle: event.title
          }
        });

      } else {
        throw new Error(response.data.message || 'Erro desconhecido no servidor');
      }

    } catch (error: any) {
      console.error('💥 Erro na inscrição:', error);
      
      let errorMessage = 'Erro ao realizar inscrição. Tente novamente.';
      
      // Tratar diferentes tipos de erro
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n• ');
        errorMessage = `Erros de validação:\n• ${errorMessages}`;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Tratar casos específicos
        if (errorMessage.includes('já está inscrito')) {
          setIsAlreadyRegistered(true);
          if (error.response.data.numero_inscricao_existente) {
            setExistingRegistration({
              id: 0,
              numero_inscricao: error.response.data.numero_inscricao_existente,
              status: 'confirmado'
            });
          }
        }
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Calcular vagas disponíveis
  const availableSpots = event 
    ? Math.max(0, event.max_participants - (event.participants || 0))
    : 0;

  const progressPercentage = event && event.max_participants > 0
    ? Math.min(100, ((event.participants || 0) / event.max_participants) * 100)
    : 0;

  // Estados de loading
  if (!event) {
    return (
      <div className="registrar-container">
        <div className="container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <h2>Carregando evento...</h2>
            <p>Aguarde enquanto carregamos as informações.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registrar-container">
      <div className="container">
        <div className="registrar-content">
          <div className="registrar-header">
            <h1>Inscrever-se no Evento</h1>
            <p>Complete os dados de pagamento para confirmar sua participação</p>
          </div>

          {/* Card de Informações do Evento */}
          <div className="event-info-card">
            <div className="event-hero">
              <img 
                src={event.image || '/default-event.jpg'} 
                alt={event.title} 
                className="event-hero-image" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-event.jpg';
                }}
              />
              <div className="event-hero-overlay">
                <span className="event-category-badge">{event.category}</span>
                <h2>{event.title}</h2>
              </div>
            </div>

            <div className="event-details-grid">
              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-file-alt"></i>
                  <h3>Descrição</h3>
                </div>
                <p className="detail-content">{event.description}</p>
              </div>

              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-tag"></i>
                  <h3>Categoria</h3>
                </div>
                <div className="category-display">
                  <span className="category-badge">{event.category}</span>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-users"></i>
                  <h3>Participação</h3>
                </div>
                <div className="participation-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{event.participants || 0}</span>
                      <span className="stat-label">Inscritos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{event.max_participants}</span>
                      <span className="stat-label">Vagas Totais</span>
                    </div>
                    <div className="stat-item">
                      <span className={`stat-number ${availableSpots === 0 ? 'text-danger' : ''}`}>
                        {availableSpots}
                      </span>
                      <span className="stat-label">Vagas Livres</span>
                    </div>
                  </div>
                  
                  <div className="progress-section">
                    <div className="progress-info">
                      <span>Preenchimento do evento</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${progressPercentage >= 90 ? 'high-capacity' : ''}`}
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-info-circle"></i>
                  <h3>Informações</h3>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <i className="fas fa-calendar-alt"></i>
                    <div>
                      <strong>Data</strong>
                      <span>{new Date(event.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>Local</strong>
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <div>
                      <strong>Hora</strong>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status de Inscrição */}
              {isAlreadyRegistered && existingRegistration && (
                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-check-circle success-icon"></i>
                    <h3>Status da Inscrição</h3>
                  </div>
                  <div className="registration-status">
                    <div className="status-success">
                      <i className="fas fa-check"></i>
                      <div>
                        <strong>Você já está inscrito neste evento!</strong>
                        <p>Número da inscrição: <strong>{existingRegistration.numero_inscricao}</strong></p>
                        <p>Status: <span className="status-badge confirmed">Confirmada</span></p>
                      </div>
                    </div>
                    <div className="status-actions">
                      <button 
                        onClick={() => navigate('/minhas-inscricoes')}
                        className="btn-primary"
                      >
                        <i className="fas fa-list"></i>
                        Ver Minhas Inscrições
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dados do Usuário */}
              {user && (
                <div className="detail-section">
                  <div className="detail-header">
                    <i className="fas fa-user"></i>
                    <h3>Seus Dados</h3>
                  </div>
                  <div className="user-data-grid">
                    <div className="user-data-item">
                      <strong>Nome:</strong>
                      <span>{user.name}</span>
                    </div>
                    <div className="user-data-item">
                      <strong>Email:</strong>
                      <span>{user.email}</span>
                    </div>
                    {user.telefone && (
                      <div className="user-data-item">
                        <strong>Telefone:</strong>
                        <span>{user.telefone}</span>
                      </div>
                    )}
                    {user.nr_estudante && (
                      <div className="user-data-item">
                        <strong>Matrícula:</strong>
                        <span>{user.nr_estudante}</span>
                      </div>
                    )}
                    {user.curso && (
                      <div className="user-data-item">
                        <strong>Curso:</strong>
                        <span>{user.curso}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulário de Inscrição */}
          {!isAlreadyRegistered && (
            <form onSubmit={handleSubmit} className="registrar-form">
              <div className="form-section">
                <h3>Dados de Pagamento</h3>
                <div className="form-grid">


                  <div className="form-group">
                    <label htmlFor="metodoPagamento">Método de Pagamento *</label>
                    <select
                      id="metodoPagamento"
                      name="metodoPagamento"
                      value={formData.metodoPagamento}
                      onChange={handleChange}
                      required
                      disabled={loading}
                      className={formErrors.metodoPagamento ? 'error' : ''}
                    >
                      <option value="">Selecione o método</option>
                      <option value="M-Pesa">M-Pesa</option>
                      <option value="E-Mola">E-Mola</option>
                      <option value="M-Kesh">M-Kesh</option>
                      <option value="NetShop">NetShop</option>
                    </select>
                    {formErrors.metodoPagamento && (
                      <span className="error-message">{formErrors.metodoPagamento}</span>
                    )}
                    <small className="form-help">
                      Selecione o método de pagamento móvel que você utiliza
                    </small>
                  </div>


                  <div className="form-group">
                    <label htmlFor="pagamento">Número para Pagamento *</label>
                    <input
                      type="text"
                      id="pagamento"
                      name="pagamento"
                      value={formData.pagamento}
                      onChange={handleChange}
                      required
                      placeholder="Ex: 84 123 4567"
                      disabled={loading}
                      className={formErrors.pagamento ? 'error' : ''}
                    />
                    {formErrors.pagamento && (
                      <span className="error-message">{formErrors.pagamento}</span>
                    )}
                    <small className="form-help">
                      Digite o número do seu celular para receber a solicitação de pagamento
                    </small>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  <i className="fas fa-arrow-left"></i>
                  Voltar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={availableSpots <= 0 || loading || !user}
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Processando...
                    </>
                  ) : availableSpots <= 0 ? (
                    <>
                      <i className="fas fa-times"></i>
                      Evento Lotado
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle"></i>
                      Confirmar Inscrição
                    </>
                  )}
                </button>
              </div>

              {availableSpots <= 0 && (
                <div className="warning-message">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>Este evento está lotado. Não é possível realizar novas inscrições.</span>
                </div>
              )}

              {availableSpots > 0 && availableSpots < 5 && (
                <div className="info-message">
                  <i className="fas fa-info-circle"></i>
                  <span>Últimas vagas disponíveis! Reserve a sua agora.</span>
                </div>
              )}
            </form>
          )}

          {/* Mensagem de já inscrito */}
          {isAlreadyRegistered && (
            <div className="already-registered-message">
              <div className="success-card">
                <i className="fas fa-check-circle"></i>
                <h3>Inscrição Confirmada</h3>
                <p>Você já está inscrito neste evento. Acompanhe suas inscrições na página "Minhas Inscrições".</p>
                <div className="action-buttons">
                  <button 
                    onClick={() => navigate('/minhas-inscricoes')}
                    className="btn-primary"
                  >
                    <i className="fas fa-list"></i>
                    Ver Minhas Inscrições
                  </button>
                  <button 
                    onClick={() => navigate('/eventos')}
                    className="btn-secondary"
                  >
                    <i className="fas fa-calendar"></i>
                    Ver Mais Eventos
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegistrarEvento;