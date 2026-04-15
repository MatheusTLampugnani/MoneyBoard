import React from 'react';
import { Container, Dropdown, Nav } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Bell, Settings } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const userName = user?.user_metadata?.name || 'Usuário';

  return (
    <header className="main-header shadow-sm">
      <Container fluid className="d-flex align-items-center justify-content-between px-4 py-2">
        <div className="d-none d-md-block">
          <span className="text-muted small">Bem-vindo de volta,</span>
          <h6 className="mb-0 fw-bold text-dark">{userName}</h6>
        </div>

        <div className="d-flex align-items-center gap-3">
          <Nav.Link className="text-muted p-2 hover-bg-light rounded-circle">
            <Bell size={20} />
          </Nav.Link>
          
          <div className="header-divider mx-2"></div>

          <Dropdown align="end">
            <Dropdown.Toggle variant="link" id="dropdown-user" className="d-flex align-items-center p-0 text-decoration-none border-0 custom-dropdown-toggle">
              <div className="user-avatar-circle bg-primary text-white me-2">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="d-none d-sm-block text-start me-2">
                <p className="user-name-text mb-0">{userName}</p>
                <small className="user-status-text">Online</small>
              </div>
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 mt-2">
              <Dropdown.Header>Minha Conta</Dropdown.Header>
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <User size={16} /> Perfil
              </Dropdown.Item>
              <Dropdown.Item className="d-flex align-items-center gap-2">
                <Settings size={16} /> Configurações
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={logout} className="d-flex align-items-center gap-2 text-danger">
                <LogOut size={16} /> Sair do Sistema
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </header>
  );
};

export default Header;