import React, { useState } from 'react';
import useApiData from '../hooks/useApiData';
import api from '../services/api';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Spinner, Alert, Card, Table, Form, Row, Col } from 'react-bootstrap';

const TransactionsPage = () => {
  const { data: transactions, isLoading, error, refetch } = useApiData('/transactions');
  const { data: categories } = useApiData('/categories');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const openModalForCreate = () => {
    setCurrentTransaction({ id: null, description: '', amount: '', type: 'despesa', date: formatDateForInput(new Date()), categoryId: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (t) => {
    setCurrentTransaction({ ...t, date: formatDateForInput(t.date) });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentTransaction.id) {
        await api.put(`/transactions/${currentTransaction.id}`, currentTransaction);
      } else {
        await api.post('/transactions', currentTransaction);
      }
      refetch();
      closeModal();
    } catch (err) { console.error("Erro ao salvar transação:", err); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza?')) {
      try {
        await api.delete(`/transactions/${id}`);
        refetch();
      } catch (err) { console.error("Erro ao deletar transação:", err); }
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2">Transações</h1>
        <Button onClick={openModalForCreate} icon={<Plus />}>Nova Transação</Button>
      </div>
      {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">Erro ao carregar transações.</Alert>}
      <Card className="shadow-sm">
        <Table responsive striped bordered hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.map(t => (
              <tr key={t.id}>
                <td>{t.description}</td>
                <td className={t.type === 'receita' ? 'text-success' : 'text-danger'}>{formatCurrency(t.amount)}</td>
                <td>{t.category?.name || 'N/A'}</td>
                <td>{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                <td>
                  <Button variant="outline-secondary" size="sm" onClick={() => openModalForEdit(t)} className="me-2"><Edit size={16} /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}><Trash2 size={16} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={currentTransaction?.id ? 'Editar Transação' : 'Nova Transação'}
          footer={<><Button variant="secondary" onClick={closeModal}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></>}>
          <Form onSubmit={handleSubmit}>
            <Input id="description" label="Descrição" value={currentTransaction.description} onChange={(e) => setCurrentTransaction({ ...currentTransaction, description: e.target.value })} required />
            <Row>
              <Col md={6}><Input id="amount" label="Valor (R$)" type="number" step="0.01" value={currentTransaction.amount} onChange={(e) => setCurrentTransaction({ ...currentTransaction, amount: e.target.value })} required /></Col>
              <Col md={6}><Input id="date" label="Data" type="date" value={currentTransaction.date} onChange={(e) => setCurrentTransaction({ ...currentTransaction, date: e.target.value })} required /></Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Select value={currentTransaction.type} onChange={(e) => setCurrentTransaction({ ...currentTransaction, type: e.target.value })}>
                    <option value="despesa">Despesa</option>
                    <option value="receita">Receita</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                <Form.Label>Categoria</Form.Label>
                <Form.Select 
                    value={currentTransaction.categoryId || ''} 
                    onChange={(e) => setCurrentTransaction({...currentTransaction, categoryId: e.target.value })}
                    required
                >
                    <option value="">Selecione...</option>
                    {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal>
      )}
    </>
  );
};

export default TransactionsPage;