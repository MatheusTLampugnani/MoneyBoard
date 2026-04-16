import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: vi.fn(),
    }
  }
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, isCricasUser } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Auth' : 'Unauth'}</div>
      <div data-testid="cricas-status">{isCricasUser ? 'Cricas' : 'Not Cricas'}</div>
      <div data-testid="user-email">{user?.email || 'No Email'}</div>
      <button onClick={() => login('test@test.com', 'pwd')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  it('should provide initial unauthenticated state', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ data: { session: null } });
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Unauth');
    });
  });

  it('should recognize Cricas mode and valid session', async () => {
    supabase.auth.getSession.mockResolvedValueOnce({ 
      data: { session: { user: { email: 'cricaskrav64@gmail.com' } } } 
    });
    supabase.auth.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Auth');
      expect(screen.getByTestId('cricas-status')).toHaveTextContent('Cricas');
      expect(screen.getByTestId('user-email')).toHaveTextContent('cricaskrav64@gmail.com');
    });
  });

  it('should throw error if useAuth is used outside provider', () => {
    // Suppress React boundary error logging
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<TestComponent />)).toThrow('useAuth deve ser usado dentro de um AuthProvider');
    spy.mockRestore();
  });
});
