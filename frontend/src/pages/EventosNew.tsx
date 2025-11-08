import React, { useEffect } from 'react';
import { useEventos } from '../context/EventosContext';
import './Eventos.css';
import Footer from '../layouts/footer';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Evento {
  id: number;
  titulo: string;
  descricao: string;
  dataHora: string;
  local: string;
  imagem: string;
}

export default function Eventos() {
  const navigate = useNavigate();
  const { eventos, carregarEventos } = useEventos();
  const { isAuthenticated, userType } = useAuth();

  useEffect(() => {
    carregarEventos();
  }, [carregarEventos]);

  const handleParticiparClick = (eventoId: number) => {
    if (!isAuthenticated) {
      const evento = eventos.find((e: Evento) => e.id === eventoId);
      if (evento) {
        localStorage.setItem('eventoParaInscricao', JSON.stringify(evento));
      }
      navigate('/login');
    } else if (userType === 'estudante') {
      navigate(`/eventos/${eventoId}/registrar`);
    } else if (userType === 'promotor' || userType === 'admin') {
      navigate('/organizadores');
    }
  };

  return (
    <div>
      <div className="eventos-container">
        <div className="eventos">
          {eventos.map((evento: Evento) => (
            <div key={evento.id} className="evento">
              <img src={evento.imagem} alt={evento.titulo} />
              <h2>{evento.titulo}</h2>
              <p className="description">{evento.descricao}</p>
              <p>Data: {evento.dataHora}</p>
              <p>Local: {evento.local}</p>
              {isAuthenticated && userType === 'estudante' && (
                <button onClick={() => handleParticiparClick(evento.id)}>
                  Participar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}