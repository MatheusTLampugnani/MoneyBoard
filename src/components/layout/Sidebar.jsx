import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav, CloseButton } from 'react-bootstrap';
import { LayoutDashboard, ArrowLeftRight, Shapes, Target, Banknote } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const navLinks = [
    { to: '/', text: 'Dashboard', icon: LayoutDashboard },
    { to: '/transactions', text: 'Transações', icon: ArrowLeftRight },
    { to: '/categories', text: 'Categorias', icon: Shapes },
    { to: '/goals', text: 'Metas', icon: Target },
  ];

  return (
    <>
      {isSidebarOpen && (
        <div
          className="d-md-none sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar bg-dark text-white ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header d-flex align-items-center justify-content-between p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <Banknote className="text-primary me-2" size={32} />
            <h1 className="h4 mb-0 text-white">MoneyBoard</h1>
          </div>
          <CloseButton variant="white" className="d-md-none" onClick={() => setIsSidebarOpen(false)} />
        </div>

        <Nav className="flex-column p-3">
          {navLinks.map((link) => (
            <Nav.Item key={link.to}>
              <Nav.Link
                as={NavLink}
                to={link.to}
                end
                className="d-flex align-items-center py-2 px-3 my-1 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                <link.icon className="me-3" size={20} />
                <span>{link.text}</span>
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </aside>
    </>
  );
};

export default Sidebar;