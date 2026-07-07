"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, History, Settings2, Users } from "lucide-react";
import { cn } from "./cn";

const LINKS = [
  { href: "/", label: "Gebruikers", icon: Users },
  { href: "/clubs", label: "Clubs", icon: Building2 },
  { href: "/audit-log", label: "Audit log", icon: History },
  { href: "/apps", label: "Instellingen", icon: Settings2 },
];

// Reads its own active tab from the URL instead of taking a `current` prop —
// three call sites once had to remember to pass the right path, and two of
// them didn't (always highlighted "Gebruikers").
export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6 text-sm">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-1.5 border-b-2 border-transparent py-3 text-neutral-500 transition-colors hover:text-neutral-900",
              active && "border-primary-500 font-medium text-primary-600 hover:text-primary-600",
            )}
          >
            <link.icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
