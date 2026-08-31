import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { EmployeeDashboard } from './pages/EmployeeDashboard';
import { MyAttendance } from './pages/MyAttendance';
import { LeaveManagement } from './pages/LeaveManagement';
import { HRDashboard } from './pages/HRDashboard';
import { HRAttendance } from './pages/HRAttendance';
import { HRLeaves } from './pages/HRLeaves';
import { HREmployees } from './pages/HREmployees';
import { NotFound } from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'HR_ADMIN' | 'EMPLOYEE' }> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading WorkPulse Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole && role !== 'HR_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Root index redirect based on role or default
const IndexRedirect: React.FC = () => {
  const { isAuthenticated, isLoading, role } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/dashboard" replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Workspace Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<IndexRedirect />} />
                <Route path="dashboard" element={<EmployeeDashboard />} />
                <Route path="my-attendance" element={<MyAttendance />} />
                <Route path="leaves" element={<LeaveManagement />} />

                {/* HR Administration Routes (Restricted to HR_ADMIN) */}
                <Route
                  path="hr/dashboard"
                  element={
                    <ProtectedRoute requiredRole="HR_ADMIN">
                      <HRDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="hr/attendance"
                  element={
                    <ProtectedRoute requiredRole="HR_ADMIN">
                      <HRAttendance />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="hr/leaves"
                  element={
                    <ProtectedRoute requiredRole="HR_ADMIN">
                      <HRLeaves />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="hr/employees"
                  element={
                    <ProtectedRoute requiredRole="HR_ADMIN">
                      <HREmployees />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* 404 Wildcard */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
