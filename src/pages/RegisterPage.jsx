import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Banknote } from 'lucide-react';
import { Container, Card, Form, Alert } from 'react-bootstrap';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      alert('Cadastro realizado! Verifique seu e-mail para confirmar a conta, se necessário.');
      navigate('/');
    } catch (err) {
      setError('Falha no cadastro. O e-mail pode já estar em uso.');
      console.error("Erro no registro:", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container style={{ maxWidth: '400px' }}>
        <Card className="p-4 shadow">
          <Card.Body>
            <div className="text-center mb-4">
              <Banknote className="mx-auto text-primary" size={48} />
              <h1 className="mt-3 h3">Crie sua Conta</h1>
              <p className="text-muted">Comece a organizar suas finanças.</p>
            </div>
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Input 
                id="name" 
                label="Nome" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                disabled={loading}
              />
              <Input 
                id="email" 
                label="E-mail" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
              <Input 
                id="password" 
                label="Senha (mínimo 6 caracteres)" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                disabled={loading}
              />
              <Button type="submit" className="w-100 mt-3" size="lg" disabled={loading}>
                {loading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </Form>
            <p className="text-center mt-3 mb-0">
              Já tem uma conta?{' '}
              <Link to="/login">Faça login</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default RegisterPage;