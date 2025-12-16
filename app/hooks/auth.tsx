import { API_BASE } from "@/apiConfig";
import { useState } from "react";
import { Alert } from "react-native";
import { clearAuth, saveToken, saveUsername } from "../lib/auth";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


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
      return token
    } catch (err) {
      console.error("Login error", err);
      Alert.alert("Error", "Could not connect to server.");
    }
  };

  const validateToken = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/validate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      console.log("validateToken response", res);
      if(res.ok)setIsAuthenticated(true);
      return res.ok;
    } catch (e) {
      console.warn("validateToken error", e);
      return false;
    }
  }
   const logout = async () => {
    await clearAuth();
    setIsAuthenticated(false);
  };

  return { isAuthenticated, setIsAuthenticated, login, logout, validateToken };
}

export default useAuth;