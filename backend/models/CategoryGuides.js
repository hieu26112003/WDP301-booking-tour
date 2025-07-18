import mongoose from 'mongoose';

const CategoryGuideSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }
});

export default mongoose.model("CategoryGuide", CategoryGuideSchema);
