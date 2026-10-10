import React from "react";
import { Settings, Plus, Trash2 } from "lucide-react";

export default function SpecParams({ formData, setFormData }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    {/* Key Benefits Section (Commented out in original but keeping structure if needed)
           * If needed in future, uncomment here
           */}
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-slate-900 px-5 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                            <Settings size={16} className="text-blue-400" />
                            <span className="text-xs font-bold uppercase tracking-wider">
                                Specifications
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                setFormData((p) => ({
                                    ...p,
                                    specifications: [
                                        ...p.specifications,
                                        { key: "", value: "" },
                                    ],
                                }))
                            }
                            className="bg-white/10 hover:bg-white/20 text-white p-1 rounded-md transition"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="p-5 space-y-3">
                        {formData.specifications.map((s, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input
                                    className="w-1/3 bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg text-xs font-bold focus:bg-white focus:border-slate-900 outline-none transition"
                                    placeholder="Label (e.g. Fabric)"
                                    value={s.key}
                                    onChange={(e) => {
                                        const up = [...formData.specifications];
                                        up[i].key = e.target.value;
                                        setFormData({ ...formData, specifications: up });
                                    }}
                                />
                                <input
                                    className="flex-1 bg-slate-50 border border-slate-300 px-3 py-2 rounded-lg text-xs focus:bg-white focus:border-slate-900 outline-none transition"
                                    placeholder="Value (e.g. Cotton)"
                                    value={s.value}
                                    onChange={(e) => {
                                        const up = [...formData.specifications];
                                        up[i].value = e.target.value;
                                        setFormData({ ...formData, specifications: up });
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setFormData({
                                            ...formData,
                                            specifications: formData.specifications.filter(
                                                (_, idx) => idx !== i,
                                            ),
                                        })
                                    }
                                    className="text-slate-400 hover:text-rose-500 transition"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {formData.specifications.length === 0 && (
                            <p className="text-center text-[10px] text-slate-400 italic py-2">
                                No specs added yet
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
