import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  // Core References
  styleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HijabStyle",
    required: [true, 'Style reference is required'],
    index: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'User reference is required'],
    index: true
  },

  // Review Content
  text: {
    type: String,
    required: [true, 'Review text is required'],
    trim: true,
    minlength: [10, 'Review must be at least 10 characters long'],
    maxlength: [1000, 'Review cannot exceed 1000 characters']
  },

  // Rating with detailed breakdown
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be between 1 and 5'],
    max: [5, 'Rating must be between 1 and 5'],
    validate: {
      validator: function(v) {
        return Number.isInteger(v * 2); // Allows half ratings (1, 1.5, 2, 2.5, etc.)
      },
      message: 'Rating must be in increments of 0.5'
    }
  },

  // Detailed rating breakdown (optional)
  detailedRating: {
    easeOfFollowing: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return !v || Number.isInteger(v * 2);
        }
      }
    },
    styleAppearance: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return !v || Number.isInteger(v * 2);
        }
      }
    },
    instructionClarity: {
      type: Number,
      min: 1,
      max: 5,
      validate: {
        validator: function(v) {
          return !v || Number.isInteger(v * 2);
        }
      }
    }
  },

  // Review metadata
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Review title cannot exceed 100 characters']
  },

  // User experience details
  userExperience: {
    difficultyLevel: {
      type: String,
      enum: ['Much Easier', 'Easier', 'As Expected', 'Harder', 'Much Harder']
    },
    timeSpent: {
      type: Number, // in minutes
      min: [1, 'Time spent must be at least 1 minute'],
      max: [240, 'Time spent cannot exceed 4 hours']
    },
    wouldRecommend: {
      type: Boolean,
      default: true
    }
  },

  // Media attachments
  images: [{
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: 'Please provide a valid image URL'
      }
    },
    caption: {
      type: String,
      trim: true,
      maxlength: 200
    }
  }],

  // Engagement metrics
  helpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  unhelpfulVotes: {
    type: Number,
    default: 0,
    min: 0
  },

  // Users who voted on this review
  voters: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    vote: {
      type: String,
      enum: ['helpful', 'unhelpful']
    }
  }],

  // Moderation
  status: {
    type: String,
    enum: ['Published', 'Pending', 'Flagged', 'Hidden'],
    default: 'Published'
  },

  flagReports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reason: {
      type: String,
      enum: ['Spam', 'Inappropriate', 'Fake', 'Offensive', 'Other']
    },
    description: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Response from style creator (optional)
  creatorResponse: {
    text: {
      type: String,
      trim: true,
      maxlength: 500
    },
    respondedAt: Date,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false // For verified purchases or authentic reviews
  },

  // Edit history
  editHistory: [{
    editedAt: {
      type: Date,
      default: Date.now
    },
    previousText: String,
    previousRating: Number
  }]

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for better performance
reviewSchema.index({ styleId: 1, createdAt: -1 }); // Get reviews for a style
reviewSchema.index({ userId: 1, createdAt: -1 }); // Get user's reviews
reviewSchema.index({ styleId: 1, userId: 1 }, { unique: true }); // One review per user per style
reviewSchema.index({ rating: -1, helpfulVotes: -1 }); // Sort by rating and helpfulness
reviewSchema.index({ status: 1, createdAt: -1 }); // Moderation queries

// Text index for search
reviewSchema.index({ text: 'text', title: 'text' });

// Virtual for helpfulness ratio
reviewSchema.virtual('helpfulnessRatio').get(function() {
  const totalVotes = this.helpfulVotes + this.unhelpfulVotes;
  if (totalVotes === 0) return 0;
  return (this.helpfulVotes / totalVotes * 100).toFixed(1);
});

// Virtual for net helpfulness score
reviewSchema.virtual('helpfulnessScore').get(function() {
  return this.helpfulVotes - this.unhelpfulVotes;
});

