// app/(auth)/login.tsx
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { API_BASE } from "../../apiConfig";
import { saveToken, saveUsername } from "../lib/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Faltan datos", "Completá usuario y contraseña.");
      return;
    }

    try {
      setLoading(true);
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
      console.log("Login response body:", body.token);
      if (!token) {
        Alert.alert("Error", "Respuesta inválida del servidor");
        return;
      }

      
      await saveToken(token);
      await saveUsername(username);

      navigation.replace("/(tabs)");
    } catch (err) {
      console.error("Login error", err);
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar sesión</Text>

      <Text style={styles.label}>Usuario</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="usuario"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="contraseña"
        placeholderTextColor="#666"
      />

      <Pressable style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0b0f", justifyContent: "center" },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  label: { color: "#ccc", marginTop: 8, marginBottom: 4 },
  input: { backgroundColor: "#16161d", color: "#fff", padding: 10, borderRadius: 8 },
  button: { backgroundColor: "#2563eb", padding: 12, borderRadius: 8, marginTop: 16, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "700" },
});
