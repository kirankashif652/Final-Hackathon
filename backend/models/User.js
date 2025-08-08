import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Please provide a valid email address'
    },
    index: true
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    validate: {
      validator: function(v) {
        // At least one uppercase, one lowercase, one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    },
    select: false // Don't include password by default in queries
  },

  profile: {
    avatar: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
        },
        message: 'Please provide a valid avatar URL'
      }
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    location: {
      country: String,
      city: String,
      timezone: String
    },
    dateOfBirth: {
      type: Date,
      validate: {
        validator: function(v) {
          if (!v) return true;
          const age = (new Date() - v) / (1000 * 60 * 60 * 24 * 365);
          return age >= 13 && age <= 120;
        },
        message: 'Invalid date of birth'
      }
    },
    gender: {
      type: String,
      enum: ['Female', 'Male', 'Other', 'Prefer not to say']
    }
  },

  hijabPreferences: {
    experienceLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    favoriteStyles: [{
      type: String,
      trim: true
    }],
    faceShape: {
      type: String,
      enum: ['Round', 'Oval', 'Square', 'Heart', 'Long', 'Diamond']
    },
    preferredOccasions: [{
      type: String,
      enum: ['Casual', 'Formal', 'Wedding', 'Office', 'Party', 'Religious', 'Sport']
    }],
    skinTone: {
      type: String,
      enum: ['Fair', 'Medium', 'Olive', 'Dark', 'Deep']
    },
    preferredColors: [{
      type: String,
      trim: true
    }]
  },

  settings: {
    emailNotifications: {
      newStyles: { type: Boolean, default: true },
      reviews: { type: Boolean, default: true },
      followers: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['Public', 'Friends', 'Private'],
        default: 'Public'
      },
      showEmail: { type: Boolean, default: false },
      showLocation: { type: Boolean, default: true }
    },
    language: {
      type: String,
      enum: ['en', 'ar', 'ur', 'tr', 'fr', 'es'],
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['Light', 'Dark', 'Auto'],
      default: 'Light'
    }
  },

  social: {
    followers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      followedAt: {
        type: Date,
        default: Date.now
      }
    }],
    following: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      followedAt: {
        type: Date,
        default: Date.now
      }
    }],
    socialLinks: {
      instagram: String,
      youtube: String,
      tiktok: String,
      pinterest: String
    }
  },

  activity: {
    lastActive: {
      type: Date,
      default: Date.now
    },
    totalStyles: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 }
  },

  collections: {
    favorites: [{
      styleId: { type: mongoose.Schema.Types.ObjectId, ref: 'HijabStyle' },
      savedAt: { type: Date, default: Date.now }
    }],
    bookmarks: [{
      styleId: { type: mongoose.Schema.Types.ObjectId, ref: 'HijabStyle' },
      savedAt: { type: Date, default: Date.now }
    }],
    customCollections: [{
      name: { type: String, required: true, trim: true },
      description: String,
      styles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'HijabStyle' }],
      isPublic: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }]
  },

  achievements: {
    badges: [{
      name: String,
      icon: String,
      description: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: {
      days: { type: Number, default: 0 },
      lastActiveDate: Date
    }
  },

  accountStatus: {
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: Date,
    role: {
      type: String,
      enum: ['User', 'Creator', 'Moderator', 'Admin'],
      default: 'User'
    },
    suspendedUntil: Date,
    suspensionReason: String
  },

  emailVerification: {
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date
  },

  passwordReset: {
    resetToken: String,
    resetTokenExpires: Date
  },

  security: {
    twoFactorAuth: {
      enabled: { type: Boolean, default: false },
      secret: String,
      backupCodes: [String]
    },
    loginAttempts: {
      count: { type: Number, default: 0 },
      lockedUntil: Date
    },
    sessions: [{
      token: String,
      device: String,
      ip: String,
      userAgent: String,
      createdAt: { type: Date, default: Date.now },
      lastUsed: { type: Date, default: Date.now }
    }]
  },

  analytics: {
    profileViews: { type: Number, default: 0 },
    stylesViewed: { type: Number, default: 0 },
    totalEngagement: { type: Number, default: 0 }
  }

}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform(doc, ret) {
      delete ret.password;
      delete ret.passwordReset;
      delete ret.emailVerification;
      delete ret.security;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ 'profile.location.country': 1, 'profile.location.city': 1 });
userSchema.index({ 'accountStatus.role': 1 });
userSchema.index({ 'activity.lastActive': -1 });
userSchema.index({ 'achievements.points': -1 });
userSchema.index({ name: 'text', 'profile.bio': 'text' });

