"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Newspaper,
  FileEdit,
  Settings,
  Search,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";
import BlogTable from "@/components/admin/blog/BlogTable";
import AdminStatCard from "@/components/admin/common/AdminStatCard";
import PageHeader from "@/components/admin/layout/PageHeader";
import { getBlogStats } from "@/services/blogService";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import toast from "react-hot-toast";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

const SLUG = "blog";

export default function BlogsPage() {
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    published: 0,
    totalViews: 0,
  });

  // ── Homepage section heading (stored in homepage model) ──────────────
  const [sectionHeading, setSectionHeading] = useState("");
  const [isSavingHeading, setIsSavingHeading] = useState(false);
  const [isLoadingHeading, setIsLoadingHeading] = useState(false);

  // ── Blog Page Settings (SEO / title stored in pages model) ──────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [autoSchema, setAutoSchema] = useState("");
  const [pageSettings, setPageSettings] = useState({
    title: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    schema: "",
  });

  // ── Fetch blog stats ─────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const res = await getBlogStats();
      if (res.success) {
        setStats({
          total: res.data.total || 0,
          active: res.data.active || 0,
          published: res.data.published || 0,
          totalViews: res.data.totalViews || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching blog stats:", err);
    }
  }, []);

  // ── Fetch homepage section heading ───────────────────────────────────
  const fetchSectionHeading = useCallback(async () => {
    setIsLoadingHeading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/homepage/sections`, {
        withCredentials: true,
      });
      if (data.success) {
        setSectionHeading(
          data.blogs?.heading || "Latest Articles & Blogs"
        );
      }
    } catch (err) {
      console.error("Error fetching section heading:", err);
    } finally {
      setIsLoadingHeading(false);
    }
  }, []);

  // ── Save homepage section heading ────────────────────────────────────
  const handleSaveHeading = async (e) => {
    e.preventDefault();
    setIsSavingHeading(true);
    try {
      const res = await axios.patch(
        `${API_BASE_URL}/homepage/sections`,
        { blogs: { heading: sectionHeading } },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Section heading updated!");
      }
    } catch (error) {
      console.error("Error saving heading:", error);
      toast.error(
        error.response?.data?.message || "Failed to update heading"
      );
    } finally {
      setIsSavingHeading(false);
    }
  };

  // ── Fetch blog page SEO settings ─────────────────────────────────────
  const fetchPageSettings = useCallback(async () => {
    setIsLoadingSettings(true);
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/pages/slug/${SLUG}`,
        { withCredentials: true }
      );
      if (data.success && data.page) {
        setPageSettings({
          title: data.page.title || "",
          metaTitle: data.page.metaTitle || "",
          metaDescription: data.page.metaDescription || "",
          metaKeywords: data.page.metaKeywords || "",
          canonicalUrl: data.page.canonicalUrl || "",
          ogImage: data.page.ogImage || "",
          schema: data.page.seoSchema || data.page.schema || "",
        });
      }
    } catch (err) {
      console.error("Error fetching blog page settings:", err);
      toast.error("Failed to load page settings");
    } finally {
      setIsLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchSectionHeading();
  }, [fetchStats, fetchSectionHeading]);

  // Fetch SEO settings only when panel is first opened
  useEffect(() => {
    if (settingsOpen && !pageSettings.title && !isLoadingSettings) {
      fetchPageSettings();
    }
  }, [settingsOpen]);

  // Validate schema on change
  useEffect(() => {
    const validation = validateJsonLd(pageSettings.schema || "");
    setSchemaError(validation.valid ? null : validation.error);
  }, [pageSettings.schema]);

  const updateField = (key, value) => {
    setPageSettings((prev) => ({ ...prev, [key]: value }));
  };

  const generateSchema = async (applyToForm = true) => {
    try {
      setIsSchemaLoading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/pages/generate-schema`,
        { ...pageSettings, slug: SLUG },
        { withCredentials: true }
      );
      if (data.success) {
        setAutoSchema(data.schema || "");
        if (applyToForm) {
          updateField("schema", data.schema || "");
          setSchemaError(null);
          toast.success("Schema generated");
        }
      }
    } catch (error) {
      toast.error("Failed to generate schema");
    } finally {
      setIsSchemaLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();

    const schemaValidation = validateJsonLd(pageSettings.schema || "");
    if (!schemaValidation.valid) {
      setSchemaError(schemaValidation.error);
      toast.error(schemaValidation.error);
      return;
    }

    setIsSavingSettings(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/pages/slug/${SLUG}`,
        {
          ...pageSettings,
          schema: schemaValidation.formatted || "",
        },
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success("Blog page settings saved!");
      }
    } catch (error) {
      console.error("Error saving blog page settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to save page settings"
      );
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="min-h-screen w-full animate-in fade-in duration-500">
      <PageHeader
        title="Blog Management"
        subtitle="Create, edit and manage your blog posts and articles"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <AdminStatCard
          title="Total Blogs"
          count={stats.total}
          icon={<Newspaper size={20} />}
        />
        <AdminStatCard
          title="Active Status"
          count={stats.active}
          icon={<FileEdit size={20} />}
        />
      </div>

      {/* ── Homepage Section Heading ──────────────────────────────────── */}
      <div className="mb-4 bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Home size={18} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Homepage Section Heading
            </p>
            <p className="text-xs text-slate-500">
              The title shown above the blogs grid on the home page
            </p>
          </div>
        </div>

        {isLoadingHeading ? (
          <div className="flex items-center gap-2 py-2">
            <Loader2 className="animate-spin text-slate-400" size={16} />
            <span className="text-sm text-slate-400">Loading…</span>
          </div>
        ) : (
          <form onSubmit={handleSaveHeading} className="flex gap-3">
            <input
              type="text"
              value={sectionHeading}
              onChange={(e) => setSectionHeading(e.target.value)}
              placeholder="e.g. Latest Articles & Blogs"
              className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-semibold text-black focus:bg-white focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
            />
            <button
              type="submit"
              disabled={isSavingHeading}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSavingHeading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Save size={16} />
              )}
              <span>Save</span>
            </button>
          </form>
        )}
      </div>

      {/* ── Blog Page SEO Settings (collapsible) ─────────────────────── */}
      <div className="mb-6 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setSettingsOpen((prev) => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Settings size={18} />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">
                Blog Page SEO Settings
              </p>
              <p className="text-xs text-slate-500">
                Update the /blog listing page title, meta tags and schema
              </p>
            </div>
          </div>
          {settingsOpen ? (
            <ChevronUp size={18} className="text-slate-400" />
          ) : (
            <ChevronDown size={18} className="text-slate-400" />
          )}
        </button>

        {settingsOpen && (
          <div className="border-t border-slate-100 px-6 pb-6 pt-5">
            {isLoadingSettings ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="animate-spin text-indigo-500" size={28} />
              </div>
            ) : (
              <form onSubmit={handleSaveSettings} className="space-y-6">
                {/* Page Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-bold text-slate-700">
                    Blog Page Title
                  </label>
                  <input
                    type="text"
                    value={pageSettings.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g. Our Blog"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-semibold text-black"
                  />
                </div>

                {/* SEO Section */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-500">
                    <Search size={14} />
                    SEO &amp; Meta
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Meta Title
                      </span>
                      <input
                        type="text"
                        value={pageSettings.metaTitle}
                        onChange={(e) =>
                          updateField("metaTitle", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Meta Description
                      </span>
                      <textarea
                        rows={3}
                        value={pageSettings.metaDescription}
                        onChange={(e) =>
                          updateField("metaDescription", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Meta Keywords
                      </span>
                      <input
                        type="text"
                        value={pageSettings.metaKeywords}
                        onChange={(e) =>
                          updateField("metaKeywords", e.target.value)
                        }
                        placeholder="keyword1, keyword2, ..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                    </label>

                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        Canonical URL
                      </span>
                      <input
                        type="text"
                        value={pageSettings.canonicalUrl}
                        onChange={(e) =>
                          updateField("canonicalUrl", e.target.value)
                        }
                        placeholder="https://yourdomain.com/blog"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">
                        OG Image URL
                      </span>
                      <input
                        type="text"
                        value={pageSettings.ogImage}
                        onChange={(e) =>
                          updateField("ogImage", e.target.value)
                        }
                        placeholder="https://yourdomain.com/og-blog.jpg"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
                      />
                    </label>
                  </div>

                  <SchemaEditor
                    value={pageSettings.schema}
                    onChange={(value) => updateField("schema", value)}
                    onGenerate={() => generateSchema(true)}
                    onReset={() => {
                      if (!autoSchema) return;
                      updateField("schema", autoSchema);
                      setSchemaError(null);
                    }}
                    error={schemaError}
                    isLoading={isSchemaLoading}
                    autoSchemaAvailable={Boolean(autoSchema)}
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSavingSettings ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Blog Table ───────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <BlogTable refreshStats={fetchStats} />
      </div>
    </div>
  );
}
