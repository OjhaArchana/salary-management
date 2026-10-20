import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import {MainNav} from "@/components/main-nav";

export const metadata: Metadata = {
  title: "ACME Salary Management",
  description: "Manage employee salaries and see how the organization pays people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <header className="border-b">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <span className="font-semibold">ACME Salary Management</span>
            {/* <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
              Employees
            </Link>
            <Link href="/insights" className="text-sm text-muted-foreground hover:text-foreground">
              Insights
            </Link> */}
            <MainNav />
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}