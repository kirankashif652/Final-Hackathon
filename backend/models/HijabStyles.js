import mongoose from "mongoose";
import validator from "validator";

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, trim: true },
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
    },
  }],
  likes: { type: Number, default: 0, min: 0 },
  views: { type: Number, default: 0, min: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tags: [{ type: String, lowercase: true, trim: true }],
  status: { type: String, enum: ["Draft", "Published", "Archived"], default: "Published" },
  slug: { type: String, unique: true, lowercase: true, trim: true },

  // Optional reviews array
  reviews: [reviewSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Indexes
hijabStyleSchema.index({ name: "text", description: "text", tags: "text" });
hijabStyleSchema.index({ difficulty: 1, occasions: 1 });
hijabStyleSchema.index({ createdAt: -1 });
hijabStyleSchema.index({ likes: -1 });

// Virtual for averageRating
hijabStyleSchema.virtual("averageRating").get(function () {
  if (this.reviews?.length) {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / this.reviews.length).toFixed(1);
  }
  return 0;
});

// Slug generator pre-save hook
hijabStyleSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Methods
hijabStyleSchema.methods.incrementViews = function () {
  this.views++;
  return this.save();
};

hijabStyleSchema.methods.toggleLike = function (increment = true) {
  this.likes = Math.max(0, this.likes + (increment ? 1 : -1));
  return this.save();
};

// Statics
hijabStyleSchema.statics.findPopular = function (limit = 10) {
  return this.find({ status: "Published" })
    .sort({ likes: -1, views: -1 })
    .limit(limit)
    .select("name image description likes views difficulty");
};

hijabStyleSchema.statics.searchStyles = function (query, filters = {}) {
  const searchQuery = { status: "Published" };

  if (query) {
    searchQuery.$text = { $search: query };
  }
  if (filters.difficulty) searchQuery.difficulty = filters.difficulty;
  if (filters.occasions?.length) searchQuery.occasions = { $in: filters.occasions };
  if (filters.faceShape) searchQuery.suitableFaceShapes = filters.faceShape;

  return this.find(searchQuery)
    .sort(query ? { score: { $meta: "textScore" } } : { createdAt: -1 });
};

const HijabStyle = mongoose.model("HijabStyle", hijabStyleSchema, "hijab_gallery");

export default HijabStyle;
