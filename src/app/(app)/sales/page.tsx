"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { CartLine, formatCurrency, Product, Store } from "@/lib/types";

export default function SalesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [storeId, setStoreId] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [{ data: s }, { data: p }] = await Promise.all([
        supabase.from("stores").select("*").order("name"),
        supabase.from("products").select("*").order("name"),
      ]);
      setStores(s ?? []);
      setProducts(p ?? []);
    })();
  }, [supabase]);

  const selectedProduct = products.find((p) => p.id === productId);

  useEffect(() => {
    if (selectedProduct) setUnitPrice(Number(selectedProduct.price));
  }, [selectedProduct]);

  const grandTotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.quantity * line.unit_price, 0),
    [cart]
  );

  function addLine() {
    setMessage(null);
    if (!selectedProduct) {
      setMessage({ type: "error", text: "Choose a product first." });
      return;
    }
    if (quantity < 1) {
      setMessage({ type: "error", text: "Quantity must be at least 1." });
      return;
    }
    const alreadyInCart = cart.find((l) => l.product_id === selectedProduct.id);
    const combinedQty = (alreadyInCart?.quantity ?? 0) + quantity;
    if (combinedQty > selectedProduct.stock) {
      setMessage({
        type: "error",
        text: `Only ${selectedProduct.stock} unit(s) of ${selectedProduct.name} left in stock.`,
      });
      return;
    }

    if (alreadyInCart) {
      setCart((prev) =>
        prev.map((l) =>
          l.product_id === selectedProduct.id
            ? { ...l, quantity: combinedQty, unit_price: unitPrice }
            : l
        )
      );
    } else {
      setCart((prev) => [
        ...prev,
        {
          product_id: selectedProduct.id,
          product_name: selectedProduct.name,
          unit_price: unitPrice,
          quantity,
          max_stock: selectedProduct.stock,
        },
      ]);
    }
    setProductId("");
    setQuantity(1);
    setUnitPrice(0);
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.product_id !== productId));
  }

  async function saveTransaction() {
    setMessage(null);
    if (!storeId) {
      setMessage({ type: "error", text: "Select a store." });
      return;
    }
    if (cart.length === 0) {
      setMessage({ type: "error", text: "Add at least one product." });
      return;
    }

    setSaving(true);
    const { error } = await supabase.rpc("record_sale", {
      p_store_id: storeId,
      p_items: cart.map((l) => ({
        product_id: l.product_id,
        quantity: l.quantity,
        unit_price: l.unit_price,
      })),
    });
    setSaving(false);

    if (error) {
      setMessage({ type: "error", text: error.message });
      return;
    }

    setMessage({ type: "success", text: "Transaction saved successfully." });
    setCart([]);
    setStoreId("");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-arena-gold md:text-3xl">New Sale</h1>
        <p className="mt-1 text-sm text-arena-cream/50">
          Record a transaction for a store, add each product, then save.
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === "error"
              ? "border-red-900/50 bg-red-950/30 text-red-300"
              : "border-arena-gold/40 bg-arena-gold/10 text-arena-gold"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h2 className="mb-4 font-serif text-lg text-arena-gold">Add products</h2>

          <div className="mb-4">
            <Label>Store</Label>
            <Select value={storeId} onChange={(e) => setStoreId(e.target.value)}>
              <option value="">Select store</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Label>Product</Label>
              <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.name} {p.stock <= 0 ? "(out of stock)" : `— ${p.stock} in stock`}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Price (₱)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-arena-black/30 px-3 py-2 text-sm">
            <span className="text-arena-cream/50">Subtotal</span>
            <span className="font-medium text-arena-gold">
              {formatCurrency((quantity || 0) * (unitPrice || 0))}
            </span>
          </div>

          <Button className="mt-4" onClick={addLine} type="button">
            + Add to transaction
          </Button>

          <div className="mt-6 border-t border-arena-border pt-4">
            <h3 className="mb-3 text-sm font-medium text-arena-cream/60">Items in this transaction</h3>
            {cart.length === 0 ? (
              <p className="text-sm text-arena-cream/30">No items added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                      <th className="py-2 pr-4 font-normal">Product</th>
                      <th className="py-2 pr-4 font-normal">Qty</th>
                      <th className="py-2 pr-4 font-normal">Price</th>
                      <th className="py-2 pr-4 font-normal text-right">Subtotal</th>
                      <th className="py-2 pl-4 font-normal"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((line) => (
                      <tr key={line.product_id} className="border-b border-arena-border/60 last:border-0">
                        <td className="py-3 pr-4">{line.product_name}</td>
                        <td className="py-3 pr-4">{line.quantity}</td>
                        <td className="py-3 pr-4">{formatCurrency(line.unit_price)}</td>
                        <td className="py-3 pr-4 text-right font-medium text-arena-gold">
                          {formatCurrency(line.quantity * line.unit_price)}
                        </td>
                        <td className="py-3 pl-4 text-right">
                          <button
                            onClick={() => removeLine(line.product_id)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>

        <Card className="h-fit">
          <h2 className="mb-4 font-serif text-lg text-arena-gold">Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-arena-cream/60">
              <span>Store</span>
              <span>{stores.find((s) => s.id === storeId)?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between text-arena-cream/60">
              <span>Items</span>
              <span>{cart.length}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-arena-border pt-4">
            <span className="font-serif text-arena-gold">Grand Total</span>
            <span className="font-serif text-2xl text-arena-gold">{formatCurrency(grandTotal)}</span>
          </div>
          <Button className="mt-5 w-full" onClick={saveTransaction} disabled={saving}>
            {saving ? "Saving..." : "Save transaction"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
