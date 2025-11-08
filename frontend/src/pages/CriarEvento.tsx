import React, { useState } from 'react';
import { useEventos } from '../context/EventosContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './CriarEvento.css';

const initialEvent = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  type: 'academico' as 'academico' | 'cultural' | 'desportivo',
  category: '',
  max_participants: '',
  target_audience: '',
  requirements: '',
  image: '',
  status: 'pendente' as const
};

const CriarEvento = () => {
  const [event, setEvent] = useState(initialEvent);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { createEvent } = useEventos();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (!user?.id) {
        throw new Error('Usuário não autenticado');
      }

      await createEvent({
        ...event,
        max_participants: Number(event.max_participants),
        promoter_id: user.id
      });
      
      setSuccess(true);
      setEvent(initialEvent);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/eventos');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar evento');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/organizadores');
  };

  const categories = [
    { value: 'cientificos', label: '🔬 Científicos' },
    { value: 'culturais', label: '🎭 Culturais' },
    { value: 'cursos', label: '📚 Cursos' },
    { value: 'workshops', label: '🛠️ Workshops' },
    { value: 'palestras', label: '🎤 Palestras' },
    { value: 'desportivos', label: '⚽ Desportivos' },
    { value: 'social', label: '🎉 Social' },
    { value: 'academico', label: '🏛️ Académico' },
  ];

  return (
    <div className="criar-evento-container">
      {/* Header */}
      <div className="criar-evento-header">
        <div className="container">
        
          <h1>Criar Novo Evento</h1>
          <p>Preencha os detalhes do evento para compartilhar com a comunidade académica</p>
        </div>
      </div>

      {/* Form Section */}
      <div className="criar-evento-content">
        <div className="container">
          <div className="form-container">
            <form className="event-form" onSubmit={handleSubmit}>
              {/* Seção Principal */}
              <div className="form-section">
                <h2>Informações Básicas</h2>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label htmlFor="title">Título do Evento *</label>
                    <input
                      id="title"
                      name="title"
                      type="text"
                      value={event.title}
                      onChange={handleChange}
                      placeholder="Ex: Conferência de Tecnologia 2024"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="category">Categoria *</label>
                    <select
                      id="category"
                      name="category"
                      value={event.category}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecione uma categoria</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="date">Data *</label>
                    <input
                      id="date"
                      name="date"
                      type="date"
                      value={event.date}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="time">Hora *</label>
                    <input
                      id="time"
                      name="time"
                      type="time"
                      value={event.time}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="location">Local *</label>
                    <input
                      id="location"
                      name="location"
                      type="text"
                      value={event.location}
                      onChange={handleChange}
                      placeholder="Ex: Auditório Principal, UEM"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="max_participants">Máx. Participantes *</label>
                    <input
                      id="max_participants"
                      name="max_participants"
                      type="number"
                      value={event.max_participants}
                      onChange={handleChange}
                      min="1"
                      max="1000"
                      placeholder="Ex: 100"
                      required
                    />
                  </div>

                  <div className="form-group full-width">
                    <label htmlFor="image">Imagem do Evento (URL)</label>
                    <input
                      id="image"
                      name="image"
                      type="url"
                      value={event.image}
                      onChange={handleChange}
                      placeholder="https://exemplo.com/imagem-evento.jpg"
                    />
                    <small className="helper-text">
                      Cole a URL de uma imagem representativa do evento
                    </small>
                  </div>
                </div>
              </div>

              {/* Seção Descrição */}
              <div className="form-section">
                <h2>Descrição do Evento</h2>
                <div className="form-group full-width">
                  <label htmlFor="description">Descrição Detalhada *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={event.description}
                    onChange={handleChange}
                    placeholder="Descreva o evento em detalhes: objetivos, público-alvo, programação, palestrantes, etc."
                    rows={6}
                    required
                  />
                  <small className="helper-text">
                    Mínimo 100 caracteres. Esta descrição será visível para todos os participantes.
                  </small>
                </div>
              </div>

              {/* Preview da Imagem */}
              {event.image && (
                <div className="form-section">
                  <h2>Pré-visualização</h2>
                  <div className="image-preview">
                    <img src={event.image} alt="Preview do evento" />
                    <p>Pré-visualização da imagem do evento</p>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Cadastrando...
                    </>
                  ) : (
                    'Cadastrar Evento'
                  )}
                </button>
              </div>

              {/* Mensagem de Sucesso */}
              {success && (
                <div className="success-message">
                  <div className="success-icon">✓</div>
                  <div>
                    <h3>Evento cadastrado com sucesso!</h3>
                    <p>O evento foi criado e está agora visível para a comunidade.</p>
                  </div>
                </div>
              )}
            </form>

            {/* Sidebar de Ajuda */}
            <div className="form-sidebar">
              <div className="help-card">
                <h3>💡 Dicas para um bom evento</h3>
                <ul>
                  <li>Use um título claro e descritivo</li>
                  <li>Selecione a categoria mais apropriada</li>
                  <li>Forneça uma descrição detalhada</li>
                  <li>Use uma imagem de alta qualidade</li>
                  <li>Verifique a capacidade do local</li>
                </ul>
              </div>

              <div className="info-card">
                <h3>📋 Informações Importantes</h3>
                <p>
                  Todos os eventos são revisados pela administração antes de serem 
                  publicados. Certifique-se de que todas as informações estão correctas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarEvento;