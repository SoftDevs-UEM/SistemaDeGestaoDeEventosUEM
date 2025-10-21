import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

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

type ActiveView = 'dashboard' | 'cadastrar-promotor' | 'lista-usuarios' | 'gestao-eventos' | 'relatorios';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout } = useAuth();
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
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
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

  const loadStatistics = () => {
    setLoading(true);
    
    // Simular carregamento de dados
    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const eventos = JSON.parse(localStorage.getItem('eventos') || '[]');
      const inscricoes = JSON.parse(localStorage.getItem('inscricoes') || '[]');
      
      // Estatísticas de usuários
      const estudantes = usuarios.filter((u: any) => u.tipo === 'estudante');
      const promotores = usuarios.filter((u: any) => u.tipo === 'docente');
      const admins = usuarios.filter((u: any) => u.tipo === 'cta' || u.email === 'admin@uem.ac.mz');
      
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
        totalUsuarios: usuarios.length,
        totalEstudantes: estudantes.length,
        totalPromotores: promotores.length,
        totalAdmin: admins.length,
        usuariosAtivos: usuarios.length // Simulação
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
      setLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Função para lidar com mudanças nos campos do promotor
  const handleInputChange = (field: string, value: string) => {
    // Se selecionar faculdade, limpar departamento
    if (field === 'faculdade' && value) {
      setPromotorData(prev => ({
        ...prev,
        faculdade: value,
        departamento: ''
      }));
    }
    // Se selecionar departamento, limpar faculdade
    else if (field === 'departamento' && value) {
      setPromotorData(prev => ({
        ...prev,
        departamento: value,
        faculdade: ''
      }));
    }
    // Para outros campos, apenas atualizar o valor
    else {
      setPromotorData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Função para cadastrar promotor
  const handleCadastrarPromotor = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validações
    if (!promotorData.nome || !promotorData.outrosNomes || !promotorData.telefone || 
        !promotorData.email || !promotorData.password) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Validar que pelo menos um (departamento OU faculdade) foi selecionado
    if (!promotorData.departamento && !promotorData.faculdade) {
      setError('Selecione pelo menos um departamento ou uma faculdade.');
      return;
    }

    if (promotorData.password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Verificar se email já existe
    const usuariosCadastrados = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
    if (usuariosCadastrados.some((u: any) => u.email === promotorData.email)) {
      setError('Email já cadastrado.');
      return;
    }

    // Criar objeto do promotor
    const novoPromotor = {
      nome: promotorData.nome,
      outrosNomes: promotorData.outrosNomes,
      telefone: promotorData.telefone,
      email: promotorData.email,
      password: promotorData.password,
      tipo: 'docente' as const,
      departamento: promotorData.departamento,
      faculdade: promotorData.faculdade,
      cadastradoPorAdmin: true,
      dataCadastro: new Date().toISOString()
    };

    // Salvar no localStorage
    usuariosCadastrados.push(novoPromotor);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosCadastrados));

    // Limpar formulário e mostrar mensagem de sucesso
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
    
    // Recarregar estatísticas após 2 segundos
    setTimeout(() => {
      loadStatistics();
      setSuccess('');
    }, 2000);
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
  };

  const getRecentActivities = () => {
    const activities = [];
    
    if (systemStats.usuariosNovos > 0) {
      activities.push({
        id: 1,
        action: 'Novos usuários registrados',
        user: `${systemStats.usuariosNovos} novos usuários`,
        time: 'este mês'
      });
    }
    
    if (eventStats.eventosPendentes > 0) {
      activities.push({
        id: 2,
        action: 'Eventos pendentes de aprovação',
        user: `${eventStats.eventosPendentes} eventos`,
        time: 'aguardando'
      });
    }
    
    activities.push({
      id: 3,
      action: 'Sistema operacional',
      user: 'Todos os serviços',
      time: '🟢 Online'
    });

    return activities;
  };

  const renderDashboardView = () => (
    <>
      {/* Estatísticas de Usuários */}
      <section className="stats-section">
        <h2>👥 Estatísticas de Usuários</h2>
        <div className="stats-grid">
          <div className="stat-card user-stat">
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

          <div className="stat-card student-stat">
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

          <div className="stat-card promoter-stat">
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

          <div className="stat-card admin-stat">
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
      <section className="stats-section">
        <h2>📅 Estatísticas de Eventos</h2>
        <div className="stats-grid">
          <div className="stat-card event-stat">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>Total de Eventos</h3>
              <span className="stat-number">{eventStats.totalEventos}</span>
              <span className="stat-change">
                {systemStats.eventosEsteMes} este mês
              </span>
            </div>
          </div>

          <div className="stat-card active-event-stat">
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

          <div className="stat-card finished-event-stat">
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

          <div className="stat-card inscription-stat">
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

      <div className="content-grid">
        {/* Ações Rápidas */}
        <section className="quick-actions">
          <h2>🚀 Ações Rápidas</h2>
          <div className="actions-grid">
            <button 
              className="action-card"
              onClick={() => setActiveView('cadastrar-promotor')}
            >
              <div className="action-icon">👨‍🏫</div>
              <span>Cadastrar Promotor</span>
            </button>

            <button className="action-card">
              <div className="action-icon">✅</div>
              <span>Aprovar Eventos ({eventStats.eventosPendentes})</span>
            </button>

            <button className="action-card">
              <div className="action-icon">📊</div>
              <span>Ver Relatórios</span>
            </button>

            <button className="action-card">
              <div className="action-icon">👥</div>
              <span>Gerir Usuários</span>
            </button>
          </div>
        </section>

        {/* Usuários Recentes */}
        <section className="recent-users">
          <h2>🆕 Usuários Recentes</h2>
          <div className="users-list">
            {recentUsers.length > 0 ? (
              recentUsers.map((user, index) => (
                <div key={index} className="user-item">
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
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>Nenhum usuário cadastrado ainda</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Atividades Recentes */}
      <section className="recent-activities">
        <h2>📋 Atividades do Sistema</h2>
        <div className="activities-list">
          {getRecentActivities().map(activity => (
            <div key={activity.id} className="activity-item">
              <div className="activity-content">
                <strong>{activity.action}</strong>
                <span>{activity.user}</span>
              </div>
              <span className="activity-time">{activity.time}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  const renderCadastrarPromotorView = () => (
    <div className="form-view-container">
      {/* <div className="form-view-header">
        <button className="back-button" onClick={handleBackToDashboard}>
          ← Voltar para Dashboard
        </button>
        <h1>👨‍🏫 Cadastrar Novo Promotor</h1>
        <p>Preencha os dados do promotor para cadastrar no sistema</p>
      </div> */}

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
            {activeView === 'dashboard' ? '🏠 Painel de Administração' : '👨‍🏫 Cadastrar Promotor'}
          </h1>
          <p>
            {activeView === 'dashboard' 
              ? 'Visão geral do sistema de gestão de eventos' 
              : 'Preencha os dados do promotor para cadastrar no sistema'
            }
          </p>
        </div>
        <div className="header-actions">
          {activeView === 'dashboard' && (
            <button className="refresh-btn" onClick={loadStatistics}>
              🔄 Atualizar
            </button>
          )}
         
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
              <button className="nav-btn">
                📋 Lista de Usuários
              </button>
              <button className="nav-btn">
                🎓 Estudantes
              </button>
              <button className="nav-btn">
                👨‍🏫 Promotores
              </button>
            </div>

            <div className="nav-section">
              <h3>📅 Gestão de Eventos</h3>
              <button className="nav-btn">
                📊 Todos os Eventos
              </button>
            </div>

            <div className="nav-section">
              <h3>📑 Relatórios</h3>
              <button className="nav-btn">
                📋 Relatórios Gerais
              </button>
              <button className="nav-btn">
                📊 Analytics
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {activeView === 'dashboard' && renderDashboardView()}
          {activeView === 'cadastrar-promotor' && renderCadastrarPromotorView()}
        </main>
      </div>
    </div>
  );
}