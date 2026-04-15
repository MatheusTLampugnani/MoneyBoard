import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/dashboard/BalanceCard';
import TransactionsChart from '../components/dashboard/TransactionsChart';
import { Spinner, Row, Col, Alert, Card } from 'react-bootstrap';
// ADICIONADO: ShoppingCart
import { Package, TrendingUp, Clock, Wallet, ShoppingCart } from 'lucide-react'; 

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

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

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

    const store = data.products.reduce((acc, p) => {
        const cost = parseFloat(p.cost_price || 0);
        const expected = parseFloat(p.expected_price || 0);
        const qty = parseInt(p.quantity || 0);

        if (p.status === 'estoque') {
          acc.invested += (cost * qty);
          acc.stockCount += qty;
          acc.expectedProfit += (expected - cost) * qty;
          
          const cat = p.category || 'Sem Categoria';
          acc.categories[cat] = (acc.categories[cat] || 0) + qty;
        }
        return acc;
    // ADICIONADO: totalSalesValue e itemsSold na inicialização
    }, { invested: 0, stockCount: 0, expectedProfit: 0, categories: {}, revenue: 0, pending: 0, totalSalesValue: 0, itemsSold: 0 });

    data.sales.forEach(s => {
      store.revenue += parseFloat(s.down_payment || 0);
      // ADICIONADO: Cálculos de faturamento total e quantidade
      store.totalSalesValue += parseFloat(s.final_sale_price || 0); 
      store.itemsSold += parseInt(s.quantity || 1);
    });

    data.installments.forEach(i => {
      if (i.status === 'pago') store.revenue += parseFloat(i.amount || 0);
      else store.pending += parseFloat(i.amount || 0);
    });

    const storePieData = Object.entries(store.categories).map(([name, value]) => ({ name, value }));
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
          <h5 className="mb-3 text-primary fw-bold">VISÃO GERAL - CRICASTECH</h5>
          
          {/* LINHA 1: FATURAMENTO E RECEBIMENTOS */}
          <Row className="g-3 mb-3">
            <Col md={12} lg={4}>
              <Card className="p-3 border-0 shadow-sm bg-info text-white h-100">
                <div className="d-flex justify-content-between">
                  <small className="fw-bold opacity-75">FATURAMENTO TOTAL</small>
                  <ShoppingCart size={20} className="opacity-75" />
                </div>
                <h3 className="fw-bold mt-2 mb-0">{formatCurrency(stats.store.totalSalesValue)}</h3>
                <small className="opacity-75 d-block mt-1">{stats.store.itemsSold} itens vendidos</small>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="p-3 border-0 shadow-sm bg-primary text-white h-100">
                <div className="d-flex justify-content-between">
                  <small className="fw-bold opacity-75">TOTAL EM CAIXA</small>
                  <Wallet size={20} className="opacity-50" />
                </div>
                <h3 className="fw-bold mt-2 mb-0">{formatCurrency(stats.store.revenue)}</h3>
                <small className="opacity-75 d-block mt-1">Entradas + Parcelas pagas</small>
              </Card>
            </Col>

            <Col md={6} lg={4}>
              <Card className="p-3 border-0 shadow-sm bg-warning text-dark h-100">
                <div className="d-flex justify-content-between">
                  <small className="fw-bold opacity-75">A RECEBER</small>
                  <Clock size={20} className="opacity-50" />
                </div>
                <h3 className="fw-bold mt-2 mb-0">{formatCurrency(stats.store.pending)}</h3>
                <small className="opacity-75 d-block mt-1">Parcelas pendentes</small>
              </Card>
            </Col>
          </Row>

          {/* LINHA 2: ESTOQUE E INVESTIMENTOS */}
          <Row className="g-3 mb-4">
            <Col md={6} lg={6}>
              <Card className="p-3 border-0 shadow-sm bg-white h-100">
                <div className="d-flex justify-content-between">
                  <small className="fw-bold text-muted">TOTAL INVESTIDO</small>
                  <Package size={20} className="text-muted" />
                </div>
                <h3 className="fw-bold mt-2 mb-0 text-dark">{formatCurrency(stats.store.invested)}</h3>
                <small className="text-muted d-block mt-1">{stats.store.stockCount} itens em estoque</small>
              </Card>
            </Col>

            <Col md={6} lg={6}>
              <Card className="p-3 border-0 shadow-sm bg-success text-white h-100">
                <div className="d-flex justify-content-between">
                  <small className="fw-bold opacity-75">LUCRO ESPERADO</small>
                  <TrendingUp size={20} className="opacity-50" />
                </div>
                <h3 className="fw-bold mt-2 mb-0">{formatCurrency(stats.store.expectedProfit)}</h3>
                <small className="opacity-75 d-block mt-1">Do estoque atual</small>
              </Card>
            </Col>
          </Row>
          
          <TransactionsChart 
            barChartData={stats.storeBarData} 
            pieChartData={stats.storePieData} 
          />
          <Row className="mt-2 px-3">
             <Col className="text-muted small">
               * O gráfico de barras compara o <strong>Total Recebido (Caixa)</strong> com o <strong>Total Investido</strong> em estoque no momento. 
               O gráfico de pizza reflete a <strong>Distribuição em Quantidade</strong> das categorias no seu estoque.
             </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardPage;