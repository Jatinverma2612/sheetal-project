"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Loader2,
  Save,
  ArrowLeft,
  GripVertical,
  X,
  Plus,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL } from "@/services/api";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
import { getCategories } from "@/services/categoryService";
import { getProducts } from "@/services/productService";

const SECTION_CONFIG = {
  aboutSBS: {
    label: "About SBS",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "text" },
    ],
  },
  hiddenBeauty: {
    label: "Hidden Beauty",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
    ],
    hasCategories: true,
  },
  collections: {
    label: "Collections",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
    ],
    hasProducts: true,
  },


  trendingThisWeek: {
    label: "Trending This Week",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
    ],
    hasProducts: true,
  },
  newArrivals: {
    label: "New Arrivals",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
      { key: "buttonText", label: "Button Text", type: "text" },
      { key: "buttonUrl", label: "Button URL", type: "text" },
    ],
    hasProducts: true,
  },
  instagramDiaries: {
    label: "Instagram Diaries",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subheading", label: "Subheading", type: "text" },
    ],
  },
};

function SortableItem({ id, item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm group"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600"
      >
        <GripVertical size={20} />
      </div>
      <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden shrink-0">
        <img
          src={
            item.mainImage?.url?.replace(/\\/g, "/") ||
            "/assets/default-image.png"
          }
          alt={item.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
        <p className="text-xs text-slate-500 truncate">{item.slug}</p>
      </div>
      <button
        onClick={() => onRemove(id)}
        className="p-2 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X size={18} />
      </button>
    </div>
  );
}

export default function EditSectionPage() {
  const { section } = useParams();
  const router = useRouter();
  const config = SECTION_CONFIG[section];

  const [formData, setFormData] = useState({});
  const [items, setItems] = useState([]); // categories or products
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    if (!config) {
      router.push("/admin/cms/homepage");
      return;
    }

    const fetchContent = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/homepage/section/${section}`,
        );
        if (data.success) {
          const content = data.data || {};
          setFormData(content);
          const initialItems = config.hasCategories
            ? content.categories
            : config.hasProducts
              ? content.products
              : [];
          setItems(initialItems || []);
        }
      } catch {
        toast.error("Failed to load section content");
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [section, config, router]);

  const handleFieldChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i._id === active.id);
        const newIndex = prev.findIndex((i) => i._id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleRemoveItem = (id) => {
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  const handleSearch = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        let res;
        if (config.hasCategories) {
          res = await getCategories(1, 10, query);
          setSearchResults(res.categories || []);
        } else if (config.hasProducts) {
          res = await getProducts(1, 10, query);
          setSearchResults(res.products || []);
        }
      } catch {
        toast.error("Search failed");
      } finally {
        setIsSearching(false);
      }
    },
    [config],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const addItem = (item) => {
    if (items.some((i) => i._id === item._id)) {
      toast.error("Already added");
      return;
    }
    setItems((prev) => [...prev, item]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        [section]: {
          ...formData,
          [config.hasCategories ? "categories" : "products"]: items.map(
            (i) => i._id,
          ),
        },
      };

      const { data } = await axios.patch(
        `${API_BASE_URL}/homepage/sections`,
        payload,
        { withCredentials: true },
      );

      if (data.success) {
        toast.success("Section updated!");
        router.push("/admin/cms/homepage");
      }
    } catch {
      toast.error("Failed to save changes");
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cms/homepage"
            className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              Edit {config.label}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Customize the content and layout of this section.
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-slate-900 cursor-pointer text-white px-6 py-2.5 rounded-xl font-bold hover:bg-black transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg text-sm"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{isSaving ? "Saving..." : "Save Changes"}</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Fields */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 space-y-5">
          <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-4">
            Content Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {config.fields.map((field) => (
              <label
                key={field.key}
                className={`block ${field.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">
                  {field.label}
                </span>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[field.key] || ""}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-slate-400 transition-colors"
                  />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Selection & Reordering */}
        {(config.hasCategories || config.hasProducts) && (
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <h3 className="text-sm font-black text-slate-900 uppercase">
                {config.hasCategories ? "Categories" : "Products"}
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                {items.length} added
              </span>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder={`Search to add ${config.hasCategories ? "categories" : "products"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-700 outline-none focus:border-slate-400 transition-all"
              />

              {/* Search Results Dropdown */}
              {searchQuery && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-60 overflow-y-auto overflow-x-hidden">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      Searching...
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((result) => (
                      <button
                        key={result._id}
                        onClick={() => addItem(result)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          <img
                            src={
                              result.mainImage?.url?.replace(/\\/g, "/") ||
                              "/assets/default-image.png"
                            }
                            alt={result.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {result.name}
                          </p>
                        </div>
                        <Plus size={14} className="text-slate-400" />
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {items.map((item) => (
                    <SortableItem
                      key={item._id}
                      id={item._id}
                      item={item}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
                {items.length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed border-slate-100 rounded-2xl">
                    <p className="text-xs text-slate-400">
                      No items added yet.
                    </p>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  );
}