import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Table, Card, Badge, Spinner, Row, Col, Modal, ListGroup, Alert } from 'react-bootstrap';
import { FileText, Eye, ShoppingCart, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button'; // CORREÇÃO: Importação corrigida!

const SoldPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();

  const fetchSales = async () => {
    try {
      const { data } = await supabase.from('sales').select('*, products (*), sale_installments (*)').order('sale_date', { ascending: false });
      setSales(data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSales(); }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <>
      <h2 className="mb-4">Produtos Vendidos <ShoppingCart size={24} className="text-success ms-2"/></h2>

      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-start">Produto</th>
                <th>Preço Final</th>
                <th>Pagamento</th>
                <th>Data</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map(s => (
                <tr key={s.id}>
                  <td className="text-start"><strong>{s.products?.name}</strong><br/><small className="text-muted">Qtd: {s.quantity}</small></td>
                  <td>{formatCurrency(s.final_sale_price)}</td>
                  <td>
                    {s.sale_installments?.some(i => i.status === 'pendente') ? 
                      <Badge bg="warning" text="dark">Parcelado</Badge> : <Badge bg="success">Pago</Badge>}
                  </td>
                  <td>{new Date(s.sale_date).toLocaleDateString('pt-BR')}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="outline-dark" size="sm" onClick={() => { setSelectedSale(s); setShowDetailsModal(true); }}><Eye size={14}/></Button>
                      <Button variant="outline-secondary" size="sm" onClick={() => navigate('/generate-receipt', { state: { sale: s } })}><FileText size={14}/> Recibo</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* MODAL DETALHES VENDA */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light"><Modal.Title>Detalhes: {selectedSale?.products?.name}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {selectedSale && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted small fw-bold">RESUMO</h6>
                <ListGroup className="mb-3 shadow-sm">
                  <ListGroup.Item className="d-flex justify-content-between fw-bold text-success">Lucro Bruto: <span>{formatCurrency(selectedSale.final_sale_price - (selectedSale.products?.cost_price * selectedSale.quantity))}</span></ListGroup.Item>
                </ListGroup>
                <div className="p-3 bg-light rounded">
                   <div className="d-flex justify-content-between mb-1 small text-muted"><span>Total Pago (Entrada):</span><span>{formatCurrency(selectedSale.down_payment)}</span></div>
                   <div className="d-flex justify-content-between fw-bold text-warning"><span>A Receber:</span><span>{formatCurrency(selectedSale.final_sale_price - selectedSale.down_payment)}</span></div>
                </div>
              </Col>
              <Col md={6}>
                <h6 className="text-muted small fw-bold">PARCELAS</h6>
                {selectedSale.sale_installments?.length > 0 ? selectedSale.sale_installments.map((inst, i) => (
                  <div key={inst.id} className="d-flex justify-content-between border-bottom py-2 small">
                    <span>{i+1}ª - {formatCurrency(inst.amount)}</span>
                    <span>{inst.status === 'pago' ? <Badge bg="success">OK</Badge> : <Badge bg="warning" text="dark">Pendente</Badge>}</span>
                  </div>
                )) : <Alert variant="info" className="py-2 small">Venda à vista.</Alert>}
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default SoldPage;