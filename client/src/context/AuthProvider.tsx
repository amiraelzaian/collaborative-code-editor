import { type ReactNode, useEffect, useState } from "react";
import type { User } from "../types/user";
import { refreshSession, setAccessToken } from "../api/client";
import * as authApi from "../api/auth.api";
import { AuthContext } from "./authContext";
import { queryClient } from "../lib/queryClient";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1) restore the session when the app loads
  useEffect(() => {
    let cancelled = false;
    const restoreSession = async () => {
      try {
        setAccessToken(await refreshSession());
        const me = await authApi.getMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) the axios client announces when the session is truly over
  useEffect(() => {
    const onLogout = () => {
      queryClient.clear();
       setUser(null);
      }
    window.addEventListener("auth:logout", onLogout);
   
    return () => window.removeEventListener("auth:logout", onLogout);
  }, []);

  const login = async (email: string, password: string) => {
    const result = await authApi.login(email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const result = await authApi.register(name, email, password);
    setAccessToken(result.accessToken);
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      queryClient.clear();
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}