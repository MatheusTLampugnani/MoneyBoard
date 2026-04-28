import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Spinner, Alert, Card, ProgressBar, Row, Col, Form } from 'react-bootstrap';

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState({ id: null, name: '', targetAmount: '', currentAmount: 0, targetDate: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const fetchGoals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase.from('goals').select('*').order('target_date', { ascending: true });
      if (fetchError) throw fetchError;

      setGoals(data.map(goal => ({
        id: goal.id,
        name: goal.name,
        targetAmount: goal.target_amount,
        currentAmount: goal.current_amount,
        targetDate: goal.target_date,
      })) || []);
    } catch (err) { setError("Não foi possível carregar as metas."); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const GoalCard = ({ goal }) => {
    const progress = (parseFloat(goal.currentAmount) / parseFloat(goal.targetAmount)) * 100;
    
    // CÁLCULO INTELIGENTE SEMPRE ATIVO
    let recomendacaoMensal = 0;
    if (goal.targetDate && parseFloat(goal.currentAmount) < parseFloat(goal.targetAmount)) {
      const mesesRestantes = Math.max(1, (new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24 * 30));
      recomendacaoMensal = (parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount)) / mesesRestantes;
    }

    return (
      <Col md={6} lg={4} className="mb-4">
        <Card className="shadow-sm h-100 border-0 rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start">
              <Card.Title className="h5 fw-bold">{goal.name}</Card.Title>
              <div>
                <Button variant="outline-secondary" size="sm" onClick={() => openModalForEdit(goal)} className="me-2"><Edit size={16} /></Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDeleteClick(goal.id)}><Trash2 size={16} /></Button>
              </div>
            </div>
            
            <ProgressBar now={progress} variant={progress >= 100 ? "success" : "primary"} label={`${progress.toFixed(1)}%`} className="my-3" style={{ height: '20px' }} />
            
            <div className="d-flex justify-content-between mb-2">
              <span className="text-success fw-bold">{formatCurrency(goal.currentAmount)}</span>
              <span className="text-muted fw-bold">{formatCurrency(goal.targetAmount)}</span>
            </div>

            {recomendacaoMensal > 0 && (
              <div className="mt-3 p-3 bg-primary-soft rounded text-center border border-primary" style={{backgroundColor: 'rgba(13, 110, 253, 0.05)'}}>
                <small className="text-primary fw-bold d-block mb-1">💡 Assistente MoneyBoard:</small>
                <span className="small text-dark">
                  Poupe <strong>{formatCurrency(recomendacaoMensal)}</strong> por mês para bater esta meta!
                </span>
              </div>
            )}
          </Card.Body>
        </Card>
      </Col>
    );
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2">Minhas Metas</h1>
        <Button onClick={() => { setCurrentGoal({ id: null, name: '', targetAmount: '', currentAmount: 0, targetDate: '' }); setIsFormModalOpen(true); }} icon={<Plus />}>Nova Meta</Button>
      </div>

      {isLoading && <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>}
      <Row>{!isLoading && goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}</Row>
      
      {/* Modais de Form e Delete mantidos iguais */}
    </>
  );
};

export default GoalsPage;