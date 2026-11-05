import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ApplicationDetail from './components/ApplicationDetail';
import ApplicationForm from './components/ApplicationForm';
import ModelSpec from './components/ModelSpec';
import Login from './pages/Login';
import ApplicantPortal from './pages/ApplicantPortal';

/**
 * Guard for authenticated users
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // If not allowed, redirect to appropriate home
    return <Navigate to={user?.role === 'loan_officer' ? '/dashboard' : '/portal'} replace />;
  }

  return children;
}

/**
 * Smart Root Redirector
 */
function RootRedirect() {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-6 h-6 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user?.role === 'loan_officer' ? '/dashboard' : '/portal'} replace />;
}

/**
 * Primary Layout with Header and Footer
 */
function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans selection:bg-zinc-800 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
      <footer className="border-t border-zinc-200 bg-white py-5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-medium text-zinc-600">
            <span className="font-bold text-zinc-900">CredAlt</span>
            <span>• Alternative Credit Underwriting Engine</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>XGBoost + SHAP</span>
            <span>•</span>
            <span>Ollama CUDA</span>
            <span>•</span>
            <span>Strict Persistence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login initialMode="login" />} />
          <Route path="/register" element={<Login initialMode="register" />} />

          {/* Root Smart Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Protected Routes for Loan Officers */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['loan_officer']}>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/applications/:id"
            element={
              <ProtectedRoute allowedRoles={['loan_officer', 'applicant']}>
                <AppLayout>
                  <ApplicationDetail />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Routes for Applicants */}
          <Route
            path="/portal"
            element={
              <ProtectedRoute allowedRoles={['applicant', 'loan_officer']}>
                <AppLayout>
                  <ApplicantPortal />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Common Routes */}
          <Route
            path="/apply"
            element={
              <ProtectedRoute allowedRoles={['applicant', 'loan_officer']}>
                <AppLayout>
                  <ApplicationForm />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/model"
            element={
              <AppLayout>
                <ModelSpec />
              </AppLayout>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
