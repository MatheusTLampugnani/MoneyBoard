import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Sidebar component', () => {
  it('should render standard menu items for regular user', () => {
    useAuth.mockReturnValue({ isCricasUser: false });

    render(
      <MemoryRouter>
        <Sidebar isSidebarOpen={true} setIsSidebarOpen={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText('MoneyBoard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transações')).toBeInTheDocument();
    // Cricas-specific should not exist
    expect(screen.queryByText('Meu Estoque')).not.toBeInTheDocument();
  });

  it('should render CricasTech menu items for Cricas user', () => {
    useAuth.mockReturnValue({ isCricasUser: true });

    render(
      <MemoryRouter>
        <Sidebar isSidebarOpen={true} setIsSidebarOpen={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Cricas/i)).toBeInTheDocument();
    expect(screen.getByText(/Tech/i)).toBeInTheDocument();
    expect(screen.getByText('Meu Estoque')).toBeInTheDocument();
    expect(screen.getByText('Registrar Venda')).toBeInTheDocument();
    // Regular personal links should not exist
    expect(screen.queryByText('Transações')).not.toBeInTheDocument();
  });
});
