import React from 'react';
import { Card } from 'react-bootstrap';
import { ArrowUpCircle, ArrowDownCircle, DollarSign } from 'lucide-react';

const BalanceCard = ({ title, amount, type = 'balance' }) => {
  const config = {
    balance: { icon: DollarSign, variant: 'primary' },
    income: { icon: ArrowUpCircle, variant: 'success' },
    expense: { icon: ArrowDownCircle, variant: 'danger' },
  };

  const { icon: Icon, variant } = config[type];
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Card className="shadow-sm">
      <Card.Body className="d-flex align-items-center">
        <div className={`p-3 rounded-circle bg-${variant}-soft me-3`}>
          <Icon className={`text-${variant}`} size={32} />
        </div>
        <div>
          <Card.Subtitle className="text-muted mb-1">{title}</Card.Subtitle>
          <Card.Title className="h4 mb-0">{formatCurrency(amount)}</Card.Title>
        </div>
      </Card.Body>
    </Card>
  );
};

export default BalanceCard;