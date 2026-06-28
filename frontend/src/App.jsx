import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EventProvider } from './context/EventContext';
import { CircularProgress, Box } from '@mui/material';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Layout from './components/Layout';
import VersionChecker from './components/VersionChecker';
import DashboardPage from './pages/DashboardPage';
import QuinielaForm from './pages/QuinielaForm';
import MiQuiniela from './pages/MiQuiniela';
import RankingPage from './pages/RankingPage';
import PaymentPage from './pages/PaymentPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminMatches from './pages/admin/AdminMatches';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPayments from './pages/admin/AdminPayments';
import AdminQuinielaView from './pages/admin/AdminQuinielaView';
import MiPerfil from './pages/MiPerfil';
import AdminEvents from './pages/admin/AdminEvents';
import QuinielaView from './pages/QuinielaView';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/ranking" element={<RankingPage />} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="quiniela" element={<QuinielaForm />} />
        <Route path="mi-quiniela" element={<MiQuiniela />} />
        <Route path="pago" element={<PaymentPage />} />
        <Route path="admin" element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
        <Route path="admin/partidos" element={<PrivateRoute adminOnly><AdminMatches /></PrivateRoute>} />
        <Route path="admin/usuarios" element={<PrivateRoute adminOnly><AdminUsers /></PrivateRoute>} />
        <Route path="admin/pagos" element={<PrivateRoute adminOnly><AdminPayments /></PrivateRoute>} />
        <Route path="admin/quiniela/:userId" element={<PrivateRoute adminOnly><AdminQuinielaView /></PrivateRoute>} />
        <Route path="admin/eventos" element={<PrivateRoute adminOnly><AdminEvents /></PrivateRoute>} />
        <Route path="quiniela-ver/:userId" element={<PrivateRoute><QuinielaView /></PrivateRoute>} />
        <Route path="perfil" element={<PrivateRoute><MiPerfil /></PrivateRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <AppRoutes />
        <VersionChecker />
      </EventProvider>
    </AuthProvider>
  );
}
