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
  Check,
  Layers,
  Box,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { API_BASE_URL, IMAGE_BASE_URL } from "@/services/api";
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

const resolveImageUrl = (item) => {
  const rawUrl =
    item?.mainImage?.url ||
    item?.images?.[0]?.url ||
    item?.image?.url ||
    (typeof item?.image === "string" ? item.image : null);

  if (!rawUrl) return "/assets/default-image.png";
  if (rawUrl.startsWith("http")) return rawUrl;
  const cleanPath = rawUrl.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${IMAGE_BASE_URL}/${cleanPath}`;
};

function SortableItem({ id, index, item, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const imageUrl = resolveImageUrl(item);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3.5 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm group hover:border-slate-300 transition-all"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 p-1"
        title="Drag to reorder"
      >
        <GripVertical size={18} />
      </div>
      <div className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
        {index + 1}
      </div>
      <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
        <img
          src={imageUrl}
          alt={item.name || item.title || ""}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 truncate">
          {item.name || item.title}
        </p>
        <p className="text-xs text-slate-400 truncate">
          /{item.slug || ""}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
        title="Remove from section"
      >
        <X size={18} />
      </button>
    </div>
  );
}

function ItemPickerModal({
  isOpen,
  onClose,
  title,
  type = "categories",
  selectedItems = [],
  onApply,
}) {
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(new Set(selectedItems.map((i) => i._id)));
      setSearch("");
      fetchItems();
    }
  }, [isOpen, selectedItems]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      if (type === "categories") {
        const res = await getCategories(1, 100, "");
        const cats =
          res?.data?.categories ||
          res?.categories?.categories ||
          res?.categories ||
          [];
        setAllItems(Array.isArray(cats) ? cats : []);
      } else {
        const res = await getProducts(1, 100, "");
        const prods =
          res?.products || res?.data?.products || res?.data || [];
        setAllItems(Array.isArray(prods) ? prods : []);
      }
    } catch {
      toast.error(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const toggleItem = (item) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(item._id)) {
        next.delete(item._id);
      } else {
        next.add(item._id);
      }
      return next;
    });
  };

  const filteredItems = allItems.filter((item) => {
    const name = item.name || item.title || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const selectAll = () => {
    const all = new Set(filteredItems.map((i) => i._id));
    setSelectedIds((prev) => new Set([...prev, ...all]));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleApply = () => {
    // Keep currently selected items to preserve display order, remove unselected
    const keptItems = selectedItems.filter((item) =>
      selectedIds.has(item._id),
    );
    const keptIds = new Set(keptItems.map((i) => i._id));

    // Append newly selected items
    const newItems = allItems.filter(
      (item) => selectedIds.has(item._id) && !keptIds.has(item._id),
    );

    const finalSelection = [...keptItems, ...newItems];
    onApply(finalSelection);
    toast.success(`Selection updated (${finalSelection.length} selected)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              {type === "categories" ? <Layers size={20} /> : <Box size={20} />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-xs text-slate-500">
                Choose from already created {type} to show on the homepage.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-2">
            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs font-medium text-slate-400 hover:text-rose-600 px-2 py-1 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="p-4 overflow-y-auto flex-1 max-h-[50vh]">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="animate-spin text-indigo-600" size={24} />
              <span className="text-xs">Loading {type}...</span>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No {type} found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const isSelected = selectedIds.has(item._id);
                const imageUrl = resolveImageUrl(item);
                return (
                  <div
                    key={item._id}
                    onClick={() => toggleItem(item)}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/40 shadow-sm"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "border border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check size={14} strokeWidth={3} />}
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      <img
                        src={imageUrl}
                        alt={item.name || item.title || ""}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {item.name || item.title}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        /{item.slug || ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Check size={14} />
            <span>Apply Selection ({selectedIds.size})</span>
          </button>
        </div>
      </div>
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

  // Picker Modal State
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Search filter for quick addition
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const fetchContent = useCallback(async () => {
    try {
      const { data } = await axios.get(
        `${API_BASE_URL}/homepage/section/${section}`,
      );
      if (data.success) {
        const content = data.data || {};
        setFormData(content);
        const initialItems = config?.hasCategories
          ? content.categories
          : config?.hasProducts
            ? content.products
            : [];
        setItems(initialItems || []);
      }
    } catch {
      toast.error("Failed to load section content");
    } finally {
      setIsLoading(false);
    }
  }, [section, config]);

  useEffect(() => {
    if (!config) {
      router.push("/admin/cms/homepage");
      return;
    }

    fetchContent();
  }, [config, router, fetchContent]);

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
          const list =
            res?.data?.categories ||
            res?.categories?.categories ||
            res?.categories ||
            [];
          setSearchResults(Array.isArray(list) ? list : []);
        } else if (config.hasProducts) {
          res = await getProducts(1, 10, query);
          const list =
            res?.products || res?.data?.products || res?.data || [];
          setSearchResults(Array.isArray(list) ? list : []);
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
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const addItem = (item) => {
    if (items.some((i) => i._id === item._id)) {
      toast.error("Already in display list");
      return;
    }
    setItems((prev) => [...prev, item]);
    setSearchQuery("");
    setSearchResults([]);
    toast.success(`Added ${item.name || item.title}`);
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
        toast.success("Section updated successfully!");
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
              Customize the heading, subheading, and which items are displayed.
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">
                  {config.hasCategories ? "Categories on Homepage" : "Products on Homepage"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select which {config.hasCategories ? "categories" : "products"} to show and drag to arrange display order.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {items.length} {config.hasCategories ? "categories" : "products"} selected
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Choose {config.hasCategories ? "Categories" : "Products"} to Show</span>
                </button>
              </div>
            </div>

            {/* Quick Search to Add Existing */}
            <div className="relative mb-6 max-w-md">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                type="text"
                placeholder={`Search to quickly add ${config.hasCategories ? "category" : "product"}...`}
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
                    searchResults.map((result) => {
                      const isAlreadyAdded = items.some((i) => i._id === result._id);
                      return (
                        <button
                          key={result._id}
                          onClick={() => addItem(result)}
                          disabled={isAlreadyAdded}
                          className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0 disabled:opacity-50"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                            <img
                              src={resolveImageUrl(result)}
                              alt={result.name || result.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {result.name || result.title}
                            </p>
                          </div>
                          {isAlreadyAdded ? (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                              Added
                            </span>
                          ) : (
                            <Plus size={14} className="text-slate-400" />
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No results found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Drag & Drop Reorderable List */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={items.map((i) => i._id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2.5">
                  {items.map((item, idx) => (
                    <SortableItem
                      key={item._id}
                      id={item._id}
                      index={idx}
                      item={item}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
                {items.length === 0 && (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                    <p className="text-xs font-medium text-slate-500 mb-3">
                      No {config.hasCategories ? "categories" : "products"} chosen to show yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsPickerOpen(true)}
                      className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Choose {config.hasCategories ? "Categories" : "Products"} to Show</span>
                    </button>
                  </div>
                )}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>

      {/* Item Picker Modal (Select from existing categories or products) */}
      <ItemPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        title={`Select ${config.hasCategories ? "Categories" : "Products"} to Show`}
        type={config.hasCategories ? "categories" : "products"}
        selectedItems={items}
        onApply={(newSelection) => setItems(newSelection)}
      />
    </div>
  );
}