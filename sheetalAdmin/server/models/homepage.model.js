import mongoose from "mongoose";

const homepageSchema = new mongoose.Schema(
  {
    sections: {
      topInfo: { type: Boolean, default: true },
      homeBanner: { type: Boolean, default: true },
      aboutSBS: { type: Boolean, default: true },
      hiddenBeauty: { type: Boolean, default: true },
      trendingThisWeek: { type: Boolean, default: true },
      newArrivals: { type: Boolean, default: true },
      collections: { type: Boolean, default: true },
      timelessWomenCollection: { type: Boolean, default: true },
      instagramDiaries: { type: Boolean, default: true },
      testimonials: { type: Boolean, default: true },
      blogs: { type: Boolean, default: true },
      bookAppointmentWidget: { type: Boolean, default: true },
    },
    topInfoConfig: {
      mode: {
        type: String,
        enum: ["coupon", "custom", "hidden"],
        default: "coupon",
      },
      customText: {
        type: String,
        default: "",
        trim: true,
      },
      customCtaLabel: {
        type: String,
        default: "Shop Now",
        trim: true,
      },
      customCtaHref: {
        type: String,
        default: "/product-list",
        trim: true,
      },
    },
    aboutSBS: {
      heading: { type: String, default: "About SBS" },
      subheading: { type: String, default: "Innovate the Outfit" },
      description: {
        type: String,
        default:
          "Studio By Sheetal: a designer studio passionate about timeless elegance. Sheetal crafts exquisite sarees, suits, and Indo-Western outfits with meticulous attention to detail, luxurious fabrics, and contemporary flair. Each piece blends traditional charm with modern silhouettes, tailored to celebrate individuality.",
      },
      buttonText: { type: String, default: "Explore More" },
      buttonUrl: { type: String, default: "/about-us" },
    },
    hiddenBeauty: {
      heading: { type: String, default: "Bring Out The Hidden Beauty" },
      subheading: {
        type: String,
        default:
          "Designer pieces that blend traditional charm with modern silhouettes for every occasion.",
      },
      categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    },
    collections: {
      heading: { type: String, default: "Collections" },
      subheading: {
        type: String,
        default:
          "Best-Selling Gems: Signature sarees, ensembles, and Indo-Western pieces that define Studio By Sheetal.",
      },
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },


    trendingThisWeek: {
      heading: { type: String, default: "Trending This Week" },
      subheading: {
        type: String,
        default:
          "Best-Selling Gems: Signature sarees, ensembles, and Indo-Western pieces that define Studio By Sheetal.",
      },
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    },
    newArrivals: {
      heading: { type: String, default: "New Arrivals" },
      subheading: {
        type: String,
        default:
          "Explore our latest collection of exquisite designs crafted with love.",
      },
      products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
      buttonText: { type: String, default: "View All" },
      buttonUrl: { type: String, default: "/product-list" },
    },
    instagramDiaries: {
      heading: { type: String, default: "Instagram Diaries" },
      subheading: {
        type: String,
        default:
          "Follow our journey and stay updated with the latest trends and styles.",
      },
    },
    testimonials: {
      heading: { type: String, default: "What Our Customers Say" },
      subheading: {
        type: String,
        default: "Testimonials from our happy customers.",
      },
    },
    blogs: {
      heading: { type: String, default: "Latest Articles & Blogs" },
    },
    metaTitle: { type: String, trim: true },
    metaDescription: { type: String, trim: true },
    metaKeywords: { type: String },
    ogImage: { type: String },
    canonicalUrl: { type: String },
    seoSchema: { type: String },
  },
  { timestamps: true },
);

const Homepage = mongoose.model("Homepage", homepageSchema);
export default Homepage;
