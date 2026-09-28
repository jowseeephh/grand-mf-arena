"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, EmptyState, Input, Label, Modal } from "@/components/ui";
import { formatCurrency, Product } from "@/lib/types";

type FormState = { name: string; price: string; stock: string };
const emptyForm: FormState = { name: "", price: "", stock: "" };

export default function InventoryPage() {
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("products").select("*").order("name");
    setProducts(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(p: Product) {
    setEditing(p);
    setForm({ name: p.name, price: String(p.price), stock: String(p.stock) });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(form.price);
    const stock = Number(form.stock);

    if (!form.name.trim()) {
      setError("Product name is required.");
      return;
    }
    if (isNaN(price) || price < 0) {
      setError("Enter a valid price.");
      return;
    }
    if (isNaN(stock) || stock < 0) {
      setError("Enter a valid stock quantity.");
      return;
    }

    setSaving(true);

    if (editing) {
      const { error } = await supabase
        .from("products")
        .update({ name: form.name.trim(), price, stock })
        .eq("id", editing.id);
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      const { error } = await supabase
        .from("products")
        .insert({ name: form.name.trim(), price, stock, units_sold: 0 });
      setSaving(false);
      if (error) {
        setError(error.message);
        return;
      }
    }

    setModalOpen(false);
    load();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await supabase.from("products").delete().eq("id", deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-arena-gold md:text-3xl">Inventory</h1>
          <p className="mt-1 text-sm text-arena-cream/50">Manage products, stock, and pricing.</p>
        </div>
        <Button onClick={openAdd}>+ Add product</Button>
      </div>

      <Card>
        {loading ? (
          <p className="py-8 text-center text-sm text-arena-cream/40">Loading...</p>
        ) : products.length === 0 ? (
          <EmptyState message="No products yet. Add your first product." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                  <th className="py-2 pr-4 font-normal">Product</th>
                  <th className="py-2 pr-4 font-normal">Price</th>
                  <th className="py-2 pr-4 font-normal">Current stock</th>
                  <th className="py-2 pr-4 font-normal">Units sold</th>
                  <th className="py-2 pl-4 font-normal text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-arena-border/60 last:border-0">
                    <td className="py-3 pr-4">{p.name}</td>
                    <td className="py-3 pr-4">{formatCurrency(Number(p.price))}</td>
                    <td className="py-3 pr-4">
                      <span className={p.stock <= 20 ? "text-red-400" : "text-arena-cream"}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-arena-cream/60">{p.units_sold}</td>
                    <td className="py-3 pl-4 text-right">
                      <button
                        onClick={() => openEdit(p)}
                        className="mr-3 text-xs text-arena-gold/80 hover:text-arena-gold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTarget(p)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit product" : "Add product"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <Label>Product name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Red Horse"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Price (₱)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save product"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete product">
        <p className="text-sm text-arena-cream/70">
          Are you sure you want to delete <span className="text-arena-gold">{deleteTarget?.name}</span>?
          This cannot be undone.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
