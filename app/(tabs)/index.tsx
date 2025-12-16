import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { API_BASE } from "../../apiConfig";
import useAuth from "../hooks/auth";
import fetchWithAuth from "../lib/fetchWithAuth";

type TransactionType = "income" | "expense";

type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  description: string;
  category: string;
  date: string;
};

type SummaryResponse = {
  total_income: number;
  total_expense: number;
  balance: number;
  transactions: Transaction[];
};

export default function SummaryScreen() {
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const {isAuthenticated} = useAuth();
  async function fetchSummary() {
    try {
      setError(null);
      const res = await fetchWithAuth(`${API_BASE}/api/summary`);
      
      if (res.status === 401) {
        router.replace("/(auth)/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      console.log("fetchSummary response", res);
      const json = (await res.json()) as SummaryResponse;
      setData(json);
    } catch (err: any) {
      console.error("Error fetching summary", err);
      setError("Could not load summary");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    console.log("isAuthenticated changed:", isAuthenticated);
    const mountFetch = async () => {
      if (isAuthenticated) {
      await fetchSummary()
    }
    }
    mountFetch();
  }, [isAuthenticated]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSummary();
  };

  const transactions = data?.transactions ?? [];
  const income = data?.total_income ?? 0;
  const expense = data?.total_expense ?? 0;
  const balance = data?.balance ?? 0;

  const renderItem = ({ item }: { item: Transaction }) => (
    <View style={styles.item}>
      <View style={{ flex: 1 }}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.meta}>
          {item.category} · {item.date}
        </Text>
      </View>
      <Text
        style={[
          styles.amount,
          item.type === "income" ? styles.income : styles.expense,
        ]}
      >
        {item.type === "income" ? "+ " : "- "}
        ${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ color: "#ccc", marginTop: 8 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}

      <View style={styles.cards}>
        <View style={[styles.card, styles.cardIncome]}>
          <Text style={styles.cardLabel}>Income</Text>
          <Text style={styles.cardValue}>+ ${income.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, styles.cardExpense]}>
          <Text style={styles.cardLabel}>Expenses</Text>
          <Text style={styles.cardValue}>- ${expense.toFixed(2)}</Text>
        </View>
        <View style={[styles.card, balance >= 0 ? styles.cardIncome : styles.cardExpense]}>
          <Text style={styles.cardLabel}>Balance</Text>
          <Text style={styles.cardValue}>
            {balance >= 0 ? "+ " : "- "}$
            {Math.abs(balance).toFixed(2)}
          </Text>
        </View>
      </View>

      <Text style={styles.listTitle}>Transactions</Text>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0b0f" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0b0b0f" },
  error: { color: "#ff7b72", marginBottom: 8 },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: "48%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardIncome: { backgroundColor: "#123d24" },
  cardExpense: { backgroundColor: "#3d1212" },
  cardLabel: { color: "#ccc", fontSize: 14 },
  cardValue: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  listTitle: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
    marginTop: 4,
    fontWeight: "600",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
  },
  description: { color: "#fff", fontSize: 15 },
  meta: { color: "#888", fontSize: 12, marginTop: 2 },
  amount: { fontSize: 15, fontWeight: "600", marginLeft: 8 },
  income: { color: "#7ee787" },
  expense: { color: "#ff7b72" },
});