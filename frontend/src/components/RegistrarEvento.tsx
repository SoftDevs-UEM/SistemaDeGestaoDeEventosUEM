import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './RegistrarEvento.css';
import Footer from '../layouts/footer';

const RegistrarEvento = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    matricula: '',
    curso: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados de inscrição:', formData);
    console.log('Evento:', event);
    alert('Inscrição realizada com sucesso!');
    navigate('/');
  };

  if (!event) {
    return (
      <div className="registrar-container">
        <div className="container">
          <div className="error-state">
            <i className="fas fa-calendar-times"></i>
            <h2>Evento não encontrado</h2>
            <p>Por favor, selecione um evento válido para se inscrever.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Voltar para Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableSpots = event.maxParticipants - event.participants;
  const progressPercentage = (event.participants / event.maxParticipants) * 100;

  return (
    <div className="registrar-container">
      <div className="container">
        <div className="registrar-content">
          <div className="registrar-header">
            <h1>Inscrever-se no Evento</h1>
            <p>Complete o formulário abaixo para confirmar sua participação</p>
          </div>

          {/* Card de Informações do Evento - Layout Melhorado */}
          <div className="event-info-card">
            <div className="event-hero">
              <img src={event.image} alt={event.title} className="event-hero-image" />
              <div className="event-hero-overlay">
                <span className="event-category-badge">{event.category}</span>
                <h2>{event.title}</h2>
              </div>
            </div>

            <div className="event-details-grid">
              {/* Descrição */}
              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-file-alt"></i>
                  <h3>Descrição</h3>
                </div>
                <p className="detail-content">{event.description}</p>
              </div>

              {/* Categoria */}
              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-tag"></i>
                  <h3>Categoria</h3>
                </div>
                <div className="category-display">
                  <span className="category-badge">{event.category}</span>
                </div>
              </div>

              {/* Participação */}
              <div className="detail-section">
                <div className="detail-header">
                  <i className="fas fa-users"></i>
                  <h3>Participação</h3>
                </div>
                <div className="participation-stats">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-number">{event.participants}</span>
                      <span className="stat-label">Inscritos</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{event.maxParticipants}</span>
                      <span className="stat-label">Vagas Totais</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-number">{availableSpots}</span>
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
                        className="progress-fill" 
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
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
                      <span>{event.date}</span>
                    </div>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <div>
                      <strong>Local</strong>
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Inscrição */}
          <form onSubmit={handleSubmit} className="registrar-form">
            <div className="form-section">
              <h3>Dados Pessoais</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nome">Nome Completo *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu nome completo"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu.email@uem.ac.mz"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="telefone">Telefone</label>
                  <input
                    type="tel"
                    id="telefone"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="+258 8X XXX XXXX"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="matricula">Número de Estudante *</label>
                  <input
                    type="text"
                    id="matricula"
                    name="matricula"
                    value={formData.matricula}
                    onChange={handleChange}
                    required
                    placeholder="Ex: 202301234"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="curso">Curso *</label>
                  <input
                    type="text"
                    id="curso"
                    name="curso"
                    value={formData.curso}
                    onChange={handleChange}
                    required
                    placeholder="Digite seu curso"
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn-secondary"
                onClick={() => navigate(-1)}
              >
                <i className="fas fa-arrow-left"></i>
                Voltar
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={availableSpots <= 0}
              >
                <i className="fas fa-check-circle"></i>
                {availableSpots <= 0 ? 'Evento Lotado' : 'Confirmar Inscrição'}
              </button>
            </div>

            {availableSpots <= 0 && (
              <div className="warning-message">
                <i className="fas fa-exclamation-triangle"></i>
                <span>Este evento está lotado. Não é possível realizar novas inscrições.</span>
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegistrarEvento;