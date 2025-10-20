import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './adminDashboard.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout } = useAuth();

  // Redirecionar se não for admin
  React.useEffect(() => {
    if (!isAuthenticated || userType !== 'admin') {
      navigate('/login');
    }
  }, [isAuthenticated, userType, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    totalUsuarios: 45,
    totalPromotores: 12,
    totalEventos: 23,
    eventosAtivos: 8
  };

  const recentActivities = [
    { id: 1, action: 'Novo promotor cadastrado', user: 'Dr. João Silva', time: 'há 2 horas' },
    { id: 2, action: 'Evento aprovado', user: 'Semana de Engenharia', time: 'há 4 horas' },
    { id: 3, action: 'Usuário removido', user: 'Maria Santos', time: 'há 1 dia' },
    { id: 4, action: 'Configurações atualizadas', user: 'Sistema', time: 'há 2 dias' }
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="header-content">
          <h1>Painel de Administração</h1>
          <p>Bem-vindo ao sistema de gestão de eventos da UEM</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Sair
        </button>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3>Gestão de Usuários</h3>
              <button 
                className="nav-btn active"
                onClick={() => navigate('/admin/cadastrar-promotor')}
              >
                📋 Cadastrar Promotor
              </button>
              <button className="nav-btn">
                👥 Gestão de Usuários
              </button>
              <button className="nav-btn">
                🎓 Lista de Estudantes
              </button>
              <button className="nav-btn">
                👨‍🏫 Lista de Docentes
              </button>
            </div>

            <div className="nav-section">
              <h3>Gestão de Eventos</h3>
              <button className="nav-btn">
                📊 Todos os Eventos
              </button>
              <button className="nav-btn">
                ✅ Aprovar Eventos
              </button>
              <button className="nav-btn">
                📈 Estatísticas
              </button>
            </div>

            <div className="nav-section">
              <h3>Relatórios</h3>
              <button className="nav-btn">
                📑 Relatórios Gerais
              </button>
              <button className="nav-btn">
                📊 Analytics
              </button>
              <button className="nav-btn">
                📋 Logs do Sistema
              </button>
            </div>

            <div className="nav-section">
              <h3>Configurações</h3>
              <button className="nav-btn">
                ⚙️ Configurações Gerais
              </button>
              <button className="nav-btn">
                🔐 Permissões
              </button>
              <button className="nav-btn">
                🏫 Departamentos/Faculdades
              </button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>Total de Usuários</h3>
                <span className="stat-number">{stats.totalUsuarios}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👨‍🏫</div>
              <div className="stat-info">
                <h3>Promotores</h3>
                <span className="stat-number">{stats.totalPromotores}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <h3>Total de Eventos</h3>
                <span className="stat-number">{stats.totalEventos}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <h3>Eventos Ativos</h3>
                <span className="stat-number">{stats.eventosAtivos}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h2>Ações Rápidas</h2>
            <div className="actions-grid">
              <button 
                className="action-card"
                onClick={() => navigate('/admin/cadastrar-promotor')}
              >
                <div className="action-icon">➕</div>
                <span>Cadastrar Promotor</span>
              </button>

              <button className="action-card">
                <div className="action-icon">✅</div>
                <span>Aprovar Eventos</span>
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
          </div>

          {/* Recent Activities */}
          <div className="recent-activities">
            <h2>Atividades Recentes</h2>
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-content">
                    <strong>{activity.action}</strong>
                    <span>{activity.user}</span>
                  </div>
                  <span className="activity-time">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="system-info">
            <h2>Informações do Sistema</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Versão do Sistema:</label>
                <span>v2.1.0</span>
              </div>
              <div className="info-item">
                <label>Última Atualização:</label>
                <span>15/12/2024</span>
              </div>
              <div className="info-item">
                <label>Usuários Online:</label>
                <span>12</span>
              </div>
              <div className="info-item">
                <label>Status do Sistema:</label>
                <span className="status-active">🟢 Operacional</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}