"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/sales", label: "New Sale", icon: SaleIcon },
  { href: "/inventory", label: "Inventory", icon: InventoryIcon },
  { href: "/stores", label: "Stores", icon: StoreIcon },
  { href: "/history", label: "Sales History", icon: HistoryIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-arena-border bg-arena-charcoal px-4 py-3 md:hidden">
        <div className="flex items-center gap-2">
          <Image src="/logo.jpg" alt="Grand MF Arena" width={32} height={32} className="rounded-full" />
          <span className="font-serif text-sm tracking-wide text-arena-gold">GRAND MF ARENA</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="rounded-md border border-arena-border p-2 text-arena-gold"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          open ? "flex" : "hidden"
        } fixed inset-x-0 top-[53px] z-30 flex-col border-b border-arena-border bg-arena-charcoal md:sticky md:top-0 md:inset-auto md:flex md:h-screen md:w-64 md:flex-col md:border-b-0 md:border-r`}
      >
        <div className="hidden items-center gap-3 border-b border-arena-border px-6 py-6 md:flex">
          <Image src="/logo.jpg" alt="Grand MF Arena" width={44} height={44} className="rounded-full" />
          <div>
            <p className="font-serif text-lg leading-tight text-arena-gold">Grand MF Arena</p>
            <p className="text-xs uppercase tracking-widest text-arena-gold/50">Sales &amp; Inventory</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map((link) => {
            const active = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  active
                    ? "bg-arena-gold/10 text-arena-gold shadow-gold"
                    : "text-arena-cream/70 hover:bg-white/5 hover:text-arena-cream"
                }`}
              >
                <Icon className={active ? "text-arena-gold" : "text-arena-cream/50"} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-arena-border p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-arena-cream/60 transition-colors hover:bg-white/5 hover:text-arena-cream"
          >
            <LogoutIcon />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <rect x="2" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="2" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="10" y="10" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function SaleIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M2 5h14l-1.4 8.2a1 1 0 01-1 .8H4.4a1 1 0 01-1-.8L2 5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.5 5V4a3.5 3.5 0 017 0v1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function InventoryIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M2 5.5L9 2l7 3.5-7 3.5-7-3.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 5.5V13l7 3 7-3V5.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 9v7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function StoreIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M2 6l1-3.5h12L16 6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2.5 6v8.5h13V6" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M7 14.5V10h4v4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}
function HistoryIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M9 4v5l3.5 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className={className}>
      <path d="M7 2H4a1 1 0 00-1 1v12a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M11 12.5l4-3.5-4-3.5M15 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
