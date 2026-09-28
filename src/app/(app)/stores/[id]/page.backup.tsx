import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import { formatCurrency, formatDateTime } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StoreDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: store } = await supabase.from("stores").select("*").eq("id", params.id).single();
  if (!store) notFound();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, grand_total, created_at, transaction_items(id, product_name, quantity, unit_price, subtotal)")
    .eq("store_id", params.id)
    .order("created_at", { ascending: false });

  const grandLifetimeTotal = (transactions ?? []).reduce(
    (sum, t) => sum + Number(t.grand_total),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <Link href="/stores" className="text-xs text-arena-gold/70 hover:text-arena-gold">
          &larr; Back to stores
        </Link>
        <h1 className="mt-2 font-serif text-2xl text-arena-gold md:text-3xl">{store.name}</h1>
        <p className="mt-1 text-sm text-arena-cream/50">
          {(transactions ?? []).length} transaction(s) &middot; Lifetime total{" "}
          <span className="text-arena-gold">{formatCurrency(grandLifetimeTotal)}</span>
        </p>
      </div>

      {!transactions || transactions.length === 0 ? (
        <EmptyState message="No purchases recorded for this store yet." />
      ) : (
        <div className="space-y-4">
          {transactions.map((t) => (
            <Card key={t.id}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-arena-cream/60">{formatDateTime(t.created_at)}</p>
                <p className="font-serif text-lg text-arena-gold">
                  {formatCurrency(Number(t.grand_total))}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                      <th className="py-2 pr-4 font-normal">Product</th>
                      <th className="py-2 pr-4 font-normal">Qty</th>
                      <th className="py-2 pr-4 font-normal">Price</th>
                      <th className="py-2 pr-4 font-normal text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(t.transaction_items ?? []).map((item) => (
                      <tr key={item.id} className="border-b border-arena-border/60 last:border-0">
                        <td className="py-2.5 pr-4">{item.product_name}</td>
                        <td className="py-2.5 pr-4">{item.quantity}</td>
                        <td className="py-2.5 pr-4">{formatCurrency(Number(item.unit_price))}</td>
                        <td className="py-2.5 pr-4 text-right text-arena-cream/80">
                          {formatCurrency(Number(item.subtotal))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
