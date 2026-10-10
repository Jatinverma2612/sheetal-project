import { AlertCircle } from "lucide-react";
import { STATUS_STYLES, STATUS_ICONS } from "./enquiryConstants.js";

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();
  const Icon = STATUS_ICONS[normalizedStatus] || AlertCircle;
  const badgeClass =
    STATUS_STYLES[normalizedStatus] ||
    "bg-slate-100 text-slate-600 border border-slate-200";

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${badgeClass}`}
    >
      <Icon size={10} />
      {normalizedStatus || "unknown"}
    </span>
  );
}