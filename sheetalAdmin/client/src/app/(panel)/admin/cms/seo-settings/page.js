"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Plus, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import PageHeader from "@/components/admin/layout/PageHeader";
import { API_BASE_URL } from "@/services/api";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

const createSocialLink = () => ({ platform: "", url: "" });

export default function SeoSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [autoSchema, setAutoSchema] = useState("");
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteUrl: "",
    organizationName: "",
    organizationDescription: "",
    logo: "",
    contactEmail: "",
    contactPhone: "",
    socialMediaLinks: [createSocialLink()],
    schema: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/seo-settings`);
        if (data.success && data.settings) {
          setFormData({
            websiteName: data.settings.websiteName || "",
            websiteUrl: data.settings.websiteUrl || "",
            organizationName: data.settings.organizationName || "",
            organizationDescription:
              data.settings.organizationDescription || "",
            logo: data.settings.logo || "",
            contactEmail: data.settings.contactEmail || "",
            contactPhone: data.settings.contactPhone || "",
            socialMediaLinks:
              data.settings.socialMediaLinks?.length > 0
                ? data.settings.socialMediaLinks
                : [createSocialLink()],
            schema: data.settings.schema || "",
          });
        }
      } catch (error) {
        toast.error("Failed to load SEO settings");
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
    if (!formData.websiteName?.trim() && !formData.organizationName?.trim()) {
      return;
    }
    generateSchema(true);
  }, [isLoading, formData.websiteName, formData.organizationName]);

  const updateField = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocialLink = (index, key, value) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: prev.socialMediaLinks.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      ),
    }));
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks: [...prev.socialMediaLinks, createSocialLink()],
    }));
  };

  const removeSocialLink = (index) => {
    setFormData((prev) => ({
      ...prev,
      socialMediaLinks:
        prev.socialMediaLinks.length > 1
          ? prev.socialMediaLinks.filter((_, itemIndex) => itemIndex !== index)
          : [createSocialLink()],
    }));
  };

  const generateSchema = async (applyToForm = true) => {
    try {
      setIsSchemaLoading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/seo-settings/generate-schema`,
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
      const payload = {
        ...formData,
        socialMediaLinks: formData.socialMediaLinks.filter(
          (item) => item.platform?.trim() || item.url?.trim(),
        ),
        schema: schemaValidation.formatted || "",
      };

      const { data } = await axios.patch(
        `${API_BASE_URL}/seo-settings`,
        payload,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("SEO settings updated");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings");
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
      <PageHeader
        title="SEO Settings"
        subtitle="Manage global website, organization, and structured data defaults"
      />

      <div className="mx-auto mt-8 max-w-5xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
            <Globe size={16} />
            Global SEO
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Website Name
              </span>
              <input
                type="text"
                value={formData.websiteName}
                onChange={(e) => updateField("websiteName", e.target.value)}
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Website URL
              </span>
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => updateField("websiteUrl", e.target.value)}
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Organization Name
              </span>
              <input
                type="text"
                value={formData.organizationName}
                onChange={(e) =>
                  updateField("organizationName", e.target.value)
                }
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Logo URL
              </span>
              <input
                type="text"
                value={formData.logo}
                onChange={(e) => updateField("logo", e.target.value)}
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Organization Description
              </span>
              <textarea
                rows={3}
                value={formData.organizationDescription}
                onChange={(e) =>
                  updateField("organizationDescription", e.target.value)
                }
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Contact Email
              </span>
              <input
                type="text"
                value={formData.contactEmail}
                onChange={(e) => updateField("contactEmail", e.target.value)}
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                Contact Phone
              </span>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                className="w-full text-black rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Social Media Links
            </h2>
            <button
              type="button"
              onClick={addSocialLink}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
            >
              <Plus size={12} />
              Add Link
            </button>
          </div>

          <div className="space-y-3">
            {formData.socialMediaLinks.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <input
                  type="text"
                  value={item.platform || ""}
                  onChange={(e) =>
                    updateSocialLink(index, "platform", e.target.value)
                  }
                  placeholder="Platform"
                  className="rounded-xl text-black border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <input
                  type="text"
                  value={item.url || ""}
                  onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                  placeholder="https://instagram.com/yourbrand"
                  className="rounded-xl text-black border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => removeSocialLink(index)}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-3 text-slate-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl text-black border border-slate-200 bg-white p-6 shadow-sm">
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
            Save SEO Settings
          </button>
        </div>
      </div>
    </div>
  );
}
