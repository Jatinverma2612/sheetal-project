"use client";

import React, { useEffect, useMemo, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft, Search } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import PageHeader from "@/components/admin/layout/PageHeader";
import TiptapEditor from "@/components/TiptapEditor";
import Link from "next/link";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

export default function EditPolicyPage({ params }) {
  const { slug } = use(params);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [autoSchema, setAutoSchema] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    schema: "",
  });

  useEffect(() => {
    if (!slug) return;

    const fetchPageData = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/pages/slug/${slug}`, {
          withCredentials: true,
        });

        if (data.success && data.page) {
          setFormData({
            title: data.page.title || "",
            content: data.page.content || "",
            metaTitle: data.page.metaTitle || "",
            metaDescription: data.page.metaDescription || "",
            metaKeywords: data.page.metaKeywords || "",
            canonicalUrl: data.page.canonicalUrl || "",
            ogImage: data.page.ogImage || "",
            schema: data.page.seoSchema || data.page.schema || "",
          });
        }
      } catch (error) {
        console.error("Error fetching page data", error);
        toast.error("Failed to load page content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPageData();
  }, [slug]);

  useEffect(() => {
    const validation = validateJsonLd(formData.schema || "");
    setSchemaError(validation.valid ? null : validation.error);
  }, [formData.schema]);

  useEffect(() => {
    if (isLoading || formData.schema?.trim()) return;
    if (!formData.title?.trim() && !formData.metaTitle?.trim()) return;
    generateSchema(true);
  }, [isLoading, formData.title, formData.metaTitle]);

  const humanReadableTitle = useMemo(
    () =>
      slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    [slug],
  );

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const generateSchema = async (applyToForm = true) => {
    try {
      setIsSchemaLoading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/pages/generate-schema`,
        { ...formData, slug },
        { withCredentials: true },
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

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.content || formData.content === "<p></p>") {
      toast.error("Content is empty");
      return;
    }

    const schemaValidation = validateJsonLd(formData.schema || "");
    if (!schemaValidation.valid) {
      setSchemaError(schemaValidation.error);
      toast.error(schemaValidation.error);
      return;
    }

    setIsSaving(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/pages/slug/${slug}`,
        {
          ...formData,
          schema: schemaValidation.formatted || "",
        },
        {
          withCredentials: true,
        },
      );

      if (res.data.success) {
        toast.success("Page updated successfully");
        router.push("/admin/cms/pages");
      }
    } catch (error) {
      console.error("Error saving page", error);
      toast.error(error.response?.data?.message || "Failed to update page");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full animate-in fade-in duration-500 pb-20 text-black">
      <div className="flex items-center gap-4 mb-4">
        <Link
          href="/admin/cms/pages"
          className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageHeader
          title={`Edit ${humanReadableTitle}`}
          subtitle={`Manage content and SEO for ${humanReadableTitle.toLowerCase()}`}
        />
      </div>

      <form onSubmit={handleSave} className="mt-8 max-w-5xl mx-auto space-y-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700">
              Page Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="e.g. Terms and Conditions"
              required
              className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-semibold"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 mb-1">
              Page Content
            </label>
            <TiptapEditor
              value={formData.content}
              onChange={(value) => updateField("content", value)}
            />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
            <Search size={16} />
            SEO & Meta
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Meta Title
              </span>
              <input
                type="text"
                value={formData.metaTitle}
                onChange={(e) => updateField("metaTitle", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Meta Description
              </span>
              <textarea
                rows={3}
                value={formData.metaDescription}
                onChange={(e) =>
                  updateField("metaDescription", e.target.value)
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Meta Keywords
              </span>
              <input
                type="text"
                value={formData.metaKeywords}
                onChange={(e) => updateField("metaKeywords", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Canonical URL
              </span>
              <input
                type="text"
                value={formData.canonicalUrl}
                onChange={(e) => updateField("canonicalUrl", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                OG Image URL
              </span>
              <input
                type="text"
                value={formData.ogImage}
                onChange={(e) => updateField("ogImage", e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </label>
          </div>

          <SchemaEditor
            value={formData.schema}
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

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:pl-72 z-10 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
