"use client";

import PageHeader from "@/components/admin/layout/PageHeader";
import {
  LayoutPanelLeft,
  Image as ImageIcon,
  BookOpen,
  FileText,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function CMSPage() {
  const cmsModules = [
    {
      title: "Homepage Banners",
      description: "Manage hero sliders and promotional banners",
      icon: <ImageIcon size={24} />,
      link: "/admin/cms/banners",
      color: "blue",
    },
    {
      title: "Lookbooks",
      description: "Create and edit seasonal style collections",
      icon: <BookOpen size={24} />,
      link: "/admin/cms/lookbooks",
      color: "purple",
    },
    {
      title: "Text Pages",
      description: "Edit About Us, T&C, and Privacy Policy",
      icon: <FileText size={24} />,
      link: "/admin/cms/pages",
      color: "emerald",
    },
    {
      title: "SEO Settings",
      description: "Manage global website schema and metadata defaults",
      icon: <Search size={24} />,
      link: "/admin/cms/seo-settings",
      color: "orange",
    },
    // {
    //   title: "Blog Posts",
    //   description: "Manage articles (Redirects to WordPress)",
    //   icon: <ExternalLink size={24} />,
    //   link: "/admin/cms/blog",
    //   external: true,
    //   color: "orange",
    // },
  ];

  return (
    <div className="min-h-screen w-full animate-in fade-in duration-500">
      <PageHeader
        title="Content Management"
        subtitle="Control your website's visual and textual content"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {cmsModules.map((module, idx) => (
          <CMSCard key={idx} {...module} />
        ))}
      </div>
    </div>
  );
}

function CMSCard({ title, description, icon, link, color, external }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    emerald: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600",
  };

  const Content = (
    <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-start gap-5 hover:shadow-lg transition-all cursor-pointer group">
      <div className={`p-4 rounded-xl ${colors[color]}`}>{icon}</div>
      <div className="flex-1">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
    </div>
  );

  return external ? (
    <a href={link} target="_blank" rel="noopener noreferrer">
      {Content}
    </a>
  ) : (
    <Link href={link}>{Content}</Link>
  );
}
