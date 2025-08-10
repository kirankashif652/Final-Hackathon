import mongoose from "mongoose";
import validator from "validator";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true, default: "" },
}, { timestamps: true });

const hijabStyleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Hijab style name is required"],
    trim: true,
    maxlength: [100, "Name cannot exceed 100 characters"],
    index: true,
  },
  image: {
    type: String,
    required: [true, "Image URL is required"],
    validate: {
      validator: (v) => validator.isURL(v) && /\.(jpg|jpeg|png|webp|gif)$/i.test(v),
      message: "Please provide a valid image URL",
    },
  },
  additionalImages: [{
    type: String,
    validate: {
      validator: (v) => !v || (validator.isURL(v) && /\.(jpg|jpeg|png|webp|gif)$/i.test(v)),
      message: "Please provide valid image URLs",
    },
  }],
  description: {
    type: String,
    trim: true,
    maxlength: [500, "Description cannot exceed 500 characters"],
    default: "",
  },
  difficulty: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced"],
    default: "Beginner",
  },
  occasions: [{
    type: String,
    enum: ["Casual", "Formal", "Wedding", "Office", "Party", "Religious", "Sport"],
  }],
  suitableFaceShapes: [{
    type: String,
    enum: ["Round", "Oval", "Square", "Heart", "Long", "Diamond"],
  }],
  requiredItems: [{
    item: { type: String, required: true, trim: true },
    quantity: { type: Number, default: 1, min: 1 },
  }],
  instructions: [{
    step: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
    image: {
      type: String,
      validate: {
        validator: (v) => !v || (validator.isURL(v) && /\.(jpg|jpeg|png|webp|gif)$/i.test(v)),
        message: "Please provide a valid image URL",
      },
      default: null,
    },
  }],
  likes: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: String, lowercase: true, trim: true }],
  status: { type: String, enum: ["Draft", "Published", "Archived"], default: "Published" },
  slug: { type: String, unique: true, lowercase: true, trim: true },

  reviews: [reviewSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Text indexes for full-text search
hijabStyleSchema.index({ name: "text", description: "text", tags: "text" });

// Additional indexes for filtering and sorting performance
hijabStyleSchema.index({ difficulty: 1, occasions: 1 });
hijabStyleSchema.index({ createdAt: -1 });
hijabStyleSchema.index({ likes: -1 });

// Virtual for averageRating (returns Number instead of string)
hijabStyleSchema.virtual("averageRating").get(function () {
  if (this.reviews?.length) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / this.reviews.length) * 10) / 10; // e.g. 4.3
  }
  return 0;
});

// Pre-save hook to generate slug from name
hijabStyleSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Instance method to increment views count safely
hijabStyleSchema.methods.incrementViews = function () {
  this.views = (this.views || 0) + 1;
  return this.save();
};

// Instance method to toggle like count, preventing negative values
hijabStyleSchema.methods.toggleLike = function (increment = true) {
  this.likes = Math.max(0, (this.likes || 0) + (increment ? 1 : -1));
  return this.save();
};

// Static method to find popular styles with limit and published status
hijabStyleSchema.statics.findPopular = function (limit = 10) {
  return this.find({ status: "Published" })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .select("name image description likes views difficulty slug")
    .lean();
};

// Static method to perform text search with optional filters
hijabStyleSchema.statics.searchStyles = function (query, filters = {}) {
  const searchQuery = { status: "Published" };

  if (query) {
    searchQuery.$text = { $search: query };
  }
  if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
  if (filters.occasions?.length) searchQuery.occasions = { $in: filters.occasions };
  if (filters.faceShape) searchQuery.suitableFaceShapes = filters.faceShape;

  return this.find(searchQuery)
    .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 })
    .lean();
};

const HijabStyle = mongoose.model("HijabStyle", hijabStyleSchema, "hijab_gallery");

export default HijabStyle;
