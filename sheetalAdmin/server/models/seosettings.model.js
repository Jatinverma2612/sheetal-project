import mongoose from "mongoose";

const seoSettingsSchema = new mongoose.Schema(
  {
    websiteName: { type: String, default: "Studio By Sheetal" },
    websiteUrl: { type: String, default: "https://studiobysheetal.com" },
    organizationName: { type: String, default: "Studio By Sheetal" },
    organizationDescription: {
      type: String,
      default: "Exquisite ethnic wear and designer sarees.",
    },
    logo: { type: String, default: "" },
    contactEmail: { type: String, default: "info@studiobysheetal.com" },
    contactPhone: { type: String, default: "" },
    socialMediaLinks: [
      {
        platform: { type: String },
        url: { type: String },
      },
    ],
    seoSchema: { type: String }, // Global Schema (Organization/WebSite)
  },
  { timestamps: true },
);

const SeoSettings =
  mongoose.models.SeoSettings ||
  mongoose.model("SeoSettings", seoSettingsSchema);

export default SeoSettings;
