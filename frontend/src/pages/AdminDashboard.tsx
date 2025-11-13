import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';
import { promoterService } from '../services/promoterService';

type UserStats = {
  totalUsuarios: number;
  totalEstudantes: number;
  totalPromotores: number;
  totalAdmin: number;
  usuariosAtivos: number;
};

type EventStats = {
  totalEventos: number;
  eventosAtivos: number;
  eventosFinalizados: number;
  eventosPendentes: number;
  totalInscricoes: number;
};

type SystemStats = {
  taxaCrescimento: number;
  usuariosNovos: number;
  eventosEsteMes: number;
};

type ActiveView = 'dashboard' | 'cadastrar-promotor' | 'lista-usuarios' | 'estudantes' | 'promotores' | 'gestao-eventos' | 'relatorios' | 'configuracoes';

type Usuario = {
  id: string;
  nome: string;
  outrosNomes: string;
  email: string;
  telefone: string;
  tipo: 'estudante' | 'docente' | 'cta';
  departamento?: string;
  faculdade?: string;
  curso?: string;
  anoAcademico?: string;
  dataCadastro: string;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    isAuthenticated, 
    userType, 
    logout, 
    user, 
    updateUserProfile,
    changePassword,
    loadUserData 
  } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsuarios: 0,
    totalEstudantes: 0,
    totalPromotores: 0,
    totalAdmin: 0,
    usuariosAtivos: 0
  });
  const [eventStats, setEventStats] = useState<EventStats>({
    totalEventos: 0,
    eventosAtivos: 0,
    eventosFinalizados: 0,
    eventosPendentes: 0,
    totalInscricoes: 0
  });
  const [systemStats, setSystemStats] = useState<SystemStats>({
    taxaCrescimento: 0,
    usuariosNovos: 0,
    eventosEsteMes: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Obter a view ativa do estado de navegação ou usar 'dashboard' como padrão
  const [activeView, setActiveView] = useState<ActiveView>(
    location.state?.activeView || 'dashboard'
  );
  
  const [promotorData, setPromotorData] = useState({
    nome: '',
    outrosNomes: '',
    telefone: '',
    email: '',
    departamento: '',
    faculdade: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para gestão de usuários
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [estudantes, setEstudantes] = useState<Usuario[]>([]);
  const [promotores, setPromotores] = useState<Usuario[]>([]);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [editandoUsuario, setEditandoUsuario] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: '',
    outrosNomes: '',
    telefone: '',
    email: '',
    departamento: '',
    faculdade: '',
    curso: '',
    anoAcademico: ''
  });

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

  // Redirecionar se não for admin
  React.useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, userType, navigate]);

  // Carregar estatísticas
  useEffect(() => {
    loadStatistics();
  }, []);

  // Atualizar a view ativa quando o estado de navegação mudar
  useEffect(() => {
    if (location.state?.activeView) {
      setActiveView(location.state.activeView);
    }
  }, [location.state]);

  // ✅ EFEITO ATUALIZADO: Carregar dados do usuário
  useEffect(() => {
    if (user) {
      setDadosPessoais({
        name: user.name || user.nome || '',
        email: user.email || '',
        telefone: user.telefone || '',
        departamento: user.departamento || ''
      });
    }
  }, [user]);

  const loadStatistics = async () => {
    setLoading(true);

    try {
      // Read local data (events/users) for stats where backend endpoints don't exist
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]');

      // Fetch promoters from backend to keep data consistent
      let backendPromoters: any[] = [];
      try {
        const res = await promoterService.list();
        backendPromoters = Array.isArray(res) ? res : [];
      } catch (e) {
        // ignore backend errors and fallback to local data
        backendPromoters = [];
      }

      // Estatísticas de usuários
      const estudantes = usuarios.filter((u: any) => u.tipo === 'estudante');
      const promotoresLocal = usuarios.filter((u: any) => u.tipo === 'docente');
      const admins = usuarios.filter((u: any) => u.tipo === 'cta' || u.email === 'admin@uem.ac.mz');

      // Combine promoters (local + backend) for display
      const combinedPromotores = [...promotoresLocal, ...backendPromoters];

      // Estatísticas de eventos
      const eventosAtivos = eventos.filter((e: any) => 
        new Date(e.dataFim) >= new Date() && new Date(e.dataInicio) <= new Date()
      );
      const eventosFinalizados = eventos.filter((e: any) => new Date(e.dataFim) < new Date());
      const eventosPendentes = eventos.filter((e: any) => !e.aprovado);

      // Calcular crescimento (simulado)
      const taxaCrescimento = usuarios.length > 0 ? Math.round((usuarios.length / 100) * 15) : 0;
      const usuariosNovos = usuarios.filter((u: any) => {
        const dataCadastro = new Date(u.dataCadastro || new Date());
        const umMesAtras = new Date();
        umMesAtras.setMonth(umMesAtras.getMonth() - 1);
        return dataCadastro >= umMesAtras;
      }).length;

      const eventosEsteMes = eventos.filter((e: any) => {
        const dataEvento = new Date(e.dataInicio);
        const esteMes = new Date();
        return dataEvento.getMonth() === esteMes.getMonth() && 
               dataEvento.getFullYear() === esteMes.getFullYear();
      }).length;

      setUserStats({
        totalUsuarios: usuarios.length + backendPromoters.length,
        totalEstudantes: estudantes.length,
        totalPromotores: combinedPromotores.length,
        totalAdmin: admins.length,
        usuariosAtivos: usuarios.length
      });

      setEventStats({
        totalEventos: eventos.length,
        eventosAtivos: eventosAtivos.length,
        eventosFinalizados: eventosFinalizados.length,
        eventosPendentes: eventosPendentes.length,
        totalInscricoes: inscricoes.length
      });

      setSystemStats({
        taxaCrescimento,
        usuariosNovos,
        eventosEsteMes
      });

      // Usuários recentes (últimos 5)
      setRecentUsers(usuarios.slice(-5).reverse());

      // Carregar todos os usuários para gestão
      setUsuarios(usuarios);
      setEstudantes(estudantes);
      setPromotores(combinedPromotores);

    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Função para lidar com mudanças nos campos do promotor
  const handleInputChange = (field: string, value: string) => {
    if (field === 'faculdade' && value) {
      setPromotorData(prev => ({
        ...prev,
        faculdade: value,
        departamento: ''
      }));
    }
    else if (field === 'departamento' && value) {
      setPromotorData(prev => ({
        ...prev,
        departamento: value,
        faculdade: ''
      }));
    }
    else {
      setPromotorData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Função para cadastrar promotor
  const handleCadastrarPromotor = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!promotorData.nome || !promotorData.outrosNomes || !promotorData.telefone || 
        !promotorData.email || !promotorData.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!promotorData.departamento && !promotorData.faculdade) {
      setError('Selecione pelo menos um departamento ou uma faculdade.');
      return;
    }

    if (promotorData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: `${promotorData.nome} ${promotorData.outrosNomes}`,
        email: promotorData.email,
        password: promotorData.password,
        telefone: promotorData.telefone,
        departamento: promotorData.departamento || null,
        faculdade: promotorData.faculdade || null,
      };

      await promoterService.create(payload);

      // Also keep local storage fallback for other parts of UI
      const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      usuariosCadastrados.push({
        id: Date.now().toString(),
        nome: promotorData.nome,
        outrosNomes: promotorData.outrosNomes,
        telefone: promotorData.telefone,
        email: promotorData.email,
        password: promotorData.password,
        tipo: 'docente',
        departamento: promotorData.departamento,
        faculdade: promotorData.faculdade,
        cadastradoPorAdmin: true,
        dataCadastro: new Date().toISOString()
      });
      localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));

      setPromotorData({
        nome: '',
        outrosNomes: '',
        telefone: '',
        email: '',
        departamento: '',
        faculdade: '',
        password: ''
      });
      setSuccess('Promotor cadastrado com sucesso!');

      // Refresh stats
      await loadStatistics();
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || JSON.stringify(err.response?.data?.errors || err.message) || 'Erro ao cadastrar promotor');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setPromotorData({
      nome: '',
      outrosNomes: '',
      telefone: '',
      email: '',
      departamento: '',
      faculdade: '',
      password: ''
    });
    setError('');
    setSuccess('');
    setEditandoUsuario(false);
    setUsuarioEditando(null);
  };

  // Funções para gestão de usuários
  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setEditandoUsuario(true);
    setDadosEdicao({
      nome: usuario.nome,
      outrosNomes: usuario.outrosNomes,
      telefone: usuario.telefone,
      email: usuario.email,
      departamento: usuario.departamento || '',
      faculdade: usuario.faculdade || '',
      curso: usuario.curso || '',
      anoAcademico: usuario.anoAcademico || ''
    });
  };

  const handleSalvarEdicao = () => {
    if (!usuarioEditando) return;

    const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
    const usuarioIndex = usuariosCadastrados.findIndex((u: any) => u.id === usuarioEditando.id);
    
    if (usuarioIndex !== -1) {
      usuariosCadastrados[usuarioIndex] = {
        ...usuariosCadastrados[usuarioIndex],
        nome: dadosEdicao.nome,
        outrosNomes: dadosEdicao.outrosNomes,
        telefone: dadosEdicao.telefone,
        email: dadosEdicao.email,
        departamento: dadosEdicao.departamento,
        faculdade: dadosEdicao.faculdade,
        curso: dadosEdicao.curso,
        anoAcademico: dadosEdicao.anoAcademico
      };

      localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));
      setSuccess('Usuário atualizado com sucesso!');
      setEditandoUsuario(false);
      setUsuarioEditando(null);
      
      setTimeout(() => {
        loadStatistics();
        setSuccess('');
      }, 2000);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoUsuario(false);
    setUsuarioEditando(null);
    setDadosEdicao({
      nome: '',
      outrosNomes: '',
      telefone: '',
      email: '',
      departamento: '',
      faculdade: '',
      curso: '',
      anoAcademico: ''
    });
  };

  const handleExcluirUsuario = async (usuarioId: any) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    setLoading(true);
    try {
      // If id looks numeric, try to delete via backend
      if (!isNaN(Number(usuarioId))) {
        try {
          await promoterService.delete(Number(usuarioId));
        } catch (e) {
          // ignore backend delete errors
        }
      }

      // Always remove from localStorage fallback
      const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const usuariosAtualizados = usuariosCadastrados.filter((u: any) => u.id !== usuarioId && String(u.id) !== String(usuarioId));
      localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosAtualizados));

      setSuccess('Usuário excluído com sucesso!');
      await loadStatistics();
      setTimeout(() => setSuccess(''), 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChangeEdicao = (field: string, value: string) => {
    setDadosEdicao(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // ✅ FUNÇÕES PARA CONFIGURAÇÕES
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

  // ✅ FUNÇÕES PARA DATAS
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

  const renderDashboardView = () => (
    <>
      {/* Estatísticas Gerais - Layout Compacto */}
      <div className="dashboard-overview">
        {/* Estatísticas de Usuários */}
        <section className="stats-section compact">
          <h2>👥 Estatísticas de Usuários</h2>
          <div className="stats-grid compact">
            <div className="stat-card user-stat compact">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total de Usuários</h3>
                <span className="stat-number">{userStats.totalUsuarios}</span>
                <span className="stat-change">
                  {systemStats.taxaCrescimento > 0 ? '↗' : '↘'} 
                  {systemStats.taxaCrescimento}% este mês
                </span>
              </div>
            </div>

            <div className="stat-card student-stat compact">
              <div className="stat-icon">🎓</div>
              <div className="stat-info">
                <h3>Estudantes</h3>
                <span className="stat-number">{userStats.totalEstudantes}</span>
                <span className="stat-percentage">
                  {userStats.totalUsuarios > 0 ? 
                    Math.round((userStats.totalEstudantes / userStats.totalUsuarios) * 100) : 0
                  }% do total
                </span>
              </div>
            </div>

            <div className="stat-card promoter-stat compact">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-info">
                <h3>Promotores</h3>
                <span className="stat-number">{userStats.totalPromotores}</span>
                <span className="stat-percentage">
                  {userStats.totalUsuarios > 0 ? 
                    Math.round((userStats.totalPromotores / userStats.totalUsuarios) * 100) : 0
                  }% do total
                </span>
              </div>
            </div>

            <div className="stat-card admin-stat compact">
              <div className="stat-icon">⚙️</div>
              <div className="stat-info">
                <h3>Administradores</h3>
                <span className="stat-number">{userStats.totalAdmin}</span>
                <span className="stat-percentage">
                  {userStats.totalUsuarios > 0 ? 
                    Math.round((userStats.totalAdmin / userStats.totalUsuarios) * 100) : 0
                  }% do total
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Estatísticas de Eventos */}
        <section className="stats-section compact">
          <h2>📅 Estatísticas de Eventos</h2>
          <div className="stats-grid compact">
            <div className="stat-card event-stat compact">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Total de Eventos</h3>
                <span className="stat-number">{eventStats.totalEventos}</span>
                <span className="stat-change">
                  {systemStats.eventosEsteMes} este mês
                </span>
              </div>
            </div>

            <div className="stat-card active-event-stat compact">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <h3>Eventos Ativos</h3>
                <span className="stat-number">{eventStats.eventosAtivos}</span>
                <span className="stat-percentage">
                  {eventStats.totalEventos > 0 ? 
                    Math.round((eventStats.eventosAtivos / eventStats.totalEventos) * 100) : 0
                  }% do total
                </span>
              </div>
            </div>

            <div className="stat-card finished-event-stat compact">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Eventos Finalizados</h3>
                <span className="stat-number">{eventStats.eventosFinalizados}</span>
                <span className="stat-percentage">
                  {eventStats.totalEventos > 0 ? 
                    Math.round((eventStats.eventosFinalizados / eventStats.totalEventos) * 100) : 0
                  }% do total
                </span>
              </div>
            </div>

            <div className="stat-card inscription-stat compact">
              <div className="stat-icon">📝</div>
              <div className="stat-info">
                <h3>Total de Inscrições</h3>
                <span className="stat-number">{eventStats.totalInscricoes}</span>
                <span className="stat-change">
                  Média: {eventStats.totalEventos > 0 ? 
                    Math.round(eventStats.totalInscricoes / eventStats.totalEventos) : 0
                  } por evento
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Usuários Recentes */}
      <section className="recent-section">
        <div className="section-header">
          <h2>🆕 Usuários Recentes</h2>
          <span className="section-badge">{recentUsers.length} usuários</span>
        </div>
        <div className="users-list compact">
          {recentUsers.length > 0 ? (
            recentUsers.map((user, index) => (
              <div key={index} className="user-item compact">
                <div className="user-avatar">
                  {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-info">
                  <strong>{user.nome || 'Usuário'}</strong>
                  <span className="user-type">
                    {user.tipo === 'estudante' ? '🎓 Estudante' : 
                     user.tipo === 'docente' ? '👨‍🏫 Promotor' : 
                     '⚙️ Admin'}
                  </span>
                </div>
                <span className="user-email">{user.email}</span>
                <span className="user-date">
                  {user.dataCadastro ? new Date(user.dataCadastro).toLocaleDateString('pt-BR') : 'Data não disponível'}
                </span>
              </div>
            ))
          ) : (
            <div className="no-data">
              <p>Nenhum usuário cadastrado ainda</p>
            </div>
          )}
        </div>
      </section>
    </>
  );

  const renderCadastrarPromotorView = () => (
    <div className="form-view-container">
      <div className="form-view-content">
        <form onSubmit={handleCadastrarPromotor} className="promotor-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={promotorData.nome}
                onChange={(e) => handleInputChange('nome', e.target.value)}
                placeholder="Primeiro nome"
                required
              />
            </div>

            <div className="form-group">
              <label>Outros Nomes *</label>
              <input
                type="text"
                value={promotorData.outrosNomes}
                onChange={(e) => handleInputChange('outrosNomes', e.target.value)}
                placeholder="Sobrenomes"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                value={promotorData.telefone}
                onChange={(e) => handleInputChange('telefone', e.target.value)}
                placeholder="(+258) 8X XXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label>Email Institucional *</label>
              <input
                type="email"
                value={promotorData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="promotor@uem.ac.mz"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Departamento</label>
              <select
                value={promotorData.departamento}
                onChange={(e) => handleInputChange('departamento', e.target.value)}
                disabled={!!promotorData.faculdade}
                className={promotorData.faculdade ? 'disabled-field' : ''}
              >
                <option value="">Selecione o departamento</option>
                <option value="Departamento de Matemática e Informática">Departamento de Matemática e Informática</option>
                <option value="Departamento de Física">Departamento de Física</option>
                <option value="Departamento de Química">Departamento de Química</option>
                <option value="Departamento de Biologia">Departamento de Biologia</option>
                <option value="Departamento de Engenharia Civil">Departamento de Engenharia Civil</option>
                <option value="Departamento de Engenharia Mecânica">Departamento de Engenharia Mecânica</option>
                <option value="Departamento de Engenharia Química">Departamento de Engenharia Química</option>
                <option value="Departamento de Engenharia Eletrotécnica">Departamento de Engenharia Eletrotécnica</option>
                <option value="Departamento de Economia">Departamento de Economia</option>
                <option value="Departamento de Gestão">Departamento de Gestão</option>
                <option value="Departamento de Direito">Departamento de Direito</option>
                <option value="Departamento de Medicina">Departamento de Medicina</option>
                <option value="Departamento de Agronomia">Departamento de Agronomia</option>
                <option value="Departamento de Veterinária">Departamento de Veterinária</option>
              </select>
              {promotorData.faculdade && (
                <div className="field-info">
                  Campo desabilitado - faculdade selecionada
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Faculdade</label>
              <select
                value={promotorData.faculdade}
                onChange={(e) => handleInputChange('faculdade', e.target.value)}
                disabled={!!promotorData.departamento}
                className={promotorData.departamento ? 'disabled-field' : ''}
              >
                <option value="">Selecione a faculdade</option>
                <option value="Faculdade de Ciências">Faculdade de Ciências</option>
                <option value="Faculdade de Engenharia">Faculdade de Engenharia</option>
                <option value="Faculdade de Medicina">Faculdade de Medicina</option>
                <option value="Faculdade de Direito">Faculdade de Direito</option>
                <option value="Faculdade de Economia">Faculdade de Economia</option>
                <option value="Faculdade de Letras e Ciências Sociais">Faculdade de Letras e Ciências Sociais</option>
                <option value="Faculdade de Agronomia e Engenharia Florestal">Faculdade de Agronomia e Engenharia Florestal</option>
                <option value="Faculdade de Veterinária">Faculdade de Veterinária</option>
                <option value="Faculdade de Arquitetura e Planeamento Físico">Faculdade de Arquitetura e Planeamento Físico</option>
              </select>
              {promotorData.departamento && (
                <div className="field-info">
                  Campo desabilitado - departamento selecionado
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Senha *</label>
            <input
              type="password"
              value={promotorData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder="Mínimo 6 caracteres"
              minLength={6}
              required
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              {success}
            </div>
          )}

          <div className="form-info">
            <p><strong>Nota:</strong> Selecione apenas um - departamento OU faculdade. Os campos são mutuamente exclusivos.</p>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Cadastrar Promotor
            </button>
            <button type="button" className="btn-secondary" onClick={handleBackToDashboard}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEstudantesView = () => (
    <div className="management-view">
      <div className="management-header">
        <h2>🎓 Gestão de Estudantes</h2>
        <span className="total-badge">{estudantes.length} estudantes</span>
      </div>

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="users-table-container">
        {estudantes.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Curso</th>
                <th>Ano Académico</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {estudantes.map((estudante) => (
                <tr key={estudante.id}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar small">
                        {estudante.nome ? estudante.nome.charAt(0).toUpperCase() : 'E'}
                      </div>
                      <div>
                        <strong>{estudante.nome} {estudante.outrosNomes}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{estudante.email}</td>
                  <td>{estudante.telefone}</td>
                  <td>{estudante.curso || 'Não informado'}</td>
                  <td>{estudante.anoAcademico || 'Não informado'}</td>
                  <td>{new Date(estudante.dataCadastro).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditarUsuario(estudante)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleExcluirUsuario(estudante.id)}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>Nenhum estudante cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPromotoresView = () => (
    <div className="management-view">
      <div className="management-header">
        <h2>👨‍🏫 Gestão de Promotores</h2>
        <span className="total-badge">{promotores.length} promotores</span>
      </div>

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="users-table-container">
        {promotores.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Departamento/Faculdade</th>
                <th>Data de Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {promotores.map((promotor) => {
                const name = (promotor as any).nome || (promotor as any).name || '';
                const outros = (promotor as any).outrosNomes || '';
                const email = (promotor as any).email || '';
                const telefone = (promotor as any).telefone || '';
                const dept = (promotor as any).departamento || (promotor as any).faculdade || (promotor as any).department || '';
                const dataCadastroRaw = (promotor as any).dataCadastro || (promotor as any).created_at || null;
                const dataCadastro = dataCadastroRaw ? new Date(dataCadastroRaw).toLocaleDateString('pt-BR') : 'Não informado';

                return (
                <tr key={(promotor as any).id || name}>
                  <td>
                    <div className="user-info-cell">
                      <div className="user-avatar small">
                        {name ? name.charAt(0).toUpperCase() : 'P'}
                      </div>
                      <div>
                        <strong>{name} {outros}</strong>
                      </div>
                    </div>
                  </td>
                  <td>{email}</td>
                  <td>{telefone}</td>
                  <td>{dept || 'Não informado'}</td>
                  <td>{dataCadastro}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditarUsuario(promotor)}
                      >
                        ✏️ Editar
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleExcluirUsuario((promotor as any).id)}
                      >
                        🗑️ Excluir
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-data">
            <p>Nenhum promotor cadastrado</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderEdicaoUsuarioView = () => (
    <div className="form-view-container">
      <div className="form-view-content">
        <div className="edicao-header">
          <h2>✏️ Editar Usuário</h2>
          <p>Editando: {usuarioEditando?.nome} {usuarioEditando?.outrosNomes}</p>
        </div>

        <form className="promotor-form">
          <div className="form-row">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                value={dadosEdicao.nome}
                onChange={(e) => handleInputChangeEdicao('nome', e.target.value)}
                placeholder="Primeiro nome"
                required
              />
            </div>

            <div className="form-group">
              <label>Outros Nomes *</label>
              <input
                type="text"
                value={dadosEdicao.outrosNomes}
                onChange={(e) => handleInputChangeEdicao('outrosNomes', e.target.value)}
                placeholder="Sobrenomes"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                value={dadosEdicao.telefone}
                onChange={(e) => handleInputChangeEdicao('telefone', e.target.value)}
                placeholder="(+258) 8X XXX XXXX"
                required
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={dadosEdicao.email}
                onChange={(e) => handleInputChangeEdicao('email', e.target.value)}
                placeholder="Email"
                required
              />
            </div>
          </div>

          {usuarioEditando?.tipo === 'docente' && (
            <div className="form-row">
              <div className="form-group">
                <label>Departamento</label>
                <input
                  type="text"
                  value={dadosEdicao.departamento}
                  onChange={(e) => handleInputChangeEdicao('departamento', e.target.value)}
                  placeholder="Departamento"
                />
              </div>

              <div className="form-group">
                <label>Faculdade</label>
                <input
                  type="text"
                  value={dadosEdicao.faculdade}
                  onChange={(e) => handleInputChangeEdicao('faculdade', e.target.value)}
                  placeholder="Faculdade"
                />
              </div>
            </div>
          )}

          {usuarioEditando?.tipo === 'estudante' && (
            <div className="form-row">
              <div className="form-group">
                <label>Curso</label>
                <input
                  type="text"
                  value={dadosEdicao.curso}
                  onChange={(e) => handleInputChangeEdicao('curso', e.target.value)}
                  placeholder="Curso"
                />
              </div>

              <div className="form-group">
                <label>Ano Académico</label>
                <input
                  type="text"
                  value={dadosEdicao.anoAcademico}
                  onChange={(e) => handleInputChangeEdicao('anoAcademico', e.target.value)}
                  placeholder="Ano Académico"
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSalvarEdicao}>
              Salvar Alterações
            </button>
            <button type="button" className="btn-secondary" onClick={handleCancelarEdicao}>
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // ✅ NOVA FUNÇÃO: Renderizar view de configurações
  const renderConfiguracoesView = () => {
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
                  {userType === 'admin' ? '👑 Administrador' : userType || 'A carregar...'}
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

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando estatísticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>
            {activeView === 'dashboard' ? '🏠 Painel de Administração' : 
             activeView === 'cadastrar-promotor' ? '👨‍🏫 Cadastrar Promotor' :
             activeView === 'estudantes' ? '🎓 Gestão de Estudantes' :
             activeView === 'promotores' ? '👨‍🏫 Gestão de Promotores' :
             activeView === 'configuracoes' ? '⚙️ Configurações' :
             'Editar Usuário'}
          </h1>
          <p>
            {activeView === 'dashboard' 
              ? 'Visão geral do sistema de gestão de eventos' 
              : activeView === 'cadastrar-promotor'
              ? 'Preencha os dados do promotor para cadastrar no sistema'
              : activeView === 'estudantes'
              ? 'Gerencie os estudantes cadastrados no sistema'
              : activeView === 'promotores'
              ? 'Gerencie os promotores cadastrados no sistema'
              : activeView === 'configuracoes'
              ? 'Gerencie suas informações pessoais e segurança da conta'
              : 'Edite os dados do usuário selecionado'
            }
          </p>
        </div>
  
      </header>

      <div className="admin-content">
        {/* Sidebar */}
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
              <h3>👥 Gestão de Usuários</h3>
              <button 
                className={`nav-btn ${activeView === 'cadastrar-promotor' ? 'active' : ''}`}
                onClick={() => setActiveView('cadastrar-promotor')}
              >
                ➕ Cadastrar Promotor
              </button>
              
              <button 
                className={`nav-btn ${activeView === 'estudantes' ? 'active' : ''}`}
                onClick={() => setActiveView('estudantes')}
              >
                🎓 Estudantes
              </button>
              <button 
                className={`nav-btn ${activeView === 'promotores' ? 'active' : ''}`}
                onClick={() => setActiveView('promotores')}
              >
                👨‍🏫 Promotores
              </button>
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

        {/* Main Content */}
        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'cadastrar-promotor' && renderCadastrarPromotorView()}
          {activeView === 'estudantes' && renderEstudantesView()}
          {activeView === 'promotores' && renderPromotoresView()}
          {activeView === 'configuracoes' && renderConfiguracoesView()}
          {editandoUsuario && renderEdicaoUsuarioView()}
        </main>
      </div>
    </div>
  );
}