import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Table, Card, Badge, Spinner, Form, Row, Col, Modal, ListGroup } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { 
  Plus, 
  Tag, 
  Search, 
  Image as ImageIcon, 
  Edit, 
  Eye, 
  Package, 
  DollarSign, 
  TrendingUp 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InventoryPage = () => {
  const [products, setProducts] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Estados para Modais
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const navigate = useNavigate();

  const fetchStock = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('status', 'estoque')
      .order('entry_date', { ascending: false });
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

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meu Estoque <Package size={24} className="text-primary ms-2"/></h2>
        <Button onClick={() => navigate('/new-product')} icon={<Plus />}>Novo Produto</Button>
      </div>

      <Card className="p-3 mb-4 shadow-sm border-0">
        <Row className="align-items-center">
          <Col md={6}>
            <div className="position-relative">
              <Search className="position-absolute ms-3" style={{top: '10px'}} size={18}/>
              <Form.Control className="ps-5" placeholder="Procurar produto..." value={filter} onChange={e => setFilter(e.target.value)} />
            </div>
          </Col>
        </Row>
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
                    <td className="text-start">
                      <strong>{p.name}</strong><br/>
                      <small className="text-muted">{p.category}</small>
                    </td>
                    <td><Badge bg="secondary" className="px-3 py-2">{p.quantity}</Badge></td>
                    <td>{formatCurrency(p.cost_price)}</td>
                    <td>{formatCurrency(p.expected_price)}</td>
                    <td className={margin < 30 ? 'text-danger fw-bold' : 'text-success fw-bold'}>{margin}%</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {/* BOTÃO DETALHES */}
                        <Button variant="outline-dark" size="sm" title="Detalhes" onClick={() => { setSelectedProduct(p); setShowDetailsModal(true); }}>
                          <Eye size={14}/>
                        </Button>
                        {/* BOTÃO EDITAR */}
                        <Button variant="outline-secondary" size="sm" title="Editar" onClick={() => { setEditingProduct(p); setShowEditModal(true); }}>
                          <Edit size={14}/>
                        </Button>
                        {/* BOTÃO ARTE */}
                        <Button variant="outline-info" size="sm" title="Gerar Arte" onClick={() => navigate('/generate-art', { state: { product: p } })}>
                          <ImageIcon size={14}/>
                        </Button>
                        {/* BOTÃO VENDER */}
                        <Button variant="outline-primary" size="sm" onClick={() => navigate('/new-sale', { state: { productId: p.id } })}>
                          <Tag size={14}/> Vender
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Card>
      )}

      {/* MODAL DE VISUALIZAÇÃO DETALHADA */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>Detalhamento de Estoque: {selectedProduct?.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {selectedProduct && (
            <Row>
              <Col md={6}>
                <h6 className="text-muted text-uppercase mb-3 small fw-bold">Valores Unitários</h6>
                <ListGroup className="mb-4 shadow-sm">
                  <ListGroup.Item className="d-flex justify-content-between">Custo: <span>{formatCurrency(selectedProduct.cost_price)}</span></ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">Venda Esperada: <span>{formatCurrency(selectedProduct.expected_price)}</span></ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between fw-bold text-success">Lucro p/ Un: <span>{formatCurrency(selectedProduct.expected_price - selectedProduct.cost_price)}</span></ListGroup.Item>
                </ListGroup>
              </Col>
              
              <Col md={6}>
                <h6 className="text-muted text-uppercase mb-3 small fw-bold">Totais do Lote ({selectedProduct.quantity} un.)</h6>
                <Card className="bg-primary text-white p-3 mb-3 border-0 shadow-sm">
                  <div className="d-flex align-items-center">
                    <DollarSign size={32} className="me-3 opacity-75"/>
                    <div>
                      <small className="d-block opacity-75">Investimento Total</small>
                      <h4 className="mb-0">{formatCurrency(selectedProduct.cost_price * selectedProduct.quantity)}</h4>
                    </div>
                  </div>
                </Card>
                <Card className="bg-success text-white p-3 border-0 shadow-sm">
                  <div className="d-flex align-items-center">
                    <TrendingUp size={32} className="me-3 opacity-75"/>
                    <div>
                      <small className="d-block opacity-75">Retorno Esperado</small>
                      <h4 className="mb-0">{formatCurrency(selectedProduct.expected_price * selectedProduct.quantity)}</h4>
                    </div>
                  </div>
                </Card>
              </Col>

              <Col md={12} className="mt-2">
                <div className="p-3 bg-light rounded text-center border">
                  <span className="text-muted">Lucro Total Potencial com este Estoque: </span>
                  <span className="h5 mb-0 fw-bold text-primary ms-2">
                    {formatCurrency((selectedProduct.expected_price - selectedProduct.cost_price) * selectedProduct.quantity)}
                  </span>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Fechar</Button>
          <Button onClick={() => {
            setShowDetailsModal(false);
            navigate('/new-sale', { state: { productId: selectedProduct.id } });
          }}>Ir para Venda</Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL DE EDIÇÃO */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Editar Produto</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            <Input 
              label="Nome do Produto" 
              value={editingProduct?.name || ''} 
              onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
              required 
            />
            <Row>
              <Col md={6}>
                <Input 
                  label="Quantidade" 
                  type="number" 
                  value={editingProduct?.quantity || ''} 
                  onChange={e => setEditingProduct({...editingProduct, quantity: e.target.value})} 
                  required 
                />
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoria</Form.Label>
                  <Form.Select 
                    value={editingProduct?.category || ''} 
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option value="Processador">Processador</option>
                    <option value="Placa de Vídeo">Placa de Vídeo</option>
                    <option value="Memória RAM">Memória RAM</option>
                    <option value="Armazenamento">Armazenamento</option>
                    <option value="Periférico">Periférico</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Input 
                  label="Custo (R$)" 
                  type="number" 
                  step="0.01" 
                  value={editingProduct?.cost_price || ''} 
                  onChange={e => setEditingProduct({...editingProduct, cost_price: e.target.value})} 
                />
              </Col>
              <Col md={6}>
                <Input 
                  label="Preço Esperado (R$)" 
                  type="number" 
                  step="0.01" 
                  value={editingProduct?.expected_price || ''} 
                  onChange={e => setEditingProduct({...editingProduct, expected_price: e.target.value})} 
                />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button type="submit">Salvar Alterações</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default InventoryPage;