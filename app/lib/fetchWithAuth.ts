// app/lib/fetchWithAuth.ts
import { Alert } from "react-native";
import { clearAuth, getToken } from "./auth";

 async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  const token = await getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(init.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(input, { ...init, headers });

  if (res.status === 401) {
    
    await clearAuth();
    
    try {
      Alert.alert("Sesión expirada", "Iniciá sesión nuevamente.");
    } catch (e) {
      
    }
  }

  return res;
}
export default fetchWithAuth;