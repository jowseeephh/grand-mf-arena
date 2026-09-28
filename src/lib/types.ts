export type Store = {
  id: string;
  name: string;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  units_sold: number;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  store_id: string;
  grand_total: number;
  created_at: string;
  stores?: { name: string } | null;
};

export type TransactionItem = {
  id: string;
  transaction_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
};

export type CartLine = {
  product_id: string;
  product_name: string;
  unit_price: number;
  quantity: number;
  max_stock: number;
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-PH", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
