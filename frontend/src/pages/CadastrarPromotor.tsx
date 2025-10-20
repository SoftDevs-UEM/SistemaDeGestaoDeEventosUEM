import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './cadastrarPromotor.css';

export default function CadastrarPromotor() {
  const navigate = useNavigate();
  const { isAuthenticated, userType } = useAuth();
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

  // Função para lidar com mudanças nos campos
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
  };

  const handleCancel = () => {
    navigate('/admin');
  };

  return (
    <div className="cadastrar-promotor-container">
      <div className="cadastrar-promotor-card">
        <div className="card-header">
          <h1>Cadastrar Novo Promotor</h1>
          <p>Preencha os dados do promotor para cadastrar no sistema</p>
        </div>

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
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Voltar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}