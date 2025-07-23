import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
    },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
