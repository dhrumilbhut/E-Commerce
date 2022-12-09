import mongoose, { mongo } from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide coupon code"],
    },
    discount: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Coupon", couponSchema);
