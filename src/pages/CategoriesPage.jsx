import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2, Tag } from 'lucide-react';
import { Spinner, Alert, Card, Form, Row, Col } from 'react-bootstrap';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '' });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      setError("Erro ao carregar categorias.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: currentCategory.name };

    try {
      const { error } = currentCategory.id 
        ? await supabase.from('categories').update(payload).eq('id', currentCategory.id)
        : await supabase.from('categories').insert([payload]);

      if (error) throw error;
      fetchCategories();
      setIsFormModalOpen(false);
    } catch (err) { alert(err.message); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('id', itemToDelete);
      if (error) throw error;
      await fetchCategories();
    } catch (err) {
      console.error("Erro ao deletar:", err);
      alert("Erro ao apagar. Pode haver transações usando esta categoria.");
    } finally {
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2 mb-0">Categorias</h1>
        <Button onClick={() => { setCurrentCategory({ id: null, name: '' }); setIsFormModalOpen(true); }} icon={<Plus />}>
          Nova Categoria
        </Button>
      </div>

      {isLoading ? <Spinner animation="border" /> : error ? <Alert variant="danger">{error}</Alert> : (
        <Row>
          {categories.map(cat => (
            <Col md={4} sm={6} key={cat.id} className="mb-3">
              <Card className="shadow-sm border-0 h-100">
                <Card.Body className="d-flex justify-content-between align-items-center p-3">
                  <div className="d-flex align-items-center">
                    <div className="bg-light p-2 rounded me-2">
                      <Tag size={16} className="text-secondary" />
                    </div>
                    <span className="fw-bold">{cat.name}</span>
                  </div>
                  <div>
                    <Button variant="link" size="sm" className="text-secondary p-1" onClick={() => { setCurrentCategory(cat); setIsFormModalOpen(true); }}><Edit size={16}/></Button>
                    <Button variant="link" size="sm" className="text-danger p-1" onClick={() => { setItemToDelete(cat.id); setShowDeleteModal(true); }}><Trash2 size={16}/></Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
          {categories.length === 0 && <div className="text-center py-5 text-muted">Nenhuma categoria cadastrada.</div>}
        </Row>
      )}

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} title={currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}>
        <Form onSubmit={handleSubmit}>
          <Input label="Nome da Categoria (ex: Lazer, Pet, Streaming)" value={currentCategory.name} onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})} required />
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
          <p>Tem certeza que deseja apagar esta categoria?</p>
        </Modal>
      )}
    </>
  );
};

export default CategoriesPage;