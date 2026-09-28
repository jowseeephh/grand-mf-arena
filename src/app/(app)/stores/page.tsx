import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import { formatCurrency } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const supabase = createClient();

  const { data: stores } = await supabase.from("stores").select("id, name").order("name");
  const { data: transactions } = await supabase
    .from("transactions")
    .select("store_id, grand_total");

  const totalsByStore = new Map<string, { total: number; count: number }>();
  for (const t of transactions ?? []) {
    const existing = totalsByStore.get(t.store_id) ?? { total: 0, count: 0 };
    existing.total += Number(t.grand_total);
    existing.count += 1;
    totalsByStore.set(t.store_id, existing);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-arena-gold md:text-3xl">Stores</h1>
        <p className="mt-1 text-sm text-arena-cream/50">
          Click a store to view its full purchase history.
        </p>
      </div>

      {!stores || stores.length === 0 ? (
        <EmptyState message="No stores yet." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => {
            const stats = totalsByStore.get(s.id) ?? { total: 0, count: 0 };
            return (
              <Link key={s.id} href={`/stores/${s.id}`}>
                <Card className="h-full transition-colors hover:border-arena-gold/50">
                  <p className="font-serif text-lg text-arena-gold">{s.name}</p>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-arena-cream/50">{stats.count} transaction(s)</span>
                    <span className="font-medium text-arena-gold">{formatCurrency(stats.total)}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
