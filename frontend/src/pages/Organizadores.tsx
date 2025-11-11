import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEventos } from '../context/EventosContext';
import './Organizadores.css';

type EventStats = {
  totalEventos: number;
  eventosAtivos: number;
  eventosFinalizados: number;
  eventosArquivados: number;
  totalParticipantes: number;
};

type ActiveView = 'dashboard' | 'criar-evento' | 'meus-eventos' | 'editar-evento' | 'eventos-arquivados';

// Componente de imagem seguro
const SafeImage = ({ src, alt, className, fallback = '📅' }: { 
  src: string; 
  alt: string; 
  className?: string;
  fallback?: string | React.ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  // Função para verificar se o base64 é válido
  const isValidBase64 = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    try {
      // Verificar se começa com data:image e tem formato base64
      return str.startsWith('data:image') && str.includes('base64,') && str.length > 100;
    } catch {
      return false;
    }
  };

  if (hasError || !isValidBase64(src)) {
    return (
      <div className={`image-fallback ${className}`}>
        {fallback}
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt}
      className={className}
      onError={() => setHasError(true)}
    />
  );
};

// Função para validar data do evento
const validarDataEvento = (data: string): boolean => {
  if (!data) return false;
  
  try {
    const dataEvento = new Date(data);
    const hoje = new Date();
    
    // Resetar horas para comparar apenas as datas
    const hojeSemHoras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEventoSemHoras = new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate());
    
    return dataEventoSemHoras >= hojeSemHoras;
  } catch (error) {
    return false;
  }
};

