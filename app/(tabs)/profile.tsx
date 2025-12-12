import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { clearAuth, getUsername } from "../lib/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
    const handleAlertProx = () => {
    Alert.alert("Próximamente", "Esta función estará disponible en una futura versión.");
  };
  useEffect(() => {
    async function loadUsername() {
      const user = await getUsername();
      setUsername(user);
    }
    loadUsername();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro que querés salir?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Salir",
          style: "destructive",
          onPress: async () => {
            await clearAuth();
            router.replace("/(auth)/login");
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle-outline" size={80} color="#2563eb" />
        </View>
        <Text style={styles.username}>{username || "Usuario"}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>
        
        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="person-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Editar perfil</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="lock-closed-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Cambiar contraseña</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="notifications-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Notificaciones</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="color-palette-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Tema</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información</Text>
        
        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="help-circle-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Ayuda</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>

        <Pressable 
          style={styles.menuItem}
          onPress={() => handleAlertProx()}
        >
          <Ionicons name="document-text-outline" size={24} color="#ccc" />
          <Text style={styles.menuText}>Términos y condiciones</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Próximamente</Text>
          </View>
        </Pressable>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      <Text style={styles.version}>Versión 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0b0f",
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: "#25252f",
  },
  avatarContainer: {
    marginBottom: 12,
  },
  username: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: "#888",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#16161d",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuText: {
    flex: 1,
    color: "#fff",
    fontSize: 16,
    marginLeft: 12,
  },
  badge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
    marginHorizontal: 16,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  version: {
    textAlign: "center",
    color: "#666",
    fontSize: 12,
    marginTop: 16,
    marginBottom: 32,
  },
});