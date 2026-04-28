import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Plus, Edit, Trash2, BarChart3, List, CreditCard, Wallet } from 'lucide-react';
import { Spinner, Alert, Card, Table, Form, Row, Col, Tabs, Tab } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [accounts, setAccounts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState('list');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatDateForInput = (date) => date ? new Date(date).toISOString().split('T')[0] : '';

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [tRes, cRes, aRes] = await Promise.all([
        supabase.from('transactions').select('*, categories(name), accounts(*)').order('date', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('accounts').select('*').order('name')
      ]);

      if (tRes.error) throw tRes.error;
      if (cRes.error) throw cRes.error;
      if (aRes.error) throw aRes.error;

      setTransactions(tRes.data.map(t => ({ ...t, categoryId: t.category_id, accountId: t.account_id })) || []);
      setCategories(cRes.data || []);
      setAccounts(aRes.data || []);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError("Não foi possível carregar as informações.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getCompetenceKey = (dateStr, account) => {
    const date = new Date(dateStr);
    let month = date.getUTCMonth();
    let year = date.getUTCFullYear();

    if (account?.type === 'credito' && account.closing_day) {
      if (date.getUTCDate() >= account.closing_day) {
        month += 1;
        if (month > 11) { month = 0; year += 1; }
      }
    }
    return `${year}-${String(month + 1).padStart(2, '0')}`;
  };

  const { groupedData, chartData, sortedMonthKeys } = useMemo(() => {
    const groups = {};
    const chartMap = {};

    transactions.forEach(t => {
      const account = accounts.find(a => a.id === t.account_id);
      const monthKey = getCompetenceKey(t.date, account);
      
      const dateObj = new Date(monthKey + '-02');
      const monthLabel = dateObj.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' });

      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(t);

      if (!chartMap[monthKey]) {
        chartMap[monthKey] = { name: monthLabel, receitas: 0, despesas: 0, rawDate: monthKey };
      }
      const amount = parseFloat(t.amount);
      if (t.type === 'receita') chartMap[monthKey].receitas += amount;
      else chartMap[monthKey].despesas += amount;
    });

    const sortedKeys = Object.keys(groups).sort().reverse();
    const sortedChart = Object.values(chartMap).sort((a, b) => a.rawDate.localeCompare(b.rawDate));

    return { groupedData: groups, chartData: sortedChart, sortedMonthKeys: sortedKeys };
  }, [transactions, accounts]);

  const openModalForCreate = () => {
    setCurrentTransaction({ id: null, description: '', amount: '', type: 'despesa', date: formatDateForInput(new Date()), categoryId: '', accountId: '' });
    setIsFormModalOpen(true);
  };

  const openModalForEdit = (t) => {
    setCurrentTransaction({ ...t, date: formatDateForInput(t.date) });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      description: currentTransaction.description,
      amount: parseFloat(currentTransaction.amount),
      type: currentTransaction.type,
      date: currentTransaction.date,
      category_id: currentTransaction.categoryId || null,
      account_id: currentTransaction.accountId || null,
    };

    try {
      const { error } = currentTransaction.id 
        ? await supabase.from('transactions').update(data).eq('id', currentTransaction.id)
        : await supabase.from('transactions').insert([data]);

      if (error) throw error;
      await fetchData();
      setIsFormModalOpen(false);
    } catch (err) { alert("Erro ao salvar: " + err.message); }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', itemToDelete);
      if (error) throw error;
      await fetchData();
    } catch (err) { console.error("Erro ao deletar:", err); }
    finally { setShowDeleteModal(false); setItemToDelete(null); }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2">Transações</h1>
        <div className="d-flex gap-2">
          <Button variant={activeView === 'list' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('list')}>
            <List size={18} />
          </Button>
          <Button variant={activeView === 'chart' ? 'primary' : 'outline-primary'} onClick={() => setActiveView('chart')}>
            <BarChart3 size={18} />
          </Button>
          <Button onClick={openModalForCreate} icon={<Plus />}>Nova</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          {activeView === 'chart' ? (
            <Card className="shadow-sm p-4 mb-4 border-0">
              <Card.Title className="mb-4">Fluxo Mensal (Faturas)</Card.Title>
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(val) => `R$ ${val}`} />
                    <Tooltip formatter={(val) => formatCurrency(val)} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#198754" name="Receitas" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#dc3545" name="Despesas" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          ) : (
            <Tabs defaultActiveKey={sortedMonthKeys[0]} className="mb-4">
              {sortedMonthKeys.map(key => (
                <Tab 
                  eventKey={key} 
                  key={key} 
                  title={new Date(key + '-02').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).toUpperCase()}
                >
                  <Card className="shadow-sm border-0 mt-3">
                    <Table responsive hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Descrição</th>
                          <th>Conta/Cartão</th>
                          <th>Valor</th>
                          <th>Data Compra</th>
                          <th>Fatura/Mês</th>
                          <th className="text-end">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupedData[key].map(t => (
                          <tr key={t.id}>
                            <td className="align-middle">
                              {t.description} <br/>
                              <small className="text-muted">{t.categories?.name || 'Sem categoria'}</small>
                            </td>
                            <td className="align-middle">
                              {t.accounts?.type === 'credito' ? <CreditCard size={14} className="me-1 text-primary"/> : <Wallet size={14} className="me-1 text-success"/>}
                              {t.accounts?.name || 'N/A'}
                            </td>
                            <td className={`align-middle fw-bold ${t.type === 'receita' ? 'text-success' : 'text-danger'}`}>
                              {formatCurrency(t.amount)}
                            </td>
                            <td className="align-middle">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                            <td className="align-middle">
                                <span className="badge bg-secondary p-2 shadow-sm">
                                  {new Date(key + '-02').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).toUpperCase()}
                                </span>
                            </td>
                            <td className="text-end align-middle">
                              <Button variant="link" size="sm" className="text-secondary" onClick={() => openModalForEdit(t)}><Edit size={16}/></Button>
                              <Button variant="link" size="sm" className="text-danger" onClick={() => { setItemToDelete(t.id); setShowDeleteModal(true); }}><Trash2 size={16}/></Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card>
                </Tab>
              ))}
            </Tabs>
          )}
          {transactions.length === 0 && <div className="text-center py-5 text-muted">Nenhuma transação cadastrada.</div>}
        </>
      )}
      
      {/* Modais de Form e Delete mantidos iguais */}
    </>
  );
};

export default TransactionsPage;