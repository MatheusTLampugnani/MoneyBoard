import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Header component', () => {
  it('should render username correctly', () => {
    useAuth.mockReturnValue({
      user: { user_metadata: { name: 'João Silva' } },
      logout: vi.fn(),
    });

    render(<Header />);
    const elements = screen.getAllByText('João Silva');
    expect(elements.length).toBeGreaterThan(0);
  });

  it('should call logout when exit button is clicked', () => {
    const mockLogout = vi.fn();
    useAuth.mockReturnValue({
      user: { user_metadata: { name: 'João Silva' } },
      logout: mockLogout,
    });

    render(<Header />);
    
    // Open dropdown to find logout button
    const dropdownToggle = screen.getByText('Online');
    fireEvent.click(dropdownToggle);
    
    const logoutBtn = screen.getByText('Sair do Sistema');
    fireEvent.click(logoutBtn);

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
