import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadUser = useCallback(async () => {
    if (token) {
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (error) {
        console.error("Sessão inválida ou expirada.", error);
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        api.defaults.headers.common['Authorization'] = null;
      }
    }
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: apiToken, ...userData } = response.data;

      localStorage.setItem('token', apiToken);

      setToken(apiToken);
      setUser(userData);

      api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;

      navigate('/');
    } catch (error) {
      console.error("Erro de login:", error);
      throw error;
    }
  };
  
  const register = async (name, email, password) => {
    try {
        const response = await api.post('/auth/register', { name, email, password });
        const { token: apiToken, ...userData } = response.data;

        localStorage.setItem('token', apiToken);
        setToken(apiToken);
        setUser(userData);
        api.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
        navigate('/');
    } catch (error) {
        console.error("Erro no registro:", error);
        throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    
    api.defaults.headers.common['Authorization'] = null;

    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};