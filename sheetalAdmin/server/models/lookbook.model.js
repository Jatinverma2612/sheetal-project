import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    // Single shared pool of images — both sliders use these
    sliderImages: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
        alt: String,
        // Category slug → user is taken to /[categorySlug] when clicked
        categoryLink: { type: String, default: "" },
      },
    ],
    // Keep old fields for backwards compatibility (read-only migration path)
    leftSliderImages: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
        alt: String,
        categoryLink: { type: String, default: "" },
      },
    ],
    rightSliderImages: [
      {
        url: { type: String, required: true },
        key: { type: String, required: true },
        alt: String,
        categoryLink: { type: String, default: "" },
      },
    ],
    centerContent: {
      label: { type: String, default: "Exclusive Deal · Few Days Left" },
      heading: { type: String, default: "Timeless Women's Collection" },
      description: { type: String, default: "" },
      buttonText: { type: String, default: "VIEW MORE" },
      buttonLink: { type: String, default: "#" },
      // Category slug for the banner/button link
      categoryLink: { type: String, default: "" },
      // Category slugs for the View More discounted product list
      categoryLinks: [{ type: String, trim: true }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Lookbook = mongoose.model("Lookbook", lookbookSchema);

export default Lookbook;
