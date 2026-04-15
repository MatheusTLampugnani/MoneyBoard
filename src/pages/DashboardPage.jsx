import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/dashboard/BalanceCard';
import TransactionsChart from '../components/dashboard/TransactionsChart'; // Importação do gráfico
import { Spinner, Row, Col, Alert, Card } from 'react-bootstrap';
import { Package, TrendingUp, DollarSign, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { user, isCricasUser } = useAuth();
  const [data, setData] = useState({ 
    transactions: [], 
    products: [], 
    sales: [], 
    installments: [] 
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const queries = [
          supabase.from('transactions').select('*, categories(name)'),
        ];

        if (isCricasUser) {
          queries.push(supabase.from('products').select('*'));
          queries.push(supabase.from('sales').select('*'));
          queries.push(supabase.from('sale_installments').select('*'));
        }

        const results = await Promise.all(queries);
        
        setData({
          transactions: results[0].data || [],
          products: results[1]?.data || [],
          sales: results[2]?.data || [],
          installments: results[3]?.data || []
        });
      } catch (err) {
        console.error("Erro no dashboard:", err);
        setError("Não foi possível carregar os dados.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [isCricasUser]);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getUTCMonth();
    const currentYear = now.getUTCFullYear();
    const categoryExpenses = {};
    const personal = data.transactions.reduce((acc, t) => {
      const transactionDate = new Date(t.date);
      if (transactionDate.getUTCMonth() === currentMonth && transactionDate.getUTCFullYear() === currentYear) {
        const amt = parseFloat(t.amount || 0);
        if (t.type === 'receita') {
          acc.income += amt;
        } else {
          acc.expense += amt;
          const catName = t.categories?.name || 'Sem Categoria';
          categoryExpenses[catName] = (categoryExpenses[catName] || 0) + amt;
        }
      }
      return acc;
    }, { income: 0, expense: 0 });

    const personalPieData = Object.entries(categoryExpenses).map(([name, value]) => ({ name, value }));
    const personalBarData = [{ name: 'Mês Atual', receitas: personal.income, despesas: personal.expense }];

    const inventoryDist = {};
    const store = data.products.reduce((acc, p) => {
        const cost = parseFloat(p.cost_price || 0);
        const qty = parseInt(p.quantity || 0);

        if (p.status === 'estoque') {
          acc.invested += (cost * qty);
          acc.stockCount += qty;
        }
        return acc;
    }, { invested: 0, stockCount: 0, revenue: 0, pending: 0 });

    data.sales.forEach(s => {
      store.revenue += parseFloat(s.down_payment || 0);
    });

    data.installments.forEach(i => {
      if (i.status === 'pago') store.revenue += parseFloat(i.amount || 0);
      else store.pending += parseFloat(i.amount || 0);
    });

    const storePieData = Object.entries(inventoryDist).map(([name, value]) => ({ name, value }));
    const storeBarData = [{ name: 'Fluxo de Caixa', receitas: store.revenue, despesas: store.invested }];

    return { 
      personal, 
      store, 
      personalPieData, 
      personalBarData, 
      storePieData, 
      storeBarData 
    };
  }, [data]);

  if (isLoading) return <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  const userName = user?.user_metadata?.name || user?.email || "Usuário";

  return (
    <>
      <div className="mb-4">
        <h1 className="h2 mb-1">Olá, {userName}!</h1>
        <p className="text-muted">Bem-vindo ao seu painel de controle.</p>
      </div>

      {!isCricasUser ? (
        <>
          <h5 className="mb-3 text-secondary">FINANÇAS PESSOAIS (Mês Atual)</h5>
          <Row className="mb-4">
            <Col md={4} className="mb-3"><BalanceCard title="Receitas" amount={stats.personal.income} type="income" /></Col>
            <Col md={4} className="mb-3"><BalanceCard title="Despesas" amount={stats.personal.expense} type="expense" /></Col>
            <Col md={4} className="mb-3"><BalanceCard title="Saldo" amount={stats.personal.income - stats.personal.expense} type="balance" /></Col>
          </Row>
          <TransactionsChart 
            barChartData={stats.personalBarData} 
            pieChartData={stats.personalPieData} 
          />
        </>
      ) : (
        <>
          <h5 className="mb-3 text-primary">LOJA CRICASTECH</h5>
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm p-3 text-center h-100">
                <Package className="text-primary mb-2 mx-auto" size={28} />
                <small className="text-muted d-block text-uppercase">Em Estoque</small>
                <h3 className="mb-0 fw-bold">{stats.store.stockCount}</h3>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm p-3 text-center h-100">
                <DollarSign className="text-danger mb-2 mx-auto" size={28} />
                <small className="text-muted d-block text-uppercase">Total Investido</small>
                <h4 className="mb-0 fw-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.store.invested)}</h4>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm p-3 text-center h-100">
                <TrendingUp className="text-success mb-2 mx-auto" size={28} />
                <small className="text-muted d-block text-uppercase">Já Recebido</small>
                <h4 className="mb-0 fw-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.store.revenue)}</h4>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="border-0 shadow-sm p-3 text-center h-100">
                <Clock className="text-warning mb-2 mx-auto" size={28} />
                <small className="text-muted d-block text-uppercase">Pendente (Parcelas)</small>
                <h4 className="mb-0 fw-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.store.pending)}</h4>
              </Card>
            </Col>
          </Row>
          
          {/* Gráficos para a Loja */}
          <TransactionsChart 
            barChartData={stats.storeBarData} 
            pieChartData={stats.storePieData} 
          />
          <Row className="mt-2 px-3">
             <Col className="text-muted small">
                * O gráfico de barras compara o <strong>Total Recebido</strong> vs <strong>Total Investido</strong> em estoque atual. 
                O gráfico de pizza mostra a <strong>Distribuição de Produtos</strong> por categoria.
             </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardPage;