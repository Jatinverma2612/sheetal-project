"use client";
import { useCallback, useEffect, useState } from "react";
import { CreditCard, Save, Loader2, RefreshCw, Palette, Upload, History, Globe } from "lucide-react";
import toast from "react-hot-toast";
import PageHeader from "@/components/admin/layout/PageHeader.js";
import { getSettings, updateSettings, updateLogo, restoreLogo, updateFavicon } from "@/services/settingsService";

export default function SettingsPage() {
  const inputStyle =
    "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 transition-all";
  const labelStyle =
    "text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 block";

  const [globalSettings, setGlobalSettings] = useState({
    platformFee: 0,
    shippingFee: 0,
    freeShippingThreshold: 0,
    taxPercentage: 0,
    globalHsnCode: "",
  });

  const [brandSettings, setBrandSettings] = useState({
    logo: null,
    favicon: "",
    logoHistory: [],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);

  const loadData = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const settingsRes = await getSettings();

      if (settingsRes?.success && settingsRes?.data) {
        setGlobalSettings({
          platformFee: settingsRes.data.platformFee || 0,
          shippingFee: settingsRes.data.shippingFee || 0,
          freeShippingThreshold: settingsRes.data.freeShippingThreshold || 0,
          taxPercentage: settingsRes.data.taxPercentage || 0,
          globalHsnCode: settingsRes.data.globalHsnCode || "",
        });

        setBrandSettings({
          logo: settingsRes.data.logo || null,
          favicon: settingsRes.data.favicon || "",
          logoHistory: settingsRes.data.logoHistory || [],
        });
      }

      if (showToast) toast.success("Settings loaded");
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGlobalSettingChange = (e) => {
    const { name, value } = e.target;
    setGlobalSettings((prev) => ({
      ...prev,
      [name]: name === "globalHsnCode" ? value : Number(value),
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await updateSettings(globalSettings);
      if (res.success) {
        toast.success("Global settings updated!");
      } else {
        toast.error(res.message || "Failed to update settings");
      }
    } catch (error) {
      toast.error("Error saving settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = async () => {
      const formData = new FormData();
      formData.append("logo", file);
      formData.append("width", img.width);
      formData.append("height", img.height);

      setIsUploadingLogo(true);
      try {
        const res = await updateLogo(formData);
        if (res.success) {
          toast.success("Logo updated successfully!");
          setBrandSettings((prev) => ({
            ...prev,
            logo: res.data.logo,
            logoHistory: res.data.logoHistory,
          }));
        } else {
          toast.error(res.message || "Failed to upload logo");
        }
      } catch (error) {
        toast.error("Error uploading logo");
      } finally {
        setIsUploadingLogo(false);
      }
    };
  };

  const handleFaviconUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("favicon", file);

    setIsUploadingFavicon(true);
    try {
      const res = await updateFavicon(formData);
      if (res.success) {
        toast.success("Favicon updated successfully!");
        setBrandSettings((prev) => ({
          ...prev,
          favicon: res.data.favicon,
        }));
      } else {
        toast.error(res.message || "Failed to upload favicon");
      }
    } catch (error) {
      toast.error("Error uploading favicon");
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  const handleRestoreLogo = async (historyId) => {
    if (!confirm("Are you sure you want to restore this version?")) return;

    try {
      const res = await restoreLogo(historyId);
      if (res.success) {
        toast.success("Logo restored!");
        setBrandSettings((prev) => ({
          ...prev,
          logo: res.data.logo,
          logoHistory: res.data.logoHistory,
        }));
      } else {
        toast.error(res.message || "Failed to restore logo");
      }
    } catch (error) {
      toast.error("Error restoring logo");
    }
  };

  return (
    <div className="w-full animate-in fade-in duration-500 pb-10">
      <PageHeader
        title="Store Settings"
        subtitle="Manage global tax, platform fees, and brand assets"
      />

      <div className="mt-8 max-w-4xl mx-auto space-y-8">
        {/* --- Brand Assets --- */}
        <div className="bg-white p-6 md:p-8 rounded-[28px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Palette size={18} className="text-pink-500" /> Brand Assets
            </h3>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
              <Loader2 size={22} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Logo Upload */}
              <div className="space-y-4">
                <label className={labelStyle}>Primary Website Logo</label>
                <div className="relative group">
                  <div className="aspect-video w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-emerald-500/50">
                    {brandSettings.logo?.url ? (
                      <img
                        src={brandSettings.logo.url}
                        alt="Logo Preview"
                        className="max-h-24 w-auto object-contain"
                      />
                    ) : (
                      <div className="text-center p-6">
                        <Upload size={32} className="mx-auto text-slate-300 mb-2" />
                        <p className="text-xs font-bold text-slate-400">No Logo Uploaded</p>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Upload size={14} />
                        {isUploadingLogo ? "Uploading..." : "Upload New"}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={isUploadingLogo}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This logo appears in headers and footers. Recommended size: 150x50px (3:1 aspect ratio).
                </p>
                {brandSettings.logo && (
                  <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
                    <span>Uploaded: {new Date(brandSettings.logo.uploadDate).toLocaleDateString()}</span>
                    {brandSettings.logo.dimensions && (
                      <span>{brandSettings.logo.dimensions.width}x{brandSettings.logo.dimensions.height}px</span>
                    )}
                  </div>
                )}
              </div>

              {/* Favicon Upload */}
              <div className="space-y-4">
                <label className={labelStyle}>Browser Favicon</label>
                <div className="flex items-start gap-6">
                  <div className="h-20 w-20 shrink-0 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden">
                    {brandSettings.favicon ? (
                      <img
                        src={brandSettings.favicon}
                        alt="Favicon"
                        className="h-10 w-10 object-contain"
                      />
                    ) : (
                      <Globe size={24} className="text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed">
                      This icon appears in browser tabs and bookmarks. Recommended size: 32x32px or 64x64px.
                    </p>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-slate-800 disabled:opacity-70">
                      {isUploadingFavicon ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Upload size={12} />
                      )}
                      {isUploadingFavicon ? "Uploading..." : "Upload Favicon"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/x-icon,image/png,image/svg+xml"
                        onChange={handleFaviconUpload}
                        disabled={isUploadingFavicon}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Logo History */}
              {brandSettings.logoHistory.length > 0 && (
                <div className="md:col-span-2 space-y-4 pt-4">
                  <h4 className={labelStyle + " flex items-center gap-2"}>
                    <History size={14} /> Previous Versions
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {brandSettings.logoHistory.map((item, idx) => (
                      <div key={item._id || idx} className="group relative">
                        <div className="aspect-video bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center p-3 transition-all hover:border-pink-200">
                          <img
                            src={item.url}
                            alt={`History ${idx}`}
                            className="max-h-full w-auto object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                          />
                          <button
                            onClick={() => handleRestoreLogo(item._id)}
                            className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-all rounded-2xl text-[10px] font-black text-pink-600 uppercase tracking-widest"
                          >
                            Restore
                          </button>
                        </div>
                        <p className="mt-1.5 text-[9px] text-center text-slate-400 font-bold">
                          {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Payments & Tax Settings --- */}
        <div className="bg-white p-6 md:p-8 rounded-[28px] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CreditCard size={18} className="text-emerald-500" /> Payments &
              Tax Settings
            </h3>
            <button
              type="button"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-white hover:border-slate-300 disabled:opacity-70"
            >
              {isRefreshing ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCw size={14} />
              )}
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50">
              <Loader2 size={22} className="animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className={labelStyle}>Platform Fee (₹)</label>
                <input
                  type="number"
                  name="platformFee"
                  min="0"
                  value={globalSettings.platformFee}
                  onChange={handleGlobalSettingChange}
                  className={inputStyle}
                />
                <p className="text-[10px] text-slate-400">
                  Fixed fee applied to every order.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Shipping Fee (₹)</label>
                <input
                  type="number"
                  name="shippingFee"
                  min="0"
                  value={globalSettings.shippingFee}
                  onChange={handleGlobalSettingChange}
                  className={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Free Shipping Above (₹)</label>
                <input
                  type="number"
                  name="freeShippingThreshold"
                  min="0"
                  value={globalSettings.freeShippingThreshold}
                  onChange={handleGlobalSettingChange}
                  className={inputStyle}
                />
                <p className="text-[10px] text-slate-400">
                  Order amount to qualify for free shipping.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>GST Percentage (%)</label>
                <input
                  type="number"
                  name="taxPercentage"
                  min="0"
                  max="100"
                  value={globalSettings.taxPercentage}
                  onChange={handleGlobalSettingChange}
                  className={inputStyle}
                />
                <p className="text-[10px] text-slate-400 font-medium text-emerald-600">
                  Default GST for categories without a specific rate.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className={labelStyle}>Global HSN Code</label>
                <input
                  type="text"
                  name="globalHsnCode"
                  value={globalSettings.globalHsnCode}
                  onChange={handleGlobalSettingChange}
                  className={inputStyle}
                  placeholder="e.g. 6204"
                />
                <p className="text-[10px] text-slate-400">
                  Default HSN code for items where the category does not define one.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-4 pt-8">
          <button
            onClick={() => loadData(true)}
            className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
