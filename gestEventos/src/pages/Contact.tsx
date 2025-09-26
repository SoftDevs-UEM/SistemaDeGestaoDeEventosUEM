// Contact.jsx
import React, { useState } from 'react';
import Footer from '../layouts/footer';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    assunto: '',
    mensagem: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode adicionar a lógica para enviar o formulário
    console.log('Dados do formulário:', formData);
    alert('Mensagem enviada com sucesso!');
    // Limpar o formulário após o envio
    setFormData({
      nome: '',
      email: '',
      assunto: '',
      mensagem: ''
    });
  };

  return (
   <div className="contact-page">
  {/* Hero Section */}
  <section className="contact-hero">
    <div className="container">
      <h1>Contacto</h1>
      <p className="hero-subtitle">Estamos aqui para ajudar. Entre em contacto connosco</p>
    </div>
  </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Informações de Contacto */}
            <div className="contact-info">
              <h2>Informações de Contacto</h2>
              
              <div className="contact-item">
                <div className="contact-icon">📞</div>
                <div className="contact-details">
                  <h3>Telefone</h3>
                  <p>+258 (21) 430239</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">✉️</div>
                <div className="contact-details">
                  <h3>Email</h3>
                  <p>cecoma@uem.ac.mz</p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div className="contact-details">
                  <h3>Localização</h3>
                  <p>Campus Universitário Principal<br />
                  Av. Julius Nyerere, nr. 3463<br />
                  Maputo, Moçambique</p>
                </div>
              </div>
            </div>

            {/* Formulário de Contacto */}
            <div className="contact-form-section">
              <h2>DEIXE A SUA MENSAGEM AQUI</h2>
              <p className="form-subtitle">Preencha com clareza os campos abaixo</p>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nome">Nome *</label>
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
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
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="assunto">Assunto *</label>
                  <input
                    type="text"
                    id="assunto"
                    name="assunto"
                    value={formData.assunto}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="mensagem">Mensagem *</label>
                  <textarea
                    id="mensagem"
                    name="mensagem"
                    rows="6"
                    value={formData.mensagem}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">ENVIAR</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;