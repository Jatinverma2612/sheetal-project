"use client";

import React, { useState, useEffect } from "react";
import { Save, Loader2, UploadCloud, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import {
    getRatioLabel,
    validateImageAspectRatio,
} from "@/utils/imageAspectRatio";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

const ABOUT_RATIOS = {
    banner: { width: 1920, height: 600 },
    founder: { width: 500, height: 600 },
    mission: { width: 960, height: 640 },
    craft: { width: 600, height: 600 },
};

export default function AboutUsForm() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isSchemaLoading, setIsSchemaLoading] = useState(false);
    const [schemaError, setSchemaError] = useState(null);
    const [autoSchema, setAutoSchema] = useState("");
    const [formData, setFormData] = useState({
        bannerImage: null,
        bannerImagePreview: "",
        bannerTitle: "",
        founderImage: null,
        founderImagePreview: "",
        journeyTitle: "",
        journeyDescription: "",
        missionImage: null,
        missionImagePreview: "",
        missionTitle: "",
        missionDescription: "",
        craftImage: null,
        craftImagePreview: "",
        craftTitle: "",
        craftDescription: "",
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        canonicalUrl: "",
        ogImage: "",
        schema: "",
    });

    useEffect(() => {
        fetchAboutData();
    }, []);

    useEffect(() => {
        const validation = validateJsonLd(formData.schema || "");
        setSchemaError(validation.valid ? null : validation.error);
    }, [formData.schema]);

    useEffect(() => {
        if (isLoading || formData.schema?.trim()) return;
        if (!formData.bannerTitle?.trim() && !formData.metaTitle?.trim()) return;
        generateSchema(true);
    }, [isLoading, formData.bannerTitle, formData.metaTitle]);

    const fetchAboutData = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/pages/about`, {
                withCredentials: true
            });
            if (data.success && data.page) {
                const page = data.page;
                setFormData({
                    bannerImage: null,
                    bannerImagePreview: page.banner?.image || "",
                    bannerTitle: page.banner?.title || "",
                    founderImage: null,
                    founderImagePreview: page.journey?.image || "",
                    journeyTitle: page.journey?.title || "",
                    journeyDescription: page.journey?.description || "",
                    missionImage: null,
                    missionImagePreview: page.mission?.image || "",
                    missionTitle: page.mission?.title || "",
                    missionDescription: page.mission?.description || "",
                    craftImage: null,
                    craftImagePreview: page.craft?.image || "",
                    craftTitle: page.craft?.title || "",
                    craftDescription: page.craft?.description || "",
                    metaTitle: page.metaTitle || "",
                    metaDescription: page.metaDescription || "",
                    metaKeywords: page.metaKeywords || "",
                    canonicalUrl: page.canonicalUrl || "",
                    ogImage: page.ogImage || "",
                    schema: page.seoSchema || page.schema || "",
                });
            }
        } catch (error) {
            console.error("Error fetching about page data", error);
            // toast.error("Failed to load data");
        } finally {
            setIsLoading(false);
        }
    };

    const generateSchema = async (applyToForm = true) => {
        try {
            setIsSchemaLoading(true);
            const { data } = await axios.post(
                `${API_BASE_URL}/pages/generate-schema`,
                {
                    title: formData.bannerTitle || "About Us",
                    content: formData.journeyDescription || "",
                    metaTitle: formData.metaTitle,
                    metaDescription: formData.metaDescription,
                    canonicalUrl: formData.canonicalUrl,
                    slug: "about-us"
                },
                { withCredentials: true },
            );

            if (data.success) {
                setAutoSchema(data.schema || "");
                if (applyToForm) {
                    setFormData((prev) => ({ ...prev, schema: data.schema || "" }));
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = async (e, fieldName, expectedRatio) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await validateImageAspectRatio(file, expectedRatio, {
                    label: `${fieldName.replace(/([A-Z])/g, " $1").trim()}`,
                });
                setFormData((prev) => ({
                    ...prev,
                    [fieldName]: file,
                    [`${fieldName}Preview`]: URL.createObjectURL(file),
                }));
            } catch (err) {
                toast.error(err.message || "Invalid image ratio");
                e.target.value = "";
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const schemaValidation = validateJsonLd(formData.schema || "");
        if (!schemaValidation.valid) {
            setSchemaError(schemaValidation.error);
            toast.error(schemaValidation.error);
            return;
        }

        setIsSaving(true);
        try {
            const data = new FormData();

            // Banner
            if (formData.bannerImage) data.append("bannerImage", formData.bannerImage);
            data.append("bannerTitle", formData.bannerTitle);

            // Journey
            if (formData.founderImage) data.append("founderImage", formData.founderImage);
            data.append("journeyTitle", formData.journeyTitle);
            data.append("journeyDescription", formData.journeyDescription);

            // Mission
            if (formData.missionImage) data.append("missionImage", formData.missionImage);
            data.append("missionTitle", formData.missionTitle);
            data.append("missionDescription", formData.missionDescription);

            // Craft
            if (formData.craftImage) data.append("craftImage", formData.craftImage);
            data.append("craftTitle", formData.craftTitle);
            data.append("craftDescription", formData.craftDescription);

            // SEO & Meta
            data.append("metaTitle", formData.metaTitle || "");
            data.append("metaDescription", formData.metaDescription || "");
            data.append("metaKeywords", formData.metaKeywords || "");
            data.append("canonicalUrl", formData.canonicalUrl || "");
            data.append("ogImage", formData.ogImage || "");
            data.append("schema", schemaValidation.formatted || "");

            const res = await axios.post(`${API_BASE_URL}/pages/about`, data, {
                headers: { "Content-Type": "multipart/form-data" },
                withCredentials: true,
            });

            if (res.data.success) {
                toast.success("About Us page updated successfully!");
                fetchAboutData(); // Refresh data to get real URLs
            }
        } catch (error) {
            console.error("Error saving about page", error);
            toast.error(error.response?.data?.message || "Failed to update page");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-5xl mx-auto pb-20 text-black">

            {/* Banner Section */}
            <SectionCard title="Hero Banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        label="Banner Image"
                        preview={formData.bannerImagePreview}
                        aspectRatioLabel={getRatioLabel(
                            ABOUT_RATIOS.banner.width,
                            ABOUT_RATIOS.banner.height,
                        )}
                        onChange={(e) =>
                            handleFileChange(e, "bannerImage", ABOUT_RATIOS.banner)
                        }
                    />
                    <div className="space-y-4">
                        <Input
                            label="Banner Title"
                            name="bannerTitle"
                            value={formData.bannerTitle}
                            onChange={handleInputChange}
                            placeholder="e.g. Our Story"
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Journey Section */}
            <SectionCard title="Our Journey (Founder Section)">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        label="Founder Image"
                        preview={formData.founderImagePreview}
                        aspectRatioLabel={getRatioLabel(
                            ABOUT_RATIOS.founder.width,
                            ABOUT_RATIOS.founder.height,
                        )}
                        onChange={(e) =>
                            handleFileChange(
                                e,
                                "founderImage",
                                ABOUT_RATIOS.founder,
                            )
                        }
                    />
                    <div className="space-y-4">
                        <Input
                            label="Section Title"
                            name="journeyTitle"
                            value={formData.journeyTitle}
                            onChange={handleInputChange}
                            placeholder="e.g. Our Journey"
                        />
                        <TextArea
                            label="Description"
                            name="journeyDescription"
                            value={formData.journeyDescription}
                            onChange={handleInputChange}
                            rows={6}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Mission Section */}
            <SectionCard title="Growth & Mission">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        label="Growth Image"
                        preview={formData.missionImagePreview}
                        aspectRatioLabel={getRatioLabel(
                            ABOUT_RATIOS.mission.width,
                            ABOUT_RATIOS.mission.height,
                        )}
                        onChange={(e) =>
                            handleFileChange(
                                e,
                                "missionImage",
                                ABOUT_RATIOS.mission,
                            )
                        }
                    />
                    <div className="space-y-4">
                        <Input
                            label="Section Title"
                            name="missionTitle"
                            value={formData.missionTitle}
                            onChange={handleInputChange}
                            placeholder="e.g. Custom handpicked styles..."
                        />
                        <TextArea
                            label="Description"
                            name="missionDescription"
                            value={formData.missionDescription}
                            onChange={handleInputChange}
                            rows={6}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* Craftsmanship Section */}
            <SectionCard title="Craftsmanship">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageUpload
                        label="Craft Image"
                        preview={formData.craftImagePreview}
                        aspectRatioLabel={getRatioLabel(
                            ABOUT_RATIOS.craft.width,
                            ABOUT_RATIOS.craft.height,
                        )}
                        onChange={(e) =>
                            handleFileChange(e, "craftImage", ABOUT_RATIOS.craft)
                        }
                    />
                    <div className="space-y-4">
                        <Input
                            label="Section Title"
                            name="craftTitle"
                            value={formData.craftTitle}
                            onChange={handleInputChange}
                            placeholder="e.g. Craftsmanship At The Core"
                        />
                        <TextArea
                            label="Description"
                            name="craftDescription"
                            value={formData.craftDescription}
                            onChange={handleInputChange}
                            rows={6}
                        />
                    </div>
                </div>
            </SectionCard>

            {/* SEO & Meta Section */}
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, metaTitle: e.target.value }))}
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, metaDescription: e.target.value }))}
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, metaKeywords: e.target.value }))}
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, canonicalUrl: e.target.value }))}
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
                            onChange={(e) => setFormData((prev) => ({ ...prev, ogImage: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                        />
                    </label>
                </div>

                <SchemaEditor
                    value={formData.schema}
                    onChange={(value) => setFormData((prev) => ({ ...prev, schema: value }))}
                    onGenerate={() => generateSchema(true)}
                    onReset={() => {
                        if (!autoSchema) return;
                        setFormData((prev) => ({ ...prev, schema: autoSchema }));
                        setSchemaError(null);
                    }}
                    error={schemaError}
                    isLoading={isSchemaLoading}
                    autoSchemaAvailable={Boolean(autoSchema)}
                />
            </div>

            {/* Save Button */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 md:pl-72 z-10 flex justify-end">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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
    );
}

// Reusable Components

function SectionCard({ title, children }) {
    return (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-6 border-b border-slate-100 pb-2">
                {title}
            </h3>
            {children}
        </div>
    );
}

function ImageUpload({ label, preview, onChange, aspectRatioLabel }) {
    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-bold">{label}</label>
            <p className="text-[10px] font-semibold text-slate-500">
                Required aspect ratio: {aspectRatioLabel}
            </p>
            <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-all aspect-video flex flex-col items-center justify-center overflow-hidden cursor-pointer">
                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                                Change Image
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center">
                        <UploadCloud size={32} className="mb-2" />
                        <span className="text-xs font-medium">Click to upload</span>
                    </div>
                )}
                <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

function Input({ label, name, value, onChange, placeholder }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold">{label}</label>
            <input
                type="text"
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
        </div>
    );
}

function TextArea({ label, name, value, onChange, rows }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={rows}
                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            />
        </div>
    );
}
