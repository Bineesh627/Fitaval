import { useContext, createContext } from 'react';
import { adminClient } from '../api/client';

export const AppCtx = createContext(null);

export const useApp = () => useContext(AppCtx);

export { adminClient };
