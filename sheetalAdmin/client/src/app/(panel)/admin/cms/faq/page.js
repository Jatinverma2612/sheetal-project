"use client";

import React from "react";
import PageHeader from "@/components/admin/layout/PageHeader";
import FAQForm from "@/components/admin/cms/pages/faq/FAQForm";

export default function FAQPage() {
  return (
    <div className="min-h-screen w-full animate-in fade-in duration-500 pb-20">
      <PageHeader
        title="Edit FAQ Page"
        subtitle="Manage frequently asked questions, CTA, and SEO settings"
      />

      <div className="mt-8 max-w-5xl mx-auto">
        <FAQForm />
      </div>
    </div>
  );
}
