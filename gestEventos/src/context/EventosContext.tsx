import React, { createContext, useContext, useState } from 'react';

export interface EventoType {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  description: string;
  maxParticipants: number;
  attendees?: number;
  participants?: number;
}

interface EventosContextType {
  eventos: EventoType[];
  addEvento: (evento: Omit<EventoType, 'id'>) => void;
}

const EventosContext = createContext<EventosContextType | undefined>(undefined);

export const EventosProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [eventos, setEventos] = useState<EventoType[]>([]);

  const addEvento = (evento: Omit<EventoType, 'id'>) => {
    setEventos((prev) => [
      ...prev,
      { ...evento, id: Date.now() }
    ]);
  };

  return (
    <EventosContext.Provider value={{ eventos, addEvento }}>
      {children}
    </EventosContext.Provider>
  );
};

export const useEventos = () => {
  const context = useContext(EventosContext);
  if (!context) throw new Error('useEventos must be used within EventosProvider');
  return context;
};
