import mongoose from "mongoose";

const returnSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: { type: String, enum: ["Return", "Exchange"], required: true },
    reason: {
      type: String,
      required: true,
      enum: [
        "Wrong Size",
        "Defective Product",
        "Quality not as expected",
        "Changed my mind",
        "Wrong item sent",
      ],
    },
    details: { type: String },
    images: [{ url: { type: String }, public_id: { type: String } }],
    status: {
      type: String,
      enum: ["Pending", "Approved", "Picked Up", "Rejected", "Completed"],
      default: "Pending",
    },
    refundStatus: {
      type: String,
      enum: ["Not Applicable", "Pending", "Processed", "Failed"],
      default: "Not Applicable",
    },
    adminComment: { type: String },
  },
  { timestamps: true },
);

const Return = mongoose.models.Return || mongoose.model("Return", returnSchema);
export default Return;
