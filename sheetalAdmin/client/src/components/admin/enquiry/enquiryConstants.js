import { AlertCircle, BookOpen, CheckCheck } from "lucide-react";

export const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700 border border-blue-200",
  read: "bg-slate-100 text-slate-600 border border-slate-200",
  replied: "bg-emerald-100 text-emerald-700 border border-emerald-200",
};

export const STATUS_OPTIONS = ["all", "new", "read", "replied"];

export const STATUS_ICONS = {
  new: AlertCircle,
  read: BookOpen,
  replied: CheckCheck,
};