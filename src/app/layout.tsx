import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grand MF Arena — Sales & Inventory",
  description: "Sales and Inventory Management System for Grand MF Arena",
  icons: { icon: "/logo.jpg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-arena-black text-arena-cream antialiased">
        {children}
      </body>
    </html>
  );
}
