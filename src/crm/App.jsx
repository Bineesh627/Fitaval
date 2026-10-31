import React, { Suspense, lazy } from 'react';
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
const Members = lazy(() => import('@/pages/Members'));
const Finance = lazy(() => import('@/pages/Finance'));
const Plans = lazy(() => import('@/pages/Plans'));
const More = lazy(() => import('@/pages/More'));
const GymProfilePage = lazy(() => import('@/pages/GymProfilePage'));
const Trainers = lazy(() => import('@/pages/Trainers'));
const Wallet = lazy(() => import('@/pages/Wallet'));
const Subscription = lazy(() => import('@/pages/Subscription'));

// Sign-in lives on the shared login page (src/portal), so send a full page load there.
const LoginRedirect = () => {
  window.location.replace('/login' + window.location.search);
  return null;
};

const RouteFallback = () => (
  <div className="flex items-center justify-center py-24">
    <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app settings
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
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
    <Suspense fallback={<RouteFallback />}>
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
    </Suspense>
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