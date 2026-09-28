"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, EmptyState, Input, Label, Modal, Select } from "@/components/ui";
import { formatCurrency, formatDateTime, Store, Product } from "@/lib/types";

type Row = {
  id: string;
  grand_total: number;
  created_at: string;
  store_id: string;
  stores: { name: string } | null;
  transaction_items: {
    id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
};

export default function HistoryPage() {
  const supabase = createClient();
  const [rows, setRows] = useState<Row[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [storeFilter, setStoreFilter] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selected, setSelected] = useState<Row | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: r }, { data: s }, { data: p }] = await Promise.all([
        supabase
          .from("transactions")
          .select(
            "id, grand_total, created_at, store_id, stores(name), transaction_items(id, product_id, product_name, quantity, unit_price, subtotal)"
          )
          .order("created_at", { ascending: false }),
        supabase.from("stores").select("*").order("name"),
        supabase.from("products").select("*").order("name"),
      ]);
      setRows((r as unknown as Row[]) ?? []);
      setStores(s ?? []);
      setProducts(p ?? []);
      setLoading(false);
    })();
  }, [supabase]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (storeFilter && row.store_id !== storeFilter) return false;
      if (
        productFilter &&
        !row.transaction_items.some((i) => i.product_id === productFilter)
      )
        return false;
      const created = new Date(row.created_at);
      if (dateFrom && created < new Date(dateFrom)) return false;
      if (dateTo && created > new Date(dateTo + "T23:59:59")) return false;
      return true;
    });
  }, [rows, storeFilter, productFilter, dateFrom, dateTo]);

  const filteredTotal = filtered.reduce((sum, r) => sum + Number(r.grand_total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-arena-gold md:text-3xl">Sales History</h1>
        <p className="mt-1 text-sm text-arena-cream/50">Search and filter every recorded transaction.</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label>Store</Label>
            <Select value={storeFilter} onChange={(e) => setStoreFilter(e.target.value)}>
              <option value="">All stores</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Product</Label>
            <Select value={productFilter} onChange={(e) => setProductFilter(e.target.value)}>
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>From date</Label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <Label>To date</Label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-arena-cream/50">{filtered.length} transaction(s) found</p>
          <p className="text-sm">
            Total: <span className="font-medium text-arena-gold">{formatCurrency(filteredTotal)}</span>
          </p>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-arena-cream/40">Loading...</p>
        ) : filtered.length === 0 ? (
          <EmptyState message="No transactions match these filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                  <th className="py-2 pr-4 font-normal">Date &amp; Time</th>
                  <th className="py-2 pr-4 font-normal">Store</th>
                  <th className="py-2 pr-4 font-normal">Items</th>
                  <th className="py-2 pr-4 font-normal text-right">Total</th>
                  <th className="py-2 pl-4 font-normal text-right">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-b border-arena-border/60 last:border-0">
                    <td className="py-3 pr-4 text-arena-cream/70">{formatDateTime(row.created_at)}</td>
                    <td className="py-3 pr-4">{row.stores?.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-arena-cream/60">{row.transaction_items.length}</td>
                    <td className="py-3 pr-4 text-right font-medium text-arena-gold">
                      {formatCurrency(Number(row.grand_total))}
                    </td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => setSelected(row)}
                        className="text-xs text-arena-gold/80 hover:text-arena-gold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Transaction details">
        {selected && (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-arena-cream/60">
              <span>{selected.stores?.name}</span>
              <span>{formatDateTime(selected.created_at)}</span>
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                  <th className="py-2 pr-4 font-normal">Product</th>
                  <th className="py-2 pr-4 font-normal">Qty</th>
                  <th className="py-2 pr-4 font-normal">Price</th>
                  <th className="py-2 pr-4 font-normal text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selected.transaction_items.map((item) => (
                  <tr key={item.id} className="border-b border-arena-border/60 last:border-0">
                    <td className="py-2 pr-4">{item.product_name}</td>
                    <td className="py-2 pr-4">{item.quantity}</td>
                    <td className="py-2 pr-4">{formatCurrency(Number(item.unit_price))}</td>
                    <td className="py-2 pr-4 text-right">{formatCurrency(Number(item.subtotal))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between border-t border-arena-border pt-3">
              <span className="font-serif text-arena-gold">Grand Total</span>
              <span className="font-serif text-lg text-arena-gold">
                {formatCurrency(Number(selected.grand_total))}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
