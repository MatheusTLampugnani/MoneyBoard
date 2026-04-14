import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const isCricasUser = useMemo(() => {
    return user?.email === 'cricaskrav64@gmail.com';
  }, [user]);

  const login = (email, password) => supabase.auth.signInWithPassword({ email, password });
  
  const logout = () => supabase.auth.signOut();
  
  const register = (name, email, password) => 
    supabase.auth.signUp({ 
      email, 
      password, 
      options: { data: { name } } 
    });

  const value = { 
    user, 
    isCricasUser,
    session, 
    isAuthenticated: !!session, 
    isLoading, 
    login, 
    logout, 
    register 
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