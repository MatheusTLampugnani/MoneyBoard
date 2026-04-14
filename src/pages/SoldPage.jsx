// src/pages/SoldPage.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Table, Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// Importação que estava faltando:
import Button from '../components/common/Button';

const SoldPage = () => {
  const [data, setData] = useState({ sales: [], stats: {} });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSold = async () => {
      setLoading(true);
      try {
        // Busca as vendas, produtos relacionados e parcelas
        const { data: sales, error } = await supabase
          .from('sales')
          .select('*, products(*), sale_installments(*)')
          .order('sale_date', { ascending: false });

        if (error) throw error;

        // Calcula as estatísticas para o dashboard da loja
        const stats = sales?.reduce((acc, s) => {
          const valorVenda = parseFloat(s.final_sale_price || 0);
          const custoProduto = parseFloat(s.products?.cost_price || 0);
          
          acc.totalVenda += valorVenda;
          acc.totalCusto += custoProduto;
          acc.recebido += parseFloat(s.down_payment || 0);

          s.sale_installments?.forEach(i => {
            if (i.status === 'pago') acc.recebido += parseFloat(i.amount || 0);
            else acc.pendente += parseFloat(i.amount || 0);
          });
          return acc;
        }, { totalVenda: 0, totalCusto: 0, recebido: 0, pendente: 0 }) || {};

        setData({ sales: sales || [], stats });
      } catch (err) {
        console.error("Erro ao carregar vendas:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSold();
  }, []);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <>
      <h2 className="mb-4">Produtos Vendidos</h2>
      
      {/* Dashboard de Vendas da CRICASTECH */}
      <Row className="mb-4 text-center">
        <Col md={3} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">TOTAL VENDIDO</small>
            <h4 className="text-primary mb-0">{formatCurrency(data.stats.totalVenda)}</h4>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">LUCRO ESTIMADO</small>
            <h4 className="text-success mb-0">{formatCurrency(data.stats.totalVenda - data.stats.totalCusto)}</h4>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">JÁ RECEBIDO</small>
            <h4 className="text-info mb-0">{formatCurrency(data.stats.recebido)}</h4>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="p-3 border-0 shadow-sm">
            <small className="text-muted fw-bold">PENDENTE</small>
            <h4 className="text-warning mb-0">{formatCurrency(data.stats.pendente)}</h4>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Produto</th>
              <th>Preço Final</th>
              <th>Status Pagamento</th>
              <th>Data da Venda</th>
              <th className="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.sales.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-4 text-muted">Nenhuma venda registrada.</td></tr>
            ) : (
              data.sales.map(s => (
                <tr key={s.id}>
                  <td className="align-middle"><strong>{s.products?.name}</strong></td>
                  <td className="align-middle">{formatCurrency(s.final_sale_price)}</td>
                  <td className="align-middle">
                    {s.sale_installments?.some(i => i.status === 'pendente') ? 
                      <Badge bg="warning" text="dark">Com Parcelas</Badge> : 
                      <Badge bg="success">Pago Integralmente</Badge>
                    }
                  </td>
                  <td className="align-middle">{new Date(s.sale_date).toLocaleDateString('pt-BR')}</td>
                  <td className="text-end align-middle">
                    <Button 
                      variant="outline-dark" 
                      size="sm" 
                      onClick={() => navigate('/generate-receipt', { state: { sale: s } })}
                    >
                      <FileText size={14} className="me-1"/> Recibo
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </>
  );
};

export default SoldPage;