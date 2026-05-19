import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShoppingBag, Calendar, User, Tag, Eye, FileText, Trash2 } from 'lucide-react';
import { Spinner, Alert, Card, Table, Modal, Button } from 'react-bootstrap';

const SoldPage = () => {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  const fetchSales = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('sales')
        .select(`
          *,
          products (
            name
          ),
          sale_installments (*)
        `)
        .order('sale_date', { ascending: false });

      if (fetchError) throw fetchError;

      setSales(data || []);
    } catch (err) {
      console.error("Erro ao buscar vendas:", err);
      setError("Não foi possível carregar o histórico de vendas.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const handleOpenDetails = (sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedSale(null);
    setShowDetailsModal(false);
  };

  const toggleInstallmentStatus = async (installmentId, currentStatus) => {
    const newStatus = (currentStatus === 'pendente') ? 'pago' : 'pendente';

    try {
      const { error: updateError } = await supabase
        .from('sale_installments')
        .update({ status: newStatus })
        .eq('id', installmentId);

      if (updateError) throw updateError;

      const updatedInstallments = selectedSale.sale_installments.map(inst =>
        inst.id === installmentId ? { ...inst, status: newStatus } : inst
      );

      setSelectedSale({ ...selectedSale, sale_installments: updatedInstallments });

      setSales(prevSales => prevSales.map(sale =>
        sale.id === selectedSale.id ? { ...sale, sale_installments: updatedInstallments } : sale
      ));

    } catch (err) {
      console.error("Erro ao atualizar parcela:", err);
      alert("Erro ao atualizar o status da parcela. Verifique a sua conexão.");
    }
  };

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h1 className="h2 mb-0 d-flex align-items-center">
          <ShoppingBag className="me-2 text-primary" size={28} />
          Produtos Vendidos
        </h1>
      </div>

      {isLoading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Carregando vendas e faturamento...</p>
        </div>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <Card className="shadow-sm border-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Produto</th>
                <th>Cliente</th>
                <th>Preço Final</th>
                <th>Pagamento</th>
                <th>Data</th>
                <th className="text-end">Ações</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => {
                const totalParcelas = sale.sale_installments?.length || 0;

                const temPendente = sale.sale_installments?.some(p => p.status === 'pendente');

                return (
                  <tr key={sale.id}>
                    <td className="align-middle">
                      <div className="fw-bold text-dark">
                        {sale.products?.name || 'Produto não encontrado'}
                      </div>
                      <small className="text-muted d-block">Qtd: {sale.quantity}</small>
                    </td>

                    <td className="align-middle text-secondary fw-semibold">
                      {sale.customer_name || 'CLIENTE PADRÃO'}
                    </td>
                    <td className="align-middle fw-bold text-dark">
                      {formatCurrency(sale.final_sale_price)}
                    </td>

                    <td className="align-middle">
                      {totalParcelas > 0 ? (
                        <span className={`badge ${temPendente ? 'bg-warning text-dark' : 'bg-success'} p-2 px-3 rounded-pill fw-bold`}>
                          {temPendente ? `Parcelado ${totalParcelas}x` : 'Totalmente Pago'}
                        </span>
                      ) : (
                        <span className="badge bg-success p-2 px-3 rounded-pill fw-bold">
                          Pago
                        </span>
                      )}
                    </td>

                    <td className="align-middle text-muted">
                      {formatDate(sale.sale_date)}
                    </td>

                    <td className="text-end align-middle">
                      <div className="d-flex justify-content-end gap-1">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleOpenDetails(sale)}
                          title="Ver detalhes e parcelas"
                        >
                          <Eye size={16} />
                        </Button>
                        <Button variant="outline-secondary" size="sm" title="Gerar Recibo">
                          <FileText size={16} />
                        </Button>
                        <Button variant="outline-danger" size="sm" title="Excluir Registro">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {sales.length === 0 && (
            <div className="text-center py-5 text-muted">
              Nenhuma venda localizada nesta conta.
            </div>
          )}
        </Card>
      )}

      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="h5 fw-bold">
            Detalhes do Fluxo de Pagamento
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedSale && (
            <>
              <div className="row mb-4 bg-light p-3 rounded mx-1">
                <div className="col-md-6 mb-2 mb-md-0">
                  <span className="text-muted small d-block">Cliente</span>
                  <strong className="text-dark">{selectedSale.customer_name || 'CLIENTE PADRÃO'}</strong>
                </div>
                <div className="col-md-6">
                  <span className="text-muted small d-block">Produto</span>
                  <strong className="text-dark">{selectedSale.products?.name}</strong>
                </div>
                <div className="col-md-4 mt-3">
                  <span className="text-muted small d-block">Valor Total da Venda</span>
                  <strong className="text-success h5">{formatCurrency(selectedSale.final_sale_price)}</strong>
                </div>
                <div className="col-md-4 mt-3">
                  <span className="text-muted small d-block">Entrada / Valor Inicial</span>
                  <strong className="text-warning h5">{formatCurrency(selectedSale.down_payment)}</strong>
                </div>
                <div className="col-md-4 mt-3">
                  <span className="text-muted small d-block">Data Geral</span>
                  <strong className="text-dark">{formatDate(selectedSale.sale_date)}</strong>
                </div>
              </div>

              <h6 className="fw-bold mb-3 px-1 text-primary">Cronograma de Parcelas Cadastradas</h6>
              <p className="text-muted small px-1 mb-3">Dica: Clique no botão de Status para marcar como pago ou pendente.</p>

              {selectedSale.sale_installments && selectedSale.sale_installments.length > 0 ? (
                <Table responsive bordered hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="text-center" style={{ width: '80px' }}>Nº</th>
                      <th>Vencimento</th>
                      <th className="text-end">Valor da Parcela</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSale.sale_installments
                      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                      .map((installment, index) => {
                        const numParcela = installment.installment_number || installment.numero || installment.parcela || (index + 1);
                        const isPago = installment.status === 'pago' || installment.status === 'paid';

                        return (
                          <tr key={installment.id || index}>
                            <td className="text-center fw-bold">{numParcela}ª</td>
                            <td>{formatDate(installment.due_date)}</td>
                            <td className="text-end fw-bold text-dark">{formatCurrency(installment.amount || installment.valor)}</td>
                            <td className="text-center">
                              <button
                                onClick={() => toggleInstallmentStatus(installment.id, installment.status)}
                                className={`btn btn-sm badge px-3 py-2 rounded-pill border-0 ${isPago ? 'bg-success text-white' : 'bg-danger text-white'}`}
                                style={{ cursor: 'pointer', transition: 'all 0.2s', width: '90px' }}
                                title="Clique para mudar o status"
                              >
                                {isPago ? 'Recebido' : 'Pendente'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4 bg-light rounded text-muted border border-dashed">
                  Esta venda foi processada como pagamento único à vista. Não há parcelas futuras pendentes no banco.
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Fechar Janela
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SoldPage;