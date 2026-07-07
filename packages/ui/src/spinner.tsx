import { Loader2 } from "lucide-react";
import { cn } from "./cn";

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-6 w-6 animate-spin text-primary-500", className)} />;
}
