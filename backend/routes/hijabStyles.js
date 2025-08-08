import express from "express";
import HijabStyle from "../models/HijabStyles.js";
import Review from "../models/Review.js";

const router = express.Router();

// Validation middleware
const validateHijabStyle = (req, res, next) => {
  const { name, image } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ 
      success: false, 
      message: "Style name is required" 
    });
  }
  
  if (!image || !image.match(/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i)) {
    return res.status(400).json({ 
      success: false, 
      message: "Valid image URL is required" 
    });
  }
  
  next();
};

// --- Specific routes before parameterized routes ---

// GET /api/hijab-styles/popular
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const popularStyles = await HijabStyle.findPopular(parseInt(limit));
    
    res.json({ success: true, data: popularStyles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching popular styles" });
  }
});

// GET /api/hijab-styles/featured
router.get("/featured", async (req, res) => {
  try {
    const featuredStyles = await HijabStyle.find({ 
      status: 'Published',
      likes: { $gte: 50 }
    })
    .sort({ likes: -1, views: -1 })
    .limit(6)
    .populate('createdBy', 'name profile.avatar')
    .lean();

    res.json({ success: true, data: featuredStyles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching featured styles" });
  }
});

// GET /api/hijab-styles/search/suggestions
router.get("/search/suggestions", async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await HijabStyle.find({
      status: 'Published',
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .select('name slug')
    .limit(10)
    .lean();

    res.json({ success: true, data: suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching suggestions" });
  }
});

// GET /api/hijab-styles/filters/options
router.get("/filters/options", async (req, res) => {
  try {
    const [difficulties, occasions, faceShapes, tags] = await Promise.all([
      HijabStyle.distinct('difficulty', { status: 'Published' }),
      HijabStyle.distinct('occasions', { status: 'Published' }),
      HijabStyle.distinct('suitableFaceShapes', { status: 'Published' }),
      HijabStyle.distinct('tags', { status: 'Published' })
    ]);

    res.json({
      success: true,
      data: {
        difficulties: difficulties.filter(Boolean),
        occasions: occasions.filter(Boolean),
        faceShapes: faceShapes.filter(Boolean),
        tags: tags.filter(Boolean).slice(0, 20)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching filter options" });
  }
});

// GET /api/hijab-styles/seed
router.get("/seed", async (req, res) => {
  try {
    await HijabStyle.deleteMany();
    
    const sampleHijabs = [
      {
        name: "Classic Everyday Wrap",
        image: "https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500",
        description: "A simple and elegant everyday hijab style perfect for work and casual outings.",
        difficulty: "Beginner",
        occasions: ["Casual", "Office"],
        suitableFaceShapes: ["Oval", "Round"],
        requiredItems: [
          { item: "Square hijab scarf", quantity: 1 },
          { item: "Safety pins", quantity: 2 }
        ],
        instructions: [
          { step: 1, description: "Place the hijab on your head with equal lengths on both sides" },
          { step: 2, description: "Cross the ends under your chin" },
          { step: 3, description: "Wrap around and pin in place" }
        ],
        tags: ["easy", "classic", "everyday", "simple"],
        likes: 45,
        views: 230
      },
      // ... (rest of sample data as you provided)
    ];

    const insertedHijabs = await HijabStyle.insertMany(sampleHijabs);

    res.json({
      success: true,
      message: `Successfully seeded ${insertedHijabs.length} hijab styles`,
      data: insertedHijabs
    });
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ success: false, message: "Error seeding data", error: error.message });
  }
});

// --- Now parameterized routes ---

// GET /api/hijab-styles/:id
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { includeReviews = 'true' } = req.query;

    const hijab = await HijabStyle.findById(id)
      .populate('createdBy', 'name profile.avatar profile.bio achievements.level')
      .lean();

    if (!hijab) {
      return res.status(404).json({ success: false, message: "Hijab style not found" });
    }

    HijabStyle.findByIdAndUpdate(id, { $inc: { views: 1 } }).exec();

    let reviews = [];
    let reviewStats = null;
    
    if (includeReviews === 'true') {
      [reviews, reviewStats] = await Promise.all([
        Review.findForStyle(id, { limit: 5, sort: 'helpful' }),
        Review.getStyleStats(id)
      ]);
    }

    res.json({
      success: true,
      data: {
        hijab,
        reviews,
        reviewStats: reviewStats?.[0] || null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching hijab style" });
  }
});

// PUT /api/hijab-styles/:id
router.put("/:id", validateHijabStyle, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (req.body.name) {
      updateData.slug = req.body.name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    const hijab = await HijabStyle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name profile.avatar');

    if (!hijab) {
      return res.status(404).json({ success: false, message: "Hijab style not found" });
    }

    res.json({ success: true, message: "Hijab style updated successfully", data: hijab });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false, message: "Validation error", errors });
    }
    res.status(500).json({ success: false, message: "Error updating hijab style" });
  }
});

// DELETE /api/hijab-styles/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const hijab = await HijabStyle.findById(id);

    if (!hijab) {
      return res.status(404).json({ success: false, message: "Hijab style not found" });
    }

    hijab.status = 'Archived';
    await hijab.save();

    res.json({ success: true, message: "Hijab style deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting hijab style" });
  }
});

