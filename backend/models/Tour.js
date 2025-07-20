import mongoose from "mongoose";

const tourSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      sparse: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
    },
    summary: {
      type: String,
      required: true,
    },
    days: {
      type: String,
      required: true,
    },
    serviceStandards: {
      type: String,
      required: true,
    },
    priceChild: {
      type: Number,
      required: true,
    },
    priceAdult: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      required: true,
    },
    cancellationPolicy: {
      type: String,
      required: true,
    },
    schedule: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tour", tourSchema);
