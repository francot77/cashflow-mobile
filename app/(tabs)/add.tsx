import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { API_BASE } from "../../apiConfig";
import fetchWithAuth from "../lib/fetchWithAuth";

type TransactionType = "income" | "expense";

type Category = {
  id: number;
  name: string;
};

export default function AddScreen() {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<TransactionType | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState<string | null>(null);
  
  const router = useRouter();

  // Fetch categorías desde el backend
  useEffect(() => {
    async function fetchCategories() {
      try {
        setCatError(null);
        const res = await fetchWithAuth(`${API_BASE}/api/categories`);
        
        if (res.status === 401) {
          router.replace("/(auth)/login");
          return;
        }
        
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        
        const json = await res.json();
        setCategories(json.categories || []);
      } catch (err) {
        console.error("Error cargando categorías", err);
        setCatError("No se pudieron cargar las categorías");
      } finally {
        setCatLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !category || !type) {
      Alert.alert("Faltan datos", "Completá todos los campos y elegí tipo.");
      return;
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Monto inválido", "El monto debe ser mayor a 0.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        amount: num,
        type,
        description,
        category,
      };

      const res = await fetchWithAuth(`${API_BASE}/api/transactions`, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.replace("/(auth)/login");
        return;
      }

      if (!res.ok) {
        const errorBody = await res.json().catch(() => ({}));
        console.error("Error body:", errorBody);
        Alert.alert(
          "Error",
          errorBody.error || `No se pudo guardar (HTTP ${res.status})`
        );
        return;
      }

      Alert.alert("OK", "Movimiento creado en el backend.");

      // limpiar
      setAmount("");
      setDescription("");
      setCategory("");
      setType(null);
    } catch (err) {
      console.error("Error creando transacción", err);
      Alert.alert("Error", "No se pudo conectar al servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (name: string) => {
    setCategory(name);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
    >
      <Text style={styles.title}>Nuevo movimiento</Text>

      <Text style={styles.label}>Monto</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="Ej: 15000"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Ej: sueldo, alquiler..."
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Categoría</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="Ej: Trabajo, Comida..."
        placeholderTextColor="#666"
      />

      {catLoading ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <ActivityIndicator size="small" />
          <Text style={{ color: "#888", marginLeft: 8 }}>Cargando categorías...</Text>
        </View>
      ) : catError ? (
        <Text style={{ color: "#ff7b72", marginTop: 6 }}>{catError}</Text>
      ) : categories.length > 0 ? (
        <>
          <Text style={styles.smallLabel}>Elegir una existente:</Text>
          <View style={styles.catChipsContainer}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.catChip,
                  category === cat.name && styles.catChipActive,
                ]}
                onPress={() => handleSelectCategory(cat.name)}
              >
                <Text
                  style={[
                    styles.catChipText,
                    category === cat.name && styles.catChipTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <Text style={{ color: "#888", marginTop: 6 }}>
          No tenés categorías aún. Podés crear una escribiendo el nombre arriba.
        </Text>
      )}

      <Text style={styles.label}>Tipo</Text>
      <View style={styles.typeRow}>
        <Pressable
          style={[
            styles.typeButton,
            type === "income" && styles.typeButtonActiveIncome,
          ]}
          onPress={() => setType("income")}
        >
          <Text
            style={[
              styles.typeText,
              type === "income" && styles.typeTextActive,
            ]}
          >
            + Ingreso
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.typeButton,
            type === "expense" && styles.typeButtonActiveExpense,
          ]}
          onPress={() => setType("expense")}
        >
          <Text
            style={[
              styles.typeText,
              type === "expense" && styles.typeTextActive,
            ]}
          >
            - Egreso
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.submit, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Guardando..." : "Guardar"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0b0f" },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  label: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
    marginBottom: 4,
  },
  smallLabel: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#16161d",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#25252f",
  },
  typeRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 8,
  },
  typeButtonActiveIncome: {
    backgroundColor: "#123d24",
    borderColor: "#1c7c3c",
  },
  typeButtonActiveExpense: {
    backgroundColor: "#3d1212",
    borderColor: "#a13737",
  },
  typeText: { color: "#ccc", fontSize: 14 },
  typeTextActive: { color: "#fff", fontWeight: "600" },
  submit: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  catChipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  catChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 6,
    marginTop: 6,
    backgroundColor: "#16161d",
  },
  catChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  catChipText: {
    color: "#ccc",
    fontSize: 13,
  },
  catChipTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
});