export default function Organizadores() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout, user } = useAuth();
  const { 
    events, 
    loading, 
    createEvent, 
    updateEvent,
    deleteEvent,
    loadEvents 
  } = useEventos();
  
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [eventStats, setEventStats] = useState<EventStats>({
    totalEventos: 0,
    eventosAtivos: 0,
    eventosFinalizados: 0,
    eventosArquivados: 0,
    totalParticipantes: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [arquivedEvents, setArquivedEvents] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [eventoEditando, setEventoEditando] = useState<any>(null);

  // Estados para o formulário de criar/editar evento
  const [eventoData, setEventoData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    type: 'academico' as 'academico' | 'cultural' | 'desportivo',
    category: '',
    description: '',
    max_participants: '',
    target_audience: '',
    image: '',
    requirements: ''
  });
  
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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

  // Redirecionar se não for promotor ou admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (userType !== 'promotor' && userType !== 'admin') {
      navigate('/');
      return;
    }
    
    loadStatistics();
  }, [isAuthenticated, userType, navigate, events]);

  const loadStatistics = () => {
    setStatsLoading(true);
    
    try {
      // Filtrar eventos do promotor logado (não arquivados)
      const meusEventos = events.filter(event => 
        (event.promoter_id === user?.id || userType === 'admin') && 
        !event.deleted_at
      );

      // Eventos arquivados
      const eventosArquivados = events.filter(event => 
        (event.promoter_id === user?.id || userType === 'admin') && 
        event.deleted_at
      );
      
      // Estatísticas baseadas apenas na data (sem status)
      const eventosAtivos = meusEventos.filter(event => 
        new Date(event.date) >= new Date()
      );
      
      const eventosFinalizados = meusEventos.filter(event => 
        new Date(event.date) < new Date()
      );

      // ✅ CALCULAR TOTAL DE PARTICIPANTES EM TODOS OS EVENTOS
      const totalParticipantes = meusEventos.reduce((total, evento) => {
        // Usar participants_count da API ou participants da tabela
        const participantes = evento.participants_count || evento.participants || 0;
        return total + participantes;
      }, 0);

      setEventStats({
        totalEventos: meusEventos.length,
        eventosAtivos: eventosAtivos.length,
        eventosFinalizados: eventosFinalizados.length,
        eventosArquivados: eventosArquivados.length,
        totalParticipantes: totalParticipantes
      });

      // Eventos recentes (últimos 5) - ordenados por data de criação
      const eventosOrdenados = [...meusEventos].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setRecentEvents(eventosOrdenados.slice(0, 5));

      // Eventos arquivados
      setArquivedEvents(eventosArquivados);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setEventStats({
        totalEventos: 0,
        eventosAtivos: 0,
        eventosFinalizados: 0,
        eventosArquivados: 0,
        totalParticipantes: 0
      });
      setRecentEvents([]);
      setArquivedEvents([]);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setEventoEditando(null);
    resetForm();
  };

  const resetForm = () => {
    setEventoData({
      title: '',
      date: '',
      time: '',
      location: '',
      type: 'academico',
      category: '',
      description: '',
      max_participants: '',
      target_audience: '',
      image: '',
      requirements: ''
    });
    setSuccess(false);
    setSuccessMessage('');
  };

  // Função para debug - verificar dados do evento
  const debugEvento = (evento: any) => {
    console.log('🔍 Debug evento:', {
      id: evento.id,
      title: evento.title,
      date: evento.date,
      dateType: typeof evento.date,
      time: evento.time,
      location: evento.location,
      participants: evento.participants,
      participants_count: evento.participants_count,
      max_participants: evento.max_participants
    });
  };

  // Função para editar evento - MELHORADA
  const handleEditarEvento = (evento: any) => {
    console.log('✏️ Editando evento:', evento);
    debugEvento(evento);
    
    setEventoEditando(evento);
    
    // Converter a data do formato ISO para o formato do input (YYYY-MM-DD)
    const dataISO = evento.date;
    let dataFormatada = '';
    
    if (dataISO) {
      console.log('📅 Data original:', dataISO);
      
      try {
        // Criar objeto Date para garantir formatação correta
        const dataObj = new Date(dataISO);
        if (!isNaN(dataObj.getTime())) {
          dataFormatada = dataObj.toISOString().split('T')[0];
        } else {
          // Fallback para o método anterior se a data for inválida
          if (dataISO.includes('T')) {
            dataFormatada = dataISO.split('T')[0];
          } else if (dataISO.includes(' ')) {
            dataFormatada = dataISO.split(' ')[0];
          } else {
            dataFormatada = dataISO;
          }
        }
        console.log('📅 Data formatada para input:', dataFormatada);
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        dataFormatada = '';
      }
    }

    setEventoData({
      title: evento.title || '',
      date: dataFormatada,
      time: evento.time || '',
      location: evento.location || '',
      type: evento.type || 'academico',
      category: evento.category || '',
      description: evento.description || '',
      max_participants: evento.max_participants?.toString() || '',
      target_audience: evento.target_audience || '',
      image: evento.image || '',
      requirements: evento.requirements || ''
    });
    setActiveView('editar-evento');
  };

  // Função CORRIGIDA para ver detalhes do evento - abre modal ou página de detalhes
  const handleVerDetalhes = (evento: any) => {
    console.log('👀 Ver detalhes do evento:', evento);
    // Navega para a página de detalhes do evento específico
    navigate(`/evento/${evento.id}`);
  };

  // Função para comprimir imagem
  const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        // Redimensionar mantendo aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Desenhar imagem comprimida
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Converter para base64 com qualidade reduzida
        try {
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          console.log('📷 Imagem comprimida. Tamanho:', compressedBase64.length);
          resolve(compressedBase64);
        } catch (error) {
          reject(new Error('Erro ao converter imagem para base64'));
        }
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Função para lidar com upload de imagem - ATUALIZADA com compressão
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      e.target.value = '';
      return;
    }

    // Verificar tamanho do arquivo (limitar para 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB em bytes
    if (file.size > maxSize) {
      alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 2MB.');
      e.target.value = '';
      return;
    }

    setFormLoading(true);

    try {
      const compressedBase64 = await compressImage(file);
      
      setEventoData(prev => ({
        ...prev,
        image: compressedBase64
      }));
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      alert('Erro ao processar a imagem. Tente novamente.');
    } finally {
      setFormLoading(false);
      e.target.value = '';
    }
  };

  // Função para remover imagem
  const handleRemoverImagem = () => {
    setEventoData(prev => ({
      ...prev,
      image: ''
    }));
  };

  // Função para arquivar evento (soft delete)
  const handleArquivarEvento = async (eventId: number, eventTitle: string) => {
    if (window.confirm(`Tem certeza que deseja arquivar o evento "${eventTitle}"?\n\nO evento será marcado como cancelado e não aparecerá para os usuários, mas poderá ser restaurado posteriormente.`)) {
      try {
        await deleteEvent(eventId);
        setSuccessMessage('Evento arquivado com sucesso!');
        setSuccess(true);
        loadStatistics();
        
        setTimeout(() => {
          setSuccess(false);
          setSuccessMessage('');
        }, 3000);
      } catch (error) {
        console.error('Erro ao arquivar evento:', error);
        alert('Erro ao arquivar evento.');
      }
    }
  };

  // Função para restaurar evento
  const handleRestaurarEvento = async (eventId: number) => {
    try {
      const evento = arquivedEvents.find(event => event.id === eventId);
      if (!evento) {
        alert('Evento não encontrado.');
        return;
      }
  
      await updateEvent(eventId, { deleted_at: null, status: 'pendente' });
      setSuccessMessage('Evento restaurado com sucesso!');
      setSuccess(true);
      loadStatistics();
  
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao restaurar evento:', error);
      alert('Erro ao restaurar evento.');
    }
  };

  // Funções auxiliares
  const formatarData = (data: string) => {
    try {
      return new Date(data).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const getEventoState = (evento: any) => {
    const hoje = new Date();
    let dataEvento: Date;
    
    try {
      dataEvento = new Date(evento.date);
    } catch (error) {
      return { label: 'Data inválida', class: 'pending', icon: '❓' };
    }
    
    if (dataEvento < hoje) {
      return { label: 'Finalizado', class: 'finished', icon: '✅' };
    } else if (evento.status === 'ativo') {
      return { label: 'Ativo', class: 'active', icon: '🟢' };
    } else {
      return { label: 'Pendente', class: 'pending', icon: '🟡' };
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEventoData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      // VALIDAÇÃO DE DATA - IMPEDIR DATAS PASSADAS
      if (!validarDataEvento(eventoData.date)) {
        throw new Error('Não é possível criar eventos em datas passadas. Por favor, selecione uma data futura.');
      }

      // Validar e formatar dados antes de enviar
      const dadosParaEnviar = {
        ...eventoData,
        max_participants: parseInt(eventoData.max_participants) || 0,
        promoter_id: user?.id || 0,
        status: 'pendente',
        // Garantir que a data está no formato correto
        date: eventoData.date ? new Date(eventoData.date).toISOString().split('T')[0] : ''
      };
      
      console.log('📤 Dados para criar evento:', dadosParaEnviar);
      
      await createEvent(dadosParaEnviar);
      
      setSuccessMessage('Evento criado com sucesso!');
      setSuccess(true);
      resetForm();
      
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
        setActiveView('dashboard');
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao criar evento:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao criar evento';
      alert(`Erro ao criar evento: ${errorMessage}`);
    } finally {
      setFormLoading(false);
    }
  };

  const handleAtualizarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventoEditando) return;
    
    setFormLoading(true);
    
    try {
      // Validar dados antes de enviar
      if (!eventoData.title.trim()) {
        throw new Error('O título do evento é obrigatório');
      }
      
      if (!eventoData.date) {
        throw new Error('A data do evento é obrigatória');
      }

      // VALIDAÇÃO DE DATA - IMPEDIR DATAS PASSADAS
      if (!validarDataEvento(eventoData.date)) {
        throw new Error('Não é possível atualizar eventos para datas passadas. Por favor, selecione uma data futura.');
      }

      // Validar e formatar dados antes de enviar
      const dadosParaEnviar = {
        title: eventoData.title.trim(),
        description: eventoData.description.trim(),
        date: eventoData.date ? new Date(eventoData.date).toISOString().split('T')[0] : eventoEditando.date,
        time: eventoData.time,
        location: eventoData.location.trim(),
        type: eventoData.type,
        category: eventoData.category,
        max_participants: parseInt(eventoData.max_participants) || 0,
        target_audience: eventoData.target_audience.trim(),
        requirements: eventoData.requirements.trim(),
        // Enviar imagem apenas se foi alterada
        image: eventoData.image !== eventoEditando.image ? eventoData.image : undefined
      };

      // Remover campos undefined para não sobrescrever com null
      Object.keys(dadosParaEnviar).forEach(key => {
        if (dadosParaEnviar[key as keyof typeof dadosParaEnviar] === undefined) {
          delete dadosParaEnviar[key as keyof typeof dadosParaEnviar];
        }
      });
      
      console.log('📤 Dados para atualizar evento:', dadosParaEnviar);
      console.log('🆔 ID do evento:', eventoEditando.id);
      
      await updateEvent(eventoEditando.id, dadosParaEnviar);
      
      setSuccessMessage('Evento atualizado com sucesso!');
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setSuccessMessage('');
        handleBackToDashboard();
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Erro ao atualizar evento';
      
      // Mostrar erro mais amigável
      if (errorMessage.includes('image') && errorMessage.includes('max')) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor ou remova a imagem.');
      } else {
        alert(`Erro ao atualizar evento: ${errorMessage}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Função para obter número de participantes (com fallback)
  const getParticipantesCount = (evento: any): number => {
    // Priorizar participants_count (contagem real), depois participants (coluna da tabela)
    return evento.participants_count || evento.participants || 0;
  };

  // Função para calcular porcentagem de ocupação
  const getOcupacaoPercentual = (evento: any): number => {
    const participantes = getParticipantesCount(evento);
    const maxParticipantes = evento.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  // Renderização das views
  const renderDashboardView = () => (
    <div className="dashboard-view">
      <div className="stats-section">
        <h2>📊 Visão Geral</h2>
        <div className="stats-grid">
          <div className="stat-card event-stat">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Total de Eventos</h3>
              <span className="stat-number">{eventStats.totalEventos}</span>
              <span className="stat-change">+{eventStats.totalEventos} este mês</span>
            </div>
          </div>
          
          <div className="stat-card active-event-stat">
            <div className="stat-icon">🟢</div>
            <div className="stat-info">
              <h3>Eventos Ativos</h3>
              <span className="stat-number">{eventStats.eventosAtivos}</span>
              <span className="stat-percentage">
                {eventStats.totalEventos > 0 ? Math.round((eventStats.eventosAtivos / eventStats.totalEventos) * 100) : 0}% do total
              </span>
            </div>
          </div>
          
          <div className="stat-card finished-event-stat">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>Eventos Finalizados</h3>
              <span className="stat-number">{eventStats.eventosFinalizados}</span>
              <span className="stat-percentage">
                {eventStats.totalEventos > 0 ? Math.round((eventStats.eventosFinalizados / eventStats.totalEventos) * 100) : 0}% do total
              </span>
            </div>
          </div>
          
          {/* ✅ NOVA CARD DE TOTAL DE PARTICIPANTES */}
          <div className="stat-card participants-stat">
            <div className="stat-icon">👥</div>
            <div className="stat-info">
              <h3>Total de Participantes</h3>
              <span className="stat-number">{eventStats.totalParticipantes}</span>
              <span className="stat-change">Em todos os eventos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-events-full">
        <div className="section-header">
          <h2>📋 Eventos Recentes</h2>
          <span className="section-badge">Últimos 5 eventos</span>
        </div>
        
        {recentEvents.length > 0 ? (
          <div className="events-list-full">
            {recentEvents.map((evento) => {
              const estado = getEventoState(evento);
              const participantesCount = getParticipantesCount(evento);
              const ocupacaoPercentual = getOcupacaoPercentual(evento);
              
              return (
                <div key={evento.id} className="event-card-full">
                  <SafeImage 
                    src={evento.image} 
                    alt={evento.title}
                    className="event-avatar"
                    fallback={evento.title ? evento.title.charAt(0).toUpperCase() : 'E'}
                  />
                  <div className="event-info">
                    <div className="event-header">
                      <h3>{evento.title}</h3>
                      <span className={`event-status ${estado.class}`}>
                        {estado.icon} {estado.label}
                      </span>
                    </div>
                    <p className="event-description">{evento.description}</p>
                    <div className="event-details">
                      <span>📅 {formatarData(evento.date)}</span>
                      <span>🕒 {evento.time}</span>
                      <span>📍 {evento.location}</span>
                      <span>👥 {participantesCount} / {evento.max_participants} participantes</span>
                    </div>
                    {/* Barra de progresso de ocupação */}
                    <div className="ocupacao-progress">
                      <div className="progress-info">
                        <span>Ocupação: {Math.round(ocupacaoPercentual)}%</span>
                        <span>{participantesCount}/{evento.max_participants}</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-fill ${ocupacaoPercentual >= 90 ? 'high' : ocupacaoPercentual >= 70 ? 'medium' : 'low'}`}
                          style={{ width: `${ocupacaoPercentual}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="event-actions">
                      <button 
                        className="btn-view"
                        onClick={() => handleVerDetalhes(evento)}
                      >
                        👀 Ver Detalhes
                      </button>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditarEvento(evento)}
                      >
                        ✏️ Editar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-events-full">
            <div className="no-events-content">
              <div className="no-events-icon">📅</div>
              <h3>Nenhum evento criado</h3>
              <p>Comece criando seu primeiro evento para ver as estatísticas aqui.</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('criar-evento')}
              >
                ➕ Criar Primeiro Evento
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderCriarEventoView = () => (
    <div className="form-view-container">
      <div className="form-view-content">
        <div className="edicao-header">
          <h2>➕ Criar Novo Evento</h2>
          <p>Preencha os detalhes do seu evento abaixo</p>
        </div>

        {success && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}

        <form className="evento-form" onSubmit={handleCriarEvento}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título do Evento *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={eventoData.title}
                onChange={handleInputChange}
                required
                placeholder="Ex: Workshop de React.js"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                value={eventoData.category}
                onChange={handleInputChange}
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Data *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventoData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]} // Impede seleção de datas passadas
              />
              <small className="form-help">
                Não é possível criar eventos em datas passadas
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Hora *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={eventoData.time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Localização *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={eventoData.location}
                onChange={handleInputChange}
                required
                placeholder="Ex: Auditório Principal, UEM"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Tipo de Evento *</label>
              <select
                id="type"
                name="type"
                value={eventoData.type}
                onChange={handleInputChange}
                required
              >
                <option value="academico">Acadêmico</option>
                <option value="cultural">Cultural</option>
                <option value="desportivo">Desportivo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <textarea
              id="description"
              name="description"
              value={eventoData.description}
              onChange={handleInputChange}
              required
              placeholder="Descreva o evento em detalhes..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max_participants">Nº Máximo de Participantes *</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={eventoData.max_participants}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Ex: 50"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="target_audience">Público-Alvo</label>
              <input
                type="text"
                id="target_audience"
                name="target_audience"
                value={eventoData.target_audience}
                onChange={handleInputChange}
                placeholder="Ex: Estudantes de Engenharia"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagem do Evento (Máx. 2MB)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={formLoading}
            />
            {eventoData.image && (
              <div className="image-preview">
                <SafeImage 
                  src={eventoData.image} 
                  alt="Preview" 
                  className="preview-image"
                  fallback="📷 Erro ao carregar imagem"
                />
                <button 
                  type="button" 
                  className="btn-remove-image"
                  onClick={handleRemoverImagem}
                  disabled={formLoading}
                >
                  ❌ Remover Imagem
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requisitos</label>
            <textarea
              id="requirements"
              name="requirements"
              value={eventoData.requirements}
              onChange={handleInputChange}
              placeholder="Requisitos para participação..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Criando...
                </>
              ) : (
                '✅ Criar Evento'
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={handleBackToDashboard}>
              ↩️ Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderMeusEventosView = () => (
    <div className="management-view">
      <div className="management-header">
        <h2>📅 Meus Eventos</h2>
        <span className="total-badge">
          {eventStats.totalEventos} eventos ativos • {eventStats.totalParticipantes} participantes totais
        </span>
      </div>

      <div className="events-table-container">
        {recentEvents.length > 0 ? (
          <div className="table-responsive">
            <table className="events-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data & Hora</th>
                  <th>Localização</th>
                  <th>Estado</th>
                  <th>Inscrições</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((evento) => {
                  const estado = getEventoState(evento);
                  const participantesCount = getParticipantesCount(evento);
                  const ocupacaoPercentual = getOcupacaoPercentual(evento);
                  
                  return (
                    <tr key={evento.id} className="event-table-row">
                      <td className="event-info-cell">
                        <div className="event-info-content">
                          <SafeImage 
                            src={evento.image} 
                            alt={evento.title}
                            className="event-avatar small"
                            fallback={evento.title ? evento.title.charAt(0).toUpperCase() : 'E'}
                          />
                          <div className="event-details-text">
                            <div className="event-title">{evento.title}</div>
                            <div className="event-meta">
                              <span className="event-category">{evento.category}</span>
                              <span className="event-type">{evento.type}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="event-date-cell">
                        <div className="event-date">{formatarData(evento.date)}</div>
                        <div className="event-time">{evento.time}</div>
                      </td>
                      <td className="event-location">
                        {evento.location}
                      </td>
                      <td className="event-status-cell">
                        <span className={`status-badge ${estado.class}`}>
                          {estado.icon} {estado.label}
                        </span>
                      </td>
                      <td className="event-registrations">
                        <div className="registrations-count">
                          {participantesCount} / {evento.max_participants}
                          <div className="participants-debug">
                            {/* Debug info - pode remover depois */}
                            {evento.participants_count !== undefined && `(count: ${evento.participants_count})`}
                            {evento.participants !== undefined && `(db: ${evento.participants})`}
                          </div>
                        </div>
                        <div className="registrations-progress">
                          <div 
                            className={`progress-bar-fill ${ocupacaoPercentual >= 90 ? 'high' : ocupacaoPercentual >= 70 ? 'medium' : 'low'}`}
                            style={{ width: `${ocupacaoPercentual}%` }}
                          ></div>
                        </div>
                        <div className="progress-percentage">
                          {Math.round(ocupacaoPercentual)}% ocupado
                        </div>
                      </td>
                      <td className="event-actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="btn-view-table"
                            onClick={() => handleVerDetalhes(evento)}
                            title="Ver detalhes do evento"
                          >
                            👀 Ver
                          </button>
                          <button 
                            className="btn-edit-table" 
                            onClick={() => handleEditarEvento(evento)}
                            title="Editar evento"
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            className="btn-archive" 
                            onClick={() => handleArquivarEvento(evento.id, evento.title)}
                            disabled={participantesCount > 0}
                            title={participantesCount > 0 ? "Não é possível arquivar evento com participantes" : "Arquivar evento"}
                          >
                            📁 Arquivar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <div className="no-data-content">
              <div className="no-data-icon">📅</div>
              <h3>Nenhum evento criado ainda</h3>
              <p>Crie seu primeiro evento para começar a gerenciar suas atividades.</p>
              <button 
                className="btn-primary"
                onClick={() => setActiveView('criar-evento')}
              >
                ➕ Criar Primeiro Evento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Seção de Eventos Arquivados */}
      {arquivedEvents.length > 0 && (
        <div className="archived-section">
          <h3>📁 Eventos Arquivados</h3>
          <div className="events-table-container">
            <div className="table-responsive">
              <table className="events-table archived-table">
                <thead>
                  <tr>
                    <th>Evento</th>
                    <th>Data & Hora</th>
                    <th>Localização</th>
                    <th>Estado</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {arquivedEvents.map((evento) => (
                    <tr key={evento.id} className="event-table-row archived-row">
                      <td className="event-info-cell">
                        <div className="event-info-content">
                          <SafeImage 
                            src={evento.image} 
                            alt={evento.title}
                            className="event-avatar small archived"
                            fallback={evento.title ? evento.title.charAt(0).toUpperCase() : 'E'}
                          />
                          <div className="event-details-text">
                            <div className="event-title">{evento.title}</div>
                            <div className="event-meta">
                              <span className="event-category">{evento.category}</span>
                              <span className="event-type">{evento.type}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="event-date-cell">
                        <div className="event-date">{formatarData(evento.date)}</div>
                        <div className="event-time">{evento.time}</div>
                      </td>
                      <td className="event-location">
                        {evento.location}
                      </td>
                      <td className="event-status-cell">
                        <span className="status-badge evento-arquivado">
                          📁 Arquivado
                        </span>
                      </td>
                      <td className="event-actions-cell">
                        <div className="action-buttons">
                          <button 
                            className="btn-restore" 
                            onClick={() => handleRestaurarEvento(evento.id)}
                            title="Restaurar evento"
                          >
                            🔄 Restaurar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderEditarEventoView = () => (
    <div className="form-view-container">
      <div className="form-view-content">
        <div className="edicao-header">
          <h2>✏️ Editar Evento</h2>
          <p>Editando: {eventoEditando?.title}</p>
        </div>

        {success && (
          <div className="success-message">
            ✅ {successMessage}
          </div>
        )}

        <form className="evento-form" onSubmit={handleAtualizarEvento}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Título do Evento *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={eventoData.title}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Categoria *</label>
              <select
                id="category"
                name="category"
                value={eventoData.category}
                onChange={handleInputChange}
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Data *</label>
              <input
                type="date"
                id="date"
                name="date"
                value={eventoData.date}
                onChange={handleInputChange}
                required
                min={new Date().toISOString().split('T')[0]} // Impede seleção de datas passadas
              />
              {eventoEditando?.date && (
                <small className="form-help">
                  Data atual: {formatarData(eventoEditando.date)}
                </small>
              )}
              <small className="form-help">
                Não é possível atualizar eventos para datas passadas
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="time">Hora *</label>
              <input
                type="time"
                id="time"
                name="time"
                value={eventoData.time}
                onChange={handleInputChange}
                required
              />
              {eventoEditando?.time && (
                <small className="form-help">
                  Hora atual: {eventoEditando.time}
                </small>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Localização *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={eventoData.location}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Tipo de Evento *</label>
              <select
                id="type"
                name="type"
                value={eventoData.type}
                onChange={handleInputChange}
                required
              >
                <option value="academico">Acadêmico</option>
                <option value="cultural">Cultural</option>
                <option value="desportivo">Desportivo</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Descrição *</label>
            <textarea
              id="description"
              name="description"
              value={eventoData.description}
              onChange={handleInputChange}
              required
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="max_participants">Nº Máximo de Participantes *</label>
              <input
                type="number"
                id="max_participants"
                name="max_participants"
                value={eventoData.max_participants}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="target_audience">Público-Alvo</label>
              <input
                type="text"
                id="target_audience"
                name="target_audience"
                value={eventoData.target_audience}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Imagem do Evento (Máx. 2MB)</label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={formLoading}
            />
            {eventoData.image && (
              <div className="image-preview">
                <SafeImage 
                  src={eventoData.image} 
                  alt="Preview" 
                  className="preview-image"
                  fallback="📷 Erro ao carregar imagem"
                />
                <button 
                  type="button" 
                  className="btn-remove-image"
                  onClick={handleRemoverImagem}
                  disabled={formLoading}
                >
                  ❌ Remover Imagem
                </button>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="requirements">Requisitos</label>
            <textarea
              id="requirements"
              name="requirements"
              value={eventoData.requirements}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={formLoading}>
              {formLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  Atualizando...
                </>
              ) : (
                '💾 Salvar Alterações'
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={handleBackToDashboard}>
              ↩️ Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderSidebar = () => (
    <aside className="admin-sidebar">
      <nav className="sidebar-nav">
        <div className="nav-section">
          <h3>📊 Dashboard</h3>
          <button 
            className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            🏠 Visão Geral
          </button>
        </div>

        <div className="nav-section">
          <h3>📅 Gestão de Eventos</h3>
          <button 
            className={`nav-btn ${activeView === 'criar-evento' ? 'active' : ''}`}
            onClick={() => setActiveView('criar-evento')}
          >
            ➕ Criar Evento
          </button>
          <button 
            className={`nav-btn ${activeView === 'meus-eventos' ? 'active' : ''}`}
            onClick={() => setActiveView('meus-eventos')}
          >
            📋 Meus Eventos
          </button>
          {eventStats.eventosArquivados > 0 && (
            <button 
              className={`nav-btn ${activeView === 'eventos-arquivados' ? 'active' : ''}`}
              onClick={() => setActiveView('meus-eventos')}
            >
              📁 Eventos Arquivados ({eventStats.eventosArquivados})
            </button>
          )}
        </div>
      </nav>
    </aside>
  );

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading && statsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="organizadores-dashboard">
      <header className="admin-header">
        <div className="header-content">
          <h1>🎯 Dashboard do Organizador</h1>
          <p>Bem-vindo, {user?.name || 'Organizador'}! Gerencie seus eventos aqui.</p>
        </div>
        {/* <div className="header-actions">
          <button className="refresh-btn" onClick={loadStatistics}>
            🔄 Atualizar
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Sair
          </button>
        </div> */}
      </header>

      <div className="admin-content">
        {renderSidebar()}

        {/* Main Content */}
        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'criar-evento' && renderCriarEventoView()}
          {activeView === 'meus-eventos' && renderMeusEventosView()}
          {activeView === 'editar-evento' && renderEditarEventoView()}
        </main>
      </div>
    </div>
  );
}