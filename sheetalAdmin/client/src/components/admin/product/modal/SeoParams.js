import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, Upload } from "lucide-react";
import {
    getRatioLabel,
    getImageAspectRatioWarning,
} from "@/utils/imageAspectRatio";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

const OG_RATIO = { width: 1200, height: 630 };
const OG_RATIO_LABEL = getRatioLabel(OG_RATIO.width, OG_RATIO.height);

export default function SeoParams({ formData, handleChange, setFormData }) {
    const [jsonError, setJsonError] = useState(null);
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [autoSchema, setAutoSchema] = useState("");
    const autoRequestedRef = useRef(false);
    const [ogPreviewUrl, setOgPreviewUrl] = useState("");

    const generateSchema = async (applyToForm = true) => {
        try {
            setIsSchemaLoading(true);
            const res = await axios.post(
                `${API_BASE_URL}/products/admin/generate-schema`,
                formData,
                { withCredentials: true },
            );
            if (res.data.success) {
                setAutoSchema(res.data.schema || "");
                if (applyToForm) {
                    setFormData({ ...formData, seoSchema: res.data.schema || "" });
                    setJsonError(null);
                    toast.success("Schema generated successfully");
                }
            }
        } catch (error) {
            toast.error("Failed to generate schema");
        } finally {
            setIsSchemaLoading(false);
        }
    };

    useEffect(() => {
        const validation = validateJsonLd(formData.seoSchema || "");
        setJsonError(validation.valid ? null : validation.error);
    }, [formData.seoSchema]);

    useEffect(() => {
        if (autoRequestedRef.current || formData.seoSchema?.trim()) return;
        if (!formData.name?.trim() && !formData.metaTitle?.trim()) return;

        autoRequestedRef.current = true;
        generateSchema(true);
    }, [formData.name, formData.metaTitle]);

    useEffect(() => {
        if (!formData.ogImage) {
            setOgPreviewUrl("");
            return;
        }

        if (formData.ogImage instanceof File) {
            const preview = URL.createObjectURL(formData.ogImage);
            setOgPreviewUrl(preview);
            return () => URL.revokeObjectURL(preview);
        }

        if (typeof formData.ogImage === "string") {
            setOgPreviewUrl(formData.ogImage);
        }
    }, [formData.ogImage]);

    const handleOgImageChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const warning = await getImageAspectRatioWarning(file, OG_RATIO);
        if (warning) {
            toast.error(warning);
        }

        setFormData({ ...formData, ogImage: file });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-900">
                        URL Slug
                    </label>
                    <input
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        placeholder="cotton-slim-fit-shirt"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 bg-slate-50"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-900">
                        Meta Title
                    </label>
                    <input
                        name="metaTitle"
                        value={formData.metaTitle || ""}
                        onChange={handleChange}
                        maxLength={60}
                        placeholder="SEO friendly title"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-900">
                        Meta Description
                    </label>
                    <textarea
                        name="metaDescription"
                        value={formData.metaDescription || ""}
                        onChange={handleChange}
                        maxLength={160}
                        rows={4}
                        placeholder="Brief summary for search results"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-900">
                        Meta Keywords
                    </label>
                    <input
                        name="metaKeywords"
                        value={formData.metaKeywords || ""}
                        onChange={handleChange}
                        placeholder="designer saree, ethnic wear"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-900">
                        Canonical URL
                    </label>
                    <input
                        name="canonicalUrl"
                        value={formData.canonicalUrl || ""}
                        onChange={handleChange}
                        placeholder="https://www.example.com/category/product"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-900"
                    />
                </div>

                <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center gap-3">
                        <ImageIcon size={16} className="text-slate-500" />
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-900">
                                OG Image
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Recommended aspect ratio: {OG_RATIO_LABEL}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                        <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                            {ogPreviewUrl ? (
                                <img
                                    src={ogPreviewUrl}
                                    alt="OG preview"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ImageIcon size={18} className="text-slate-300" />
                            )}
                        </div>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white">
                            <Upload size={14} />
                            Upload OG Image
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleOgImageChange}
                            />
                        </label>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <SchemaEditor
                        value={formData.seoSchema || ""}
                        onChange={(value) => setFormData({ ...formData, seoSchema: value })}
                        onGenerate={() => generateSchema(true)}
                        onReset={() => {
                            if (!autoSchema) return;
                            setFormData({ ...formData, seoSchema: autoSchema });
                            setJsonError(null);
                        }}
                        error={jsonError}
                        isLoading={isSchemaLoading}
                        autoSchemaAvailable={Boolean(autoSchema)}
                    />
                </div>
            </div>
        </div>
    );
}
