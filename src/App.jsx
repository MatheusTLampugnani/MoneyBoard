import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Spinner } from 'react-bootstrap';

// Layout e Componentes
import Layout from './components/layout/Layout';

// Páginas Públicas
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Páginas Comuns
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import CategoriesPage from './pages/CategoriesPage';
import GoalsPage from './pages/GoalsPage';
import AccountsPage from './pages/AccountsPage';

// Páginas CRICASTECH
import InventoryPage from './pages/InventoryPage';
import NewProductPage from './pages/NewProductPage';
import NewSalePage from './pages/NewSalePage';
import SoldPage from './pages/SoldPage';
import GenerateArtPage from './pages/GenerateArtPage';
import GenerateReceiptPage from './pages/GenerateReceiptPage';
import CashControlPage from './pages/CashControlPage';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return (
    <div className="vh-100 d-flex align-items-center justify-content-center">
      <Spinner animation="border" variant="primary" />
    </div>
  );
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { isCricasUser } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />        
        <Route path="/categories" element={<CategoriesPage />} />

        {!isCricasUser && (
          <>
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
          </>
        )}

        {isCricasUser && (
          <>
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/new-product" element={<NewProductPage />} />
            <Route path="/new-sale" element={<NewSalePage />} />
            <Route path="/sold" element={<SoldPage />} />
            <Route path="/generate-art" element={<GenerateArtPage />} />
            <Route path="/generate-receipt" element={<GenerateReceiptPage />} />
            <Route path="/cash-control" element={<CashControlPage />} />
          </>
        )}
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;