import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Form, Row, Col, Card, InputGroup } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, RefreshCcw, Trash2 } from 'lucide-react';

const NewSalePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [autoParams, setAutoParams] = useState({ count: '', firstDate: '' }); // Parâmetros para geração automática
  const [sale, setSale] = useState({
    productId: location.state?.productId || '',
    finalPrice: '',
    downPayment: '0',
    installments: []
  });

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*').eq('status', 'estoque');
      setProducts(data || []);
    };
    loadProducts();
  }, []);

  // Lógica de Geração Automática
  const generateInstallments = () => {
    const numInstallments = parseInt(autoParams.count);
    const firstDate = new Date(autoParams.firstDate);
    const totalToInstall = parseFloat(sale.finalPrice) - parseFloat(sale.downPayment);

    if (isNaN(numInstallments) || isNaN(firstDate.getTime()) || totalToInstall <= 0) {
      alert("Certifique-se de preencher o Preço Final, a Quantidade e a Primeira Data.");
      return;
    }

    const valuePerInstallment = (totalToInstall / numInstallments).toFixed(2);
    const generated = [];

    for (let i = 0; i < numInstallments; i++) {
      const dueDate = new Date(firstDate);
      dueDate.setMonth(dueDate.getMonth() + i); // Adiciona 1 mês a cada iteração
      
      generated.push({
        date: dueDate.toISOString().split('T')[0],
        value: valuePerInstallment,
        method: 'Pix' // Valor padrão
      });
    }

    setSale({ ...sale, installments: generated });
  };

  const removeInstallment = (index) => {
    const newInst = sale.installments.filter((_, i) => i !== index);
    setSale({ ...sale, installments: newInst });
  };

  const handleSale = async (e) => {
    e.preventDefault();
    if (sale.installments.length === 0 && (parseFloat(sale.finalPrice) > parseFloat(sale.downPayment))) {
        alert("O valor da venda é maior que a entrada, mas não há parcelas geradas.");
        return;
    }

    try {
      const { data: saleData, error: sErr } = await supabase.from('sales').insert([{
        product_id: sale.productId,
        final_sale_price: sale.finalPrice,
        down_payment: sale.downPayment
      }]).select().single();

      if (sErr) throw sErr;

      if (sale.installments.length > 0) {
        const installments = sale.installments.map(inst => ({
          sale_id: saleData.id,
          due_date: inst.date,
          amount: inst.value,
          payment_method: inst.method
        }));
        await supabase.from('sale_installments').insert(installments);
      }

      await supabase.from('products').update({ status: 'vendido' }).eq('id', sale.productId);
      alert("Venda registrada com sucesso!");
      navigate('/sold');
    } catch (err) { alert(err.message); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Card className="p-4 shadow-sm border-0">
        <h3 className="mb-4">Registrar Venda - CRICASTECH</h3>
        <Form onSubmit={handleSale}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Selecione o Produto</Form.Label>
            <Form.Select value={sale.productId} onChange={e => setSale({...sale, productId: e.target.value})} required>
              <option value="">Escolher...</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Custo: {p.cost_price})</option>)}
            </Form.Select>
          </Form.Group>

          <Row>
            <Col md={6}><Input label="Preço de Venda Final (R$)" type="number" step="0.01" value={sale.finalPrice} onChange={e => setSale({...sale, finalPrice: e.target.value})} required /></Col>
            <Col md={6}><Input label="Valor Recebido à Vista (Entrada)" type="number" step="0.01" value={sale.downPayment} onChange={e => setSale({...sale, downPayment: e.target.value})} /></Col>
          </Row>

          <Card className="bg-light border-0 mt-4 mb-4">
            <Card.Body>
              <h5 className="mb-3 d-flex align-items-center"><RefreshCcw size={20} className="me-2 text-primary"/> Gerador de Parcelas</h5>
              <Row className="align-items-end">
                <Col md={4}><Input label="Número de Parcelas" type="number" value={autoParams.count} onChange={e => setAutoParams({...autoParams, count: e.target.value})} /></Col>
                <Col md={4}><Input label="Data da 1ª Parcela" type="date" value={autoParams.firstDate} onChange={e => setAutoParams({...autoParams, firstDate: e.target.value})} /></Col>
                <Col md={4} className="mb-3">
                  <Button variant="primary" type="button" className="w-100" onClick={generateInstallments} disabled={!autoParams.count || !autoParams.firstDate}>
                    Gerar Automaticamente
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {sale.installments.length > 0 && (
            <div className="mt-2">
              <h6 className="text-muted mb-3">Conferência de Parcelas:</h6>
              {sale.installments.map((inst, index) => (
                <Row key={index} className="mb-2 align-items-center g-2 border-bottom pb-2">
                  <Col md={1} className="text-center fw-bold text-primary">{index + 1}ª</Col>
                  <Col md={3}><Input label="Vencimento" type="date" value={inst.date} onChange={e => {
                    const newInst = [...sale.installments]; newInst[index].date = e.target.value; setSale({...sale, installments: newInst});
                  }} required /></Col>
                  <Col md={3}><Input label="Valor (R$)" type="number" step="0.01" value={inst.value} onChange={e => {
                    const newInst = [...sale.installments]; newInst[index].value = e.target.value; setSale({...sale, installments: newInst});
                  }} required /></Col>
                  <Col md={4}>
                    <Form.Label>Meio de Pagamento</Form.Label>
                    <Form.Select value={inst.method} onChange={e => {
                       const newInst = [...sale.installments]; newInst[index].method = e.target.value; setSale({...sale, installments: newInst});
                    }}>
                      <option>Pix</option><option>Dinheiro</option><option>Cartão</option>
                    </Form.Select>
                  </Col>
                  <Col md={1} className="text-end pt-3">
                    <Button variant="link" className="text-danger p-0" onClick={() => removeInstallment(index)}><Trash2 size={20}/></Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          <div className="mt-5">
            <Button type="submit" className="w-100 py-3 fw-bold" size="lg">Concluir Venda</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewSalePage;