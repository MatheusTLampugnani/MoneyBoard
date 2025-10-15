import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TransactionsChart = ({ barChartData, pieChartData }) => {
  const PIE_COLORS = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Row className="mt-4">
      <Col lg={7} className="mb-4">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Receitas vs. Despesas</Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `R$${value*1}`} />
                <Tooltip formatter={formatCurrency} />
                <Legend />
                <Bar dataKey="receitas" fill="#198754" name="Receitas" />
                <Bar dataKey="despesas" fill="#dc3545" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5} className="mb-4">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>Despesas por Categoria</Card.Title>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatCurrency} />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default TransactionsChart;