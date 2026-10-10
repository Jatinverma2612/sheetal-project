import React from "react";

export default function InputField({ label, ...props }) {
    return (
        <div className="space-y-1.5 w-full text-left">
            <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {label}
            </label>
            <input
                className="w-full bg-white border border-slate-400 px-4 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-500 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none transition shadow-sm"
                {...props}
            />
        </div>
    );
}
