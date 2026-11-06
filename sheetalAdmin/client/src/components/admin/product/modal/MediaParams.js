import React, { useRef, useCallback, useState } from "react";
import {
  LayoutDashboard,
  UploadCloud,
  MousePointer2,
  Trash2,
  ImageIcon,
  Images,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getRatioLabel,
  getImageAspectRatioWarning,
} from "@/utils/imageAspectRatio";

const PRODUCT_IMAGE_RATIO = { width: 3, height: 4 };
const PRODUCT_IMAGE_RATIO_LABEL = getRatioLabel(
  PRODUCT_IMAGE_RATIO.width,
  PRODUCT_IMAGE_RATIO.height,
);
const MAX_GALLERY_IMAGES = 15;

const handleProductImageChange = async (e, setFormData, fieldName) => {
  const file = e.target.files?.[0];
  if (!file) return;

  try {
    const warning = await getImageAspectRatioWarning(file, PRODUCT_IMAGE_RATIO, {
      label: fieldName === "mainImageFile" ? "Main image" : "Hover image",
    });
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
    if (warning) {
      toast.error(warning);
    }
  } catch (err) {
    toast.error(err.message || "Invalid image file");
    e.target.value = "";
  }
};

export default function MediaParams({ formData, setFormData }) {
  const galleryInputRef = useRef(null);
  const urlMapRef = useRef(new WeakMap());
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [isDropzoneActive, setIsDropzoneActive] = useState(false);

  const getPreviewUrl = useCallback((item) => {
    if (!item) return "/placeholder.png";
    if (item instanceof File) {
      if (!urlMapRef.current.has(item)) {
        urlMapRef.current.set(item, URL.createObjectURL(item));
      }
      return urlMapRef.current.get(item);
    }
    if (typeof item === "string") return item;
    return item.url || "/placeholder.png";
  }, []);

  const handleAddGalleryFiles = async (selectedFiles) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const currentImages = Array.isArray(formData.images) ? formData.images : [];
    const remainingSlots = Math.max(0, MAX_GALLERY_IMAGES - currentImages.length);

    if (remainingSlots <= 0) {
      toast.error(`Maximum of ${MAX_GALLERY_IMAGES} gallery images reached.`);
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    if (selectedFiles.length > remainingSlots) {
      toast.error(`Added ${remainingSlots} images. Maximum is ${MAX_GALLERY_IMAGES}.`);
    }

    // Check aspect ratios for warnings
    for (const file of filesToAdd) {
      try {
        const warning = await getImageAspectRatioWarning(file, PRODUCT_IMAGE_RATIO, {
          label: file.name,
        });
        if (warning) {
          toast.error(warning);
          break;
        }
      } catch (err) {
        console.error("Aspect ratio check error:", err);
      }
    }

    setFormData((prev) => {
      const existing = Array.isArray(prev.images) ? prev.images : [];
      const existingFiles = Array.isArray(prev.galleryImageFiles)
        ? prev.galleryImageFiles
        : [];
      return {
        ...prev,
        images: [...existing, ...filesToAdd],
        galleryImageFiles: [...existingFiles, ...filesToAdd],
      };
    });
  };

  const handleGalleryFileInput = async (e) => {
    const files = Array.from(e.target.files || []);
    await handleAddGalleryFiles(files);
    e.target.value = "";
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    const itemToRemove = (formData.images || [])[indexToRemove];
    setFormData((prev) => {
      const updatedImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      const updatedFiles = (prev.galleryImageFiles || []).filter((f) => f !== itemToRemove);
      return {
        ...prev,
        images: updatedImages,
        galleryImageFiles: updatedFiles,
      };
    });
  };

  const handleMoveGalleryImage = (fromIndex, toIndex) => {
    const list = Array.isArray(formData.images) ? formData.images : [];
    if (toIndex < 0 || toIndex >= list.length) return;

    setFormData((prev) => {
      const nextList = [...(prev.images || [])];
      const [moved] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, moved);
      return {
        ...prev,
        images: nextList,
      };
    });
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDropItem = (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    handleMoveGalleryImage(draggedIndex, targetIndex);
    setDraggedIndex(null);
  };

  const handleDropzoneDrop = async (e) => {
    e.preventDefault();
    setIsDropzoneActive(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length > 0) {
      await handleAddGalleryFiles(files);
    }
  };

  const galleryImagesList = Array.isArray(formData.images) ? formData.images : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-400">
      {/* ── Main and Hover Images ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Main Display Image */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
              <LayoutDashboard size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              Main Display Image
            </span>
          </div>
          <p className="mb-3 text-[10px] font-semibold text-slate-500">
            Required aspect ratio: {PRODUCT_IMAGE_RATIO_LABEL}
          </p>

          <div className="relative group border-2 border-dashed border-slate-200 rounded-3xl p-2 bg-white hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden shadow-sm">
            {formData.mainImageFile || formData.mainImage?.url ? (
              <>
                <img
                  src={
                    formData.mainImageFile
                      ? URL.createObjectURL(formData.mainImageFile)
                      : formData.mainImage?.url
                        ? formData.mainImage.url
                        : "/placeholder.png"
                  }
                  className="w-full h-full object-cover rounded-2xl"
                  alt="Main"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />

                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                  <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-transform">
                    Replace Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        handleProductImageChange(
                          e,
                          setFormData,
                          "mainImageFile",
                        )
                      }
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <UploadCloud
                    className="text-slate-400 group-hover:text-blue-500"
                    size={32}
                  />
                </div>
                <p className="text-xs font-bold text-slate-600 mb-1">
                  Click or Drag to Upload
                </p>
                <p className="text-[10px] text-slate-400">JPG, PNG, WebP up to 5MB</p>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    handleProductImageChange(
                      e,
                      setFormData,
                      "mainImageFile",
                    )
                  }
                />
              </div>
            )}
          </div>
          <input
            className="mt-3 w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition"
            placeholder="SEO Alt Text: e.g. Navy Blue Cotton Shirt Front"
            value={formData.mainImage?.alt || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                mainImage: {
                  ...formData.mainImage,
                  alt: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Secondary / Hover Image */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-lg">
              <MousePointer2 size={16} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
              Secondary / Hover Image
            </span>
          </div>
          <p className="mb-3 text-[10px] font-semibold text-slate-500">
            Required aspect ratio: {PRODUCT_IMAGE_RATIO_LABEL}
          </p>

          <div className="relative group border-2 border-dashed border-slate-200 rounded-3xl p-2 bg-white hover:border-purple-500 hover:bg-purple-50/30 transition-all duration-300 aspect-[4/3] flex flex-col items-center justify-center overflow-hidden shadow-sm">
            {formData.hoverImageFile || formData.hoverImage?.url ? (
              <>
                <img
                  src={
                    formData.hoverImageFile
                      ? URL.createObjectURL(formData.hoverImageFile)
                      : formData.hoverImage?.url
                        ? formData.hoverImage.url
                        : "/placeholder.png"
                  }
                  className="w-full h-full object-cover rounded-2xl"
                  alt="Hover"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />

                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({
                        ...formData,
                        hoverImageFile: null,
                        hoverImage: { url: "" },
                      })
                    }
                    className="bg-rose-500 text-white p-2.5 rounded-xl shadow-xl hover:bg-rose-600 transition"
                    title="Remove hover image"
                  >
                    <Trash2 size={16} />
                  </button>
                  <label className="cursor-pointer bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl hover:scale-105 transition-transform">
                    Replace
                    <input
                      type="file"
                      className="hidden"
                      id="hover-upload"
                      accept="image/*"
                      onChange={(e) =>
                        handleProductImageChange(
                          e,
                          setFormData,
                          "hoverImageFile",
                        )
                      }
                    />
                  </label>
                </div>
              </>
            ) : (
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="text-slate-300" size={32} />
                </div>
                <p className="text-xs font-bold text-slate-600 mb-1">
                  Hover Preview Image
                </p>
                <p className="text-[10px] text-slate-400">
                  Shows on mouse hover in shop
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) =>
                    handleProductImageChange(
                      e,
                      setFormData,
                      "hoverImageFile",
                    )
                  }
                />
              </div>
            )}
          </div>
          <input
            className="mt-3 w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-purple-500/20 outline-none transition"
            placeholder="SEO Alt Text: e.g. Model wearing navy blue shirt"
            value={formData.hoverImage?.alt || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                hoverImage: {
                  ...formData.hoverImage,
                  alt: e.target.value,
                },
              })
            }
          />
        </div>
      </div>

      {/* ── Product Gallery (Multiple Images / Side Photos) ── */}
      <div className="pt-6 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <Images size={16} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                Product Gallery Images (Side Photos)
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {galleryImagesList.length}/{MAX_GALLERY_IMAGES}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Add multiple side & gallery photos. These appear as clickable side thumbnails next to the main photo on the product page.
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition">
            <Plus size={15} /> Add Images
            <input
              ref={galleryInputRef}
              type="file"
              className="hidden"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={handleGalleryFileInput}
            />
          </label>
        </div>

        {galleryImagesList.length === 0 ? (
          /* Empty State Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDropzoneActive(true);
            }}
            onDragLeave={() => setIsDropzoneActive(false)}
            onDrop={handleDropzoneDrop}
            onClick={() => galleryInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDropzoneActive
                ? "border-indigo-500 bg-indigo-50/40"
                : "border-slate-300 hover:border-indigo-400 hover:bg-slate-50/60 bg-white"
            }`}
          >
            <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Images size={28} />
            </div>
            <p className="text-xs font-bold text-slate-700">
              Click or drag multiple images here
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports JPEG, PNG, and WebP (up to {MAX_GALLERY_IMAGES} images, max 5MB each)
            </p>
          </div>
        ) : (
          /* Gallery Thumbnail Grid */
          <div
            onDragOver={(e) => e.preventDefault()}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5"
          >
            {galleryImagesList.map((item, index) => (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropItem(e, index)}
                className={`group relative aspect-[3/4] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm transition hover:shadow-md ${
                  draggedIndex === index ? "opacity-40 scale-95 ring-2 ring-indigo-500" : ""
                }`}
              >
                <img
                  src={getPreviewUrl(item)}
                  alt={`Gallery image ${index + 1}`}
                  className="w-full h-full object-cover select-none"
                  onError={(e) => {
                    e.target.src = "/placeholder.png";
                  }}
                />

                {/* Number Badge */}
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                  #{index + 1}
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveGalleryImage(index);
                  }}
                  className="absolute top-2 right-2 rounded-xl bg-rose-600/90 text-white p-1.5 shadow-sm opacity-90 hover:opacity-100 hover:bg-rose-700 transition"
                  title="Remove image"
                >
                  <Trash2 size={13} />
                </button>

                {/* Reorder Arrows on Hover */}
                <div className="absolute bottom-2 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveGalleryImage(index, index - 1);
                    }}
                    className={`p-1 rounded-lg backdrop-blur-md text-white transition ${
                      index === 0
                        ? "bg-black/20 text-white/30 cursor-not-allowed"
                        : "bg-black/60 hover:bg-black/80"
                    }`}
                    title="Move left"
                  >
                    <ChevronLeft size={13} />
                  </button>

                  <span className="text-[9px] font-semibold text-white/80 bg-black/40 px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none">
                    Drag to reorder
                  </span>

                  <button
                    type="button"
                    disabled={index === galleryImagesList.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveGalleryImage(index, index + 1);
                    }}
                    className={`p-1 rounded-lg backdrop-blur-md text-white transition ${
                      index === galleryImagesList.length - 1
                        ? "bg-black/20 text-white/30 cursor-not-allowed"
                        : "bg-black/60 hover:bg-black/80"
                    }`}
                    title="Move right"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Add More Slot */}
            {galleryImagesList.length < MAX_GALLERY_IMAGES && (
              <label
                onClick={() => galleryInputRef.current?.click()}
                className="aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/20 bg-white flex flex-col items-center justify-center cursor-pointer transition text-slate-400 hover:text-indigo-600 shadow-sm"
              >
                <Plus size={22} className="mb-1" />
                <span className="text-[11px] font-bold">Add More</span>
                <span className="text-[9px] text-slate-400">
                  ({MAX_GALLERY_IMAGES - galleryImagesList.length} left)
                </span>
              </label>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
