"use client";
import { useState, useEffect } from "react";
import { X, Save, Settings as SettingsIcon, AlertCircle } from "lucide-react";
import { getSettings, updateSettings } from "../../../services/settingsService";
import toast from "react-hot-toast";

export default function SettingsModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        platformFee: 0,
        shippingFee: 0,
        freeShippingThreshold: 0,
        taxPercentage: 0,
    });

    useEffect(() => {
        if (isOpen) {
            loadSettings();
        }
    }, [isOpen]);

    const loadSettings = async () => {
        try {
            const res = await getSettings();
            if (res.success && res.data) {
                setSettings({
                    platformFee: res.data.platformFee || 0,
                    shippingFee: res.data.shippingFee || 0,
                    freeShippingThreshold: res.data.freeShippingThreshold || 0,
                    taxPercentage: res.data.taxPercentage || 0,
                });
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load settings. Please refresh and try again.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings((prev) => ({
            ...prev,
            [name]: Number(value),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await updateSettings(settings);
            if (res.success) {
                toast.success("Settings updated successfully!");
                onClose();
            } else {
                toast.error("Failed to update settings. Please try again.");
            }
        } catch (error) {
            toast.error("Failed to update settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-[100] p-4 text-left font-montserrat">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-900 text-white rounded-lg shadow-sm">
                            <SettingsIcon size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 leading-tight">
                                Global Settings
                            </h2>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                                Platform Fees & Charges
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 cursor-pointer  hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded-lg transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                            Platform Fee (₹)
                            <AlertCircle size={12} className="text-slate-400" />
                        </label>
                        <input
                            type="number"
                            name="platformFee"
                            min="0"
                            value={settings.platformFee}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition shadow-sm"
                            placeholder="0"
                        />
                        <p className="text-[10px] text-slate-400">Fixed fee applied to every order.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Shipping Fee (₹)
                        </label>
                        <input
                            type="number"
                            name="shippingFee"
                            min="0"
                            value={settings.shippingFee}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition shadow-sm"
                            placeholder="0"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            Free Shipping Above (₹)
                        </label>
                        <input
                            type="number"
                            name="freeShippingThreshold"
                            min="0"
                            value={settings.freeShippingThreshold}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition shadow-sm"
                            placeholder="0"
                        />
                        <p className="text-[10px] text-slate-400">Order amount to qualify for free shipping.</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                            GST Percentage (%)
                        </label>
                        <input
                            type="number"
                            name="taxPercentage"
                            min="0"
                            max="100"
                            value={settings.taxPercentage}
                            onChange={handleChange}
                            className="w-full bg-white border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-bold text-slate-900 focus:border-slate-900 outline-none transition shadow-sm"
                            placeholder="0"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 cursor-pointer border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 transition uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-[2] bg-slate-900 cursor-pointer hover:bg-black text-white py-2.5 rounded-lg font-bold text-sm transition shadow-lg active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            <Save size={16} />
                            {loading ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
