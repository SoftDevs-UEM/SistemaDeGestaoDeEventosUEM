import React, { useState } from 'react';
import { useEventos } from '../context/EventosContext';

const initialEvent = {
  title: '',
  date: '',
  time: '',
  location: '',
  image: '',
  category: '',
  description: '',
  maxParticipants: '',
};


const HomePromotor = () => {
  const [event, setEvent] = useState(initialEvent);
  const [success, setSuccess] = useState(false);
  const { addEvento } = useEventos();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEvento({
      ...event,
      maxParticipants: Number(event.maxParticipants),
      attendees: 0,
      participants: 0,
    });
    setSuccess(true);
    setEvent(initialEvent);
  };

  return (
    <div className="home-promotor-container">
      <h1>Bem-vindo, Promotor!</h1>
      <p>Cadastre um novo evento para a comunidade acadêmica:</p>
      <form className="event-form" onSubmit={handleSubmit} style={{maxWidth: 500, margin: '0 auto'}}>
        <div className="form-group">
          <label>Título do Evento</label>
          <input name="title" value={event.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Data</label>
          <input name="date" type="date" value={event.date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Hora</label>
          <input name="time" type="time" value={event.time} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Local</label>
          <input name="location" value={event.location} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Imagem (URL)</label>
          <input name="image" value={event.image} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Categoria</label>
          <select name="category" value={event.category} onChange={handleChange} required>
            <option value="">Selecione</option>
            <option value="cientificos">Científicos</option>
            <option value="culturais">Culturais</option>
            <option value="cursos">Cursos</option>
            <option value="workshops">Workshops</option>
            <option value="palestras">Palestras</option>
            <option value="desportivos">Desportivos</option>
          </select>
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <textarea name="description" value={event.description} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Número máximo de participantes</label>
          <input name="maxParticipants" type="number" value={event.maxParticipants} onChange={handleChange} required />
        </div>
        <button type="submit" className="btn-primary">Cadastrar Evento</button>
        {success && <p style={{color: 'green', marginTop: 10}}>Evento cadastrado com sucesso!</p>}
      </form>
    </div>
  );
};

export default HomePromotor;
