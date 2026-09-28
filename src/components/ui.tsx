"use client";

import { ReactNode, useEffect } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-arena-border bg-arena-panel p-5 shadow-gold ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-widest text-arena-gold/60">{label}</p>
      <p className="mt-2 font-serif text-3xl text-arena-gold">{value}</p>
      {hint && <p className="mt-1 text-xs text-arena-cream/40">{hint}</p>}
    </Card>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-arena-gold text-arena-black hover:bg-arena-goldlight",
    secondary:
      "border border-arena-border text-arena-cream hover:border-arena-gold/50 hover:text-arena-gold",
    danger: "border border-red-900/50 text-red-400 hover:bg-red-950/40",
    ghost: "text-arena-cream/70 hover:text-arena-gold",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-arena-border bg-arena-black/40 px-3 py-2.5 text-sm text-arena-cream placeholder:text-arena-cream/30 focus:border-arena-gold/60 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-arena-border bg-arena-black/40 px-3 py-2.5 text-sm text-arena-cream focus:border-arena-gold/60 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs text-arena-cream/50">{children}</label>;
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 py-10 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-arena-border bg-arena-panel shadow-gold">
        <div className="flex items-center justify-between border-b border-arena-border px-5 py-4">
          <h2 className="font-serif text-lg text-arena-gold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-arena-cream/50 hover:text-arena-gold"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-arena-border py-10 text-center text-sm text-arena-cream/40">
      {message}
    </div>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full border border-arena-gold/30 bg-arena-gold/10 px-2.5 py-0.5 text-xs text-arena-gold">
      {children}
    </span>
  );
}
