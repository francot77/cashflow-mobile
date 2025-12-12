import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { API_BASE, USERNAME } from "../../apiConfig";

const COLOR_PALETTE = [
  "#2563eb",
  "#22c55e",
  "#eab308",
  "#ec4899",
  "#a855f7",
  "#f97316",
  "#14b8a6",
  "#f43f5e",
];

type Range = "month" | "year" | "all";

type CategoryTotal = {
  category: string;
  total: number;
};

type AnalyticsResponse = {
  range: string;
  start_date: string;
  end_date: string;
  income_total: number;
  expense_total: number;
  balance: number;
  expenses_by_category: CategoryTotal[];
  incomes_by_category: CategoryTotal[];
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function getColorForCategory(category: string, type: "income" | "expense") {
  const base = `${type}:${category}`;
  const hash = hashString(base);
  return COLOR_PALETTE[hash % COLOR_PALETTE.length];
}

export default function StatsScreen() {
  const [range, setRange] = useState<Range>("month");
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAnalytics(selectedRange: Range) {
    try {
      setError(null);
      // loading sólo si no viene de pull-to-refresh
      if (!refreshing) {
        setLoading(true);
      }

      const url = `${API_BASE}/api/analytics?username=${encodeURIComponent(
        USERNAME
      )}&range=${selectedRange}`;

      console.log("Fetching analytics from:", url);

      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as AnalyticsResponse;
      setData(json);
    } catch (err: any) {
      console.error("Error fetching analytics", err);
      setError(err.message || "Error al cargar métricas");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchAnalytics(range);
  }, [range]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAnalytics(range);
  };

  const income = data?.income_total ?? 0;
  const expense = data?.expense_total ?? 0;
  const balance = data?.balance ?? 0;
  const expensesByCategory = data?.expenses_by_category ?? [];
  const incomesByCategory = data?.incomes_by_category ?? [];

  // máximos para normalizar
  const maxExpense = expensesByCategory.reduce(
    (max, c) => (c.total > max ? c.total : max),
    0
  );
  const maxIncome = incomesByCategory.reduce(
    (max, c) => (c.total > max ? c.total : max),
    0
  );

  // máximo global para que las barras sean comparables
  const globalMax = Math.max(maxExpense, maxIncome, 0);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 24 }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <Text style={styles.title}>Métricas</Text>

      {/* Filtros de rango */}
      <View style={styles.rangeRow}>
        <RangeButton
          label="Mes"
          value="month"
          current={range}
          onPress={setRange}
        />
        <RangeButton
          label="Año"
          value="year"
          current={range}
          onPress={setRange}
        />
        <RangeButton
          label="Todo"
          value="all"
          current={range}
          onPress={setRange}
        />
      </View>

      {data && (
        <Text style={styles.subText}>
          {data.start_date} → {data.end_date}
        </Text>
      )}

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ color: "#ccc", marginTop: 8 }}>Cargando...</Text>
        </View>
      ) : (
        <>
          {error && <Text style={styles.error}>{error}</Text>}

          {/* tarjetas de totales */}
          <View style={styles.cards}>
            <View style={[styles.card, styles.cardIncome]}>
              <Text style={styles.cardLabel}>Ingresos</Text>
              <Text style={styles.cardValue}>+ ${income.toFixed(2)}</Text>
            </View>
            <View style={[styles.card, styles.cardExpense]}>
              <Text style={styles.cardLabel}>Egresos</Text>
              <Text style={styles.cardValue}>- ${expense.toFixed(2)}</Text>
            </View>
            <View
              style={[
                styles.card,
                balance >= 0 ? styles.cardIncome : styles.cardExpense,
              ]}
            >
              <Text style={styles.cardLabel}>Balance</Text>
              <Text style={styles.cardValue}>
                {balance >= 0 ? "+ " : "- "}$
                {Math.abs(balance).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Egresos por categoría */}
          <Text style={styles.sectionTitle}>Egresos por categoría</Text>

          {expensesByCategory.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay egresos en este rango de fechas.
            </Text>
          ) : (
            expensesByCategory.map((cat) => {
              const ratio =
                globalMax > 0 ? cat.total / globalMax : 0;
              // le bajo un toque el máximo para que ni la mayor llene TODO
              const widthPercent = Math.max(ratio * 90, 8);
              const color = getColorForCategory(cat.category, "expense");

              return (
                <View
                  key={`expense-${cat.category}`}
                  style={styles.barRow}
                >
                  <Text style={styles.barLabel}>{cat.category}</Text>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${widthPercent}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>
                    ${cat.total.toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}

          {/* Ingresos por categoría */}
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
            Ingresos por categoría
          </Text>

          {incomesByCategory.length === 0 ? (
            <Text style={styles.emptyText}>
              No hay ingresos en este rango de fechas.
            </Text>
          ) : (
            incomesByCategory.map((cat) => {
              const ratio =
                globalMax > 0 ? cat.total / globalMax : 0;
              const widthPercent = Math.max(ratio * 90, 8);
              const color = getColorForCategory(cat.category, "income");

              return (
                <View
                  key={`income-${cat.category}`}
                  style={styles.barRow}
                >
                  <Text style={styles.barLabel}>{cat.category}</Text>
                  <View style={styles.barBackground}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${widthPercent}%`,
                          backgroundColor: color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValue}>
                    ${cat.total.toFixed(2)}
                  </Text>
                </View>
              );
            })
          )}
        </>
      )}
    </ScrollView>
  );
}

type RangeButtonProps = {
  label: string;
  value: Range;
  current: Range;
  onPress: (r: Range) => void;
};

function RangeButton({ label, value, current, onPress }: RangeButtonProps) {
  const active = current === value;
  return (
    <Pressable
      onPress={() => onPress(value)}
      style={[
        styles.rangeButton,
        active && styles.rangeButtonActive,
      ]}
    >
      <Text
        style={[
          styles.rangeButtonText,
          active && styles.rangeButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#0b0b0f" },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  subText: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 8,
  },
  center: {
    marginTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "#ff7b72",
    marginBottom: 8,
  },
  rangeRow: {
    flexDirection: "row",
    marginBottom: 8,
    marginTop: 4,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#333",
    alignItems: "center",
    marginRight: 8,
  },
  rangeButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  rangeButtonText: {
    color: "#aaa",
    fontSize: 13,
  },
  rangeButtonTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
    marginTop: 8,
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
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  emptyText: {
    color: "#888",
    fontSize: 13,
  },
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  barLabel: {
    color: "#ccc",
    fontSize: 13,
    width: 90,
  },
  barBackground: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#1f2933",
    overflow: "hidden",
    marginHorizontal: 8,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
  },
  barValue: {
    color: "#ccc",
    fontSize: 12,
    width: 80,
    textAlign: "right",
  },
});
