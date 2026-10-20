"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath } from "@/lib/nav";

const LINKS = [
  { href: "/", label: "Employees" },
  { href: "/insights", label: "Insights" },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main" className="flex items-stretch gap-6">
      {LINKS.map(({ href, label }) => {
        const active = isActivePath(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px flex items-center border-b-2 px-1 text-sm transition-colors ${
              active
                ? "border-foreground font-medium text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}