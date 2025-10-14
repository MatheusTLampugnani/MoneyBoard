import React from 'react';
import { Navbar, NavDropdown, Container } from 'react-bootstrap';
import { Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = ({ setIsSidebarOpen }) => {
  const { user, logout } = useAuth();

  return (
    <Navbar bg="white" className="shadow-sm">
      <Container fluid>
        {/* Ícone do Menu para Mobile */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="btn border-0 d-md-none"
        >
          <Menu />
        </button>

        <Navbar.Collapse className="justify-content-end">
          <NavDropdown
            title={
              <div className="d-flex align-items-center">
                <span className="d-none d-sm-inline me-2">{user?.name || "Usuário"}</span>
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                  <User />
                </div>
              </div>
            }
            id="user-profile-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={logout}>
              <LogOut size={16} className="me-2" />
              Sair
            </NavDropdown.Item>
          </NavDropdown>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;