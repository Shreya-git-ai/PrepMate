import { useState, useCallback } from "react";
import * as api from "@/lib/api";

/**
 * Simple auth hook -- token localStorage mein rehta hai (api.ts handles that),
 * yeh hook sirf React state ko usse sync rakhta hai taaki UI re-render ho.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!api.getToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.login(email, password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.signup(email, password);
      // signup ke baad seedha login taaki token mil jaye
      await api.login(email, password);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      setError(err instanceof api.ApiError ? err.message : "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    api.logout();
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, loading, error, login, signup, logout };
}