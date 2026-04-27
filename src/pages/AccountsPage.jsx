import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2, CreditCard, Wallet } from 'lucide-react';
import { Spinner, Alert, Card, Form, Row, Col } from 'react-bootstrap';

const AccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState({ id: null, name: '', type: 'corrente', closing_day: '', due_day: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const [isPremium, setIsPremium] = useState(false);

  const fetchAccounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('accounts').select('*').order('name');
      if (error) throw error;
      setAccounts(data || []);
    } catch (err) {
      setError("Erro ao carregar contas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: currentAccount.name,
      type: currentAccount.type,
      closing_day: currentAccount.type === 'credito' ? parseInt(currentAccount.closing_day) : null,
      due_day: currentAccount.type === 'credito' ? parseInt(currentAccount.due_day) : null,
    };

    try {
      const { error } = currentAccount.id 
        ? await supabase.from('accounts').update(payload).eq('id', currentAccount.id)
        : await supabase.from('accounts').insert([payload]);

      if (error) throw error;
      fetchAccounts();
      setIsFormModalOpen(false);
    } catch (err) { alert(err.message); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('accounts').delete().eq('id', itemToDelete);
      if (error) throw error;
      await fetchAccounts();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao apagar conta. Verifique se não existem transações vinculadas a ela.");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="h2 mb-0">Minhas Contas e Cartões</h1>
          <Form.Check 
            type="switch" 
            label={isPremium ? "💎 Modo Premium Ativo" : "Modo Freemium"} 
            checked={isPremium} 
            onChange={() => setIsPremium(!isPremium)}
            className="mt-2 text-primary fw-bold"
          />
        </div>
        
        <Button 
          disabled={!isPremium && accounts.length >= 2}
          onClick={() => { setCurrentAccount({ id: null, name: '', type: 'corrente', closing_day: '', due_day: '' }); setIsFormModalOpen(true); }} 
          icon={<Plus />}
        >
          {!isPremium && accounts.length >= 2 ? "Limite Atingido (Grátis)" : "Nova Conta"}
        </Button>
      </div>

      {!isPremium && accounts.length >= 2 && (
        <Alert variant="warning" className="border-0 shadow-sm mb-4">
          💡 <strong>Limite de contas atingido:</strong> No plano gratuito só pode gerir 2 contas. Faça upgrade para ilimitadas!
        </Alert>
      )}

      {isLoading ? <Spinner animation="border" /> : error ? <Alert variant="danger">{error}</Alert> : (
        <Row>
          {accounts.map(acc => (
            <Col md={6} key={acc.id} className="mb-3">
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className={`p-3 rounded me-3 ${acc.type === 'credito' ? 'bg-primary-soft text-primary' : 'bg-success-soft text-success'}`}>
                      {acc.type === 'credito' ? <CreditCard /> : <Wallet />}
                    </div>
                    <div>
                      <h5 className="mb-0">{acc.name}</h5>
                      <small className="text-muted">
                        {acc.type === 'credito' ? `Fecha dia ${acc.closing_day} | Vence dia ${acc.due_day}` : 'Conta Corrente'}
                      </small>
                    </div>
                  </div>
                  <div>
                    <Button variant="link" className="text-secondary" onClick={() => { setCurrentAccount(acc); setIsFormModalOpen(true); }}><Edit size={18}/></Button>
                    <Button variant="link" className="text-danger" onClick={() => { setItemToDelete(acc.id); setShowDeleteModal(true); }}><Trash2 size={18}/></Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {accounts.length === 0 && <div className="text-center py-5 text-muted">Nenhuma conta cadastrada.</div>}
        </Row>
      )}

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentAccount.id ? 'Editar Conta' : 'Nova Conta'}>
        <Form onSubmit={handleSubmit}>
          <Input label="Nome da Conta (ex: Nubank, Carteira)" value={currentAccount.name} onChange={e => setCurrentAccount({...currentAccount, name: e.target.value})} required />
          
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Conta</Form.Label>
            <Form.Select value={currentAccount.type} onChange={e => setCurrentAccount({...currentAccount, type: e.target.value})}>
              <option value="corrente">Conta Corrente / Dinheiro</option>
              <option value="credito">Cartão de Crédito</option>
            </Form.Select>
          </Form.Group>

          {currentAccount.type === 'credito' && (
            <Row>
              <Col><Input label="Dia de Fecho" type="number" value={currentAccount.closing_day} onChange={e => setCurrentAccount({...currentAccount, closing_day: e.target.value})} required /></Col>
              <Col><Input label="Dia de Vencimento" type="number" value={currentAccount.due_day} onChange={e => setCurrentAccount({...currentAccount, due_day: e.target.value})} required /></Col>
            </Row>
          )}
          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={() => setIsFormModalOpen(false)}>Cancelar</Button>
            <Button type="submit">Guardar</Button>
          </div>
        </Form>
      </Modal>

      {showDeleteModal && (
        <Modal 
          isOpen={showDeleteModal} 
          onClose={() => setShowDeleteModal(false)} 
          title="Confirmar Exclusão" 
          footer={
            <>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
              <Button variant="danger" onClick={confirmDelete}>Excluir</Button>
            </>
          }
        >
          <p>Tem certeza que deseja apagar esta conta ou cartão?</p>
        </Modal>
      )}
    </>
  );
};

export default AccountsPage;