// Pre-save middleware
reviewSchema.pre('save', function(next) {
  // Track edit history
  if (this.isModified('text') || this.isModified('rating')) {
    if (!this.isNew) {
      this.editHistory.push({
        editedAt: new Date(),
        previousText: this.text,
        previousRating: this.rating
      });
    }
  }
  next();
});

// Instance Methods

// Vote on review helpfulness
reviewSchema.methods.vote = function(userId, voteType) {
  // Remove existing vote from this user
  this.voters = this.voters.filter(v => !v.userId.equals(userId));
  
  // Update vote counts
  if (voteType === 'helpful') {
    this.helpfulVotes += 1;
    this.voters.push({ userId, vote: 'helpful' });
  } else if (voteType === 'unhelpful') {
    this.unhelpfulVotes += 1;
    this.voters.push({ userId, vote: 'unhelpful' });
  }
  
  return this.save();
};

// Remove vote
reviewSchema.methods.removeVote = function(userId) {
  const existingVote = this.voters.find(v => v.userId.equals(userId));
  if (existingVote) {
    if (existingVote.vote === 'helpful') {
      this.helpfulVotes = Math.max(0, this.helpfulVotes - 1);
    } else {
      this.unhelpfulVotes = Math.max(0, this.unhelpfulVotes - 1);
    }
    this.voters = this.voters.filter(v => !v.userId.equals(userId));
  }
  return this.save();
};

// Flag review
reviewSchema.methods.flag = function(reportedBy, reason, description) {
  this.flagReports.push({
    reportedBy,
    reason,
    description,
    reportedAt: new Date()
  });
  
  // Auto-hide if flagged multiple times
  if (this.flagReports.length >= 3) {
    this.status = 'Flagged';
  }
  
  return this.save();
};

// Add creator response
reviewSchema.methods.addCreatorResponse = function(respondedBy, text) {
  this.creatorResponse = {
    text,
    respondedAt: new Date(),
    respondedBy
  };
  return this.save();
};

// Static Methods

// Get reviews for a style with sorting options
reviewSchema.statics.findForStyle = function(styleId, options = {}) {
  const {
    sort = 'newest',
    status = 'Published',
    limit = 10,
    skip = 0
  } = options;

  let sortQuery = {};
  switch (sort) {
    case 'newest':
      sortQuery = { createdAt: -1 };
      break;
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'highest':
      sortQuery = { rating: -1, createdAt: -1 };
      break;
    case 'lowest':
      sortQuery = { rating: 1, createdAt: -1 };
      break;
    case 'helpful':
      sortQuery = { helpfulVotes: -1, createdAt: -1 };
      break;
  }

  return this.find({ styleId, status })
    .populate('userId', 'name avatar')
    .populate('creatorResponse.respondedBy', 'name')
    .sort(sortQuery)
    .limit(limit)
    .skip(skip);
};

// Get average rating and stats for a style
reviewSchema.statics.getStyleStats = function(styleId) {
  return this.aggregate([
    { $match: { styleId: new mongoose.Types.ObjectId(styleId), status: 'Published' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        },
        recommendationRate: {
          $avg: { $cond: ['$userExperience.wouldRecommend', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        averageRating: { $round: ['$averageRating', 1] },
        totalReviews: 1,
        recommendationRate: { $multiply: ['$recommendationRate', 100] },
        ratingBreakdown: {
          5: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 5] } } } },
          4: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 4] } } } },
          3: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 3] } } } },
          2: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 2] } } } },
          1: { $size: { $filter: { input: '$ratingDistribution', cond: { $eq: ['$$this', 1] } } } }
        }
      }
    }
  ]);
};

// Find helpful reviews
reviewSchema.statics.findHelpful = function(limit = 5) {
  return this.find({ status: 'Published' })
    .populate('userId', 'name avatar')
    .populate('styleId', 'name image')
    .sort({ helpfulVotes: -1, rating: -1 })
    .limit(limit);
};

const Review = mongoose.model("Review", reviewSchema);

export default Review;
