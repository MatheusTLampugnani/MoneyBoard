import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, CloseButton, Modal, Table, Card, Button as RBButton } from 'react-bootstrap';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Shapes,
  Target,
  Banknote,
  Package,
  ShoppingBag,
  Tag,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';
import cricasLogo from '../../assets/cricas-logo.jpeg';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { isCricasUser } = useAuth();
  
  // INOVAÇÃO: Estados para o modelo de negócio (Planos)
  const [showPlans, setShowPlans] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  const commonLinks = [
    { to: '/', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/categories', text: 'Categorias', icon: Shapes },
  ];

  const personalLinks = [
    { to: '/transactions', text: 'Transações', icon: ArrowLeftRight },
    { to: '/goals', text: 'Metas', icon: Target },
    { to: '/accounts', text: 'Contas', icon: Banknote },
  ];

  const cricasLinks = [
    { to: '/inventory', text: 'Meu Estoque', icon: Package },
    { to: '/sold', text: 'Produtos Vendidos', icon: ShoppingBag },
    { to: '/new-sale', text: 'Registrar Venda', icon: Tag },
    { to: '/cash-control', text: 'Controle de Caixa', icon: Banknote },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div className="d-md-none sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`sidebar bg-dark text-white ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            {isCricasUser ? (
              <div className="d-flex align-items-center">
                <img
                  src={cricasLogo}
                  alt="CricasTech Logo"
                  style={{
                    height: '42px',
                    width: '42px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                  className="me-2"
                />
                <div>
                  <h1 className="h5 mb-0 fw-bold text-white text-uppercase" style={{ letterSpacing: '1px', fontSize: '1rem' }}>
                    Cricas <span className="text-primary">Tech</span>
                  </h1>
                </div>
              </div>
            ) : (
              <div className="d-flex flex-column">
                <div className="d-flex align-items-center">
                  <Banknote className="text-primary me-2" size={32} />
                  <h1 className="h4 mb-0 text-white">MoneyBoard</h1>
                </div>
                {/* INOVAÇÃO: Crachá indicativo do Plano */}
                <span 
                  className={`badge ${isPremium ? 'bg-info text-dark' : 'bg-warning text-dark'} shadow-sm mt-2`}
                  style={{ cursor: 'pointer', width: 'fit-content', fontSize: '0.7rem' }}
                  onClick={() => setShowPlans(true)}
                >
                  {isPremium ? <><Sparkles size={10} className="me-1"/> PLANO PREMIUM</> : 'PLANO FREEMIUM'}
                </span>
              </div>
            )}
          </div>
          <CloseButton variant="white" className="d-md-none" onClick={() => setIsSidebarOpen(false)} />
        </div>

        <Nav className="flex-column p-3">
          {commonLinks.map((link) => (
            <Nav.Item key={link.to}>
              <Nav.Link as={NavLink} to={link.to} end className="d-flex align-items-center py-2 px-3 my-1 rounded text-decoration-none" onClick={() => setIsSidebarOpen(false)}>
                <link.icon className="me-3" size={20} />
                <span>{link.text}</span>
              </Nav.Link>
            </Nav.Item>
          ))}

          {!isCricasUser && personalLinks.map((link) => (
            <Nav.Item key={link.to}>
              <Nav.Link as={NavLink} to={link.to} className="d-flex align-items-center py-2 px-3 my-1 rounded text-decoration-none" onClick={() => setIsSidebarOpen(false)}>
                <link.icon className="me-3" size={20} />
                <span>{link.text}</span>
              </Nav.Link>
            </Nav.Item>
          ))}

          {isCricasUser && (
            <>
              {cricasLinks.map((link) => (
                <Nav.Item key={link.to}>
                  <Nav.Link as={NavLink} to={link.to} className="d-flex align-items-center py-2 px-3 my-1 rounded text-decoration-none" onClick={() => setIsSidebarOpen(false)}>
                    <link.icon className="me-3" size={20} />
                    <span>{link.text}</span>
                  </Nav.Link>
                </Nav.Item>
              ))}
            </>
          )}

          {/* INOVAÇÃO: Call to Action para o Upgrade (Apenas no MoneyBoard Freemium) */}
          {!isCricasUser && !isPremium && (
            <div className="mt-4 p-3 rounded text-center border border-secondary" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <small className="text-light d-block mb-2">Tenha recursos ilimitados</small>
              <button 
                className="btn btn-outline-warning btn-sm w-100 fw-bold" 
                onClick={() => setShowPlans(true)}
              >
                Fazer Upgrade
              </button>
            </div>
          )}
        </Nav>
      </aside>

      {/* INOVAÇÃO: Janela Modal de Comparação de Planos */}
      <Modal show={showPlans} onHide={() => setShowPlans(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Escolha o seu Plano</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Table responsive borderless className="align-middle">
            <thead>
              <tr className="text-center">
                <th className="text-start">Funcionalidade</th>
                <th className="p-3 bg-light rounded-top">Freemium (Grátis)</th>
                <th className="p-3 bg-primary-soft rounded-top text-primary" style={{ backgroundColor: 'rgba(13, 110, 253, 0.1)' }}>Premium (R$ 9,90)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Contas e Cartões</td>
                <td className="text-center">Até 2 contas</td>
                <td className="text-center fw-bold">Ilimitado</td>
              </tr>
              <tr>
                <td>Inteligência de Fatura (Cartões)</td>
                <td className="text-center"><X size={18} className="text-danger" /></td>
                <td className="text-center"><Check size={18} className="text-success" /></td>
              </tr>
              <tr>
                <td>Assistente de Metas (Cálculo de Aporte)</td>
                <td className="text-center"><X size={18} className="text-danger" /></td>
                <td className="text-center"><Check size={18} className="text-success" /></td>
              </tr>
              <tr>
                <td>Relatórios em PDF</td>
                <td className="text-center"><X size={18} className="text-danger" /></td>
                <td className="text-center"><Check size={18} className="text-success" /></td>
              </tr>
              <tr>
                <td>Categorias Personalizadas</td>
                <td className="text-center">Básico</td>
                <td className="text-center fw-bold text-success">Total</td>
              </tr>
            </tbody>
          </Table>

          <div className="d-flex flex-column flex-md-row gap-3 mt-4">
            <Card className="flex-fill p-3 border-0 bg-light text-center">
              <h5>Plano Atual</h5>
              <RBButton variant="secondary" disabled className="w-100 mt-2">Ativo</RBButton>
            </Card>
            <Card className="flex-fill p-3 border-primary text-center shadow-sm" style={{ backgroundColor: 'rgba(13, 110, 253, 0.05)' }}>
              <h5 className="text-primary fw-bold">Plano Premium</h5>
              <RBButton 
                variant="primary" 
                className="w-100 mt-2 fw-bold"
                onClick={() => { setIsPremium(true); setShowPlans(false); }}
              >
                Assinar Agora
              </RBButton>
            </Card>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Sidebar;