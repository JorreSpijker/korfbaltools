import Link from "next/link";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Gebruikers" },
  { href: "/audit-log", label: "Audit log" },
  { href: "/apps", label: "Instellingen" },
];

export function AdminNav({ current }: { current: string }) {
  return (
    <nav className="flex items-center gap-4 text-sm">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-neutral-500 hover:text-neutral-900",
            current === link.href && "font-medium text-brand-600 hover:text-brand-600",
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
