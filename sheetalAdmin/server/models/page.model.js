import mongoose from "mongoose";

const pageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: { type: mongoose.Schema.Types.Mixed, default: "" },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: String, trim: true },
    canonicalUrl: { type: String, trim: true },
    ogTitle: { type: String, trim: true },
    ogDescription: { type: String, trim: true },
    ogImage: { type: String, trim: true },
    seoSchema: { type: String },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Draft",
      index: true,
    },
    footerPlacement: {
      type: String,
      enum: ["none", "footer_column_1", "footer_column_2", "footer_column_3"],
      default: "none",
      index: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

pageSchema.index({ title: "text", slug: "text" });

const Page = mongoose.models.Page || mongoose.model("Page", pageSchema);

export default Page;
