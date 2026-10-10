"use client";

import { useEffect, useMemo, useState } from "react";
import { FilePlus2, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import PageHeader from "@/components/admin/layout/PageHeader";
import DeleteConfirmModal from "@/components/admin/common/DeleteConfirmModal";
import StaticPageForm from "@/components/admin/cms/pages/StaticPageForm";
import StaticPagesTable from "@/components/admin/cms/pages/StaticPagesTable";
import {
  createStaticPage,
  deleteStaticPage,
  getStaticPages,
  updateStaticPage,
} from "@/services/staticPageService";

const fixedPages = [
  {
    title: "About Us",
    href: "/admin/cms/pages/about",
    description: "Edit founder story, mission, and vision",
    accent: "amber",
  },
  {
    title: "Terms & Conditions",
    href: "/admin/cms/pages/terms-and-conditions",
    description: "Edit user agreement, platform policies, and rules",
    accent: "indigo",
  },
  {
    title: "Privacy Policy",
    href: "/admin/cms/pages/privacy-policy",
    description: "Edit data protection rules, privacy claims, and terms",
    accent: "emerald",
  },
  {
    title: "Shipping Policy",
    href: "/admin/cms/pages/shipping-policy",
    description: "Edit delivery timelines, charges, and shipment terms",
    accent: "sky",
  },
  {
    title: "Return & Exchange Policy",
    href: "/admin/cms/pages/return-exchange-policy",
    description: "Edit return windows, exchange rules, and refund terms",
    accent: "rose",
  },
];

const accentClasses = {
  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:text-amber-700",
  indigo: "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 group-hover:text-indigo-700",
  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:text-emerald-700",
  sky: "bg-sky-50 text-sky-600 group-hover:bg-sky-100 group-hover:text-sky-700",
  rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100 group-hover:text-rose-700",
};

export default function PagesCMS() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteInfo, setDeleteInfo] = useState(null);

  const filteredPages = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return pages;
    return pages.filter(
      (page) =>
        page.title?.toLowerCase().includes(term) ||
        page.slug?.toLowerCase().includes(term),
    );
  }, [pages, search]);

  const fetchPages = async (isRefresh = false) => {
    setLoading(true);
    try {
      const res = await getStaticPages();
      setPages(res.pages || []);
      if (isRefresh) toast.success("Static pages refreshed");
    } catch (error) {
      toast.error(error.message || "Failed to load static pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSubmit = async (payload) => {
    setSaving(true);
    try {
      if (editData?._id) {
        await updateStaticPage(editData._id, payload);
        toast.success("Page updated successfully");
      } else {
        await createStaticPage(payload);
        toast.success("Page created successfully");
      }
      setShowForm(false);
      setEditData(null);
      await fetchPages();
    } catch (error) {
      toast.error(error.message || "Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteInfo?._id) return;
    try {
      await deleteStaticPage(deleteInfo._id);
      toast.success("Page deleted successfully");
      setDeleteInfo(null);
      await fetchPages();
    } catch (error) {
      toast.error(error.message || "Failed to delete page");
    }
  };

  return (
    <div className="min-h-screen w-full animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Pages Management"
        subtitle="Edit static site content and custom pages"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {fixedPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="group bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                accentClasses[page.accent]
              }`}
            >
              <span className="text-lg font-black">{page.title.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 transition-colors">
              {page.title}
            </h3>
            <p className="text-sm text-slate-500 mt-2">{page.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-900 overflow-hidden">
        <div className="p-4 flex flex-col gap-4 border-b border-slate-100 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900">
              Custom Static Pages
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Pages created here can be published and added to footer columns.
            </p>
          </div>

          <div className="flex gap-3 flex-1 items-center md:justify-end">
            <div className="relative max-w-md w-full">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-slate-200 outline-none"
                placeholder="Search by title or slug..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={() => fetchPages(true)}
              disabled={loading}
              className="p-2 text-slate-500 cursor-pointer hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditData(null);
              setShowForm(true);
            }}
            className="bg-slate-900 hover:bg-black cursor-pointer text-white px-5 py-2 rounded text-sm font-bold transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <FilePlus2 size={16} />
            New Page
          </button>
        </div>

        <StaticPagesTable
          pages={filteredPages}
          loading={loading}
          onEdit={(page) => {
            setEditData(page);
            setShowForm(true);
          }}
          onDelete={(page) => setDeleteInfo(page)}
        />
      </div>

      <StaticPageForm
        isOpen={showForm}
        initialData={editData}
        loading={saving}
        onClose={() => {
          setShowForm(false);
          setEditData(null);
        }}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deleteInfo)}
        onClose={() => setDeleteInfo(null)}
        onConfirm={handleDeleteConfirm}
        entityName="page"
        itemName={deleteInfo?.title}
      />
    </div>
  );
}
