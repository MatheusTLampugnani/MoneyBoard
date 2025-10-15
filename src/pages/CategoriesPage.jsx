import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../context/AuthContext';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Spinner, Alert, Card, ListGroup } from 'react-bootstrap';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ id: null, name: '', color: '#0d6efd' });

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error("Erro ao carregar categorias:", err);
      setError("Não foi possível carregar as categorias.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openModalForCreate = () => {
    setCurrentCategory({ id: null, name: '', color: '#0d6efd' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (category) => {
    setCurrentCategory(category);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { id, name, color } = currentCategory;
    try {
      let error;
      if (id) {
        const { error: updateError } = await supabase
          .from('categories')
          .update({ name, color })
          .eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('categories')
          .insert({ name, color });
        error = insertError;
      }

      if (error) throw error;

      fetchCategories();
      closeModal();
    } catch (err) {
      console.error("Erro ao salvar categoria:", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta categoria?')) {
      try {
        const { error: deleteError } = await supabase
          .from('categories')
          .delete()
          .eq('id', id);
        
        if (deleteError) throw deleteError;

        fetchCategories();
      } catch (err) {
        console.error("Erro ao deletar categoria:", err);
      }
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2">Categorias</h1>
        <Button onClick={openModalForCreate} icon={<Plus />}>Nova Categoria</Button>
      </div>
      {isLoading && <div className="text-center"><Spinner animation="border" /></div>}
      {error && <Alert variant="danger">{error}</Alert>}
      {!isLoading && !error && (
        <Card className="shadow-sm">
          <ListGroup variant="flush">
            {categories.map(cat => (
              <ListGroup.Item key={cat.id} className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <span className="d-inline-block rounded-circle me-3" style={{ width: '15px', height: '15px', backgroundColor: cat.color }}></span>
                  {cat.name}
                </div>
                <div>
                  <Button variant="outline-secondary" size="sm" onClick={() => openModalForEdit(cat)} className="me-2"><Edit size={16} /></Button>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat.id)}><Trash2 size={16} /></Button>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={currentCategory.id ? 'Editar Categoria' : 'Nova Categoria'}
        footer={<><Button variant="secondary" onClick={closeModal}>Cancelar</Button><Button onClick={handleSubmit}>Salvar</Button></>}>
        <form onSubmit={handleSubmit}>
          <Input id="name" label="Nome da Categoria" value={currentCategory.name} onChange={(e) => setCurrentCategory({...currentCategory, name: e.target.value})} required/>
          <Input id="color" label="Cor" type="color" value={currentCategory.color} onChange={(e) => setCurrentCategory({...currentCategory, color: e.target.value})} />
        </form>
      </Modal>
    </>
  );
};

export default CategoriesPage;