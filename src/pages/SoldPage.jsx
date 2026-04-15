import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Table, Card, Badge, Spinner, Row, Col, Modal, ListGroup, Alert } from 'react-bootstrap';
import { FileText, Eye, ShoppingCart, CheckCircle, Clock, Trash2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

const SoldPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const navigate = useNavigate();

  const fetchSales = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('sales')
        .select('*, products (*), sale_installments (*)')
        .order('sale_date', { ascending: false });
      setSales(data || []);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchSales(); }, []);

  const handlePayInstallment = async (installmentId) => {
    try {
      const { error } = await supabase
        .from('sale_installments')
        .update({ status: 'pago' })
        .eq('id', installmentId);

      if (error) throw error;

      const updatedInstallments = selectedSale.sale_installments.map(inst => 
        inst.id === installmentId ? { ...inst, status: 'pago' } : inst
      );
      setSelectedSale({ ...selectedSale, sale_installments: updatedInstallments });

      fetchSales();

    } catch (err) {
      alert("Erro ao dar baixa na parcela: " + err.message);
    }
  };

  const confirmDeleteSale = async () => {
    try {
      const { data: productData, error: pErr } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', selectedSale.product_id)
        .single();

      if (pErr) throw pErr;

      const newQuantity = (productData.quantity || 0) + selectedSale.quantity;
      
      const { error: updateErr } = await supabase
        .from('products')
        .update({ quantity: newQuantity, status: 'estoque' })
        .eq('id', selectedSale.product_id);

      if (updateErr) throw updateErr;

      // 3. Exclui as parcelas vinculadas
      await supabase.from('sale_installments').delete().eq('sale_id', selectedSale.id);
      
      // 4. Exclui a venda
      const { error: delErr } = await supabase.from('sales').delete().eq('id', selectedSale.id);
      if (delErr) throw delErr;

      setShowDeleteModal(false);
      fetchSales();
    } catch (err) {
      alert("Erro ao cancelar venda: " + err.message);
    }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <>
      <h2 className="mb-4 d-flex align-items-center">
        Produtos Vendidos <ShoppingCart size={24} className="text-success ms-2"/>
      </h2>

      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Table responsive hover className="mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-start ps-4">Produto</th>
                <th>Cliente</th> 
                <th>Preço Final</th>
                <th>Pagamento</th>
                <th>Data</th>
                <th className="text-end pe-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td className="text-start ps-4">
                    <strong>{s.products?.name}</strong><br/>
                    <small className="text-muted">Qtd: {s.quantity}</small>
                  </td>
                  <td><span className="text-muted small">{s.customer_name || '-'}</span></td>
                  <td>{formatCurrency(s.final_sale_price)}</td>
                  <td>
                    {s.sale_installments?.some(i => i.status === 'pendente') ? 
                      <Badge bg="warning" text="dark">Parcelado</Badge> : <Badge bg="success">Pago</Badge>}
                  </td>
                  <td>{new Date(s.sale_date).toLocaleDateString('pt-BR')}</td>
                  <td className="text-end pe-4">
                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="outline-dark" size="sm" title="Ver Detalhes" onClick={() => { setSelectedSale(s); setShowDetailsModal(true); }}>
                        <Eye size={14}/>
                      </Button>
                      <Button variant="outline-secondary" size="sm" title="Gerar Recibo" onClick={() => navigate('/generate-receipt', { state: { sale: s } })}>
                        <FileText size={14}/>
                      </Button>
                      <Button variant="outline-danger" size="sm" title="Cancelar Venda" onClick={() => { setSelectedSale(s); setShowDeleteModal(true); }}>
                        <Trash2 size={14}/>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma venda registrada.</td></tr>
              )}
            </tbody>
          </Table>
        </Card>
      )}

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Detalhes: {selectedSale?.products?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedSale && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted small fw-bold">RESUMO DA VENDA</h6>
                <ListGroup className="mb-3 shadow-sm">
                  <ListGroup.Item className="d-flex justify-content-between text-muted small">
                    Cliente: <strong className="text-dark">{selectedSale.customer_name || 'Não informado'}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between fw-bold text-success">
                    Lucro Bruto: <span>{formatCurrency(selectedSale.final_sale_price - (selectedSale.products?.cost_price * selectedSale.quantity))}</span>
                  </ListGroup.Item>
                </ListGroup>
                <div className="p-3 bg-light rounded border">
                   <div className="d-flex justify-content-between mb-1 small text-muted">
                     <span>Total Pago (Entrada):</span>
                     <span>{formatCurrency(selectedSale.down_payment)}</span>
                   </div>
                   <div className="d-flex justify-content-between fw-bold text-warning">
                     <span>A Receber:</span>
                     <span>{formatCurrency(selectedSale.final_sale_price - selectedSale.down_payment)}</span>
                   </div>
                </div>
              </Col>
              
              <Col md={6}>
                <h6 className="text-muted small fw-bold">PARCELAS</h6>
                {selectedSale.sale_installments?.length > 0 ? (
                  <div className="border rounded p-2" style={{ maxHeight: '250px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
                    {selectedSale.sale_installments.sort((a, b) => new Date(a.due_date) - new Date(b.due_date)).map((inst, i) => (
                      <div key={inst.id} className="d-flex align-items-center justify-content-between bg-white border-bottom p-2 mb-1 rounded shadow-sm">
                        <div>
                          <strong className="d-block text-primary small">{i+1}ª Parcela</strong>
                          <span>{formatCurrency(inst.amount)}</span>
                        </div>
                        <div className="text-end">
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>
                            Venc: {new Date(inst.due_date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}
                          </small>
                          {inst.status === 'pago' ? (
                            <Badge bg="success" className="mt-1"><CheckCircle size={10} className="me-1"/>Pago</Badge>
                          ) : (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="py-0 px-2 mt-1" 
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handlePayInstallment(inst.id)}
                            >
                              <Check size={12} className="me-1"/> Receber
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Alert variant="info" className="py-2 small">Venda realizada com pagamento total à vista.</Alert>
                )}
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h6">Cancelar Venda</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <Trash2 size={40} className="text-danger mb-3" />
          <p className="mb-2">Deseja realmente cancelar esta venda de <strong>{selectedSale?.products?.name}</strong>?</p>
          <small className="text-muted d-block mt-2">
            A venda será apagada do caixa e <strong>{selectedSale?.quantity} unidade(s)</strong> retornarão ao estoque.
          </small>
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Voltar</Button>
          <Button variant="danger" onClick={confirmDeleteSale}>Sim, Cancelar Venda</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SoldPage;