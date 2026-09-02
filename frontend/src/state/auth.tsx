import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthApi, UserApi, getToken, setToken, onlineChangedHandler, isOffline, setOfflineFlag } from '../api/client';

export interface User {
  id: string;
  name: string;
  email: string;
  accountNumber: number;
  premiumStatus: string;
  premiumExpiresAt?: string | null;
  loyaltyPoints: number;
  isDemo: boolean;
  hasTicket: boolean;
  hasDemoAccess: boolean;
  createdAt: string;
}

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  offline: boolean;
  online: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  setAuthUser: (u: User) => void;
}

const Ctx = createContext<AuthCtx>(null as any);

export function useAuth() {
  return useContext(Ctx);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(getToken());
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    onlineChangedHandler(setOnline);
    setOfflineFlag(!navigator.onLine);
    if (getToken()) {
      UserApi.me()
        .then((d) => {
          setUser(d.user);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    return () => {};
  }, []);

  const setAuthUser = useCallback((u: User) => setUser(u), []);

  const refresh = useCallback(async () => {
    if (!getToken()) return;
    try {
      const d = await UserApi.me();
      setUser(d.user);
    } catch {}
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const d = await AuthApi.login(email, password);
    setToken(d.token);
    setTok(d.token);
    setUser(d.user);
    return d.user as User;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const d = await AuthApi.register(name, email, password);
    setToken(d.token);
    setTok(d.token);
    setUser(d.user);
    return d.user as User;
  }, []);

  const logout = useCallback(() => {
    AuthApi.logout().catch(() => {});
    setToken(null);
    setTok(null);
    setUser(null);
  }, []);

  const updateName = useCallback(async (name: string) => {
    const d = await UserApi.updateProfile(name);
    setUser(d.user);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, loading, offline: !online || isOffline(), online, login, register, logout, refresh, updateName, setAuthUser }}>
      {children}
    </Ctx.Provider>
  );
}