"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Home, Loader2, Save } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import axios from "axios";
import PageHeader from "@/components/admin/layout/PageHeader";
import { API_BASE_URL } from "@/services/api";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

export default function HomepageSeoPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [autoSchema, setAutoSchema] = useState("");
  const [formData, setFormData] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    schema: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/homepage/sections`);
        if (data.success) {
          setFormData({
            metaTitle: data.metaTitle || "",
            metaDescription: data.metaDescription || "",
            metaKeywords: data.metaKeywords || "",
            canonicalUrl: data.canonicalUrl || "",
            ogImage: data.ogImage || "",
            schema: data.schema || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load homepage SEO");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const validation = validateJsonLd(formData.schema || "");
    setSchemaError(validation.valid ? null : validation.error);
  }, [formData.schema]);

  useEffect(() => {
    if (isLoading || formData.schema?.trim()) return;
    if (!formData.metaTitle?.trim() && !formData.metaDescription?.trim()) return;
    generateSchema(true);
  }, [isLoading, formData.metaTitle, formData.metaDescription]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const generateSchema = async (applyToForm = true) => {
    try {
      setIsSchemaLoading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/homepage/generate-schema`,
        formData,
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

  const handleSave = async () => {
    const schemaValidation = validateJsonLd(formData.schema || "");
    if (!schemaValidation.valid) {
      setSchemaError(schemaValidation.error);
      toast.error(schemaValidation.error);
      return;
    }

    setIsSaving(true);
    try {
      const { data } = await axios.patch(
        `${API_BASE_URL}/homepage/sections`,
        {
          ...formData,
          schema: schemaValidation.formatted || "",
        },
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Homepage SEO updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save homepage SEO");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500 pb-12">
      <div className="mb-4 flex items-center gap-4">
        <Link
          href="/admin/cms/homepage"
          className="rounded-full p-2 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft size={20} />
        </Link>
        <PageHeader
          title="Homepage SEO"
          subtitle="Manage homepage meta tags and structured data"
        />
      </div>

      <div className="mx-auto mt-8 max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
            <Home size={16} />
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
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

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Save Homepage SEO
          </button>
        </div>
      </div>
    </div>
  );
}
