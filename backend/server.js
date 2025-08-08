import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.js";
import hijabRoutes from "./routes/hijabStyles.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware for CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true,
}));

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hijab-styles", hijabRoutes);

// Simple test route to verify server is running
app.get("/", (req, res) => {
  res.send("✅ Server is running...");
});

// 404 route handler - for undefined routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(500).json({ message: "Server error" });
});

// Start server on port from env or 5000 by default
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
