import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './login.css';

type LoginFormData = {
  email: string;
  password: string;
};

type RegisteredUser = {
  nome: string;
  telefone: string;
  email: string;
  password: string;
  tipo: 'estudante' | 'docente' | 'cta';
  nrEstudante?: string;
  curso?: string;
  departamento?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState<RegisteredUser & { confirmPassword: string }>({
    nome: '',
    telefone: '',
    email: '',
    password: '',
    confirmPassword: '',
    tipo: 'estudante',
    nrEstudante: '',
    curso: '',
    departamento: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const response = await api.post('/login', formData);
      const { token, user } = response.data;
      
      // Salvar token
      localStorage.setItem('token', token);
      
      // Atualizar contexto de autenticação
      await login(user);
      
      // Redirecionar baseado no tipo de usuário
      switch (user.tipo) {
        case 'estudante':
          navigate('/estudante');
          break;
        case 'docente':
        case 'cta':
          navigate('/Organizadores');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      const response = await api.post('/register', registerData);
      const { token, user } = response.data;
      
      // Salvar token
      localStorage.setItem('token', token);
      
      // Atualizar contexto de autenticação
      await login(user);
      
      // Redirecionar baseado no tipo de usuário
      switch (user.tipo) {
        case 'estudante':
          navigate('/estudante');
          break;
        case 'docente':
        case 'cta':
          navigate('/Organizadores');
          break;
        default:
          navigate('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao registrar');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRegisterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="login-base-container">
      <div className="login-card">
        <div className="login-logo-circle">
          <span className="login-logo-text">UEM</span>
        </div>
        
        <h2 className="login-title">Sistema de Gestão de Eventos</h2>
        <p className="login-subtitle">Universidade Eduardo Mondlane</p>

        {error && <div className="error-message">{error}</div>}

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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="exemplo@uem.ac.mz"
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
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Digite sua palavra-passe"
                  autoComplete="current-password"
                  required
                />
              </div>
              
              <div className="login-form-actions">
                <button type="submit" className="login-btn-main" disabled={loading}>
                  {loading ? 'Entrando...' : 'Entrar no Sistema'}
                </button>
                <button 
                  type="button" 
                  className="login-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancelar
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
                name="nome"
                className="login-form-input" 
                value={registerData.nome} 
                onChange={handleRegisterInputChange}
                placeholder="Seu nome completo"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Telefone *</label>
              <input 
                type="tel"
                name="telefone"
                className="login-form-input" 
                value={registerData.telefone} 
                onChange={handleRegisterInputChange}
                placeholder="(+258) 8X XXX XXXX"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Email institucional *</label>
              <input 
                type="email"
                name="email"
                className="login-form-input" 
                value={registerData.email} 
                onChange={handleRegisterInputChange}
                placeholder="seu.email@uem.ac.mz"
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Tipo de usuário *</label>
              <select 
                name="tipo"
                className="login-form-input" 
                value={registerData.tipo} 
                onChange={handleRegisterInputChange}
                required
              >
                <option value="estudante">Estudante</option>
                <option value="docente">Docente</option>
                <option value="cta">CTA</option>
              </select>
            </div>
            
            {registerData.tipo === 'estudante' && (
              <>
                <div className="login-form-group">
                  <label className="login-form-label">Nº de estudante *</label>
                  <input 
                    type="text"
                    name="nrEstudante"
                    className="login-form-input" 
                    value={registerData.nrEstudante} 
                    onChange={handleRegisterInputChange}
                    placeholder="Ex: 202301234"
                    required 
                  />
                </div>
                
                <div className="login-form-group">
                  <label className="login-form-label">Curso *</label>
                  <select 
                    name="curso"
                    className="login-form-input" 
                    value={registerData.curso} 
                    onChange={handleRegisterInputChange}
                    required
                  >
                    <option value="">Selecione o curso</option>
                    <option value="Informática">Informática</option>
                    <option value="Estatistica">Estatistica</option>
                    <option value="Matematica">Matematica</option>
                    <option value="Medicina">Medicina</option>
                    <option value="Direito">Direito</option>
                    <option value="Engenharia Civil">Engenharia Civil</option>
                    <option value="Engenharia Informática">Engenharia Informática</option>
                    <option value="Economia">Economia</option>
                    <option value="Gestão">Gestão</option>
                    <option value="Arquitetura">Arquitetura</option>
                    <option value="Biologia">Biologia</option>
                    <option value="Química">Química</option>
                    <option value="Matemática">Matemática</option>
                    <option value="Física">Física</option>
                    <option value="Letras">Letras</option>
                    <option value="História">História</option>
                    <option value="Psicologia">Psicologia</option>
                    <option value="Sociologia">Sociologia</option>
                    <option value="Agronomia">Agronomia</option>
                    <option value="Veterinária">Veterinária</option>
                  </select>
                </div>
              </>
            )}
            
            {registerData.tipo === 'docente' && (
              <div className="login-form-group">
                <label className="login-form-label">Departamento *</label>
                <select 
                  name="departamento"
                  className="login-form-input" 
                  value={registerData.departamento} 
                  onChange={handleRegisterInputChange}
                  required
                >
                  <option value="">Selecione o departamento</option>
                  <option value="Departamento de Matemática e Informática">Departamento de Matemática e Informática</option>
                  <option value="Departamento de Física">Departamento de Física</option>
                  <option value="Departamento de Química">Departamento de Química</option>
                  <option value="Departamento de Biologia">Departamento de Biologia</option>
                  <option value="Departamento de Geologia">Departamento de Geologia</option>
                  <option value="Departamento de Engenharia Civil">Departamento de Engenharia Civil</option>
                  <option value="Departamento de Engenharia Mecânica">Departamento de Engenharia Mecânica</option>
                  <option value="Departamento de Engenharia Química">Departamento de Engenharia Química</option>
                  <option value="Departamento de Engenharia Eletrotécnica">Departamento de Engenharia Eletrotécnica</option>
                  <option value="Departamento de Arquitetura e Planeamento Físico">Departamento de Arquitetura e Planeamento Físico</option>
                  <option value="Departamento de Economia">Departamento de Economia</option>
                  <option value="Departamento de Gestão">Departamento de Gestão</option>
                  <option value="Departamento de Contabilidade e Auditoria">Departamento de Contabilidade e Auditoria</option>
                  <option value="Departamento de Direito">Departamento de Direito</option>
                  <option value="Departamento de Ciências da Educação">Departamento de Ciências da Educação</option>
                  <option value="Departamento de Línguas e Literaturas">Departamento de Línguas e Literaturas</option>
                  <option value="Departamento de História">Departamento de História</option>
                  <option value="Departamento de Geografia">Departamento de Geografia</option>
                  <option value="Departamento de Sociologia">Departamento de Sociologia</option>
                  <option value="Departamento de Psicologia">Departamento de Psicologia</option>
                  <option value="Departamento de Medicina">Departamento de Medicina</option>
                  <option value="Departamento de Cirurgia">Departamento de Cirurgia</option>
                  <option value="Departamento de Pediatria">Departamento de Pediatria</option>
                  <option value="Departamento de Ginecologia e Obstetrícia">Departamento de Ginecologia e Obstetrícia</option>
                  <option value="Departamento de Saúde Pública">Departamento de Saúde Pública</option>
                  <option value="Departamento de Agronomia">Departamento de Agronomia</option>
                  <option value="Departamento de Engenharia Rural">Departamento de Engenharia Rural</option>
                  <option value="Departamento de Ciências Animais">Departamento de Ciências Animais</option>
                  <option value="Departamento de Veterinária">Departamento de Veterinária</option>
                </select>
              </div>
            )}
            
            <div className="login-form-group">
              <label className="login-form-label">Senha *</label>
              <input 
                type="password"
                name="password"
                className="login-form-input" 
                value={registerData.password} 
                onChange={handleRegisterInputChange}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
                required 
              />
            </div>
            
            <div className="login-form-group">
              <label className="login-form-label">Confirmação de senha *</label>
              <input 
                type="password"
                name="confirmPassword"
                className="login-form-input" 
                value={registerData.confirmPassword} 
                onChange={handleRegisterInputChange}
                placeholder="Digite a senha novamente"
                required 
              />
            </div>
            
            <div className="login-form-actions">
              <button type="submit" className="login-btn-main" disabled={loading}>
                {loading ? 'Cadastrando...' : 'Cadastrar'}
              </button>
              <div className="login-secondary-actions">
                <button 
                  type="button" 
                  className="login-back-btn"
                  onClick={() => setShowRegister(false)}
                >
                  Voltar para Login
                </button>
                <button 
                  type="button" 
                  className="login-cancel-btn"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}