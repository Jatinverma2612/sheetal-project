"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Save,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Search,
  Code,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TiptapEditor from "@/components/TiptapEditor";
import SchemaEditor from "@/components/admin/seo/SchemaEditor";
import { validateJsonLd } from "@/utils/jsonLd";

export default function FAQForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSchemaLoading, setIsSchemaLoading] = useState(false);
  const [schemaError, setSchemaError] = useState(null);
  const [autoSchema, setAutoSchema] = useState("");
  const [formData, setFormData] = useState({
    pageTitle: "Frequently Asked Questions",
    ctaText: "",
    ctaButtonText: "",
    ctaButtonLink: "",
    faqs: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    canonicalUrl: "",
    ogImage: "",
    seoSchema: "",
  });

  // Tracks which single FAQ item id is currently expanded.
  // null = all collapsed. Lives here (not inside SortableFaqItem) so that
  // adding a new FAQ can explicitly open just that one item.
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  const [activeTab, setActiveTab] = useState("content");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    fetchFaqData();
  }, []);

  useEffect(() => {
    const validation = validateJsonLd(formData.seoSchema || "");
    setSchemaError(validation.valid ? null : validation.error);
  }, [formData.seoSchema]);

  const fetchFaqData = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/faq`, {
        withCredentials: true,
      });
      if (data.success && data.page) {
        const page = data.page;
        setFormData({
          pageTitle: page.pageTitle || "Frequently Asked Questions",
          ctaText: page.ctaText || "",
          ctaButtonText: page.ctaButtonText || "",
          ctaButtonLink: page.ctaButtonLink || "",
          faqs: (page.faqs || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((faq, index) => ({
              ...faq,
              id: faq._id || `temp-${index}-${Date.now()}`,
            })),
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
          metaKeywords: page.metaKeywords || "",
          canonicalUrl: page.canonicalUrl || "",
          ogImage: page.ogImage || "",
          seoSchema: page.seoSchema || "",
        });
        // All accordions start closed when the page loads.
        setExpandedFaqId(null);
      }
    } catch (error) {
      console.error("Error fetching FAQ data", error);
      toast.error("Failed to load FAQ data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFaqChange = (id, field, value) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.map((faq) =>
        faq.id === id ? { ...faq, [field]: value } : faq,
      ),
    }));
  };

  const addFaq = () => {
    const newId = `temp-${Date.now()}`;
    const newFaq = {
      id: newId,
      question: "",
      answer: "",
      isActive: true,
      order: formData.faqs.length,
    };
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, newFaq],
    }));
    // Newly added FAQ opens automatically; everything else stays/becomes closed.
    setExpandedFaqId(newId);
  };

  const removeFaq = (id) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((faq) => faq.id !== id),
    }));
    setExpandedFaqId((prev) => (prev === id ? null : prev));
  };

  const toggleExpanded = (id) => {
    setExpandedFaqId((prev) => (prev === id ? null : id));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData((prev) => {
        const oldIndex = prev.faqs.findIndex((faq) => faq.id === active.id);
        const newIndex = prev.faqs.findIndex((faq) => faq.id === over.id);
        return {
          ...prev,
          faqs: arrayMove(prev.faqs, oldIndex, newIndex),
        };
      });
    }
  };

  const generateSchema = async (applyToForm = true) => {
    try {
      setIsSchemaLoading(true);
      const { data } = await axios.post(
        `${API_BASE_URL}/faq/generate-schema`,
        formData,
        { withCredentials: true },
      );

      if (data.success) {
        setAutoSchema(data.schema || "");
        if (applyToForm) {
          setFormData((prev) => ({ ...prev, seoSchema: data.schema || "" }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        faqs: formData.faqs.map((faq, index) => ({
          ...faq,
          order: index,
        })),
      };

      const res = await axios.post(`${API_BASE_URL}/faq`, payload, {
        withCredentials: true,
      });

      if (res.data.success) {
        toast.success("FAQ page updated successfully!");
        fetchFaqData();
      }
    } catch (error) {
      console.error("Error saving FAQ page", error);
      toast.error(error.response?.data?.message || "Failed to update page");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-24 text-black">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("content")}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "content"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Page Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("faqs")}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "faqs"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          FAQ Items ({formData.faqs.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`px-6 py-3 text-sm font-bold transition-all border-b-2 ${
            activeTab === "seo"
              ? "border-slate-900 text-slate-900"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          SEO & Schema
        </button>
      </div>

      {activeTab === "content" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <SectionCard title="Basic Page Info">
            <div className="space-y-4">
              <Input
                label="Page Title"
                name="pageTitle"
                value={formData.pageTitle}
                onChange={handleInputChange}
                placeholder="e.g. Frequently Asked Questions"
              />
            </div>
          </SectionCard>

          <SectionCard title="Call to Action (CTA) Section">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="CTA Text"
                  name="ctaText"
                  value={formData.ctaText}
                  onChange={handleInputChange}
                  placeholder="e.g. Still need help?"
                />
              </div>
              <Input
                label="CTA Button Text"
                name="ctaButtonText"
                value={formData.ctaButtonText}
                onChange={handleInputChange}
                placeholder="e.g. Contact Us"
              />
              <Input
                label="CTA Button Link"
                name="ctaButtonLink"
                value={formData.ctaButtonLink}
                onChange={handleInputChange}
                placeholder="e.g. /contact-us"
              />
            </div>
          </SectionCard>
        </div>
      )}

      {activeTab === "faqs" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-bold uppercase text-slate-900">
                FAQ Management
              </h3>
              <p className="text-[11px] text-slate-500">
                Add, edit, and reorder your frequently asked questions.
              </p>
            </div>
            <button
              type="button"
              onClick={addFaq}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all"
            >
              <Plus size={16} />
              Add FAQ Item
            </button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={formData.faqs.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {formData.faqs.map((faq, index) => (
                  <SortableFaqItem
                    key={faq.id}
                    faq={faq}
                    index={index}
                    isExpanded={expandedFaqId === faq.id}
                    onToggleExpanded={() => toggleExpanded(faq.id)}
                    onChange={handleFaqChange}
                    onRemove={removeFaq}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {formData.faqs.length === 0 && (
            <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="text-slate-500 text-sm">
                No FAQ items added yet. Click the button above to add one.
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "seo" && (
        <div className="animate-in fade-in duration-300 space-y-6">
          <SectionCard title="SEO Settings">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Meta Title"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleInputChange}
                  placeholder="SEO friendly title"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Brief summary for search results"
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
                  />
                </div>
              </div>

              <Input
                label="Meta Keywords"
                name="metaKeywords"
                value={formData.metaKeywords}
                onChange={handleInputChange}
                placeholder="faq, questions, help"
              />

              <Input
                label="Canonical URL"
                name="canonicalUrl"
                value={formData.canonicalUrl}
                onChange={handleInputChange}
                placeholder="https://www.example.com/faq"
              />

              <div className="md:col-span-2">
                <Input
                  label="OG Image URL"
                  name="ogImage"
                  value={formData.ogImage}
                  onChange={handleInputChange}
                  placeholder="URL to Open Graph image"
                />
              </div>

              <div className="md:col-span-2">
                <SchemaEditor
                  value={formData.seoSchema}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, seoSchema: value }))
                  }
                  onGenerate={() => generateSchema(true)}
                  onReset={() => {
                    if (!autoSchema) return;
                    setFormData((prev) => ({ ...prev, seoSchema: autoSchema }));
                    setSchemaError(null);
                  }}
                  error={schemaError}
                  isLoading={isSchemaLoading}
                  autoSchemaAvailable={Boolean(autoSchema)}
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Floating Save Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 md:pl-72 z-40 flex justify-end gap-4 shadow-xl">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save FAQ Page</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SortableFaqItem({
  faq,
  index,
  isExpanded,
  onToggleExpanded,
  onChange,
  onRemove,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: faq.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-shadow ${
        isDragging ? "shadow-xl border-slate-400" : ""
      }`}
    >
      <div className="flex items-center bg-slate-50/50 p-4 gap-4">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600"
        >
          <GripVertical size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={faq.question}
            onChange={(e) => onChange(faq.id, "question", e.target.value)}
            placeholder="Enter question here..."
            className="w-full bg-transparent border-none text-sm font-bold text-slate-900 focus:ring-0 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onChange(faq.id, "isActive", !faq.isActive)}
            className={`p-2 rounded-xl transition-colors ${
              faq.isActive
                ? "bg-emerald-100 text-emerald-600"
                : "bg-slate-100 text-slate-400"
            }`}
            title={faq.isActive ? "Active" : "Inactive"}
          >
            {faq.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-600"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
          <button
            type="button"
            onClick={() => onRemove(faq.id)}
            className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-200">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
                Answer Content
              </label>
              <TiptapEditor
                value={faq.answer}
                onChange={(html) => onChange(faq.id, "answer", html)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
      <h3 className="text-sm font-black uppercase text-slate-900 mb-6 border-b border-slate-100 pb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Input({ label, name, value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-slate-900/10 outline-none transition-all"
      />
    </div>
  );
}