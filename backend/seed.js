// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import HijabStyle from "./models/HijabStyles.js";

dotenv.config();

const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const makeSlugUnique = async (baseSlug) => {
  let slug = baseSlug;
  let count = 0;
  while (await HijabStyle.findOne({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }
  return slug;
};

const seedDB = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // 2️⃣ Delete old data
    await User.deleteMany();
    await HijabStyle.deleteMany();

    // 3️⃣ Create admin user
    const adminUser = await User.create({
      name: "Admin",
      email: "admin@example.com",
      password: "123456", // hashing middleware should handle hashing
    });
    console.log("✅ Admin user created:", adminUser._id);

    // 4️⃣ Prepare hijab styles with slugs
    let hijabStyles = [
      {
        name: "Elegant Wrap",
        image: "https://example.com/images/elegant-wrap.jpg",
        createdBy: adminUser._id,
        difficulty: "Beginner",
        occasions: ["Formal", "Wedding"],
        suitableFaceShapes: ["Oval", "Heart"],
        requiredItems: [
          { item: "Hijab scarf", quantity: 1 },
          { item: "Pins", quantity: 3 },
        ],
        instructions: [
          { step: 1, description: "Place the hijab on your head", image: "" },
          { step: 2, description: "Wrap one side over the other and pin securely", image: "" },
        ],
        tags: ["elegant", "formal", "wrap"],
        status: "Published",
      },
      {
        name: "Casual Sporty",
        image: "https://example.com/images/casual-sporty.png",
        createdBy: adminUser._id,
        difficulty: "Intermediate",
        occasions: ["Casual", "Sport"],
        suitableFaceShapes: ["Round", "Square"],
        requiredItems: [{ item: "Sports hijab", quantity: 1 }],
        instructions: [
          { step: 1, description: "Put on the sports hijab", image: "" },
          { step: 2, description: "Secure with elastic bands", image: "" },
        ],
        tags: ["sporty", "casual", "comfort"],
        status: "Published",
      },
      {
        name: "Party Glam",
        image: "https://example.com/images/party-glam.jpg",
        createdBy: adminUser._id,
        difficulty: "Advanced",
        occasions: ["Party", "Formal"],
        suitableFaceShapes: ["Oval", "Diamond"],
        requiredItems: [
          { item: "Silk hijab", quantity: 1 },
          { item: "Decorative pins", quantity: 5 },
        ],
        instructions: [
          { step: 1, description: "Drape the silk hijab around your head", image: "" },
          { step: 2, description: "Add decorative pins to secure and style", image: "" },
          { step: 3, description: "Adjust folds for a glam look", image: "" },
        ],
        tags: ["party", "glam", "evening"],
        status: "Published",
      },
      {
        name: "Office Professional",
        image: "https://example.com/images/office-professional.jpg",
        createdBy: adminUser._id,
        difficulty: "Beginner",
        occasions: ["Office", "Formal"],
        suitableFaceShapes: ["Square", "Heart"],
        requiredItems: [
          { item: "Cotton hijab", quantity: 1 },
          { item: "Small pins", quantity: 2 },
        ],
        instructions: [
          { step: 1, description: "Wrap the cotton hijab smoothly over your head", image: "" },
          { step: 2, description: "Secure under the chin with pins", image: "" },
        ],
        tags: ["office", "professional", "formal"],
        status: "Published",
      },
      {
        name: "Sporty Runner",
        image: "https://example.com/images/sporty-runner.jpg",
        createdBy: adminUser._id,
        difficulty: "Intermediate",
        occasions: ["Sport", "Casual"],
        suitableFaceShapes: ["Round", "Oval"],
        requiredItems: [
          { item: "Breathable hijab", quantity: 1 },
          { item: "Elastic band", quantity: 1 },
        ],
        instructions: [
          { step: 1, description: "Put on breathable hijab", image: "" },
          { step: 2, description: "Secure with elastic band at the back", image: "" },
        ],
        tags: ["sport", "workout", "comfort"],
        status: "Published",
      },
    ];

    // 5️⃣ Generate unique slugs for each hijab style
    for (let style of hijabStyles) {
      const baseSlug = generateSlug(style.name);
      style.slug = await makeSlugUnique(baseSlug);
    }

    // 6️⃣ Insert all hijab styles
    await HijabStyle.insertMany(hijabStyles);
    console.log(`✅ ${hijabStyles.length} Hijab styles created`);

    process.exit();
  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  }
};

seedDB();
