import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Form, Row, Col, Card } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { ArrowLeft } from 'lucide-react';

const NewProductPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    category: '',
    quantity: 1,
    description: '',
    cost_price: '',
    expected_price: '',
    entry_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('product_categories').select('name').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  const handleCostChange = (val) => {
    const cost = parseFloat(val);
    let expected = '';
    
    if (!isNaN(cost)) {
      expected = (cost * 1.3).toFixed(2);
    }
    
    setProduct({ ...product, cost_price: val, expected_price: expected });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert([{
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        description: product.description,
        cost_price: product.cost_price,
        expected_price: product.expected_price,
        entry_date: product.entry_date,
        status: 'estoque'
      }]);

      if (error) throw error;
      alert("Produto cadastrado com sucesso!");
      navigate('/inventory');
    } catch (err) {
      alert("Erro ao cadastrar: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" onClick={() => navigate(-1)} className="p-0 me-3 text-dark text-decoration-none">
          <ArrowLeft size={28} />
        </Button>
        <h2 className="mb-0 text-dark fw-bold">Novo Produto</h2>
      </div>

      <Card className="p-4 shadow-sm border-0 rounded-4">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={8}>
              <Input 
                label="Nome do Produto" 
                value={product.name} 
                onChange={e => setProduct({...product, name: e.target.value})} 
                required 
                autoFocus 
              />
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="small fw-bold text-muted">Categoria</Form.Label>
                <Form.Select 
                  value={product.category} 
                  onChange={e => setProduct({...product, category: e.target.value})} 
                  required
                >
                  <option value="">Selecione...</option>
                  {categories.map(c => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Input 
                label="Quantidade" 
                type="number" 
                min="1" 
                value={product.quantity} 
                onChange={e => setProduct({...product, quantity: e.target.value})} 
                required 
              />
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold text-muted">Descrição (Opcional)</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={3} 
              value={product.description} 
              onChange={e => setProduct({...product, description: e.target.value})} 
            />
          </Form.Group>

          <Row className="align-items-center">
            <Col md={4}>
              <Input 
                label="Custo de Compra (R$)" 
                type="number" 
                step="0.01" 
                value={product.cost_price} 
                onChange={e => handleCostChange(e.target.value)} 
                required 
              />
            </Col>
            <Col md={4}>
              <Input 
                label="Preço de Venda Esperado (R$)" 
                type="number" 
                step="0.01" 
                value={product.expected_price} 
                onChange={e => setProduct({...product, expected_price: e.target.value})} 
                required 
              />
            </Col>
            <Col md={4}>
              <Input 
                label="Data de Entrada" 
                type="date" 
                value={product.entry_date} 
                onChange={e => setProduct({...product, entry_date: e.target.value})} 
                required 
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-5">
            <Button variant="secondary" type="button" onClick={() => navigate(-1)}>Cancelar</Button>
            <Button type="submit" variant="primary">Guardar Produto</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewProductPage;