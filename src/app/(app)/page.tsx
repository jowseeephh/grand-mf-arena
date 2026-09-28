import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, EmptyState } from "@/components/ui";
import { formatCurrency, formatDateTime, Transaction } from "@/lib/types";
import { StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = createClient();

  const [{ data: transactions }, { data: products }, { data: stores }] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id, grand_total, created_at, store_id, stores(name)")
        .order("created_at", { ascending: false }),
      supabase.from("products").select("id, units_sold"),
      supabase.from("stores").select("id"),
    ]);

  const txns = (transactions ?? []) as unknown as Transaction[];
  const totalSales = txns.reduce((sum, t) => sum + Number(t.grand_total), 0);
  const totalProductsSold = (products ?? []).reduce(
    (sum, p) => sum + Number(p.units_sold),
    0
  );
  const recent = txns.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-arena-gold md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-arena-cream/50">
          Overview of Grand MF Arena&apos;s sales and inventory.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Sales" value={formatCurrency(totalSales)} hint={`${txns.length} transactions`} />
        <StatCard label="Total Products Sold" value={totalProductsSold.toLocaleString()} hint="units, all time" />
        <StatCard label="Number of Stores" value={String((stores ?? []).length)} hint="active accounts" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg text-arena-gold">Recent Transactions</h2>
          <Link href="/history" className="text-xs text-arena-gold/70 hover:text-arena-gold">
            View all &rarr;
          </Link>
        </div>

        {recent.length === 0 ? (
          <EmptyState message="No transactions yet. Record your first sale to see it here." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-arena-border text-xs uppercase tracking-wide text-arena-cream/40">
                  <th className="py-2 pr-4 font-normal">Date &amp; Time</th>
                  <th className="py-2 pr-4 font-normal">Store</th>
                  <th className="py-2 pr-4 font-normal text-right">Grand Total</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-arena-border/60 last:border-0">
                    <td className="py-3 pr-4 text-arena-cream/70">{formatDateTime(t.created_at)}</td>
                    <td className="py-3 pr-4">{t.stores?.name ?? "—"}</td>
                    <td className="py-3 pr-4 text-right font-medium text-arena-gold">
                      {formatCurrency(Number(t.grand_total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
