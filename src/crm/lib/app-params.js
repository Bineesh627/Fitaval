const isNode = typeof window === 'undefined';

const isClearAccessTokenRequested = () =>
  !isNode && new URLSearchParams(window.location.search).get("clear_access_token") === 'true';

const clearStoredAccessToken = () => {
  if (isNode) return;
  window.localStorage.removeItem('fitaval_auth_token');
  window.localStorage.removeItem('fitaval_auth_user');
  window.localStorage.removeItem('token');
};

const getAccessToken = () => {
  if (isNode) return null;
  return window.localStorage.getItem('fitaval_auth_token') || 'demo_token';
};

const getAppParams = () => {
  if (isClearAccessTokenRequested()) {
    clearStoredAccessToken();
  }
  return {
    appId: 'fitaval-crm',
    token: getAccessToken(),
    appBaseUrl: typeof window !== 'undefined' ? window.location.origin : '',
  };
};

export const appParams = {
  ...getAppParams(),
};
