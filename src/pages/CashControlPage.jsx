import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Row, Col, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { Wallet, Edit } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const CashControlPage = () => {
  const [data, setData] = useState({ sales: [], installments: [] });
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, i] = await Promise.all([
        supabase.from('sales').select('*, products(name)').gt('down_payment', 0),
        supabase.from('sale_installments').select('*, sales(products(name))').eq('status', 'pago')
      ]);
      setData({ sales: s.data || [], installments: i.data || [] });
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const totals = useMemo(() => {
    const totalEntradas = data.sales.reduce((acc, s) => acc + parseFloat(s.down_payment || 0), 0);
    const totalParcelas = data.installments.reduce((acc, i) => acc + parseFloat(i.amount || 0), 0);
    return { income: totalEntradas + totalParcelas };
  }, [data]);

  const openEditModal = (id, type, currentValue, desc) => {
    setEditingEntry({ id, type, value: currentValue, description: desc });
    setShowEditModal(true);
  };

  const handleEditEntry = async (e) => {
    e.preventDefault();
    try {
      const table = editingEntry.type === 'venda' ? 'sales' : 'sale_installments';
      const column = editingEntry.type === 'venda' ? 'down_payment' : 'amount';

      const { error } = await supabase.from(table).update({ [column]: editingEntry.value }).eq('id', editingEntry.id);
      if (error) throw error;
      
      setShowEditModal(false);
      fetchData();
    } catch (err) { alert("Erro ao atualizar caixa: " + err.message); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <>
      <h2 className="mb-4 text-dark fw-bold">Controle de Caixa <Wallet size={24} className="text-primary ms-2"/></h2>
      
      <Row className="mb-4">
        <Col md={4}>
          <Card className="p-4 border-0 shadow-sm bg-primary text-white rounded-4">
            <small className="fw-bold opacity-75">SALDO TOTAL EM CAIXA (REAL)</small>
            <h2 className="mb-0 fw-bold">{formatCurrency(totals.income)}</h2>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white fw-bold py-3 border-0">Últimas Movimentações (Entradas)</Card.Header>
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th className="text-end">Valor</th>
              <th className="text-end pe-4">Editar</th>
            </tr>
          </thead>
          <tbody>
            {data.sales.map(s => (
              <tr key={`s-${s.id}`}>
                <td className="ps-4">{new Date(s.sale_date).toLocaleDateString('pt-BR')}</td>
                <td>Entrada à Vista: {s.products?.name}</td>
                <td><Badge bg="success">Venda Direta</Badge></td>
                <td className="text-end text-success fw-bold">+{formatCurrency(s.down_payment)}</td>
                <td className="text-end pe-4">
                  <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(s.id, 'venda', s.down_payment, `Entrada: ${s.products?.name}`)}>
                    <Edit size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {data.installments.map(i => (
              <tr key={`i-${i.id}`}>
                <td className="ps-4">{new Date(i.payment_date || i.due_date).toLocaleDateString('pt-BR')}</td>
                <td>Parcela: {i.sales?.products?.name}</td>
                <td><Badge bg="info">Recebimento</Badge></td>
                <td className="text-end text-success fw-bold">+{formatCurrency(i.amount)}</td>
                <td className="text-end pe-4">
                  <Button variant="outline-secondary" size="sm" onClick={() => openEditModal(i.id, 'parcela', i.amount, `Parcela: ${i.sales?.products?.name}`)}>
                    <Edit size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {data.sales.length === 0 && data.installments.length === 0 && (
              <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma movimentação de caixa encontrada.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h6">Corrigir Lançamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditEntry}>
          <Modal.Body className="p-4">
            <p className="text-muted small mb-3">Movimentação: <strong className="text-dark">{editingEntry?.description}</strong></p>
            <Input 
              label="Valor Recebido (R$)" 
              type="number" 
              step="0.01" 
              value={editingEntry?.value || ''} 
              onChange={e => setEditingEntry({...editingEntry, value: e.target.value})} 
              required 
              autoFocus
            />
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button type="submit" variant="primary">Salvar Correção</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default CashControlPage;