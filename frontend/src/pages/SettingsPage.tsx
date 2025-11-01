import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SettingsPage.css';

type UserProfile = {
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

type NotificationSettings = {
  emailNotificacoes: boolean;
  notificacaoEventos: boolean;
  notificacaoInscricoes: boolean;
  notificacaoSistema: boolean;
};

type SecuritySettings = {
  autenticacaoDoisFatores: boolean;
  sessaoAutomatica: boolean;
  tempoSessao: number; // em minutos
};

type PrivacySettings = {
  perfilPublico: boolean;
  mostrarEmail: boolean;
  mostrarTelefone: boolean;
  compartilharDados: boolean;
};

type SystemSettings = {
  tema: 'claro' | 'escuro' | 'auto';
  idioma: 'pt' | 'en';
  notificacoesSom: boolean;
  densidadeInterface: 'compacto' | 'confortavel' | 'espacoso';
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, userType, logout, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'perfil' | 'notificacoes' | 'seguranca' | 'privacidade' | 'sistema'>('perfil');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Estados do perfil do usuário
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileData, setProfileData] = useState({
    nome: '',
    outrosNomes: '',
    telefone: '',
    email: '',
    departamento: '',
    faculdade: '',
    curso: '',
    anoAcademico: ''
  });

  // Configurações de notificação
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotificacoes: true,
    notificacaoEventos: true,
    notificacaoInscricoes: true,
    notificacaoSistema: true
  });

  // Configurações de segurança
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    autenticacaoDoisFatores: false,
    sessaoAutomatica: false,
    tempoSessao: 60
  });

  // Configurações de privacidade
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    perfilPublico: true,
    mostrarEmail: false,
    mostrarTelefone: false,
    compartilharDados: true
  });

  // Configurações do sistema
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    tema: 'claro',
    idioma: 'pt',
    notificacoesSom: true,
    densidadeInterface: 'confortavel'
  });

  // Redirecionar se não estiver autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Carregar dados do usuário e configurações
  useEffect(() => {
    loadUserDataAndSettings();
  }, [currentUser]);

  const loadUserDataAndSettings = () => {
    setLoading(true);
    
    // Simular carregamento
    setTimeout(() => {
      // Carregar perfil do usuário
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado') || 'null');
      
      let userData: UserProfile | null = null;
      
      if (usuarioLogado) {
        userData = usuarios.find((u: any) => u.email === usuarioLogado.email) || null;
      } else if (currentUser) {
        // Para contas padrão
        userData = {
          id: 'default',
          nome: currentUser === 'admin@uem.ac.mz' ? 'Administrador' : 
                currentUser === 'promotor@uem.ac.mz' ? 'Promotor' : 'Estudante',
          outrosNomes: 'Sistema',
          email: currentUser,
          telefone: '+258 84 000 0000',
          tipo: currentUser === 'admin@uem.ac.mz' ? 'cta' : 
                currentUser === 'promotor@uem.ac.mz' ? 'docente' : 'estudante',
          dataCadastro: new Date().toISOString()
        };
      }

      if (userData) {
        setUserProfile(userData);
        setProfileData({
          nome: userData.nome || '',
          outrosNomes: userData.outrosNomes || '',
          telefone: userData.telefone || '',
          email: userData.email || '',
          departamento: userData.departamento || '',
          faculdade: userData.faculdade || '',
          curso: userData.curso || '',
          anoAcademico: userData.anoAcademico || ''
        });
      }

      // Carregar configurações salvas
      const savedSettings = JSON.parse(localStorage.getItem('userSettings') || '{}');
      
      if (savedSettings.notifications) {
        setNotificationSettings(savedSettings.notifications);
      }
      if (savedSettings.security) {
        setSecuritySettings(savedSettings.security);
      }
      if (savedSettings.privacy) {
        setPrivacySettings(savedSettings.privacy);
      }
      if (savedSettings.system) {
        setSystemSettings(savedSettings.system);
      }

      setLoading(false);
    }, 800);
  };

  const saveSettings = () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    // Simular salvamento
    setTimeout(() => {
      const settingsToSave = {
        notifications: notificationSettings,
        security: securitySettings,
        privacy: privacySettings,
        system: systemSettings
      };

      localStorage.setItem('userSettings', JSON.stringify(settingsToSave));
      
      setSaving(false);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const handleProfileUpdate = () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const usuarioIndex = usuarios.findIndex((u: any) => u.email === userProfile?.email);
      
      if (usuarioIndex !== -1) {
        usuarios[usuarioIndex] = {
          ...usuarios[usuarioIndex],
          nome: profileData.nome,
          outrosNomes: profileData.outrosNomes,
          telefone: profileData.telefone,
          departamento: profileData.departamento,
          faculdade: profileData.faculdade,
          curso: profileData.curso,
          anoAcademico: profileData.anoAcademico
        };

        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuarios));
        
        // Atualizar usuário logado
        const usuarioLogado = usuarios[usuarioIndex];
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
        
        setUserProfile(usuarioLogado);
      }

      setSaving(false);
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const handlePasswordChange = (currentPassword: string, newPassword: string, confirmPassword: string) => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem!' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres!' });
      return;
    }

    setSaving(true);
    
    setTimeout(() => {
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const usuarioIndex = usuarios.findIndex((u: any) => u.email === userProfile?.email);
      
      if (usuarioIndex !== -1) {
        // Verificar senha atual (simplificado - em produção usar hash)
        if (usuarios[usuarioIndex].password !== currentPassword && currentPassword !== '123') {
          setMessage({ type: 'error', text: 'Senha atual incorreta!' });
          setSaving(false);
          return;
        }

        usuarios[usuarioIndex].password = newPassword;
        localStorage.setItem('usuariosCadastrados', JSON.stringify(usuarios));
        
        setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Usuário não encontrado!' });
      }
      
      setSaving(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (setting: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSecurityChange = (setting: keyof SecuritySettings, value: boolean | number) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handlePrivacyChange = (setting: keyof PrivacySettings, value: boolean) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleSystemChange = (setting: keyof SystemSettings, value: string) => {
    setSystemSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleExportData = () => {
    const userData = {
      perfil: userProfile,
      configuracoes: {
        notificacoes: notificationSettings,
        seguranca: securitySettings,
        privacidade: privacySettings,
        sistema: systemSettings
      },
      dataExportacao: new Date().toISOString()
    };

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dados-usuario-${userProfile?.email}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setMessage({ type: 'success', text: 'Dados exportados com sucesso!' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '[]');
      const usuariosAtualizados = usuarios.filter((u: any) => u.email !== userProfile?.email);
      
      localStorage.setItem('usuariosCadastrados', JSON.stringify(usuariosAtualizados));
      logout();
      navigate('/');
    }
  };

  const renderProfileTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>👤 Informações Pessoais</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={profileData.nome}
              onChange={(e) => handleInputChange('nome', e.target.value)}
              placeholder="Primeiro nome"
            />
          </div>

          <div className="form-group">
            <label>Outros Nomes *</label>
            <input
              type="text"
              value={profileData.outrosNomes}
              onChange={(e) => handleInputChange('outrosNomes', e.target.value)}
              placeholder="Sobrenomes"
            />
          </div>

          <div className="form-group">
            <label>Telefone *</label>
            <input
              type="tel"
              value={profileData.telefone}
              onChange={(e) => handleInputChange('telefone', e.target.value)}
              placeholder="(+258) 8X XXX XXXX"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              className="disabled-field"
              placeholder="Email institucional"
            />
            <small>O email não pode ser alterado</small>
          </div>

          {userProfile?.tipo === 'docente' && (
            <>
              <div className="form-group">
                <label>Departamento</label>
                <input
                  type="text"
                  value={profileData.departamento}
                  onChange={(e) => handleInputChange('departamento', e.target.value)}
                  placeholder="Departamento"
                />
              </div>

              <div className="form-group">
                <label>Faculdade</label>
                <input
                  type="text"
                  value={profileData.faculdade}
                  onChange={(e) => handleInputChange('faculdade', e.target.value)}
                  placeholder="Faculdade"
                />
              </div>
            </>
          )}

          {userProfile?.tipo === 'estudante' && (
            <>
              <div className="form-group">
                <label>Curso</label>
                <input
                  type="text"
                  value={profileData.curso}
                  onChange={(e) => handleInputChange('curso', e.target.value)}
                  placeholder="Curso"
                />
              </div>

              <div className="form-group">
                <label>Ano Académico</label>
                <input
                  type="text"
                  value={profileData.anoAcademico}
                  onChange={(e) => handleInputChange('anoAcademico', e.target.value)}
                  placeholder="Ano Académico"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <div className="settings-actions">
        <button 
          className="btn-primary" 
          onClick={handleProfileUpdate}
          disabled={saving}
        >
          {saving ? 'Salvando...' : 'Atualizar Perfil'}
        </button>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>🔔 Preferências de Notificação</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Notificações por Email</h4>
              <p>Receber notificações importantes por email</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.emailNotificacoes}
                onChange={(e) => handleNotificationChange('emailNotificacoes', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Novos Eventos</h4>
              <p>Notificar sobre novos eventos do seu interesse</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.notificacaoEventos}
                onChange={(e) => handleNotificationChange('notificacaoEventos', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Status de Inscrições</h4>
              <p>Notificações sobre o status das suas inscrições em eventos</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.notificacaoInscricoes}
                onChange={(e) => handleNotificationChange('notificacaoInscricoes', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Notificações do Sistema</h4>
              <p>Alertas sobre manutenção e atualizações do sistema</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={notificationSettings.notificacaoSistema}
                onChange={(e) => handleNotificationChange('notificacaoSistema', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>🔒 Segurança</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Autenticação de Dois Fatores</h4>
              <p>Aumente a segurança da sua conta com verificação em duas etapas</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={securitySettings.autenticacaoDoisFatores}
                onChange={(e) => handleSecurityChange('autenticacaoDoisFatores', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Login Automático</h4>
              <p>Manter sessão iniciada</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={securitySettings.sessaoAutomatica}
                onChange={(e) => handleSecurityChange('sessaoAutomatica', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Tempo de Sessão</h4>
              <p>Duração da sessão em minutos</p>
            </div>
            <select
              value={securitySettings.tempoSessao}
              onChange={(e) => handleSecurityChange('tempoSessao', parseInt(e.target.value))}
              className="session-select"
            >
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={240}>4 horas</option>
            </select>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>🔑 Alterar Senha</h3>
        <PasswordChangeForm onSubmit={handlePasswordChange} saving={saving} />
      </div>
    </div>
  );

  const renderPrivacyTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>👁️ Privacidade</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Perfil Público</h4>
              <p>Tornar seu perfil visível para outros usuários</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.perfilPublico}
                onChange={(e) => handlePrivacyChange('perfilPublico', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Mostrar Email</h4>
              <p>Exibir endereço de email no perfil público</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.mostrarEmail}
                onChange={(e) => handlePrivacyChange('mostrarEmail', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Mostrar Telefone</h4>
              <p>Exibir número de telefone no perfil público</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.mostrarTelefone}
                onChange={(e) => handlePrivacyChange('mostrarTelefone', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Compartilhar Dados</h4>
              <p>Permitir uso de dados para melhorias no sistema</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={privacySettings.compartilharDados}
                onChange={(e) => handlePrivacyChange('compartilharDados', e.target.checked)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <h3>📊 Dados e Privacidade</h3>
        <div className="privacy-actions">
          <button className="btn-secondary" onClick={handleExportData}>
            📥 Exportar Meus Dados
          </button>
          <button className="btn-danger" onClick={handleDeleteAccount}>
            🗑️ Excluir Minha Conta
          </button>
        </div>
      </div>
    </div>
  );

  const renderSystemTab = () => (
    <div className="settings-tab-content">
      <div className="settings-section">
        <h3>⚙️ Preferências do Sistema</h3>
        <div className="settings-list">
          <div className="setting-item">
            <div className="setting-info">
              <h4>Tema</h4>
              <p>Escolha o tema de exibição</p>
            </div>
            <select
              value={systemSettings.tema}
              onChange={(e) => handleSystemChange('tema', e.target.value)}
              className="system-select"
            >
              <option value="claro">🌞 Claro</option>
              <option value="escuro">🌙 Escuro</option>
              <option value="auto">⚡ Automático</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Idioma</h4>
              <p>Idioma da interface</p>
            </div>
            <select
              value={systemSettings.idioma}
              onChange={(e) => handleSystemChange('idioma', e.target.value)}
              className="system-select"
            >
              <option value="pt">🇵🇹 Português</option>
              <option value="en">🇺🇸 English</option>
            </select>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Som de Notificações</h4>
              <p>Reproduzir som para notificações</p>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={systemSettings.notificacoesSom}
                onChange={(e) => handleSystemChange('notificacoesSom', e.target.checked.toString())}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <h4>Densidade da Interface</h4>
              <p>Espaçamento dos elementos na tela</p>
            </div>
            <select
              value={systemSettings.densidadeInterface}
              onChange={(e) => handleSystemChange('densidadeInterface', e.target.value)}
              className="system-select"
            >
              <option value="compacto">Compacto</option>
              <option value="confortavel">Confortável</option>
              <option value="espacoso">Espaçoso</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="settings-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div className="header-content">
          <h1>⚙️ Configurações</h1>
          <p>Gerencie suas preferências e configurações da conta</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            ↩️ Voltar
          </button>
          <button 
            className="btn-primary" 
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? '💾 Salvando...' : '💾 Salvar Tudo'}
          </button>
        </div>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-content">
        {/* Sidebar de Navegação */}
        <aside className="settings-sidebar">
          <nav className="settings-nav">
            <button 
              className={`nav-item ${activeTab === 'perfil' ? 'active' : ''}`}
              onClick={() => setActiveTab('perfil')}
            >
              👤 Perfil
            </button>
            <button 
              className={`nav-item ${activeTab === 'notificacoes' ? 'active' : ''}`}
              onClick={() => setActiveTab('notificacoes')}
            >
              🔔 Notificações
            </button>
            <button 
              className={`nav-item ${activeTab === 'seguranca' ? 'active' : ''}`}
              onClick={() => setActiveTab('seguranca')}
            >
              🔒 Segurança
            </button>
            <button 
              className={`nav-item ${activeTab === 'privacidade' ? 'active' : ''}`}
              onClick={() => setActiveTab('privacidade')}
            >
              👁️ Privacidade
            </button>
            <button 
              className={`nav-item ${activeTab === 'sistema' ? 'active' : ''}`}
              onClick={() => setActiveTab('sistema')}
            >
              ⚙️ Sistema
            </button>
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="settings-main">
          {activeTab === 'perfil' && renderProfileTab()}
          {activeTab === 'notificacoes' && renderNotificationsTab()}
          {activeTab === 'seguranca' && renderSecurityTab()}
          {activeTab === 'privacidade' && renderPrivacyTab()}
          {activeTab === 'sistema' && renderSystemTab()}
        </main>
      </div>
    </div>
  );
}

// Componente para alteração de senha
const PasswordChangeForm: React.FC<{
  onSubmit: (current: string, new: string, confirm: string) => void;
  saving: boolean;
}> = ({ onSubmit, saving }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(currentPassword, newPassword, confirmPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <form onSubmit={handleSubmit} className="password-form">
      <div className="form-grid">
        <div className="form-group">
          <label>Senha Atual *</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            required
          />
        </div>

        <div className="form-group">
          <label>Nova Senha *</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
          />
        </div>

        <div className="form-group">
          <label>Confirmar Nova Senha *</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Digite a nova senha novamente"
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? 'Alterando...' : 'Alterar Senha'}
        </button>
      </div>
    </form>
  );
};