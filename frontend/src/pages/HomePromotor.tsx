import React, { useState } from 'react';
import { useEventos } from '../context/EventosContext';



const HomePromotor = () => {
  

  return (
    <div className="home-promotor-container">
      <h1>Bem-vindo, Promotor!</h1>
      <p>Cadastre um novo evento para a comunidade acadêmica:</p>
    
    </div>
  );
};

export default HomePromotor;
