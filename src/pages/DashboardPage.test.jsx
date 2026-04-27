import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  }
}));

// Mocking child components to prevent Recharts rendering issues in jsdom
vi.mock('../components/dashboard/TransactionsChart', () => ({
  __esModule: true,
  default: () => <div data-testid="transactions-chart">Chart Component</div>
}));

vi.mock('../components/dashboard/BalanceCard', () => ({
  __esModule: true,
  default: ({ title, amount }) => <div data-testid="balance-card">{title} - {amount}</div>
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state initially', () => {
    useAuth.mockReturnValue({ user: null, isCricasUser: false });
    // Keep the promise unresolved to check loading state
    const selectMock = vi.fn().mockReturnValue(new Promise(() => {}));
    supabase.from.mockReturnValue({ select: selectMock });

    const { container } = render(<DashboardPage />);
    expect(container.querySelector('.spinner-border')).toBeInTheDocument();
  });

  it('should render personal dashboard successfully', async () => {
    useAuth.mockReturnValue({ 
      user: { user_metadata: { name: 'João' } }, 
      isCricasUser: false 
    });

    const mockTransactions = [{ amount: 100, type: 'receita', date: new Date().toISOString() }];
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: mockTransactions })
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Olá, João!')).toBeInTheDocument();
      expect(screen.getByText('FINANÇAS PESSOAIS (Mês Atual)')).toBeInTheDocument();
    });

    const balanceCards = screen.getAllByTestId('balance-card');
    expect(balanceCards.length).toBe(3); // Receitas, Despesas, Saldo
  });

  it('should render cricastech dashboard successfully', async () => {
    useAuth.mockReturnValue({ 
      user: { user_metadata: { name: 'Cricas' } }, 
      isCricasUser: true 
    });

    supabase.from.mockImplementation((table) => {
      return {
        select: vi.fn().mockResolvedValue({ data: [] })
      }
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Olá, Cricas!')).toBeInTheDocument();
      expect(screen.getByText('VISÃO GERAL - CRICASTECH')).toBeInTheDocument();
    });

    expect(screen.getByText('FATURAMENTO TOTAL')).toBeInTheDocument();
  });

  it('should show error message if fetch fails', async () => {
    useAuth.mockReturnValue({ user: null, isCricasUser: false });
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error('Network error'))
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Não foi possível carregar os dados.')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
