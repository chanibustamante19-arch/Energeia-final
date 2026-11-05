import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import PageNotFound from '@/lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import ScrollToTop from '@/components/ScrollToTop';
import { ThemeProvider } from '@/lib/theme';
import AppLayout from '@/components/AppLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { HouseholdDataProvider } from '@/lib/HouseholdDataContext';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Appliances from '@/pages/Appliances';
import History from '@/pages/History';
import Insights from '@/pages/Insights';
import Scenarios from '@/pages/Scenarios';
import Settings from '@/pages/Settings';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';

function ProtectedApp() {
  return (
    <HouseholdDataProvider>
      <AppLayout />
    </HouseholdDataProvider>
  );
}

function AppRoutes() {
  const { isLoadingAuth, isAuthenticated } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/overview" replace /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/overview" replace /> : <RegisterPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedApp />}>
          <Route path="/overview" element={<Dashboard />} />
          <Route path="/appliances" element={<Appliances />} />
          <Route path="/history" element={<History />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/scenarios" element={<Scenarios />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
