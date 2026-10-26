
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import auth from "./routes/auth.js";
import recipes from "./routes/recipes.js";
import collections from "./routes/collections.js";
import community from "./routes/community.js";
import admin from "./routes/admin.js";
import { Category } from "./models.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Categories
app.get("/api/categories", async (req, res, next) => {
  try {
    const categories = await Category.find().sort("name");
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Routes
app.use("/api/auth", auth);
app.use("/api/recipes", recipes);
app.use("/api/recipes", community);
app.use("/api/collections", collections);
app.use("/api/admin", admin);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(err.status || 500).json({
    message: err.message || "Server error",
  });
});

// Connect MongoDB, then start server
async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exitCode = 1;
  }
}

startServer();
