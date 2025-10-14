import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { Banknote } from 'lucide-react';
import { Container, Card, Form, Alert } from 'react-bootstrap';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Falha no login. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Container style={{ maxWidth: '400px' }}>
        <Card className="p-4 shadow">
          <Card.Body>
            <div className="text-center mb-4">
              <Banknote className="mx-auto text-primary" size={48} />
              <h1 className="mt-3 h3">MoneyBoard</h1>
              <p className="text-muted">Acesse sua conta</p>
            </div>
            <Form onSubmit={handleSubmit}>
              {error && <Alert variant="danger">{error}</Alert>}
              <Input
                id="email"
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
              <Input
                id="password"
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
              <Button type="submit" className="w-100 mt-3" size="lg">
                Entrar
              </Button>
            </Form>
            <p className="text-center mt-3 mb-0">
              Não tem uma conta?{' '}
              <Link to="/register">Cadastre-se</Link>
            </p>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default LoginPage;