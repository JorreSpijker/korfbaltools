import type { VastspelenSpelerStatus } from "@korfbaltools/types";

const STATUS_LABEL: Record<VastspelenSpelerStatus, string> = {
  vrij: "Vrij inzetbaar",
  laatste_invalbeurt: "Laatste invalbeurt",
  zou_vastspelen_veroorzaken: "Zou vastspelen veroorzaken",
};

const STATUS_CLASS: Record<VastspelenSpelerStatus, string> = {
  vrij: "bg-success/10 text-success",
  laatste_invalbeurt: "bg-warning/10 text-warning",
  zou_vastspelen_veroorzaken: "bg-danger/10 text-danger",
};

export function StatusBadge({ status }: { status: VastspelenSpelerStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  );
}
