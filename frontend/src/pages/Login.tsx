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

// Funções de validação
const validatePhoneNumber = (phone: string): boolean => {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se começa com 258 (código de Moçambique) seguido dos prefixos válidos
  if (cleanPhone.startsWith('258')) {
    const prefix = cleanPhone.substring(3, 5); // Pega os dígitos após 258
    return ['82', '83', '84', '85', '86', '87'].includes(prefix);
  }
  
  // Verifica se começa diretamente com os prefixos válidos (sem código do país)
  const prefix = cleanPhone.substring(0, 2);
  return ['82', '83', '84', '85', '86', '87'].includes(prefix);
};

const validateStudentNumber = (studentNumber: string): boolean => {
  // Remove todos os caracteres não numéricos
  const cleanNumber = studentNumber.replace(/\D/g, '');
  
  // Verifica se tem exatamente 8 dígitos
  return /^\d{8}$/.test(cleanNumber);
};

// Função para formatar o telefone durante a digitação
const formatPhoneNumber = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 0) return '';
  
  // Se começar com 258, formata como +258 XX XXX XXXX
  if (cleanPhone.startsWith('258')) {
    const rest = cleanPhone.substring(3);
    if (rest.length <= 2) return `+258 ${rest}`;
    if (rest.length <= 5) return `+258 ${rest.substring(0, 2)} ${rest.substring(2)}`;
    if (rest.length <= 8) return `+258 ${rest.substring(0, 2)} ${rest.substring(2, 5)} ${rest.substring(5)}`;
    return `+258 ${rest.substring(0, 2)} ${rest.substring(2, 5)} ${rest.substring(5, 8)}`;
  }
  
  // Formata como XX XXX XXXX
  if (cleanPhone.length <= 2) return cleanPhone;
  if (cleanPhone.length <= 5) return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2)}`;
  if (cleanPhone.length <= 8) return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5)}`;
  return `${cleanPhone.substring(0, 2)} ${cleanPhone.substring(2, 5)} ${cleanPhone.substring(5, 8)}`;
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
  
  // Estados para erros de validação
  const [validationErrors, setValidationErrors] = useState({
    telefone: '',
    nrEstudante: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const response = await api.post('/login', formData);
      const { token, user } = response.data;
      
      console.log('🔐 Resposta do login:', { token, user });
      
      // ✅ VERIFICAR se o user tem ID
      if (!user.id) {
        console.error('❌ Servidor não retornou ID do usuário:', user);
        throw new Error('Erro de autenticação: ID do usuário não recebido');
      }
      
      // Salvar token
      localStorage.setItem('token', token);
      
      // ✅ PREPARAR usuário com todos os campos
      const userToSave = {
        id: user.id,
        name: user.name || user.nome,
        email: user.email,
        tipo: user.tipo,
        nome: user.nome,
        telefone: user.telefone,
        nr_estudante: user.nr_estudante,
        curso: user.curso,
        departamento: user.departamento
      };
      
      console.log('💾 Salvando usuário no AuthContext:', userToSave);
      
      // Atualizar contexto de autenticação
      await login(userToSave);
      
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
      console.error('❌ Erro no login:', err);
      setError(err.response?.data?.message || err.message || 'Falha ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      // Validações antes do envio
      if (registerData.password !== registerData.confirmPassword) {
        throw new Error('As senhas não coincidem');
      }

      // Validar telefone
      if (!validatePhoneNumber(registerData.telefone)) {
        setValidationErrors(prev => ({
          ...prev,
          telefone: 'Número de telefone inválido. Use os prefixos: 82, 83, 84, 85, 86 ou 87'
        }));
        throw new Error('Número de telefone inválido');
      }

      // Validar número de estudante se for estudante
      if (registerData.tipo === 'estudante' && !validateStudentNumber(registerData.nrEstudante || '')) {
        setValidationErrors(prev => ({
          ...prev,
          nrEstudante: 'Número de estudante deve ter exatamente 8 dígitos'
        }));
        throw new Error('Número de estudante inválido');
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
      // Não setar o erro se já foi setado pelas validações específicas
      if (!err.message.includes('Número de') && !err.message.includes('senhas')) {
        setError(err.response?.data?.message || 'Falha ao registrar');
      }
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

    // Limpar erros de validação quando o usuário começar a digitar
    if (validationErrors[name as keyof typeof validationErrors]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Validação em tempo real para telefone
    if (name === 'telefone' && value) {
      if (!validatePhoneNumber(value)) {
        setValidationErrors(prev => ({
          ...prev,
          telefone: 'Número inválido. Use prefixos: 82, 83, 84, 85, 86 ou 87'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          telefone: ''
        }));
      }
    }

    // Validação em tempo real para número de estudante
    if (name === 'nrEstudante' && value && registerData.tipo === 'estudante') {
      if (!validateStudentNumber(value)) {
        setValidationErrors(prev => ({
          ...prev,
          nrEstudante: 'Deve ter exatamente 8 dígitos'
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          nrEstudante: ''
        }));
      }
    }
  };

  // Handler específico para telefone com formatação
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const formattedPhone = formatPhoneNumber(value);
    
    setRegisterData(prev => ({
      ...prev,
      telefone: formattedPhone
    }));

    // Validação em tempo real
    if (value && !validatePhoneNumber(value)) {
      setValidationErrors(prev => ({
        ...prev,
        telefone: 'Número inválido. Use prefixos: 82, 83, 84, 85, 86 ou 87'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        telefone: ''
      }));
    }
  };

  // Handler específico para número de estudante (apenas números)
  const handleStudentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    // Permite apenas números
    const numericValue = value.replace(/\D/g, '');
    
    setRegisterData(prev => ({
      ...prev,
      nrEstudante: numericValue
    }));

    // Validação em tempo real
    if (numericValue && !validateStudentNumber(numericValue)) {
      setValidationErrors(prev => ({
        ...prev,
        nrEstudante: 'Deve ter exatamente 8 dígitos'
      }));
    } else {
      setValidationErrors(prev => ({
        ...prev,
        nrEstudante: ''
      }));
    }
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
                className={`login-form-input ${validationErrors.telefone ? 'input-error' : ''}`} 
                value={registerData.telefone} 
                onChange={handlePhoneChange}
                placeholder="82 XXX XXXX ou +258 82 XXX XXXX"
                required 
              />
              {validationErrors.telefone && (
                <div className="validation-error">{validationErrors.telefone}</div>
              )}
              <div className="input-hint">
                Prefixos válidos: 82, 83, 84, 85, 86, 87
              </div>
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
                    className={`login-form-input ${validationErrors.nrEstudante ? 'input-error' : ''}`} 
                    value={registerData.nrEstudante} 
                    onChange={handleStudentNumberChange}
                    placeholder="8 dígitos (ex: 20230123)"
                    maxLength={8}
                    required 
                  />
                  {validationErrors.nrEstudante && (
                    <div className="validation-error">{validationErrors.nrEstudante}</div>
                  )}
                  <div className="input-hint">
                    Apenas números, exatamente 8 dígitos
                  </div>
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