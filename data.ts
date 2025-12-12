// app/data.ts
export type TransactionType = "income" | "expense";

export type Transaction = {
  id: number;
  amount: number;
  type: TransactionType;
  description: string;
  category: string;
  date: string; // ISO string
};

// mock de ejemplo
export const mockTransactions: Transaction[] = [
  {
    id: 1,
    amount: 200000,
    type: "income",
    description: "Sueldo",
    category: "Trabajo",
    date: "2025-11-01",
  },
  {
    id: 2,
    amount: 35000,
    type: "expense",
    description: "Alquiler",
    category: "Vivienda",
    date: "2025-11-02",
  },
  {
    id: 3,
    amount: 12000,
    type: "expense",
    description: "Supermercado",
    category: "Comida",
    date: "2025-11-03",
  },
];
