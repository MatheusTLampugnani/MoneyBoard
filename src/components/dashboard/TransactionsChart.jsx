import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const TransactionsChart = ({ barChartData, pieChartData }) => {
  const { isCricasUser } = useAuth(); // Importado para evitar erro de variável não definida

  // Paleta de cores mais moderna e suave
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316'];
  
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  const formatQuantity = (value) => `${value} un.`;

  return (
    <Row className="mt-4">
      {/* GRÁFICO DE BARRAS */}
      <Col lg={7} className="mb-4">
        <Card className="shadow-sm h-100 border-0 rounded-4">
          <Card.Body>
            <Card.Title className="fw-bold text-muted mb-4">
              {isCricasUser ? "Fluxo de Caixa (Recebido vs Investido)" : "Receitas vs. Despesas"}
            </Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                {/* Remove linhas verticais para ficar mais clean */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6c757d'}} />
                <YAxis tickFormatter={(value) => `R$${value}`} axisLine={false} tickLine={false} tick={{fill: '#6c757d'}} />
                <Tooltip 
                  formatter={formatCurrency} 
                  cursor={{fill: '#f8f9fa'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                {/* Bordas arredondadas no topo das barras (radius) */}
                <Bar dataKey="receitas" fill="#10b981" name={isCricasUser ? "Recebido (Caixa)" : "Receitas"} radius={[6, 6, 0, 0]} />
                <Bar dataKey="despesas" fill="#ef4444" name={isCricasUser ? "Investido (Estoque)" : "Despesas"} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
      
      {/* GRÁFICO DE PIZZA (DONUT) */}
      <Col lg={5} className="mb-4">
        <Card className="shadow-sm h-100 border-0 rounded-4">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="fw-bold text-muted mb-4">
              {isCricasUser ? "Distribuição do Estoque" : "Despesas por Categoria"}
            </Card.Title>
            <div style={{ flex: 1, minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={pieChartData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={75} /* Cria o buraco no meio (Donut) */
                    outerRadius={100}
                    paddingAngle={3} /* Espaçamento entre as fatias */
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    /* Se for Cricas mostra "X un.", se for Finanças mostra "R$ X" */
                    formatter={isCricasUser ? formatQuantity : formatCurrency} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    formatter={(value) => <span className="text-muted small fw-bold">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionsChart;