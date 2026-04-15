import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Row, Col, Table, Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { Wallet, Edit, Plus, ArrowUpCircle, ArrowDownCircle, User, CreditCard } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const CashControlPage = () => {
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const fetchData = async () => {
    setLoading(true);
    try {
      // CORREÇÃO: Usando select('*') para evitar erros de colunas não existentes
      const [sRes, iRes, eRes] = await Promise.all([
        supabase.from('sales').select('*, products(name)').gt('down_payment', 0),
        supabase.from('sale_installments').select('*, sales(customer_name, products(name))').eq('status', 'pago'),
        supabase.from('store_expenses').select('*')
      ]);

      // Logs para caso algum erro aconteça no banco de dados, você consiga ver no F12
      if (sRes.error) console.error("Erro ao buscar Entradas:", sRes.error);
      if (iRes.error) console.error("Erro ao buscar Parcelas:", iRes.error);
      if (eRes.error) console.error("Erro ao buscar Saídas:", eRes.error);

      const combinedData = [];

      // 1. Processa Entradas à Vista
      (sRes.data || []).forEach(s => {
        combinedData.push({
          id: s.id,
          source: 'sales',
          date: s.sale_date,
          description: `Entrada: ${s.products?.name}`,
          customer: s.customer_name || 'Não informado',
          amount: parseFloat(s.down_payment),
          type: 'entrada',
          badge: 'Venda Direta',
          method: 'À Vista'
        });
      });

      // 2. Processa Parcelas Pagas (Agora vai aparecer!)
      (iRes.data || []).forEach(i => {
        combinedData.push({
          id: i.id,
          source: 'sale_installments',
          date: i.due_date, // Usa a data de vencimento como referência
          description: `Parcela: ${i.sales?.products?.name}`,
          customer: i.sales?.customer_name || 'Não informado',
          amount: parseFloat(i.amount),
          type: 'entrada',
          badge: 'Recebimento',
          method: i.payment_method || 'Pix'
        });
      });

      // 3. Processa Saídas (Despesas)
      (eRes.data || []).forEach(e => {
        combinedData.push({
          id: e.id,
          source: 'store_expenses',
          date: e.expense_date,
          description: e.description,
          customer: '-',
          amount: parseFloat(e.amount),
          type: 'saida',
          badge: 'Despesa',
          method: 'Saída de Caixa'
        });
      });

      // Ordena tudo por data (do mais recente para o mais antigo)
      combinedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setTimeline(combinedData);

    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Cálculos de Totais
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    timeline.forEach(item => {
      if (item.type === 'entrada') income += item.amount;
      else expense += item.amount;
    });
    return { income, expense, balance: income - expense };
  }, [timeline]);

  // Função de Edição
  const handleEditEntry = async (e) => {
    e.preventDefault();
    try {
      const column = editingEntry.source === 'sales' ? 'down_payment' : 'amount';
      const { error } = await supabase
        .from(editingEntry.source)
        .update({ [column]: editingEntry.value })
        .eq('id', editingEntry.id);

      if (error) throw error;
      setShowEditModal(false);
      fetchData();
    } catch (err) { alert("Erro ao atualizar caixa: " + err.message); }
  };

  // Função de Registrar Despesa
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('store_expenses').insert([{
        description: newExpense.description,
        amount: newExpense.amount,
        expense_date: newExpense.date
      }]);

      if (error) throw error;
      setShowExpenseModal(false);
      setNewExpense({ description: '', amount: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) { alert("Erro ao registrar saída: " + err.message); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-dark fw-bold mb-0">Controle de Caixa <Wallet size={24} className="text-primary ms-2"/></h2>
        <Button variant="danger" onClick={() => setShowExpenseModal(true)} icon={<Plus />}>
          Registrar Saída
        </Button>
      </div>
      
      {/* CARDS DE RESUMO */}
      <Row className="mb-4 g-3">
        <Col md={4}>
          <Card className="p-4 border-0 shadow-sm bg-success text-white rounded-4 h-100">
            <div className="d-flex justify-content-between">
              <small className="fw-bold opacity-75">TOTAL ENTRADAS</small>
              <ArrowUpCircle size={20} className="opacity-50" />
            </div>
            <h3 className="mb-0 fw-bold mt-2">{formatCurrency(totals.income)}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 border-0 shadow-sm bg-danger text-white rounded-4 h-100">
            <div className="d-flex justify-content-between">
              <small className="fw-bold opacity-75">TOTAL SAÍDAS</small>
              <ArrowDownCircle size={20} className="opacity-50" />
            </div>
            <h3 className="mb-0 fw-bold mt-2">{formatCurrency(totals.expense)}</h3>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="p-4 border-0 shadow-sm bg-primary text-white rounded-4 h-100">
            <div className="d-flex justify-content-between">
              <small className="fw-bold opacity-75">SALDO ATUAL</small>
              <Wallet size={20} className="opacity-50" />
            </div>
            <h3 className="mb-0 fw-bold mt-2">{formatCurrency(totals.balance)}</h3>
          </Card>
        </Col>
      </Row>

      {/* TABELA DE MOVIMENTAÇÕES */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white fw-bold py-3 border-0">Histórico de Movimentações</Card.Header>
        <Table responsive hover className="mb-0 align-middle">
          <thead className="table-light">
            <tr>
              <th className="ps-4">Data</th>
              <th>Descrição / Cliente</th>
              <th>Meio</th>
              <th>Tipo</th>
              <th className="text-end">Valor</th>
              <th className="text-end pe-4">Editar</th>
            </tr>
          </thead>
          <tbody>
            {timeline.map((item, idx) => (
              <tr key={`${item.source}-${item.id}-${idx}`}>
                <td className="ps-4 text-muted small">{new Date(item.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
                <td>
                  <strong className="d-block">{item.description}</strong>
                  {item.customer !== '-' && (
                    <small className="text-muted d-flex align-items-center mt-1">
                      <User size={12} className="me-1"/> {item.customer}
                    </small>
                  )}
                </td>
                <td>
                  <small className="text-muted d-flex align-items-center">
                    {item.method !== '-' && <CreditCard size={12} className="me-1"/>} {item.method}
                  </small>
                </td>
                <td>
                  <Badge bg={item.type === 'entrada' ? (item.source === 'sales' ? 'success' : 'info') : 'danger'}>
                    {item.badge}
                  </Badge>
                </td>
                <td className={`text-end fw-bold ${item.type === 'entrada' ? 'text-success' : 'text-danger'}`}>
                  {item.type === 'entrada' ? '+' : '-'}{formatCurrency(item.amount)}
                </td>
                <td className="text-end pe-4">
                  <Button variant="outline-secondary" size="sm" onClick={() => {
                    setEditingEntry({ id: item.id, source: item.source, value: item.amount, description: item.description });
                    setShowEditModal(true);
                  }}>
                    <Edit size={14} />
                  </Button>
                </td>
              </tr>
            ))}
            {timeline.length === 0 && (
              <tr><td colSpan="6" className="text-center py-4 text-muted">Nenhuma movimentação no caixa.</td></tr>
            )}
          </tbody>
        </Table>
      </Card>

      {/* MODAL: REGISTRAR SAÍDA (DESPESA) */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h6">Registrar Saída de Caixa</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleAddExpense}>
          <Modal.Body className="p-4">
            <Input 
              label="Descrição (Ex: Pagamento Fornecedor, Luz)" 
              value={newExpense.description} 
              onChange={e => setNewExpense({...newExpense, description: e.target.value})} 
              required 
              autoFocus
            />
            <Row>
              <Col md={6}>
                <Input 
                  label="Valor (R$)" 
                  type="number" 
                  step="0.01" 
                  value={newExpense.amount} 
                  onChange={e => setNewExpense({...newExpense, amount: e.target.value})} 
                  required 
                />
              </Col>
              <Col md={6}>
                <Input 
                  label="Data da Saída" 
                  type="date" 
                  value={newExpense.date} 
                  onChange={e => setNewExpense({...newExpense, date: e.target.value})} 
                  required 
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>Cancelar</Button>
            <Button type="submit" variant="danger">Confirmar Saída</Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DE EDIÇÃO DE CAIXA */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h6">Corrigir Lançamento</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditEntry}>
          <Modal.Body className="p-4">
            <p className="text-muted small mb-3">Movimentação: <strong className="text-dark">{editingEntry?.description}</strong></p>
            <Input 
              label="Corrigir Valor (R$)" 
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