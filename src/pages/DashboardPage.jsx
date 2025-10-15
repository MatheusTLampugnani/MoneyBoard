import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import BalanceCard from '../components/dashboard/BalanceCard';
import TransactionsChart from '../components/dashboard/TransactionsChart';
import { Spinner, Row, Col, Alert } from 'react-bootstrap';

const DashboardPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('transactions')
          .select('*, categories(name)');

        if (fetchError) throw fetchError;
        setTransactions(data || []);
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
        setError("Não foi possível carregar os dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const financialSummary = useMemo(() => {
    if (!transactions) return { income: 0, expense: 0, balance: 0, pieData: [], barData: [] };
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    let monthIncome = 0;
    let monthExpense = 0;
    const categoryExpenses = {};

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (transactionDate.getUTCMonth() === currentMonth && transactionDate.getUTCFullYear() === currentYear) {
        if (t.type === 'receita') {
          monthIncome += parseFloat(t.amount);
        } else {
          monthExpense += parseFloat(t.amount);
          const categoryName = t.categories?.name || 'Sem Categoria';
          categoryExpenses[categoryName] = (categoryExpenses[categoryName] || 0) + parseFloat(t.amount);
        }
      }
    });

    const pieData = Object.entries(categoryExpenses).map(([name, value]) => ({ name, value }));
    const barData = [{ name: 'Mês Atual', receitas: monthIncome, despesas: monthExpense }];
    
    return { income: monthIncome, expense: monthExpense, balance: monthIncome - monthExpense, pieData, barData };
  }, [transactions]);

  if (isLoading) {
    return <div className="text-center"><Spinner animation="border" variant="primary" /></div>;
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  const userName = user?.user_metadata?.name || user?.email || "Usuário";

  return (
    <>
      <h1 className="h2 mb-1">Olá, {userName}!</h1>
      <p className="text-muted mb-4">Aqui está o resumo das suas finanças.</p>
      <Row>
        <Col md={4} className="mb-3"><BalanceCard title="Receitas do Mês" amount={financialSummary.income} type="income" /></Col>
        <Col md={4} className="mb-3"><BalanceCard title="Despesas do Mês" amount={financialSummary.expense} type="expense" /></Col>
        <Col md={4} className="mb-3"><BalanceCard title="Saldo do Mês" amount={financialSummary.balance} type="balance" /></Col>
      </Row>
      <TransactionsChart barChartData={financialSummary.barData} pieChartData={financialSummary.pieData} />
    </>
  );
};

export default DashboardPage;