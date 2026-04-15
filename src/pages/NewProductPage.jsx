import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Form, Row, Col, Card, Alert } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';

const NewProductPage = () => {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    cost_price: '',
    expected_price: '',
    entry_date: new Date().toISOString().split('T')[0],
    image_url: ''
  });

  const calculateMargin = (cost, price) => {
    if (!cost || !price || cost <= 0) return 0;
    return (((price - cost) / cost) * 100).toFixed(1);
  };

  const margin = calculateMargin(product.cost_price, product.expected_price);
  const isLowMargin = margin < 30 && product.cost_price && product.expected_price;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert([product]);
      if (error) throw error;
      alert("Produto guardado com sucesso!");
      navigate('/inventory');
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="d-flex align-items-center mb-4">
        <Button variant="link" onClick={() => navigate('/inventory')} className="me-2 p-0"><ArrowLeft /></Button>
        <h2 className="mb-0">Novo Produto</h2>
      </div>

      <Card className="p-4 shadow-sm border-0">
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={8}><Input label="Nome do Produto" value={product.name} onChange={e => setProduct({...product, name: e.target.value})} required /></Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Select value={product.category} onChange={e => setProduct({...product, category: e.target.value})} required>
                  <option value="">Selecione...</option>
                  <option value="Processador">Processador</option>
                  <option value="Placa de Vídeo">Placa de Vídeo</option>
                  <option value="Memória RAM">Memória RAM</option>
                  <option value="Armazenamento">Armazenamento</option>
                  <option value="Periférico">Periférico</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
            <Input 
                label="Quantidade" 
                type="number" 
                value={product.quantity} 
                onChange={e => setProduct({...product, quantity: e.target.value})} 
                required 
            />
            </Col>
          </Row>

          <Input label="Descrição (Opcional)" as="textarea" rows={3} value={product.description} onChange={e => setProduct({...product, description: e.target.value})} />

          <Row>
            <Col md={4}><Input label="Custo de Compra (R$)" type="number" step="0.01" value={product.cost_price} onChange={e => setProduct({...product, cost_price: e.target.value})} required /></Col>
            <Col md={4}><Input label="Preço de Venda Esperado (R$)" type="number" step="0.01" value={product.expected_price} onChange={e => setProduct({...product, expected_price: e.target.value})} required /></Col>
            <Col md={4}><Input label="Data de Entrada" type="date" value={product.entry_date} onChange={e => setProduct({...product, entry_date: e.target.value})} required /></Col>
          </Row>

          {product.cost_price && product.expected_price && (
            <Alert variant={isLowMargin ? "danger" : "success"} className="mt-3">
              <strong>Margem de Lucro: {margin}%</strong> 
              {isLowMargin && " ⚠️ Alerta: Margem inferior a 30%!"}
            </Alert>
          )}

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={() => navigate('/inventory')}>Cancelar</Button>
            <Button type="submit" icon={<Save />}>Guardar Produto</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewProductPage;