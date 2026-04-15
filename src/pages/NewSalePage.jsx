import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Form, Row, Col, Card } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate, useLocation } from 'react-router-dom';
import { RefreshCcw, Trash2, User } from 'lucide-react';

const NewSalePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [autoParams, setAutoParams] = useState({ count: '', firstDate: '' });
  const [sale, setSale] = useState({
    productId: location.state?.productId || '',
    customerName: '', // NOVO CAMPO: Nome do Cliente
    quantity: 1,
    finalPrice: '',
    downPayment: '0',
    installments: []
  });

  useEffect(() => {
    const loadProducts = async () => {
      const { data } = await supabase.from('products').select('*').eq('status', 'estoque');
      setProducts(data || []);
      
      if (location.state?.productId && data) {
        const product = data.find(p => p.id === location.state.productId);
        if (product) {
          setSale(prev => ({ ...prev, finalPrice: product.expected_price }));
        }
      }
    };
    loadProducts();
  }, [location.state]);

  const selectedProduct = products.find(p => p.id === sale.productId);

  const handleProductChange = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
      const suggestedPrice = (parseFloat(product.expected_price) * sale.quantity).toFixed(2);
      setSale({ ...sale, productId: id, finalPrice: suggestedPrice });
    } else {
      setSale({ ...sale, productId: id, finalPrice: '' });
    }
  };

  const handleQuantityChange = (qty) => {
    const quantity = parseInt(qty) || 1;
    let newFinalPrice = sale.finalPrice;

    if (selectedProduct) {
      newFinalPrice = (parseFloat(selectedProduct.expected_price) * quantity).toFixed(2);
    }

    setSale({ ...sale, quantity: qty, finalPrice: newFinalPrice });
  };

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
      dueDate.setMonth(dueDate.getMonth() + i);
      
      generated.push({
        date: dueDate.toISOString().split('T')[0],
        value: valuePerInstallment,
        method: 'Pix'
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
    const quantitySold = parseInt(sale.quantity, 10);
    const availableQty = parseInt(selectedProduct?.quantity || 0, 10);

    if (!selectedProduct) {
      alert('Selecione um produto válido.');
      return;
    }

    if (isNaN(quantitySold) || quantitySold <= 0) {
      alert('Informe uma quantidade válida para venda.');
      return;
    }

    if (quantitySold > availableQty) {
      alert(`Quantidade indisponível. Há apenas ${availableQty} unidade(s) em estoque.`);
      return;
    }

    if (sale.installments.length === 0 && (parseFloat(sale.finalPrice) > parseFloat(sale.downPayment))) {
        alert("O valor da venda é maior que a entrada, mas não há parcelas geradas.");
        return;
    }

    try {
      // INSERE A VENDA COM O NOME DO CLIENTE
      const { data: saleData, error: sErr } = await supabase.from('sales').insert([{
        product_id: sale.productId,
        customer_name: sale.customerName || 'Não informado', // Salva o nome ou um padrão
        quantity: quantitySold,
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

      const remainingQty = availableQty - quantitySold;
      const updatePayload = { quantity: remainingQty };
      
      if (remainingQty <= 0) {
        updatePayload.status = 'vendido';
      }

      const { error: uErr } = await supabase
        .from('products')
        .update(updatePayload)
        .eq('id', sale.productId);

      if (uErr) throw uErr;

      alert("Venda registrada com sucesso!");
      navigate('/sold');
    } catch (err) { 
      alert("Erro ao processar venda: " + err.message); 
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Card className="p-4 shadow-sm border-0 rounded-4">
        <h3 className="mb-4 text-dark fw-bold">Registrar Venda - CRICASTECH</h3>
        <Form onSubmit={handleSale}>
          
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Selecione o Produto</Form.Label>
                <Form.Select 
                  value={sale.productId} 
                  onChange={e => handleProductChange(e.target.value)} 
                  required
                >
                  <option value="">Escolher...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Qtd: {p.quantity})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            {/* NOVO CAMPO: NOME DO CLIENTE */}
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold d-flex align-items-center">
                  <User size={16} className="me-1 text-muted"/> Nome do Cliente
                </Form.Label>
                <Form.Control 
                  type="text"
                  placeholder="Ex: Matheus Lampugnani"
                  value={sale.customerName}
                  onChange={e => setSale({...sale, customerName: e.target.value})}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Input 
                label="Quantidade Vendida" 
                type="number" 
                min="1" 
                max={selectedProduct?.quantity || ''} 
                value={sale.quantity} 
                onChange={e => handleQuantityChange(e.target.value)} 
                required 
              />
            </Col>
            <Col md={4}>
              <Input 
                label="Preço de Venda Final (R$)" 
                type="number" 
                step="0.01" 
                value={sale.finalPrice} 
                onChange={e => setSale({...sale, finalPrice: e.target.value})} 
                required 
              />
              <small className="text-muted">Sugestão baseada no preço esperado</small>
            </Col>
            <Col md={4}>
              <Input 
                label="Entrada / À Vista" 
                type="number" 
                step="0.01" 
                value={sale.downPayment} 
                onChange={e => setSale({...sale, downPayment: e.target.value})} 
              />
            </Col>
          </Row>
          
          {selectedProduct && (
            <div className="mt-2 mb-3 text-muted">
              Estoque disponível: <strong>{selectedProduct.quantity} unidade(s)</strong>
            </div>
          )}

          <Card className="bg-light border-0 mt-4 mb-4">
            <Card.Body>
              <h5 className="mb-3 d-flex align-items-center fw-bold">
                <RefreshCcw size={20} className="me-2 text-primary"/> Gerador de Parcelas
              </h5>
              <Row className="align-items-end">
                <Col md={4}>
                  <Input 
                    label="Número de Parcelas" 
                    type="number" 
                    value={autoParams.count} 
                    onChange={e => setAutoParams({...autoParams, count: e.target.value})} 
                  />
                </Col>
                <Col md={4}>
                  <Input 
                    label="Data da 1ª Parcela" 
                    type="date" 
                    value={autoParams.firstDate} 
                    onChange={e => setAutoParams({...autoParams, firstDate: e.target.value})} 
                  />
                </Col>
                <Col md={4} className="mb-3">
                  <Button 
                    variant="primary" 
                    type="button" 
                    className="w-100" 
                    onClick={generateInstallments} 
                    disabled={!autoParams.count || !autoParams.firstDate}
                  >
                    Gerar Automaticamente
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {sale.installments.length > 0 && (
            <div className="mt-2">
              <h6 className="text-muted mb-3 fw-bold">Conferência de Parcelas:</h6>
              {sale.installments.map((inst, index) => (
                <Row key={index} className="mb-2 align-items-center g-2 border-bottom pb-2">
                  <Col md={1} className="text-center fw-bold text-primary">{index + 1}ª</Col>
                  <Col md={3}>
                    <Input 
                      label="Vencimento" 
                      type="date" 
                      value={inst.date} 
                      onChange={e => {
                        const newInst = [...sale.installments];
                        newInst[index].date = e.target.value;
                        setSale({...sale, installments: newInst});
                      }} 
                      required 
                    />
                  </Col>
                  <Col md={3}>
                    <Input 
                      label="Valor (R$)" 
                      type="number" 
                      step="0.01" 
                      value={inst.value} 
                      onChange={e => {
                        const newInst = [...sale.installments];
                        newInst[index].value = e.target.value;
                        setSale({...sale, installments: newInst});
                      }} 
                      required 
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Label className="small fw-bold text-muted">Meio de Pagamento</Form.Label>
                    <Form.Select 
                      value={inst.method} 
                      onChange={e => {
                        const newInst = [...sale.installments];
                        newInst[index].method = e.target.value;
                        setSale({...sale, installments: newInst});
                      }}
                    >
                      <option>Pix</option>
                      <option>Dinheiro</option>
                      <option>Cartão</option>
                    </Form.Select>
                  </Col>
                  <Col md={1} className="text-end pt-3">
                    <Button 
                      variant="link" 
                      className="text-danger p-0" 
                      onClick={() => removeInstallment(index)}
                    >
                      <Trash2 size={20}/>
                    </Button>
                  </Col>
                </Row>
              ))}
            </div>
          )}

          <div className="mt-5">
            <Button type="submit" className="w-100 py-3 fw-bold" size="lg">
              Concluir Venda
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewSalePage;