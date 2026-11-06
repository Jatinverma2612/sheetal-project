import React, { useState } from "react";
import Image from "next/image";
import { submitEnquiry } from "@/app/services/enquireService";

interface EnquireModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  sizes?: { name: string }[];
  defaultSize?: string;
  badgeImage?: string;
}

const EnquireModal: React.FC<EnquireModalProps> = ({
  isOpen,
  onClose,
  productTitle,
  sizes = [],
  defaultSize = "",
  badgeImage,
}) => {
  const badgeImageUrl = badgeImage || "/assets/popu-element-img.png";
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted]       = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedSize(defaultSize);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, defaultSize]);

  // Eagerly preload badge image into browser cache and memory so it renders with 0ms delay
  React.useEffect(() => {
    if (typeof window !== "undefined" && badgeImageUrl) {
      const img = new window.Image();
      img.src = badgeImageUrl;
    }
  }, [badgeImageUrl]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize && sizes.length > 0) {
      alert("Please select a size.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitEnquiry({
        productName: productTitle,
        size: selectedSize,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        message: message.trim(),
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setName(""); setEmail(""); setPhone("");
        setMessage(""); setSelectedSize("");
        onClose();
      }, 2500);
    } catch (err: any) {
      alert(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {badgeImageUrl && <link rel="preload" as="image" href={badgeImageUrl} />}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-[9999] bg-black/55 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 transition-all duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto visible"
            : "opacity-0 pointer-events-none invisible"
        }`}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="enquire-modal-title"
          style={{
            '--modal-size': 'min(94vw, 92vh, 865px)',
          } as React.CSSProperties}
          className={`relative w-[95vw] sm:w-[92vw] max-w-[480px] max-h-[92vh] rounded-[28px] sm:rounded-[32px] md:w-[var(--modal-size)] md:h-[var(--modal-size)] md:max-w-none md:max-h-none md:aspect-square md:rounded-full bg-[#fbf7f2] border-[3px] sm:border-[4px] border-[#e69a28] shadow-2xl flex flex-col items-center justify-start md:justify-center p-6 sm:p-8 md:p-10 lg:p-12 overflow-y-auto md:overflow-visible transition-all duration-200 shrink-0 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {/* Perimeter Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 md:top-8 md:right-14 z-30 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-white rounded-full shadow border border-gray-100 flex items-center justify-center text-xl sm:text-xl md:text-2xl text-[#b08237] hover:bg-gray-50 cursor-pointer transition-colors"
            aria-label="Close"
          >
            ×
          </button>

          {/* Mobile Badge Preview (Appears above heading on screens < md, never overlaps form) */}
          <div className="md:hidden flex justify-center mb-2.5 sm:mb-3 shrink-0">
            <div className="w-20 h-28 sm:w-24 sm:h-32 relative drop-shadow-md">
              <Image
                src={badgeImageUrl}
                alt="Studio By Sheetal"
                fill
                sizes="120px"
                className="object-contain object-bottom"
                priority
                unoptimized
              />
            </div>
          </div>

          {/* Form Column: Horizontally Centered on the Entire Circle's Geometric Center Axis */}
        <div className="w-full max-w-[425px] md:w-[54%] mx-auto flex flex-col items-center relative z-20">
          <h3 id="enquire-modal-title" className="text-2xl sm:text-[26px] md:text-3xl lg:text-[32px] font-normal text-[#683e14] font-[family-name:var(--font-optima)] text-center tracking-wide leading-tight">
            Enquire Form
          </h3>

          <div className="w-full h-px bg-gray-300 my-2.5 sm:my-3 md:my-3.5 lg:my-4" />

          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-6 z-20">
              <div className="w-16 h-16 rounded-full bg-[#f5a623] flex items-center justify-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="text-[#5a3e10] font-semibold text-lg">Enquiry Sent!</p>
              <p className="text-gray-500 text-sm text-center">We&apos;ll get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center space-y-2.5 sm:space-y-3 text-sm">
              {/* Product Title */}
              <input
                type="text"
                value={productTitle}
                disabled
                aria-label="Product Title"
                className="w-full rounded-full border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-center text-sm sm:text-base text-gray-800 font-medium truncate"
              />

              {/* Size Select (Preserved existing functionality) */}
              {sizes.length > 0 && (
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  required
                  aria-label="Select Size"
                  className="w-full rounded-full border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base text-gray-800 focus:outline-none focus:border-[#683e14] cursor-pointer"
                >
                  <option value="">Select Size</option>
                  {sizes.map((s) => (
                    <option key={s.name} value={s.name}>{s.name}</option>
                  ))}
                </select>
              )}

              {/* Name */}
              <input
                type="text"
                placeholder="Name"
                required
                aria-label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-full border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#683e14]"
              />

              {/* Email */}
              <input
                type="email"
                placeholder="Email"
                required
                aria-label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-full border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#683e14]"
              />

              {/* Phone Number */}
              <input
                type="text"
                placeholder="Phone Number"
                maxLength={10}
                required
                aria-label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-full border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#683e14]"
              />

              {/* Message Textarea */}
              <textarea
                placeholder="Message"
                rows={2}
                value={message}
                aria-label="Message"
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-[20px] sm:rounded-[24px] md:rounded-[28px] border border-gray-400/90 bg-transparent px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#683e14] h-18 sm:h-20 md:h-[86px] resize-none"
              />

              {/* Enquire Now Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-3 sm:mt-4 md:mt-4 lg:mt-5 cursor-pointer block w-[175px] sm:w-[190px] md:w-[185px] lg:w-[205px] py-2.5 sm:py-3 md:py-3 lg:py-3.5 text-sm sm:text-base font-normal border border-black bg-transparent hover:bg-black hover:text-white transition-all text-black disabled:opacity-60 disabled:cursor-not-allowed tracking-wide text-center"
              >
                {isSubmitting ? "Sending..." : "Enquire Now"}
              </button>
            </form>
          )}
        </div>

        {/* Existing Dynamic Saree / Badge Image (Desktop & Tablet: anchored bottom-left) */}
        <div className="hidden md:block absolute -bottom-2 md:-left-40 lg:-left-60 z-10 md:w-[340px] lg:w-[460px] pointer-events-none select-none drop-shadow-2xl">
          <Image
            src={badgeImageUrl}
            alt="Studio By Sheetal"
            width={500}
            height={750}
            className="object-contain object-bottom"
            priority
            unoptimized
          />
        </div>
      </div>
    </div>
  </>
);
};

export default EnquireModal;
