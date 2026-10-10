'use client';
import React from "react";
import NavbarLayoutEditor from "../../../../components/admin/navbar-footer/NavbarLayoutEditor";
import FooterLayoutEditor from "../../../../components/admin/navbar-footer/FooterLayoutEditor";

export default function NavbarFooterPage() {
  return (
    <div className="p-6">
      <div className="flex flex-col gap-12">
         {/* Navbar Section */}
         <section>
             <NavbarLayoutEditor />
         </section>

         <hr className="border-white/10" />

         {/* Footer Section */}
         <section>
             <FooterLayoutEditor />
         </section>
      </div>
    </div>
  );
}
