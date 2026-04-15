import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Table, Card, Badge, Spinner, Form, Row, Col, Modal, ListGroup } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Tag, Search, Image as ImageIcon, Edit, Eye, Package, DollarSign, TrendingUp, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  
  const navigate = useNavigate();

  const fetchStock = async () => {
    const { data } = await supabase.from('products').select('*').eq('status', 'estoque').order('entry_date', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchStock(); }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').update({
        name: editingProduct.name,
        cost_price: editingProduct.cost_price,
        expected_price: editingProduct.expected_price,
        quantity: editingProduct.quantity,
        category: editingProduct.category
      }).eq('id', editingProduct.id);
      if (error) throw error;
      setShowEditModal(false);
      fetchStock();
    } catch (err) { alert(err.message); }
  };

  const confirmRestock = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').update({ 
        quantity: selectedProduct.quantity + parseInt(restockQty) 
      }).eq('id', selectedProduct.id);
      if (error) throw error;
      setShowRestockModal(false);
      fetchStock();
    } catch (err) { alert(err.message); }
  };

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meu Estoque <Package size={24} className="text-primary ms-2"/></h2>
        <Button onClick={() => navigate('/new-product')} icon={<Plus />}>Novo Produto</Button>
      </div>

      <Card className="shadow-sm border-0 mb-4 p-3">
        <div className="position-relative" style={{ maxWidth: '400px' }}>
          <Search className="position-absolute ms-3" style={{top: '10px'}} size={18}/>
          <Form.Control className="ps-5" placeholder="Procurar produto..." value={filter} onChange={e => setFilter(e.target.value)} />
        </div>
      </Card>

      {loading ? <div className="text-center py-5"><Spinner animation="border" /></div> : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0 text-center align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-start">Produto</th>
                <th>Qtd</th>
                <th>Custo Un.</th>
                <th>Esperado Un.</th>
                <th>Margem</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(p => {
                const margin = (((p.expected_price - p.cost_price) / p.cost_price) * 100).toFixed(1);
                return (
                  <tr key={p.id}>
                    <td className="text-start"><strong>{p.name}</strong><br/><small className="text-muted">{p.category}</small></td>
                    <td><Badge bg="secondary" className="px-3 py-2">{p.quantity}</Badge></td>
                    <td>{formatCurrency(p.cost_price)}</td>
                    <td>{formatCurrency(p.expected_price)}</td>
                    <td className={margin < 30 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{margin}%</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <Button variant="outline-success" size="sm" onClick={() => { setSelectedProduct(p); setRestockQty(1); setShowRestockModal(true); }}><PlusCircle size={14}/></Button>
                        <Button variant="outline-dark" size="sm" onClick={() => { setSelectedProduct(p); setShowDetailsModal(true); }}><Eye size={14}/></Button>
                        <Button variant="outline-secondary" size="sm" onClick={() => { setEditingProduct(p); setShowEditModal(true); }}><Edit size={14}/></Button>
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('/new-sale', { state: { productId: p.id } })}><Tag size={14}/> Vender</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* MODAL REPOSIÇÃO */}
      <Modal show={showRestockModal} onHide={() => setShowRestockModal(false)} centered size="sm">
        <Modal.Header closeButton className="bg-success text-white"><Modal.Title className="h6">Repor Estoque</Modal.Title></Modal.Header>
        <Form onSubmit={confirmRestock}>
          <Modal.Body className="text-center py-4">
            <p className="mb-2 small">Adicionar unidades ao item:<br/><strong>{selectedProduct?.name}</strong></p>
            <Form.Control type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} className="text-center fs-4 fw-bold" autoFocus />
          </Modal.Body>
          <Modal.Footer className="border-0"><Button type="submit" variant="success" className="w-100">Confirmar</Button></Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL DETALHES */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light"><Modal.Title>Detalhamento: {selectedProduct?.name}</Modal.Title></Modal.Header>
        <Modal.Body className="p-4">
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted small fw-bold">UNITÁRIO</h6>
                <ListGroup className="mb-4 shadow-sm">
                  <ListGroup.Item className="d-flex justify-content-between">Custo: <span>{formatCurrency(selectedProduct.cost_price)}</span></ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">Venda: <span>{formatCurrency(selectedProduct.expected_price)}</span></ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between fw-bold text-success">Lucro: <span>{formatCurrency(selectedProduct.expected_price - selectedProduct.cost_price)}</span></ListGroup.Item>
                </ListGroup>
              </Col>
              <Col md={6}>
                <h6 className="text-muted small fw-bold">TOTAL DO LOTE ({selectedProduct.quantity} un.)</h6>
                <Card className="bg-primary text-white p-3 mb-2 border-0"><small className="opacity-75">Investimento Total</small><h4 className="mb-0">{formatCurrency(selectedProduct.cost_price * selectedProduct.quantity)}</h4></Card>
                <Card className="bg-success text-white p-3 border-0"><small className="opacity-75">Retorno Total</small><h4 className="mb-0">{formatCurrency(selectedProduct.expected_price * selectedProduct.quantity)}</h4></Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>

      {/* MODAL EDIÇÃO */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Editar Produto</Modal.Title></Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Input label="Nome" value={editingProduct?.name || ''} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
            <Row>
              <Col md={6}><Input label="Quantidade" type="number" value={editingProduct?.quantity || ''} onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})} required /></Col>
              <Col md={6}>
                <Form.Group className="mb-3"><Form.Label>Categoria</Form.Label>
                  <Form.Select value={editingProduct?.category || ''} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}>
                    <option value="Processador">Processador</option><option value="Monitor">Monitor</option><option value="Periférico">Periférico</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer><Button type="submit">Salvar Alterações</Button></Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default InventoryPage;