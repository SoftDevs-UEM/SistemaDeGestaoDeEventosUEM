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

type ActiveView = 'dashboard' | 'criar-evento' | 'meus-eventos' | 'editar-evento' | 'eventos-arquivados' | 'configuracoes';

// Componente de imagem seguro
const SafeImage = ({ src, alt, className, fallback = '📅' }: { 
  src: string; 
  alt: string; 
  className?: string;
  fallback?: string | React.ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  const isValidBase64 = (str: string): boolean => {
    if (!str || typeof str !== 'string') return false;
    try {
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
    const hojeSemHoras = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const dataEventoSemHoras = new Date(dataEvento.getFullYear(), dataEvento.getMonth(), dataEvento.getDate());
    
    return dataEventoSemHoras >= hojeSemHoras;
  } catch (error) {
    return false;
  }
};

// ✅ FUNÇÕES PARA DATAS - ADICIONAR ESTAS FUNÇÕES
const formatarDataSegura = (dataString: string | undefined | null): string => {
  if (!dataString) {
    return 'A carregar...';
  }
  
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    return 'Erro na data';
  }
};

const formatarDataCompletaSegura = (dataString: string | undefined | null): string => {
  if (!dataString) {
    return 'A carregar...';
  }
  
  try {
    const data = new Date(dataString);
    if (isNaN(data.getTime())) {
      return 'Data inválida';
    }
    
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Erro na data';
  }
};

export default function Organizadores() {
  const navigate = useNavigate();
  const { 
    isAuthenticated, 
    userType, 
    logout, 
    user, 
    updateUserProfile,
    changePassword,
    loadUserData 
  } = useAuth();
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

  // Estados para configurações
  const [dadosPessoais, setDadosPessoais] = useState({
    name: '',
    email: '',
    telefone: '',
    departamento: ''
  });
  
  const [senhaData, setSenhaData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });
  
  const [configLoading, setConfigLoading] = useState(false);
  const [configMessage, setConfigMessage] = useState({ type: '', text: '' });

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

  // ✅ LISTA DE DEPARTAMENTOS DA UEM
  const departamentos = [
    'Departamento de Matemática e Informática',
    'Departamento de Física',
    'Departamento de Química',
    'Departamento de Biologia',
    'Departamento de Geologia',
    'Departamento de Engenharia Civil',
    'Departamento de Engenharia Mecânica',
    'Departamento de Engenharia Química',
    'Departamento de Engenharia Eletrotécnica',
    'Departamento de Arquitetura e Planeamento Físico',
    'Departamento de Economia',
    'Departamento de Gestão',
    'Departamento de Contabilidade e Auditoria',
    'Departamento de Direito',
    'Departamento de Ciências da Educação',
    'Departamento de Línguas e Literaturas',
    'Departamento de História',
    'Departamento de Geografia',
    'Departamento de Sociologia',
    'Departamento de Psicologia',
    'Departamento de Medicina',
    'Departamento de Cirurgia',
    'Departamento de Pediatria',
    'Departamento de Ginecologia e Obstetrícia',
    'Departamento de Saúde Pública',
    'Departamento de Agronomia',
    'Departamento de Engenharia Rural',
    'Departamento de Ciências Animais',
    'Departamento de Veterinária'
  ];

  // ✅ EFEITO ATUALIZADO: Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setDadosPessoais({
        name: user.name || user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        departamento: user.departamento || ''
      });
      
      // ✅ SE NÃO TEM DATAS, FORÇAR CARREGAMENTO
      if (!user.created_at || !user.updated_at) {
        loadUserData();
      }
    }
  }, [user]);

  // ✅ NOVO EFEITO: Carregar dados quando o componente monta
  useEffect(() => {
    if (isAuthenticated && userType && (userType === 'promotor' || userType === 'admin')) {
      loadUserData();
    }
  }, [isAuthenticated, userType]);

  // ✅ FUNÇÃO ATUALIZADA: Verificar se o promotor pode editar o evento
  const podeEditarEvento = (evento: any) => {
    // Admin pode editar qualquer evento
    if (userType === 'admin') return true;
    // Promotor só pode editar seus próprios eventos
    return evento.promoter_id === user?.id;
  };

  // ✅ FUNÇÃO ATUALIZADA: Verificar se o promotor pode arquivar o evento
  const podeArquivarEvento = (evento: any) => {
    if (!podeEditarEvento(evento)) return false;
    // Não pode arquivar evento com participantes
    const participantesCount = getParticipantesCount(evento);
    return participantesCount === 0;
  };

  // ✅ COMPONENTE ATUALIZADO: Botão de editar com verificação de permissão
  const renderBotaoEditar = (evento: any) => {
    if (!podeEditarEvento(evento)) {
      return null;
    }
    
    return (
      <button 
        className="btn-edit"
        onClick={() => handleEditarEvento(evento)}
      >
        ✏️ Editar
      </button>
    );
  };

  // ✅ COMPONENTE ATUALIZADO: Botão de arquivar com verificação de permissão
  const renderBotaoArquivar = (evento: any) => {
    if (!podeArquivarEvento(evento)) {
      const participantesCount = getParticipantesCount(evento);
      return (
        <button 
          className="btn-archive disabled"
          disabled
          title={!podeEditarEvento(evento) ? "Não autorizado" : participantesCount > 0 ? "Não é possível arquivar evento com participantes" : "Arquivar evento"}
        >
          📁 Arquivar
        </button>
      );
    }
    
    return (
      <button 
        className="btn-archive" 
        onClick={() => handleArquivarEvento(evento.id, evento.title)}
        title="Arquivar evento"
      >
        📁 Arquivar
      </button>
    );
  };

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
      // ✅ FILTRAR APENAS EVENTOS DO PROMOTOR LOGADO
      const meusEventos = events.filter(event => {
        // Admin pode ver todos os eventos
        if (userType === 'admin') {
          return !event.deleted_at;
        }
        // Promotor vê apenas seus próprios eventos
        return event.promoter_id === user?.id && !event.deleted_at;
      });
  
      // ✅ FILTRAR EVENTOS ARQUIVADOS DO PROMOTOR LOGADO
      const eventosArquivados = events.filter(event => {
        if (userType === 'admin') {
          return event.deleted_at;
        }
        return event.promoter_id === user?.id && event.deleted_at;
      });
      
      const eventosAtivos = meusEventos.filter(event => 
        new Date(event.date) >= new Date() && event.status === 'ativo'
      );
      
      const eventosFinalizados = meusEventos.filter(event => 
        new Date(event.date) < new Date() || event.status === 'finalizado'
      );
  
      const totalParticipantes = meusEventos.reduce((total, evento) => {
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
  
      // ✅ ORDENAR EVENTOS RECENTES DO PROMOTOR
      const eventosOrdenados = [...meusEventos].sort((a, b) => 
        new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );
      setRecentEvents(eventosOrdenados.slice(0, 5));
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

  const handleEditarEvento = (evento: any) => {
    console.log('✏️ Editando evento:', evento);
    
    // ✅ VERIFICAR PERMISSÃO ANTES DE EDITAR
    if (!podeEditarEvento(evento)) {
      alert('Não autorizado a editar este evento.');
      return;
    }
    
    setEventoEditando(evento);
    
    const dataISO = evento.date;
    let dataFormatada = '';
    
    if (dataISO) {
      try {
        const dataObj = new Date(dataISO);
        if (!isNaN(dataObj.getTime())) {
          dataFormatada = dataObj.toISOString().split('T')[0];
        } else {
          if (dataISO.includes('T')) {
            dataFormatada = dataISO.split('T')[0];
          } else if (dataISO.includes(' ')) {
            dataFormatada = dataISO.split(' ')[0];
          } else {
            dataFormatada = dataISO;
          }
        }
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

  const handleVerDetalhes = (evento: any) => {
    navigate(`/evento/${evento.id}`);
  };

  const compressImage = (file: File, maxWidth = 800, quality = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        try {
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } catch (error) {
          reject(new Error('Erro ao converter imagem para base64'));
        }
      };
      
      img.onerror = () => reject(new Error('Erro ao carregar imagem'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      e.target.value = '';
      return;
    }

    const maxSize = 2 * 1024 * 1024;
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

  const handleRemoverImagem = () => {
    setEventoData(prev => ({
      ...prev,
      image: ''
    }));
  };

  // ✅ FUNÇÃO ATUALIZADA: Arquivar evento com verificação de permissão
  const handleArquivarEvento = async (eventId: number, eventTitle: string) => {
    const evento = events.find(event => event.id === eventId);
    
    if (!evento) {
      alert('Evento não encontrado.');
      return;
    }

    // ✅ VERIFICAR PERMISSÃO
    if (!podeEditarEvento(evento)) {
      alert('Não autorizado a arquivar este evento.');
      return;
    }

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
      } catch (error: any) {
        console.error('Erro ao arquivar evento:', error);
        const errorMessage = error.response?.data?.message || 'Erro ao arquivar evento';
        alert(`Erro ao arquivar evento: ${errorMessage}`);
      }
    }
  };

  const handleRestaurarEvento = async (eventId: number) => {
    try {
      const evento = arquivedEvents.find(event => event.id === eventId);
      if (!evento) {
        alert('Evento não encontrado.');
        return;
      }

      // ✅ VERIFICAR PERMISSÃO PARA RESTAURAR
      if (!podeEditarEvento(evento)) {
        alert('Não autorizado a restaurar este evento.');
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

  const handleDadosPessoaisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDadosPessoais(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSenhaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSenhaData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ✅ FUNÇÃO ATUALIZADA: Atualizar dados pessoais
  const atualizarDadosPessoais = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigLoading(true);
    setConfigMessage({ type: '', text: '' });
    
    try {
      console.log('📤 Enviando dados para atualização:', dadosPessoais);
      
      const result = await updateUserProfile(dadosPessoais);
      
      if (result.success) {
        setConfigMessage({
          type: 'success',
          text: result.message
        });
        
        // Recarregar dados para garantir sincronização
        await loadUserData();
        
        console.log('✅ Dados pessoais atualizados com sucesso');
      } else {
        setConfigMessage({
          type: 'error',
          text: result.message
        });
        console.error('❌ Erro ao atualizar dados:', result.message);
      }
      
    } catch (error: any) {
      console.error('❌ Erro inesperado ao atualizar dados:', error);
      setConfigMessage({
        type: 'error',
        text: 'Erro inesperado ao atualizar dados. Tente novamente.'
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // ✅ FUNÇÃO ATUALIZADA: Alterar senha
  const alterarSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigMessage({ type: '', text: '' });
    
    // Validações no frontend
    if (!senhaData.current_password) {
      setConfigMessage({
        type: 'error',
        text: 'A senha atual é obrigatória'
      });
      return;
    }
    
    if (senhaData.new_password.length < 6) {
      setConfigMessage({
        type: 'error',
        text: 'A nova senha deve ter pelo menos 6 caracteres'
      });
      return;
    }
    
    if (senhaData.new_password !== senhaData.new_password_confirmation) {
      setConfigMessage({
        type: 'error',
        text: 'As senhas não coincidem'
      });
      return;
    }
    
    setConfigLoading(true);
    
    try {
      console.log('📤 Alterando senha...');
      
      const result = await changePassword(senhaData);
      
      if (result.success) {
        setConfigMessage({
          type: 'success',
          text: result.message
        });
        
        // Limpar formulário
        setSenhaData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
        
        console.log('✅ Senha alterada com sucesso');
      } else {
        setConfigMessage({
          type: 'error',
          text: result.message
        });
        console.error('❌ Erro ao alterar senha:', result.message);
      }
      
    } catch (error: any) {
      console.error('❌ Erro inesperado ao alterar senha:', error);
      setConfigMessage({
        type: 'error',
        text: 'Erro inesperado ao alterar senha. Tente novamente.'
      });
    } finally {
      setConfigLoading(false);
    }
  };

  // ✅ FUNÇÃO ATUALIZADA: Criar evento
  const handleCriarEvento = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    
    try {
      if (!validarDataEvento(eventoData.date)) {
        throw new Error('Não é possível criar eventos em datas passadas. Por favor, selecione uma data futura.');
      }

      const dadosParaEnviar = {
        ...eventoData,
        max_participants: parseInt(eventoData.max_participants) || 0,
        // ✅ O promoter_id será automaticamente definido pelo backend com o ID do usuário logado
        status: 'pendente',
        date: eventoData.date ? new Date(eventoData.date).toISOString().split('T')[0] : ''
      };
      
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
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Erro ao criar evento';
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
      if (!eventoData.title.trim()) {
        throw new Error('O título do evento é obrigatório');
      }
      
      if (!eventoData.date) {
        throw new Error('A data do evento é obrigatória');
      }

      if (!validarDataEvento(eventoData.date)) {
        throw new Error('Não é possível atualizar eventos para datas passadas. Por favor, selecione uma data futura.');
      }

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
        image: eventoData.image !== eventoEditando.image ? eventoData.image : undefined
      };

      Object.keys(dadosParaEnviar).forEach(key => {
        if (dadosParaEnviar[key as keyof typeof dadosParaEnviar] === undefined) {
          delete dadosParaEnviar[key as keyof typeof dadosParaEnviar];
        }
      });
      
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
      
      if (errorMessage.includes('image') && errorMessage.includes('max')) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor ou remova a imagem.');
      } else {
        alert(`Erro ao atualizar evento: ${errorMessage}`);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const getParticipantesCount = (evento: any): number => {
    return evento.participants_count || evento.participants || 0;
  };

  const getOcupacaoPercentual = (evento: any): number => {
    const participantes = getParticipantesCount(evento);
    const maxParticipantes = evento.max_participants || 1;
    return Math.min(100, (participantes / maxParticipantes) * 100);
  };

  // ========== FUNÇÕES DE RENDERIZAÇÃO COMPLETAS ==========

  // ✅ ATUALIZAR a renderização do dashboard para mostrar mensagem personalizada
  const renderDashboardView = () => (
    <div className="dashboard-view">
      <div className="stats-section">
        <h2>📊 Visão Geral {userType === 'promotor' ? ' - Meus Eventos' : ' - Todos os Eventos'}</h2>
        <div className="stats-grid">
          <div className="stat-card event-stat">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Total de Eventos</h3>
              <span className="stat-number">{eventStats.totalEventos}</span>
              <span className="stat-change">
                {userType === 'promotor' ? 'Meus eventos' : 'Todos os eventos'}
              </span>
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
          <h2>📋 {userType === 'promotor' ? 'Meus Eventos Recentes' : 'Eventos Recentes'}</h2>
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
                      {userType === 'admin' && (
                        <span className="event-promoter">
                          👤 Promotor: {evento.promoter_name || `ID: ${evento.promoter_id}`}
                        </span>
                      )}
                    </div>
                    <p className="event-description">{evento.description}</p>
                    <div className="event-details">
                      <span>📅 {formatarData(evento.date)}</span>
                      <span>🕒 {evento.time}</span>
                      <span>📍 {evento.location}</span>
                      <span>👥 {participantesCount} / {evento.max_participants} participantes</span>
                    </div>
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
                      {renderBotaoEditar(evento)}
                      {renderBotaoArquivar(evento)}
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
              <h3>{userType === 'promotor' ? 'Nenhum evento criado' : 'Nenhum evento disponível'}</h3>
              <p>
                {userType === 'promotor' 
                  ? 'Comece criando seu primeiro evento para ver as estatísticas aqui.' 
                  : 'Não há eventos disponíveis no momento.'}
              </p>
              {userType === 'promotor' && (
                <button 
                  className="btn-primary"
                  onClick={() => setActiveView('criar-evento')}
                >
                  ➕ Criar Primeiro Evento
                </button>
              )}
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
                min={new Date().toISOString().split('T')[0]}
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
        <h2>📅 {userType === 'promotor' ? 'Meus Eventos' : 'Todos os Eventos'}</h2>
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
                              {userType === 'admin' && (
                                <span className="event-promoter-badge">
                                  👤 {evento.promoter_name || `ID: ${evento.promoter_id}`}
                                </span>
                              )}
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
                          {renderBotaoEditar(evento)}
                          {renderBotaoArquivar(evento)}
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
              <h3>{userType === 'promotor' ? 'Nenhum evento criado ainda' : 'Nenhum evento disponível'}</h3>
              <p>
                {userType === 'promotor' 
                  ? 'Crie seu primeiro evento para começar a gerenciar suas atividades.' 
                  : 'Não há eventos disponíveis no momento.'}
              </p>
              {userType === 'promotor' && (
                <button 
                  className="btn-primary"
                  onClick={() => setActiveView('criar-evento')}
                >
                  ➕ Criar Primeiro Evento
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {arquivedEvents.length > 0 && (
        <div className="archived-section">
          <h3>📁 {userType === 'promotor' ? 'Meus Eventos Arquivados' : 'Eventos Arquivados'}</h3>
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
                              {userType === 'admin' && (
                                <span className="event-promoter-badge">
                                  👤 {evento.promoter_name || `ID: ${evento.promoter_id}`}
                                </span>
                              )}
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
                min={new Date().toISOString().split('T')[0]}
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

  const renderConfiguracoesView = () => {
    // ✅ USAR AS NOVAS FUNÇÕES DE DATA
    const dataRegisto = user?.created_at ? formatarDataSegura(user.created_at) : 'A carregar...';
    const dataAtualizacao = user?.updated_at ? formatarDataCompletaSegura(user.updated_at) : dataRegisto;

    return (
      <div className="configuracoes-view">
        <div className="configuracoes-header">
          <h2>⚙️ Configurações da Conta</h2>
          <p>Gerencie suas informações pessoais e segurança da conta</p>
        </div>

        {configMessage.text && (
          <div className={`message ${configMessage.type}`}>
            {configMessage.type === 'success' ? '✅' : '❌'} {configMessage.text}
          </div>
        )}

        <div className="configuracoes-grid">
          <div className="config-card">
            <div className="config-card-header">
              <h3>👤 Dados Pessoais</h3>
              <span className="config-badge">Informações básicas</span>
            </div>
            
            <form onSubmit={atualizarDadosPessoais} className="config-form">
              <div className="form-group">
                <label htmlFor="name">Nome Completo *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={dadosPessoais.name}
                  onChange={handleDadosPessoaisChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={dadosPessoais.email}
                  onChange={handleDadosPessoaisChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="telefone">Telefone</label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={dadosPessoais.telefone}
                  onChange={handleDadosPessoaisChange}
                  placeholder="(+258) 8X XXX XXXX"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="departamento">Departamento</label>
                <select 
                  name="departamento"
                  value={dadosPessoais.departamento} 
                  onChange={handleDadosPessoaisChange}
                  className="form-select"
                >
                  <option value="">Selecione o departamento</option>
                  {departamentos.map((depto, index) => (
                    <option key={index} value={depto}>
                      {depto}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={configLoading}
              >
                {configLoading ? '🔄 Atualizando...' : '💾 Salvar Alterações'}
              </button>
            </form>
          </div>

          <div className="config-card">
            <div className="config-card-header">
              <h3>🔒 Alterar Senha</h3>
              <span className="config-badge">Segurança</span>
            </div>
            
            <form onSubmit={alterarSenha} className="config-form">
              <div className="form-group">
                <label htmlFor="current_password">Senha Atual *</label>
                <input
                  type="password"
                  id="current_password"
                  name="current_password"
                  value={senhaData.current_password}
                  onChange={handleSenhaChange}
                  required
                  placeholder="Digite sua senha atual"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password">Nova Senha *</label>
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  value={senhaData.new_password}
                  onChange={handleSenhaChange}
                  required
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="new_password_confirmation">Confirmar Nova Senha *</label>
                <input
                  type="password"
                  id="new_password_confirmation"
                  name="new_password_confirmation"
                  value={senhaData.new_password_confirmation}
                  onChange={handleSenhaChange}
                  required
                  placeholder="Digite novamente a nova senha"
                />
              </div>
              
              <button 
                type="submit" 
                className="btn-primary"
                disabled={configLoading}
              >
                {configLoading ? '🔄 Alterando...' : '🔐 Alterar Senha'}
              </button>
            </form>
          </div>

          <div className="config-card">
            <div className="config-card-header">
              <h3>📋 Informações da Conta</h3>
              <span className="config-badge">Leitura apenas</span>
            </div>
            
            <div className="account-info">
              <div className="info-item">
                <span className="info-label">Tipo de Usuário:</span>
                <span className="info-value">
                  {userType === 'promotor' ? '🎯 Organizador/Promotor' : 
                   userType === 'admin' ? '👑 Administrador' : 
                   userType || 'A carregar...'}
                </span>
              </div>
              
              <div className="info-item">
                <span className="info-label">ID do Usuário:</span>
                <span className="info-value">{user?.id || 'A carregar...'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Data de Registro:</span>
                <span className="info-value">{dataRegisto}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Última Atualização:</span>
                <span className="info-value">{dataAtualizacao}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">Status da Conta:</span>
                <span className="info-value status-ativo">✅ Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
            📋 {userType === 'promotor' ? 'Meus Eventos' : 'Todos os Eventos'}
          </button>
          {eventStats.eventosArquivados > 0 && (
            <button 
              className={`nav-btn ${activeView === 'eventos-arquivados' ? 'active' : ''}`}
              onClick={() => setActiveView('meus-eventos')}
            >
              📁 {userType === 'promotor' ? 'Meus Eventos Arquivados' : 'Eventos Arquivados'} ({eventStats.eventosArquivados})
            </button>
          )}
        </div>

        <div className="nav-section">
          <h3>⚙️ Configurações</h3>
          <button 
            className={`nav-btn ${activeView === 'configuracoes' ? 'active' : ''}`}
            onClick={() => setActiveView('configuracoes')}
          >
            👤 Minha Conta
          </button>
        </div>
      </nav>
    </aside>
  );

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
          <h1>🎯 Dashboard do {userType === 'promotor' ? 'Organizador' : 'Administrador'}</h1>
          <p>Bem-vindo, {user?.name || (userType === 'promotor' ? 'Organizador' : 'Administrador')}! Gerencie seus eventos aqui.</p>
        </div>
      </header>

      <div className="admin-content">
        {renderSidebar()}

        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'criar-evento' && renderCriarEventoView()}
          {activeView === 'meus-eventos' && renderMeusEventosView()}
          {activeView === 'editar-evento' && renderEditarEventoView()}
          {activeView === 'configuracoes' && renderConfiguracoesView()}
        </main>
      </div>
    </div>
  );
}