// Virtuals
userSchema.virtual('age').get(function() {
  if (!this.profile.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.profile.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

userSchema.virtual('followersCount').get(function() {
  return this.social.followers.length;
});

userSchema.virtual('followingCount').get(function() {
  return this.social.following.length;
});

userSchema.virtual('isAccountLocked').get(function() {
  return this.security.loginAttempts.lockedUntil &&
         this.security.loginAttempts.lockedUntil > Date.now();
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }

  // Only update streak if lastActive is modified or new doc
  if (this.isModified('activity.lastActive') || this.isNew) {
    const lastActive = this.achievements.streak.lastActiveDate;
    const today = new Date().toDateString();

    if (lastActive && lastActive.toDateString() === today) {
      // Same day, no change
    } else if (lastActive && (new Date() - lastActive) <= 24 * 60 * 60 * 1000) {
      this.achievements.streak.days += 1;
    } else {
      this.achievements.streak.days = 1;
    }
    this.achievements.streak.lastActiveDate = new Date();
  }

  next();
});

// Instance methods
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerification.verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  this.emailVerification.verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24h
  return token;
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordReset.resetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordReset.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10min
  return resetToken;
};

userSchema.methods.followUser = function(userId) {
  if (!this.social.following.find(f => f.user.equals(userId))) {
    this.social.following.push({ user: userId });
  }
  return this.save();
};

userSchema.methods.unfollowUser = function(userId) {
  this.social.following = this.social.following.filter(f => !f.user.equals(userId));
  return this.save();
};

userSchema.methods.addToFavorites = function(styleId) {
  if (!this.collections.favorites.find(f => f.styleId.equals(styleId))) {
    this.collections.favorites.push({ styleId });
  }
  return this.save();
};

userSchema.methods.removeFromFavorites = function(styleId) {
  this.collections.favorites = this.collections.favorites.filter(f => !f.styleId.equals(styleId));
  return this.save();
};

userSchema.methods.awardPoints = function(points) {
  this.achievements.points += points;
  const newLevel = Math.floor(this.achievements.points / 100) + 1;
  if (newLevel > this.achievements.level) {
    this.achievements.level = newLevel;
  }
  return this.save();
};

userSchema.methods.addBadge = function(badge) {
  if (!this.achievements.badges.find(b => b.name === badge.name)) {
    this.achievements.badges.push(badge);
  }
  return this.save();
};

userSchema.methods.incLoginAttempts = function() {
  if (this.security.loginAttempts.lockedUntil &&
      this.security.loginAttempts.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: { 'security.loginAttempts.lockedUntil': 1 },
      $set: { 'security.loginAttempts.count': 1 }
    });
  }

  const updates = { $inc: { 'security.loginAttempts.count': 1 } };

  if (this.security.loginAttempts.count + 1 >= 5 && !this.isAccountLocked) {
    updates.$set = { 'security.loginAttempts.lockedUntil': Date.now() + 2 * 60 * 60 * 1000 };
  }

  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      'security.loginAttempts.count': 1,
      'security.loginAttempts.lockedUntil': 1
    }
  });
};

// Static methods
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) return null;
  const isMatch = await user.matchPassword(password);
  return isMatch ? user : null;
};

userSchema.statics.searchUsers = function(query, options = {}) {
  const searchQuery = {
    'accountStatus.isActive': true,
    'settings.privacy.profileVisibility': { $ne: 'Private' }
  };
  if (query) {
    searchQuery.$text = { $search: query };
  }
  return this.find(searchQuery)
    .select('name profile.avatar profile.bio social.followers achievements.level')
    .sort(options.sort || { 'achievements.points': -1 })
    .limit(options.limit || 20);
};

userSchema.statics.getUserStats = function(userId) {
  return this.findById(userId)
    .select('activity achievements collections social')
    .populate('collections.favorites.styleId', 'name image likes')
    .populate('social.followers.user', 'name profile.avatar')
    .populate('social.following.user', 'name profile.avatar');
};

userSchema.statics.getTrendingUsers = function(limit = 10) {
  return this.find({
    'accountStatus.isActive': true,
    'settings.privacy.profileVisibility': 'Public'
  })
  .select('name profile.avatar achievements.points social.followers activity.totalStyles')
  .sort({ 'achievements.points': -1, 'social.followers': -1 })
  .limit(limit);
};

const User = mongoose.model("User", userSchema, "Users");

export default User;
