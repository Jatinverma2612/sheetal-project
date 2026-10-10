"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Copy, MoreHorizontal, Mail, X as CloseIcon } from "lucide-react";
import toast from "react-hot-toast";

interface ShareMenuProps {
  url?: string;
  getUrl?: () => Promise<string | null>;
  title?: string;
  text?: string;
  children?: React.ReactNode;
}

const ShareMenu: React.FC<ShareMenuProps> = ({
  url,
  getUrl,
  title = "Check this out!",
  text = "Check out this product from Studio By Sheetal",
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedUrl, setCachedUrl] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setIsShareSupported(!!navigator.share);

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const fetchUrl = useCallback(async () => {
    if (cachedUrl) return cachedUrl;
    if (url) return url;

    if (getUrl) {
      setIsLoading(true);
      try {
        const result = await getUrl();
        if (result) {
          setCachedUrl(result);
          return result;
        }
      } finally {
        setIsLoading(false);
      }
    }

    return typeof window !== "undefined" ? window.location.href : "";
  }, [cachedUrl, getUrl, url]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen((previous) => !previous);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClose, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [handleClose, isOpen]);

  const handleCopyLink = async () => {
    const shareUrl = await fetchUrl();
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
      handleClose();
    } catch {
      toast.error("Failed to copy link.");
    }
  };

  const handleNativeShare = async () => {
    const shareUrl = await fetchUrl();
    if (!navigator.share) return;

    try {
      await navigator.share({ title, text, url: shareUrl });
      handleClose();
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        toast.error("Share failed.");
      }
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: "/assets/icons/whatsapp.svg",
      onClick: async () => {
        const win = window.open("about:blank", "_blank");
        const shareUrl = await fetchUrl();
        if (win) {
          win.location.href = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        }
        handleClose();
      },
    },
    {
      name: "Facebook",
      icon: "/assets/icons/facebook.svg",
      onClick: async () => {
        const win = window.open("about:blank", "_blank");
        const shareUrl = await fetchUrl();
        if (win) {
          win.location.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        }
        handleClose();
      },
    },
    {
      name: "Email",
      component: <Mail size={18} className="text-gray-600" />,
      onClick: async () => {
        const shareUrl = await fetchUrl();
        window.location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`;
        handleClose();
      },
    },
    {
      name: "Copy Link",
      component: <Copy size={18} className="text-gray-600" />,
      onClick: handleCopyLink,
    },
  ];

  if (isShareSupported) {
    shareOptions.push({
      name: "More",
      component: <MoreHorizontal size={18} className="text-gray-600" />,
      onClick: handleNativeShare,
    });
  }

  return (
    <div className="relative inline-block" ref={menuRef}>
      <div
        onClick={handleToggle}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
        className="cursor-pointer"
      >
        {children}
      </div>

      {isOpen && (
        <div
          onMouseLeave={() => !isMobile && setIsOpen(false)}
          className={`absolute z-100 min-w-[190px] rounded-2xl border border-white/20 bg-white/90 p-2 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-md transition-all duration-200 ${
            isMobile
              ? "bottom-full right-0 mb-3 origin-bottom-right"
              : "left-full top-0 ml-3 origin-top-left"
          }`}
        >
          <div className="flex flex-col gap-1">
            <div className="mb-1 flex items-center justify-between border-b border-gray-100/50 px-3 py-2 md:hidden">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-gray-500">
                Share via
              </span>
              <CloseIcon
                size={16}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
                onClick={handleClose}
              />
            </div>

            {isLoading && (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-100 border-t-[#bd9951]" />
                <span className="animate-pulse text-[11px] font-medium text-gray-500">
                  Generating secure link...
                </span>
              </div>
            )}

            {!isLoading &&
              shareOptions.map((option, index) => (
                <button
                  key={option.name}
                  onClick={(event) => {
                    event.stopPropagation();
                    option.onClick();
                  }}
                  className="flex w-full translate-x-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-[#bd9951]/10 hover:translate-x-1"
                  style={{ transitionDelay: `${index * 20}ms` }}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 shadow-sm ring-1 ring-gray-100 transition-colors group-hover:bg-white">
                    {"icon" in option && option.icon ? (
                      <Image
                        src={option.icon}
                        alt={option.name}
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    ) : (
                      option.component
                    )}
                  </div>
                  <span className="text-sm font-semibold text-gray-700 transition-colors hover:text-[#6a3f07]">
                    {option.name}
                  </span>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareMenu;
