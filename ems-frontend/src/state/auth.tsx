import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { api } from "../lib/api";
import type { Me } from "../lib/types";
import { getErrorMessage } from "../lib/errors";

type AuthState = {
  me: Me | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await api.get<Me>("/api/auth/me");
      setMe(res.data);
    } catch {
      setMe(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      await api.post<any>("/api/auth/login", { email, password });
      await refresh();
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }

  async function logout() {
    try {
      await api.post("/api/auth/logout");
      setMe(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
      throw e;
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(() => ({ me, loading, refresh, login, logout }), [me, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

