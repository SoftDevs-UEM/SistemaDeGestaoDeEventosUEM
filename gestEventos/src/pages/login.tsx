import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import './login.css';

export default function Login() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login submitted');
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="unive rsity-logo">
            <div className="logo-circle">
              <span className="logo-text">UEM</span>
            </div>
          </div>
          <h2 className="login-title">Sistema de Gestão de Eventos</h2>
          <p className="university-name">Universidade Eduardo Mondlane</p>
        </div>

        <div className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              <span className="icon-email">📧</span>
              Endereço de Email
            </label>
            <input
              type="email"
              className="form-input"
              id="email"
              placeholder="exemplo@uem.ac.mz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <span className="icon-password">🔒</span>
              Palavra-passe
            </label>
            <input
              type="password"
              className="form-input"
              id="password"
              placeholder="Digite sua palavra-passe"
            />
          </div>

          <div className="form-check">
            <input type="checkbox" className="checkbox" id="remember" />
            <label className="checkbox-label" htmlFor="remember">
              Lembrar-me neste dispositivo
            </label>
          </div>

          <button type="submit" className="btn-login" onClick={handleSubmit}>
            <span>Entrar no Sistema</span>
            <span className="arrow-icon">→</span>
          </button>

          <div className="login-footer">
            <a href="#" className="forgot-link">
              Esqueceu a palavra-passe?
            </a>
               <button className="modal-close" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
          </div>
          
        </div>
      </div>

      <div className="background-elements">
        <div className="floating-element element-1"></div>
        <div className="floating-element element-2"></div>
        <div className="floating-element element-3"></div>
      </div>
    </div>
  );
}
