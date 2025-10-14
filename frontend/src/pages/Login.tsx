import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './login.css';

type RegisteredUser = {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  tipo: 'estudante' | 'docente' | 'cta';
  nrEstudante?: string;
};

export default function Login() {
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState<RegisteredUser & { confirmPassword: string }>(
    {
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      tipo: 'estudante',
      nrEstudante: ''
    }
  );
  const [registerError, setRegisterError] = useState('');

  const getRegisteredUsers = (): RegisteredUser[] => {
    const users = localStorage.getItem('usuariosCadastrados');
    return users ? JSON.parse(users) : [];
  };

  const saveRegisteredUser = (user: RegisteredUser) => {
    const users = getRegisteredUsers();
    users.push(user);
    localStorage.setItem('usuariosCadastrados', JSON.stringify(users));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value || '';
    const password = passwordRef.current?.value || '';
    
    // Login com contas padrão
    if (
      (email === 'estudante@uem.ac.mz' && password === '123') ||
      (email === 'promotor@uem.ac.mz' && password === '123') ||
      (email === 'admin@uem.ac.mz' && password === '123')
    ) {
      login(email);
      const eventoParaInscricao = localStorage.getItem('eventoParaInscricao');
      
      if (email === 'estudante@uem.ac.mz') {
        if (eventoParaInscricao) {
          try {
            const event = JSON.parse(eventoParaInscricao);
            localStorage.removeItem('eventoParaInscricao');
            navigate('/registrar', { state: { event } });
            return;
          } catch {}
        }
        navigate('/estudante');
      } else if (email === 'promotor@uem.ac.mz') {
        navigate('/Organizadores');
      } else if (email === 'admin@uem.ac.mz') {
        navigate('/');
      }
      return;
    }

    // Login com usuários cadastrados
    const users = getRegisteredUsers();
    const found = users.find((u: RegisteredUser) => u.email === email && u.password === password);
    if (found) {
      login(email);
      localStorage.setItem('usuarioLogado', JSON.stringify(found));
      if (found.tipo === 'estudante') navigate('/estudante');
      else if (found.tipo === 'docente') navigate('/promotor');
      else if (found.tipo === 'cta') navigate('/admin');
      return;
    }
    
    alert('Email ou senha inválidos!');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validações
    if (!registerData.nome || !registerData.telefone || !registerData.email || !registerData.password || !registerData.confirmPassword) {
      setRegisterError('Preencha todos os campos obrigatórios.');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError('As senhas não coincidem.');
      return;
    }
    
    if (registerData.tipo === 'estudante' && !registerData.nrEstudante) {
      setRegisterError('Informe o número de estudante.');
      return;
    }
    
    const users = getRegisteredUsers();
    if (users.some((u: RegisteredUser) => u.email === registerData.email)) {
      setRegisterError('Email já cadastrado.');
      return;
    }
    
    // Salvar usuário
    const userToSave: RegisteredUser = {
      nome: registerData.nome,
      telefone: registerData.telefone,
      email: registerData.email,
      password: registerData.password,
      tipo: registerData.tipo as 'estudante' | 'docente' | 'cta',
      nrEstudante: registerData.tipo === 'estudante' ? registerData.nrEstudante : undefined
    };
    
    saveRegisteredUser(userToSave);
    setShowRegister(false);
    setRegisterData({
      nome: '',
      telefone: '',
      email: '',
      password: '',
      confirmPassword: '',
      tipo: 'estudante',
      nrEstudante: ''
    });
    alert('Cadastro realizado! Faça login.');
  };

  const handleInputChange = (field: keyof typeof registerData, value: string) => {
    setRegisterData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="login-base-container">
      <div className="login-card">
        <div className="login-logo-circle">
          <span className="login-logo-text">UEM</span>
        </div>
        
        <h2 className="login-title">Sistema de Gestão de Eventos</h2>
        <p className="login-subtitle">Universidade Eduardo Mondlane</p>

        {!showRegister ? (
          <>
            {/* FORMULÁRIO DE LOGIN */}
            <form className="login-form-styled" onSubmit={handleSubmit}>
              <div className="login-form-group">
                <label htmlFor="email" className="login-form-label">
                  <span className="login-icon">📧</span> Email institucional
                </label>
                <input
                  type="email"
                  className="login-form-input"
                  id="email"
                  placeholder="exemplo@uem.ac.mz"
                  ref={emailRef}
                  autoComplete="username"
                  required
                />
              </div>
              
              <div className="login-form-group">
                <label htmlFor="password" className="login-form-label">
                  <span className="login-icon">🔒</span> Palavra-passe
                </label>
                <input
                  type="password"
                  className="login-form-input"
                  id="password"
                  placeholder="Digite sua palavra-passe"
                  ref={passwordRef}
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="login-form-actions">
                <button type="submit" className="login-btn-main">
                  Entrar no Sistema
                </button>
              </div>
              
              <div className="login-form-footer">
                <a href="#" className="login-forgot-link">
                  Esqueceu a palavra-passe?
                </a>
              </div>
            </form>
            
            {/* SEÇÃO DE CADASTRO */}
            <div className="login-register-section">
              <p className="login-register-text">Não tem uma conta?</p>
              <button 
                className="login-register-btn" 
                onClick={() => setShowRegister(true)}
              >
                Cadastrar
              </button>
            </div>
          </>
        ) : (
       
          <form className="login-form-styled" onSubmit={handleRegister}>
            <div className="login-form-group">
              <label className="login-form-label">Nome completo *</label>
              <input 
                type="text" 
                className="login-form-input" 
                value={registerData.nome} 
                onChange={e => handleInputChange('nome', e.target.value)} 
                placeholder="Seu nome completo"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Telefone *</label>
              <input 
                type="tel" 
                className="login-form-input" 
                value={registerData.telefone} 
                onChange={e => handleInputChange('telefone', e.target.value)} 
                placeholder="(+258) 8X XXX XXXX"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Email institucional *</label>
              <input 
                type="email" 
                className="login-form-input" 
                value={registerData.email} 
                onChange={e => handleInputChange('email', e.target.value)} 
                placeholder="seu.email@uem.ac.mz"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Tipo de usuário *</label>
              <select 
                className="login-form-input" 
                value={registerData.tipo} 
                onChange={e => handleInputChange('tipo', e.target.value)}
                required
              >
                <option value="estudante">Estudante</option>
                <option value="docente">Docente</option>
                <option value="cta">CTA</option>
              </select>
            </div>
            
            {registerData.tipo === 'estudante' && (
              <div className="login-form-group">
                <label className="login-form-label">Nº de estudante *</label>
                <input 
                  type="text" 
                  className="login-form-input" 
                  value={registerData.nrEstudante} 
                  onChange={e => handleInputChange('nrEstudante', e.target.value)} 
                  placeholder="Ex: 202301234"
                  required 
                />
              </div>
            )}
            
            <div className="login-form-group">
              <label className="login-form-label">Senha *</label>
              <input 
                type="password" 
                className="login-form-input" 
                value={registerData.password} 
                onChange={e => handleInputChange('password', e.target.value)} 
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Confirmação de senha *</label>
              <input 
                type="password" 
                className="login-form-input" 
                value={registerData.confirmPassword} 
                onChange={e => handleInputChange('confirmPassword', e.target.value)} 
                placeholder="Digite a senha novamente"
                required 
              />
            </div>
            
            {registerError && (
              <div className="login-error-message">
                {registerError}
              </div>
            )}
            
            <div className="login-form-actions">
              <button type="submit" className="login-btn-main">
                Cadastrar
              </button>
              <button 
                type="button" 
                className="login-back-btn"
                onClick={() => setShowRegister(false)}
              >
                Voltar para Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}