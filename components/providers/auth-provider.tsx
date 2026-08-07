'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export interface AuthSession {
  schoolCode: string;
  schoolName: any;
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'SCHOOL_ADMIN';
  schoolId: string | null;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string | null;
  lastLogin: string | null;
  mobile: string | null;
}

interface AuthContextValue {
  session: AuthSession | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      if (!res.ok) {
        setSession(null);
        return;
      }
      const data = await res.json();
      setSession(data.session ?? null);
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error ?? 'Login failed' };
    setSession(data.session);
    return { ok: true };
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading, refresh, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
