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
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/categories", async (req, res) => res.json(await Category.find().sort("name")));
app.use("/api/auth", auth);
app.use("/api/recipes", recipes);
app.use("/api/recipes", community);
app.use("/api/collections", collections);
app.use("/api/admin", admin);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT || 5000, () => console.log("Server running")))
  .catch((e) => console.error(e));
