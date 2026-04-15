import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, CloseButton } from 'react-bootstrap';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Shapes,
  Target,
  Banknote,
  Package,
  ShoppingBag,
  Tag
} from 'lucide-react';
import './Sidebar.css';
import { useAuth } from '../../context/AuthContext';
import cricasLogo from '../../assets/cricas-logo.jpeg';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { isCricasUser } = useAuth();

  const commonLinks = [
    { to: '/', text: 'Dashboard', icon: LayoutDashboard },
  ];

  const personalLinks = [
    { to: '/transactions', text: 'Transações', icon: ArrowLeftRight },
    { to: '/categories', text: 'Categorias', icon: Shapes },
    { to: '/goals', text: 'Metas', icon: Target },
    { to: '/accounts', text: 'Contas', icon: Banknote },
  ];

  const cricasLinks = [
    { to: '/inventory', text: 'Meu Estoque', icon: Package },
    { to: '/sold', text: 'Produtos Vendidos', icon: ShoppingBag },
    { to: '/new-sale', text: 'Registrar Venda', icon: Tag },
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
              <>
                <Banknote className="text-primary me-2" size={32} />
                <h1 className="h4 mb-0 text-white">MoneyBoard</h1>
              </>
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
        </Nav>
      </aside>
    </>
  );
};

export default Sidebar;