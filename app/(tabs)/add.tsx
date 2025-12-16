
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
import fetchWithAuth from "../../src/_lib/fetchWithAuth";

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

  // Fetch categories from backend
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
        console.error("Error loading categories", err);
        setCatError("Could not load categories");
      } finally {
        setCatLoading(false);
      }
    }

    fetchCategories();
  }, []);

  const handleSubmit = async () => {
    if (!amount || !description || !category || !type) {
      Alert.alert("Missing Data", "Complete all fields and select type.");
      return;
    }

    const num = Number(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Invalid Amount", "Amount must be greater than 0.");
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
          errorBody.error || `Could not save (HTTP ${res.status})`
        );
        return;
      }

      Alert.alert("Success", "Transaction created successfully.");

      // Clear form
      setAmount("");
      setDescription("");
      setCategory("");
      setType(null);
    } catch (err) {
      console.error("Error creating transaction", err);
      Alert.alert("Error", "Could not connect to server.");
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
      <Text style={styles.title}>New Transaction</Text>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="e.g., 15000"
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="e.g., salary, rent..."
        placeholderTextColor="#666"
      />

      <Text style={styles.label}>Category</Text>
      <TextInput
        style={styles.input}
        value={category}
        onChangeText={setCategory}
        placeholder="e.g., Work, Food..."
        placeholderTextColor="#666"
      />

      {catLoading ? (
        <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
          <ActivityIndicator size="small" />
          <Text style={{ color: "#888", marginLeft: 8 }}>Loading categories...</Text>
        </View>
      ) : catError ? (
        <Text style={{ color: "#ff7b72", marginTop: 6 }}>{catError}</Text>
      ) : categories.length > 0 ? (
        <>
          <Text style={styles.smallLabel}>Select existing category:</Text>
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
          No categories yet. You can create one by typing the name above.
        </Text>
      )}

      <Text style={styles.label}>Type</Text>
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
            + Income
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
            - Expense
          </Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.submit, loading && { opacity: 0.6 }]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.submitText}>
          {loading ? "Saving..." : "Save"}
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
