import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Spinner, Alert, Card, ProgressBar, Row, Col } from 'react-bootstrap';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentGoal, setCurrentGoal] = useState({ id: null, name: '', targetAmount: '', currentAmount: 0, targetDate: '' });
  
  const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .order('target_date', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedData = data.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: goal.target_date,
      }));
      setGoals(formattedData || []);

    } catch (err) {
      console.error("Erro ao carregar metas:", err);
      setError("Não foi possível carregar as metas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const openModalForCreate = () => {
    setCurrentGoal({ id: null, name: '', targetAmount: '', currentAmount: 0, targetDate: '' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (goal) => {
    setCurrentGoal({ ...goal, targetDate: formatDateForInput(goal.targetDate) });
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const goalDataForSupabase = {
      name: currentGoal.name,
      target_amount: currentGoal.targetAmount,   
      current_amount: currentGoal.currentAmount, 
      target_date: currentGoal.targetDate || null,
    };

    try {
      let error;
      if (currentGoal.id) {
        const { error: updateError } = await supabase
          .from('goals')
          .update(goalDataForSupabase)
          .eq('id', currentGoal.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('goals')
          .insert(goalDataForSupabase);
        error = insertError;
      }
      if (error) throw error;
      fetchGoals();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar meta:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza?')) {
      try {
        const { error: deleteError } = await supabase
          .from('goals')
          .delete()
          .eq('id', id);
        if (deleteError) throw deleteError;
        fetchGoals();
      } catch (err) {
        console.error("Erro ao deletar meta:", err);
      }
    }
  };

  const GoalCard = ({ goal }) => {
    const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
    return (
      <Col md={6} lg={4} className="mb-4">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <Card.Title className="h5">{goal.name}</Card.Title>
              <div>
                <Button variant="outline-secondary" size="sm" onClick={() => openModalForEdit(goal)} className="me-2"><Edit size={16} /></Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDelete(goal.id)}><Trash2 size={16} /></Button>
              </div>
            </div>
            <ProgressBar now={progress} label={`${progress.toFixed(1)}%`} className="my-3" />
            <div className="d-flex justify-content-between">
              <span className="text-success">{formatCurrency(goal.currentAmount)}</span>
              <span className="text-muted">{formatCurrency(goal.targetAmount)}</span>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2">Minhas Metas</h1>
        <Button onClick={openModalForCreate} icon={<Plus />}>Nova Meta</Button>
      </div>
      {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      <Row>{!isLoading && goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}</Row>
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={currentGoal?.id ? 'Editar Meta' : 'Nova Meta'}
          footer={<><Button variant="secondary" onClick={closeModal}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></>}>
          <form onSubmit={handleSubmit}>
            <Input id="name" label="Nome da Meta" value={currentGoal.name} onChange={(e) => setCurrentGoal({ ...currentGoal, name: e.target.value })} required />
            <Input id="targetAmount" label="Valor Alvo (R$)" type="number" step="0.01" value={currentGoal.targetAmount} onChange={(e) => setCurrentGoal({ ...currentGoal, targetAmount: e.target.value })} required />
            <Input id="currentAmount" label="Valor Atual (R$)" type="number" step="0.01" value={currentGoal.currentAmount} onChange={(e) => setCurrentGoal({ ...currentGoal, currentAmount: e.target.value })} required />
            <Input id="targetDate" label="Data Alvo" type="date" value={currentGoal.targetDate} onChange={(e) => setCurrentGoal({ ...currentGoal, targetDate: e.target.value })} />
          </form>
        </Modal>
      )}
    </>
  );
};

export default GoalsPage;