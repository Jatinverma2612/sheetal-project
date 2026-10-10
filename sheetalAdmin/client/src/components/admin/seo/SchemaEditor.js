"use client";

import { AlertCircle, RefreshCw, RotateCcw } from "lucide-react";

export default function SchemaEditor({
  value,
  onChange,
  onGenerate,
  onReset,
  error,
  isLoading = false,
  autoSchemaAvailable = false,
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex justify-between items-center gap-3">
        <span>Schema</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGenerate}
            disabled={isLoading}
            className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white disabled:opacity-60"
          >
            <RefreshCw size={10} className={isLoading ? "animate-spin" : ""} />
            Generate Schema
          </button>
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading || !autoSchemaAvailable}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 disabled:opacity-50"
          >
            <RotateCcw size={10} />
            Reset to Auto
          </button>
        </div>
      </label>

      <textarea
        name="schema"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        rows={10}
        placeholder='{ "@context": "https://schema.org", ... }'
        className={`w-full rounded-xl border px-3 py-2.5 text-sm font-mono outline-none transition resize-y ${
          error
            ? "border-rose-400 bg-rose-50 focus:border-rose-500"
            : "border-slate-300 bg-white focus:border-slate-900"
        }`}
      />

      {error ? (
        <p className="flex items-center gap-1 text-[11px] text-rose-600">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : (
        <p className="text-[11px] text-slate-500">
          Saved custom schema is used on the storefront until you regenerate or
          reset it.
        </p>
      )}
    </div>
  );
}
