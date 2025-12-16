import { API_BASE } from "@/apiConfig";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { clearAuth, deleteToken, getToken, saveToken, saveUsername } from "../lib/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<string | undefined>;
  logout: () => Promise<void>;
  validateToken: (token: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Validar token al iniciar la app
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          const valid = await validateToken(token);
          if (!valid) {
            await deleteToken();
            setIsAuthenticated(false);
          } else {
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    if (!username || !password) {
      Alert.alert("Missing Data", "Please enter username and password.");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const body = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        Alert.alert("Error", body.error || `HTTP ${res.status}`);
        return;
      }

      const token = body.token;
      if (!token) {
        Alert.alert("Error", "Invalid server response");
        return;
      }

      await saveToken(token);
      await saveUsername(username);
      setIsAuthenticated(true);
      
      return token;
    } catch (err) {
      console.error("Login error", err);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      
      return res.ok;
    } catch (e) {
      console.warn("validateToken error", e);
      return false;
    }
  };

  const logout = async () => {
    await clearAuth();
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        validateToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}