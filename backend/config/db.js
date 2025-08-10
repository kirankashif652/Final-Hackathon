import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const dbName = "hijab_gallery"; 
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName, 
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📂 Using Database: ${conn.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
};

export default connectDB;
