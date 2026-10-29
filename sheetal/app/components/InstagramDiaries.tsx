"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { Instagram } from "lucide-react";
import {
  fetchProducts,
  getProductImageUrl,
  Product,
} from "../services/productService";

import { InstagramDiariesContent } from "../services/homepageService";

const INSTAGRAM_DIARIES_PRODUCT_LIMIT = 50;
const MIN_FOR_CAROUSEL_DESKTOP = 5;
const MIN_FOR_CAROUSEL_MOBILE = 2;
const INSTAGRAM_URL = "https://www.instagram.com/";

const fallbackImages = [
  "/assets/images/product-placeholder.webp",
  "/assets/images/product-placeholder.webp",
  "/assets/images/product-placeholder.webp",
  "/assets/images/product-placeholder.webp",
  "/assets/images/product-placeholder.webp",
];

interface InstaCard {
  url: string;
  link: string;
  alt: string | null;
}

const InstagramDiaries = ({ content }: { content?: InstagramDiariesContent }) => {
  const {
    heading = "Visit Our Instagram Diaries",
    subheading = "Follow To Know More @sbsinstagram",
  } = content || {};

  const [cards, setCards] = useState<InstaCard[]>(
    fallbackImages.map((url) => ({ url, link: INSTAGRAM_URL, alt: null })),
  );
  const [loading, setLoading] = useState(true);
  const [isCarousel, setIsCarousel] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    skipSnaps: false,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (emblaApi) emblaApi.reInit();
  }, [emblaApi, cards]);

  // Recompute isCarousel on cards change and window resize
  useEffect(() => {
    const update = () => {
      const isMobile = window.innerWidth < 768;
      const min = isMobile ? MIN_FOR_CAROUSEL_MOBILE : MIN_FOR_CAROUSEL_DESKTOP;
      setIsCarousel(cards.length >= min);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [cards]);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response = await fetchProducts({
          sort: "-createdAt",
          limit: INSTAGRAM_DIARIES_PRODUCT_LIMIT,
          status: "Active",
        });

        if (response.success && response.products?.length > 0) {
          const inStockProducts = response.products.filter((p: Product) => {
            if (!p || p.status !== "Active") return false;
            const hasVariantSizes = p.variants?.some(
              (v) => Array.isArray(v.sizes) && v.sizes.length > 0,
            );
            if (hasVariantSizes) {
              const hasVariantStock = p.variants.some((v) =>
                v.sizes?.some((s) => Number(s.stock || 0) > 0),
              );
              const hasOverallStock = p.stock === undefined || Number(p.stock) > 0;
              return hasVariantStock && hasOverallStock;
            }
            return (p.stock ?? 0) > 0;
          });

          if (inStockProducts.length > 0) {
            setCards(
              inStockProducts.map((product: Product) => ({
                url: getProductImageUrl(product),
                link: INSTAGRAM_URL,
                alt: product.mainImage?.alt || product.name,
              })),
            );
          }
        }
      } catch (error) {
        console.error(
          "Error fetching latest products for Instagram Diaries:",
          error,
        );
      } finally {
        setLoading(false);
      }
    };
    fetchLatestProducts();
  }, []);

  const SkeletonCard = ({ index }: { index: number }) => (
    <div className="relative overflow-hidden rounded-xl shadow-md aspect-[3/4] bg-[#fbf9f6] border border-[#f0ece4] flex flex-col items-center justify-center p-6 animate-pulse">
      <div className="relative w-20 h-28 opacity-80">
        <Image
          src="/assets/335014072.png"
          alt="Studio By Sheetal"
          fill
          className="object-contain"
        />
      </div>
      <div className="mt-4 h-2 w-16 bg-[#e8decf] rounded-full opacity-60" />
    </div>
  );

  const CardItem = ({ card, index }: { card: InstaCard; index: number }) => (
    <a href={card.link} target="_blank" rel="noreferrer">
      <div className="relative overflow-hidden rounded-xl shadow-md group cursor-pointer aspect-[3/4]">
        <Image
          src={card.url}
          alt={card.alt || `Instagram Post ${index + 1}`}
          fill
          className="object-cover transform group-hover:scale-105 transition-transform duration-500 ease-in-out"
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 20vw"
          quality={76}
        />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/60 transition-colors duration-300" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Instagram className="h-8 w-8 text-white drop-shadow-lg" />
        </div>
      </div>
    </a>
  );

  return (
    <div className="relative w-full overflow-hidden bg-[#f9f9f9] px-4 py-8 sm:px-6 md:py-10 lg:px-20">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/845146398.jpg"
          alt="Background"
          fill
          className="object-cover opacity-20"
          sizes="100vw"
          quality={70}
        />
        <div className="absolute inset-0 bg-white/60" />
      </div>

      <div className="container relative z-10 mx-auto px-0 md:px-4">
        {/* Header */}
        <div className="text-center mb-10 md:mb-4">
          <div className="flex items-center justify-center gap-6 w-full">
            <div className="h-[2px] bg-[#68400f] w-15 hidden md:flex" />
            <h2 className="font-[family-name:var(--font-optima)] text-[#6a3f0e] whitespace-nowrap uppercase">
              {heading}
            </h2>
            <div className="h-[2px] bg-[#68400f] w-15 hidden md:flex" />
          </div>
          <p className="text-[#666] text-[15px] tracking-wide mt-2">
            {subheading}
          </p>
        </div>

        {/* LOADER SKELETON */}
        {loading ? (
          <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="w-[85%] sm:w-[45%] md:w-[30%] lg:w-[18%]"
              >
                <SkeletonCard index={index} />
              </div>
            ))}
          </div>
        ) : isCarousel ? (
          <div className="relative group/slider">
            <div ref={emblaRef} className="overflow-hidden">
              <div className="flex gap-3 px-2 sm:px-3 md:gap-8 md:px-4">
                {cards.map((card, index) => (
                  <div
                    key={index}
                    className="shrink-0 w-[75%] sm:w-[45%] lg:w-[20%]"
                  >
                    <CardItem card={card} index={index} />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={scrollPrev}
              aria-label="Previous product"
              className="absolute left-[-50px] cursor-pointer bottom-[20%] -translate-y-1/2 w-12 h-12 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10"
            >
              <Image src="/assets/left-image.png" alt="Previous" width={48} height={48} className="w-full h-auto" />
            </button>
            <button
              onClick={scrollNext}
              aria-label="Next product"
              className="absolute right-[-50px] cursor-pointer bottom-[20%] -translate-y-1/2 w-12 h-12 flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10"
            >
              <Image src="/assets/right-image.png" alt="Next" width={48} height={48} className="w-full h-auto" />
            </button>
          </div>
        ) : (
          /* STATIC GRID */
          <div className="flex flex-wrap gap-4 md:gap-8 justify-center">
            {cards.map((card, index) => (
              <div
                key={index}
                className="w-[85%] sm:w-[45%] md:w-[30%] lg:w-[18%]"
              >
                <CardItem card={card} index={index} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramDiaries;
