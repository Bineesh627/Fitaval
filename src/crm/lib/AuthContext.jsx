import React, { createContext, useState, useContext, useEffect } from 'react';
import { client } from '@/api/client';
import { getSession } from '../../portal/session';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const getInitialUser = () => {
    try {
      const session = getSession();
      if (session?.role === 'crm') {
        return session.user || {
          id: session.id || 'usr_owner',
          name: session.name || 'Gym Owner',
          email: session.email || 'owner@fitaval.com',
          role: 'owner',
        };
      }
    } catch {
      // ignore
    }
    return null;
  };

  const initialUser = getInitialUser();
  const [user, setUser] = useState(initialUser);
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialUser));
  const [isLoadingAuth, setIsLoadingAuth] = useState(!initialUser && !client.isMock);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(!client.isMock);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(Boolean(initialUser));
  const [appPublicSettings, setAppPublicSettings] = useState(
    client.isMock
      ? {
          id: 'fitaval-crm',
          public_settings: {
            app_name: 'Fitaval Gym Manager',
            auth_mode: 'public',
          },
        }
      : null
  );

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      if (!client.isMock) {
        setIsLoadingPublicSettings(true);
      }
      setAuthError(null);

      const publicSettings = await client.app.getPublicSettings();
      setAppPublicSettings(publicSettings);

      await checkUserAuth();
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('App state check failed:', error);
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      if (!client.isMock && !initialUser) {
        setIsLoadingAuth(true);
      }
      const currentUser = await client.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    } catch (error) {
      console.warn('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAuthChecked(true);
    }
  };

  const logout = (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);

    if (shouldRedirect) {
      client.auth.logout('/login');
    } else {
      client.auth.logout();
    }
  };

  const navigateToLogin = () => {
    client.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
