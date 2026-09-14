/**
 * PrepMate Auth Context.
 * Real backend (api.ts) se wire kiya hua.
 * SSR-safe: localStorage sirf useEffect (client-side) mein access hota hai,
 * server render ke waqt nahi -- warna "localStorage is not defined" aata hai.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import * as api from "@/lib/api";

const USER_EMAIL_KEY = "prepmate_user_email";

type AuthUser = { email: string };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Server render ke waqt hamesha null se shuru karo -- localStorage yahan touch nahi karna
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Browser mount hone ke baad hi localStorage padho (client-only)
  useEffect(() => {
    const savedEmail = localStorage.getItem(USER_EMAIL_KEY);
    const token = api.getToken();
    if (savedEmail && token) {
      setUser({ email: savedEmail });
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      localStorage.setItem(USER_EMAIL_KEY, email.trim().toLowerCase());
      setUser({ email: email.trim().toLowerCase() });
      return true;
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.signup(email, password);
      // Signup ke baad seedha login karke token le lete hain
      return await login(email, password);
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Signup failed. Please try again.");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    api.logout();
    localStorage.removeItem(USER_EMAIL_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}