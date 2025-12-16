import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import useAuth from "../hooks/auth";

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useRouter();
  const { login } = useAuth();
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Missing Data", "Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      const token = await login(username, password);
      if (!token) {
        Alert.alert("Error", "Invalid server response");
        return;
      }

      navigation.replace("/(tabs)");
    } catch (err) {
      console.error("Login error", err);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign In</Text>

      <Text style={styles.label}>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        placeholder="username"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="password"
        placeholderTextColor="#666"
      />

      <Pressable style={[styles.button, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
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