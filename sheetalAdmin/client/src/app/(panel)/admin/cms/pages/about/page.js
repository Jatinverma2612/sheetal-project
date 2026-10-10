"use client";

import React from "react";
import PageHeader from "@/components/admin/layout/PageHeader";
import AboutUsForm from "@/components/admin/cms/pages/about/AboutUsForm";

export default function AboutPage() {
    return (
        <div className="min-h-screen w-full animate-in fade-in duration-500 pb-20">
            <PageHeader
                title="Edit About Us"
                subtitle="Manage brand story, mission, and craftsmanship content"
            />

            <div className="mt-8 max-w-5xl mx-auto">
                <AboutUsForm />
            </div>
        </div>
    );
}

// Ensure the default export is the component function
// export default AboutPage;
