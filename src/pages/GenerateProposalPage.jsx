import React, { useState } from 'react';
import { Row, Col, Card, Form, Alert } from 'react-bootstrap';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Printer, Settings, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import cricasLogo from '../assets/cricas-logo.jpeg';
import './GenerateProposalPage.css';

const GenerateProposalPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: 'Upgrade de Hardware',
    date: new Date().toISOString().split('T')[0],
    amount: '1800.00',
    clientItems: 'Processador: Ryzen 5 5500 (Usado)\nPlaca-Mãe: B450 HDV (Usada)',
    cricasItems: 'Processador Ryzen 7 5700: R$ 1.200,00\nPlaca ASUS TUF A520M WIFI: R$ 900,00\nKit Fans: Rise Reverse R$ 300,00 (Incluso)'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    if (!val) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const renderList = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      const parts = line.split(':');
      if (parts.length > 1) {
        return (
          <li key={idx}>
            <strong>{parts[0]}:</strong>{parts.slice(1).join(':')}
          </li>
        );
      }
      return <li key={idx}>{line}</li>;
    });
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4 no-print">
        <div className="d-flex align-items-center gap-3">
          <h1 className="h2 mb-0">Gerar Proposta/Orçamento</h1>
        </div>
        <Button onClick={handlePrint} icon={<Printer />}>Imprimir Proposta</Button>
      </div>

      <Row className="no-print mb-5">
        <Col md={12}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3">
              <h5 className="mb-0 text-primary fw-bold"><Settings size={18} className="me-2 mb-1" />Dados da Proposta</h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Row>
                  <Col md={4}>
                    <Input label="Título da Proposta" name="title" value={formData.title} onChange={handleChange} />
                  </Col>
                  <Col md={4}>
                    <Input label="Data" type="date" name="date" value={formData.date} onChange={handleChange} />
                  </Col>
                  <Col md={4}>
                    <Input label="Valor do Investimento (R$)" type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} />
                  </Col>
                </Row>
                <Row className="mt-3">
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Componentes do Cliente (Um por linha, formato 'Nome: Detalhe')</Form.Label>
                      <Form.Control as="textarea" rows={6} name="clientItems" value={formData.clientItems} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Componentes CricasTech (Um por linha, formato 'Nome: Detalhe')</Form.Label>
                      <Form.Control as="textarea" rows={6} name="cricasItems" value={formData.cricasItems} onChange={handleChange} />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ÁREA DE IMPRESSÃO */}
      <div className="proposal-print-container">
        <div className="proposal-card">
          <div className="proposal-header">
            <div className="proposal-header-content">
              <div className="proposal-header-top">
                <div>
                  <div className="proposal-header-title">PROPOSTA DE VALOR</div>
                  <div className="proposal-header-number">{formData.title}</div>
                </div>
                <div className="proposal-header-date">
                  <span className="proposal-header-date-label">Data:</span> {formatDate(formData.date)}
                </div>
              </div>
            </div>
          </div>

          <div className="proposal-divider"></div>

          <div className="proposal-value-section">
            <div className="proposal-value-label">Investimento Proposto</div>
            <div className="proposal-value-amount">{formatCurrency(formData.amount)}</div>
          </div>

          <div className="proposal-content">
            <div className="proposal-logo-section">
              <img src={cricasLogo} alt="Logo CricasTech" className="proposal-logo-image" />
            </div>

            <div className="proposal-section">
              <div className="proposal-section-title">Visão Geral da Proposta</div>
              <div className="proposal-text-block">A CricasTech tem o prazer de apresentar uma proposta de upgrade de hardware cuidadosamente elaborada para otimizar o desempenho do seu sistema. Nosso objetivo é fornecer uma solução de alta qualidade que garanta maior eficiência e longevidade para suas operações, utilizando componentes de última geração e oferecendo um excelente custo-benefício.</div>
            </div>

            {(formData.clientItems || formData.cricasItems) && (
              <div className="proposal-section">
                <div className="proposal-section-title">Detalhes da Transação</div>
                <div className="proposal-items-grid">
                  {formData.clientItems && (
                    <div className="proposal-item-card">
                      <div className="proposal-item-card-title">Componentes Recebidos (Cliente)</div>
                      <div className="proposal-item-details">
                        <ul>{renderList(formData.clientItems)}</ul>
                      </div>
                    </div>
                  )}
                  {formData.cricasItems && (
                    <div className="proposal-item-card">
                      <div className="proposal-item-card-title">Componentes Fornecidos (CricasTech)</div>
                      <div className="proposal-item-details">
                        <ul>{renderList(formData.cricasItems)}</ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="proposal-section">
              <div className="proposal-section-title">Benefícios do Upgrade</div>
              <div className="proposal-text-block">Este upgrade representa um salto significativo em capacidade de processamento e estabilidade do sistema. O Ryzen 7 5700, combinado com a placa-mãe Asus TUF A520M-PLUS WIFI, proporcionará um desempenho superior para multitarefas, aplicações exigentes e uma experiência de uso mais fluida e responsiva. Além disso, a utilização de componentes novos garante maior confiabilidade e acesso às tecnologias mais recentes.</div>
            </div>

            <div className="proposal-section">
              <div className="proposal-section-title">Serviços Adicionais</div>
              <div className="proposal-service-card">
                <div className="proposal-service-card-title">Limpeza Completa do Sistema</div>
                <div className="proposal-service-details">Como cortesia da CricasTech, realizaremos uma limpeza interna completa do seu sistema. Este serviço garante a remoção de poeira e otimiza o fluxo de ar, contribuindo para a longevidade e o desempenho ideal dos seus componentes.</div>
              </div>
            </div>
          </div>

          <div className="proposal-footer">
            <div className="proposal-footer-text">
              Proposta de Valor elaborada pela CricasTech com garantia de 90 dias. Para mais informações, entre em contato conosco.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GenerateProposalPage;
