import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Sitemap | Studio By Sheetal",
  description:
    "Explore the complete sitemap of Studio By Sheetal — categories, policies, customer care, and quick links.",
};

const sitemapSections = [
  {
    title: "Shop Categories",
    links: [
      { label: "Suits", href: "/suits" },
      { label: "Sarees", href: "/sarees" },
      { label: "Lehengas", href: "/lehenga" },
      { label: "Kurta Sets", href: "/kurta-sets" },
      { label: "Kaftan", href: "/kaftan" },
      { label: "Dresses", href: "/dresses" },
    ],
  },
  {
    title: "Quick Links",
    links: [
      { label: "Our Story", href: "/about-us#our-story" },
      { label: "About Us", href: "/about-us" },
      { label: "Blog", href: "/blog" },
      { label: "FAQ's", href: "/faq" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  {
    title: "Customer Care",
    links: [
      { label: "My Account", href: "/my-account" },
      { label: "Track Order", href: "/my-account/orders" },
      { label: "Return Order", href: "/my-account/orders" },
      { label: "Saved Addresses", href: "/my-account/address" },
      { label: "Wishlist", href: "/wishlist" },
      { label: "Shopping Bag", href: "/cart" },
    ],
  },
  {
    title: "Policies & Legal",
    links: [
      { label: "Return & Exchange Policy", href: "/return-exchange-policy" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-and-conditions" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <>
      <main className="min-h-screen bg-[#faf8f5] pt-8 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs uppercase tracking-widest text-stone-500 mb-6 font-[family-name:var(--font-montserrat)]">
            <Link href="/" className="hover:text-stone-900 transition-colors">
              Home
            </Link>{" "}
            / <span className="text-stone-800 font-medium">Sitemap</span>
          </nav>

          {/* Header */}
          <div className="text-center mb-12 border-b border-stone-200 pb-8">
            <h1 className="text-3xl sm:text-4xl font-normal text-stone-900 font-optima tracking-wide mb-3">
              Site Directory & Sitemap
            </h1>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-light font-[family-name:var(--font-montserrat)]">
              Find everything you need across Studio By Sheetal — categories,
              orders, customer policies, and XML sitemaps.
            </p>
          </div>

          {/* Grid of Sections */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {sitemapSections.map((section) => (
              <div
                key={section.title}
                className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm"
              >
                <h2 className="text-lg font-medium text-stone-900 font-optima mb-4 pb-2 border-b border-stone-100">
                  {section.title}
                </h2>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-stone-600 hover:text-[#bd9951] transition-colors block font-[family-name:var(--font-montserrat)] font-light"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* XML Search Engine Sitemap Link */}
          <div className="bg-stone-100 rounded-xl p-6 text-center border border-stone-200">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Search Engine Sitemap
            </h3>
            <p className="text-xs text-stone-500 mb-3 font-[family-name:var(--font-montserrat)]">
              Looking for our structured XML sitemap for search engines and crawlers?
            </p>
            <Link
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#bd9951] hover:underline uppercase tracking-wider"
            >
              View XML Sitemap (/sitemap.xml) &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

