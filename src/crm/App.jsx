import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/theme';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import Layout from '@/components/Layout';
import Dashboard from '@/pages/Dashboard';
import Members from '@/pages/Members';
import Finance from '@/pages/Finance';
import Plans from '@/pages/Plans';
import More from '@/pages/More';
import GymProfilePage from '@/pages/GymProfilePage';
import Trainers from '@/pages/Trainers';
import Wallet from '@/pages/Wallet';
import Subscription from '@/pages/Subscription';
import { handleEnterKeyNavigation } from '@/lib/enterNav';

// Sign-in lives on the shared login page (src/portal), so send a full page load there.
const LoginRedirect = () => {
  window.location.replace('/login' + window.location.search);
  return null;
};

const AppRoutes = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Attach Enter key navigation handler across all CRM forms and modals
  useEffect(() => {
    const onKeyDown = (e) => {
      handleEnterKeyNavigation(e);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Show loading spinner while checking app settings
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-muted-foreground font-medium">Loading workspace...</p>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/login" element={<LoginRedirect />} />

      {/* Main app routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/members" element={<Members />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/staff" element={<Trainers />} />
        <Route path="/trainers" element={<Trainers />} />
        <Route path="/plans" element={<Plans />} />
        <Route path="/settings" element={<More />} />
        <Route path="/more" element={<More />} />
        <Route path="/gym-profile" element={<GymProfilePage />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/subscription" element={<Subscription />} />
      </Route>

      {/* 404 catch-all */}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <AppRoutes />
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
