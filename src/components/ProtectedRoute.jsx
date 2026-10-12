import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Загрузка сессии...</div>;
  }

  // Если пользователь не авторизован, перенаправляем на /login, 
  // сохраняя текущий путь в state, чтобы вернуть его после входа
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};