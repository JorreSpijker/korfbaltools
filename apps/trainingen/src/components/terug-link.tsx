import Link from "next/link";
import { ChevronLeft } from "./icons";

export function TerugLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-ml-1.5 inline-flex min-h-11 items-center gap-1 self-start text-[15px] font-semibold text-muted"
    >
      <ChevronLeft size={20} />
      {children}
    </Link>
  );
}
