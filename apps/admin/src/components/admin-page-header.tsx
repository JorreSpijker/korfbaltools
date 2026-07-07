import type { LucideIcon } from "lucide-react";
import { AdminNav } from "@korfbaltools/ui";

interface AdminPageHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function AdminPageHeader({ icon: Icon, title, description }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-neutral-200 pb-6">
      <AdminNav />
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-900">
          <Icon className="h-6 w-6 text-primary-600" />
          {title}
        </h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-neutral-600">{description}</p>}
      </div>
    </div>
  );
}
