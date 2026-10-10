"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/admin/layout/Sidebar";
import TopNav from "@/components/admin/layout/TopNav";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-screen bg-[#fcfcfd]" />;
  }

  return (
    <div className="h-screen flex bg-[#fcfcfd] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        storeName="Admin"
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Right Side */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopNav */}
        <div className="sticky top-0 z-30">
          <TopNav storeName="Admin" setIsOpen={setIsSidebarOpen} />
        </div>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9] p-4 md:p-6 lg:p-8">
          <div className="w-full max-w-[1600px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
