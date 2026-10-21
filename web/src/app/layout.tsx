import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Inter } from "next/font/google";
import { MainNav } from "@/components/main-nav";
import { Wallet } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ACME Salary Management",
  description: "Manage employee salaries and see how the organization pays people.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-background text-foreground antialiased`}
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(99,102,241,0.10), transparent 360px)",
          backgroundRepeat: "no-repeat",
        }}
      >
        {" "}

           <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur">
     <div className="mx-auto flex max-w-6xl items-stretch gap-8 px-4">
       <span className="flex items-center gap-2.5 py-3 font-semibold tracking-tight">
         <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
           <Wallet className="h-4 w-4" />
         </span>
         ACME Salary Management
       </span>
       <MainNav />
     </div>
   </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