// POST /api/hijab-styles/:id/like
router.post("/:id/like", async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'toggle' } = req.body;
    
    const hijab = await HijabStyle.findById(id);
    if (!hijab) {
      return res.status(404).json({ success: false, message: "Hijab style not found" });
    }

    let increment = action === 'unlike' ? false : true;

    await hijab.toggleLike(increment);

    res.json({
      success: true,
      message: increment ? "Style liked" : "Style unliked",
      data: { likes: hijab.likes }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating like status" });
  }
});

// GET /api/hijab-styles/:id/similar
router.get("/:id/similar", async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 6 } = req.query;

    const currentStyle = await HijabStyle.findById(id);
    if (!currentStyle) {
      return res.status(404).json({ success: false, message: "Hijab style not found" });
    }

    const similarStyles = await HijabStyle.find({
      _id: { $ne: id },
      status: 'Published',
      $or: [
        { difficulty: currentStyle.difficulty },
        { occasions: { $in: currentStyle.occasions || [] } },
        { tags: { $in: currentStyle.tags || [] } },
        { suitableFaceShapes: { $in: currentStyle.suitableFaceShapes || [] } }
      ]
    })
    .sort({ likes: -1, views: -1 })
    .limit(parseInt(limit))
    .populate('createdBy', 'name profile.avatar')
    .lean();

    res.json({ success: true, data: similarStyles });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching similar styles" });
  }
});

// GET /api/hijab-styles - list all with filtering, pagination etc.
router.get("/", async (req, res) => {
  try {
    const {
      search,
      difficulty,
      occasions,
      faceShape,
      page = 1,
      limit = 12,
      sort = 'newest',
      status = 'Published',
      createdBy
    } = req.query;

    const filters = { status };
    if (createdBy) filters.createdBy = createdBy;

    let hijabsQuery;
    if (search) {
      hijabsQuery = HijabStyle.searchStyles(search, {
        difficulty,
        occasions: occasions ? occasions.split(',') : undefined,
        faceShape
      });
    } else {
      if (difficulty) filters.difficulty = difficulty;
      if (occasions) filters.occasions = { $in: occasions.split(',') };
      if (faceShape) filters.suitableFaceShapes = faceShape;

      hijabsQuery = HijabStyle.find(filters);
    }

    let sortQuery;
    switch (sort) {
      case 'newest': sortQuery = { createdAt: -1 }; break;
      case 'oldest': sortQuery = { createdAt: 1 }; break;
      case 'popular': sortQuery = { likes: -1, views: -1 }; break;
      case 'name': sortQuery = { name: 1 }; break;
      case 'difficulty': sortQuery = { difficulty: 1, name: 1 }; break;
      default: sortQuery = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hijabs = await hijabsQuery
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('createdBy', 'name profile.avatar')
      .lean();

    const totalCount = await HijabStyle.countDocuments(filters);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        hijabs,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hijab styles:', error);
    res.status(500).json({ success: false, message: "Error fetching hijab styles" });
  }
});

export default router;
