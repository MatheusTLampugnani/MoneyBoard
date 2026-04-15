import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Row, Col } from 'react-bootstrap';
import Button from '../components/common/Button';
import { Download, ArrowLeft, FileCheck } from 'lucide-react';

const GenerateReceiptPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const sale = state?.sale;

  if (!sale) return <Navigate to="/sold" />;

  const generatePDF = () => {
    const doc = new jsPDF();
    const dateStr = new Date(sale.sale_date).toLocaleDateString('pt-BR');
    const blueCricas = [0, 51, 102];
    const goldCricas = [255, 215, 0];

    doc.setFillColor(...blueCricas);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("CRICASTECH", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(...goldCricas);
    doc.text("COMPROVANTE DE VENDA E GARANTIA", 105, 30, { align: "center" });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text(`Nº do Recibo: #${sale.id.slice(0, 8).toUpperCase()}`, 14, 55);
    doc.text(`Data da Venda: ${dateStr}`, 14, 62);

    autoTable(doc, {
      startY: 70,
      head: [['Descrição do Produto', 'Categoria', 'Valor Total']],
      body: [
        [
          sale.products?.name || 'Produto não identificado',
          sale.products?.category || 'Geral',
          `R$ ${parseFloat(sale.final_sale_price).toFixed(2)}`
        ]
      ],
      headStyles: { fillColor: blueCricas, textColor: [255, 255, 255] },
      theme: 'grid'
    });

    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Resumo Financeiro", 14, finalY);

    const financeBody = [
      ['Valor Total do Produto', `R$ ${parseFloat(sale.final_sale_price).toFixed(2)}`],
      ['Entrada / Valor à Vista', `R$ ${parseFloat(sale.down_payment).toFixed(2)}`],
      ['Saldo Pendente (Parcelado)', `R$ ${(sale.final_sale_price - sale.down_payment).toFixed(2)}`]
    ];

    autoTable(doc, {
      startY: finalY + 5,
      body: financeBody,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } }
    });

    if (sale.sale_installments && sale.sale_installments.length > 0) {
      doc.setFontSize(14);
      doc.text("Cronograma de Parcelas", 14, doc.lastAutoTable.finalY + 15);
      
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 20,
        head: [['Parcela', 'Vencimento', 'Valor', 'Meio', 'Status']],
        body: sale.sale_installments.map((inst, index) => [
          `${index + 1}ª`,
          new Date(inst.due_date).toLocaleDateString('pt-BR'),
          `R$ ${parseFloat(inst.amount).toFixed(2)}`,
          inst.payment_method,
          inst.status.toUpperCase()
        ]),
        headStyles: { fillColor: [100, 100, 100] }
      });
    }

    const footerY = 270;
    doc.setDrawColor(200, 200, 200);
    doc.line(60, footerY, 150, footerY);
    doc.setFontSize(10);
    doc.text("Assinatura do Cliente", 105, footerY + 5, { align: "center" });
    
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Obrigado pela preferência! CRICASTECH - Qualidade e Confiança.", 105, 285, { align: "center" });

    doc.save(`Recibo_CRICASTECH_${sale.products?.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="container py-5">
      <Button variant="link" onClick={() => navigate('/sold')} className="mb-4 p-0">
        <ArrowLeft size={20} className="me-1"/> Voltar para Vendidos
      </Button>

      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0 overflow-hidden">
            <div style={{ backgroundColor: '#003366', padding: '30px' }} className="text-center text-white">
              <FileCheck size={48} className="mb-3" style={{ color: '#FFD700' }}/>
              <h2 className="mb-0">Recibo Pronto</h2>
              <p className="opacity-75">Venda: {sale.products?.name}</p>
            </div>
            
            <Card.Body className="p-5 text-center">
              <div className="mb-4">
                <p className="text-muted mb-1">Valor Total</p>
                <h1 className="display-5 fw-bold text-dark">
                  R$ {parseFloat(sale.final_sale_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h1>
              </div>
              
              <div className="alert alert-light border d-inline-block px-4">
                <strong>Status:</strong> {sale.sale_installments?.length > 0 ? '📝 Parcelado' : '✅ Pago'}
              </div>

              <hr className="my-4" />
              
              <div className="d-grid gap-2">
                <Button onClick={generatePDF} size="lg" icon={<Download />}>
                  Baixar Recibo em PDF
                </Button>
                <small className="text-muted mt-2">
                  O PDF inclui papel timbrado, tabela de parcelas e campo para assinatura.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default GenerateReceiptPage;