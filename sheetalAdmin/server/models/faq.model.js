import mongoose from "mongoose";

const faqItemSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const faqSchema = new mongoose.Schema(
  {
    pageTitle: { type: String, default: "Frequently Asked Questions" },
    ctaText: { type: String, default: "" },
    ctaButtonText: { type: String, default: "" },
    ctaButtonLink: { type: String, default: "" },
    faqs: [faqItemSchema],
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: String },
    ogImage: { type: String },
    canonicalUrl: { type: String },
    seoSchema: { type: String },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const FAQ = mongoose.models.FAQ || mongoose.model("FAQ", faqSchema);

export default FAQ;
