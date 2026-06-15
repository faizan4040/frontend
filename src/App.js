import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import UsersPage from './pages/UsersPage';
import LeadsPage from './pages/LeadsPage';
import AttendancePage from './pages/AttendancePage';
import LeadDetailPage from './pages/LeadDetailPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

const DashboardRoute = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin' || user.role === 'supervisor') return <AdminDashboard />;
  return <EmployeeDashboard />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardRoute /></PrivateRoute>} />
      <Route path="/users" element={<PrivateRoute roles={['admin']}><UsersPage /></PrivateRoute>} />
      <Route path="/leads" element={<PrivateRoute><LeadsPage /></PrivateRoute>} />
      <Route path="/leads/:id" element={<PrivateRoute><LeadDetailPage /></PrivateRoute>} />
      <Route path="/attendance" element={<PrivateRoute><AttendancePage /></PrivateRoute>} />
      <Route path="/attendance/history" element={<PrivateRoute><AttendanceHistoryPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
