import { Router } from "express";
import { User, Recipe, Review, Category } from "../models.js";
import { protect, adminOnly } from "../middleware.js";

const r = Router();
r.use(protect, adminOnly);

r.get("/users", async (req, res) => res.json(await User.find().select("-password").sort("-createdAt")));
r.put("/users/:id/role", async (req, res) =>
  res.json(await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select("-password")));
r.delete("/users/:id", async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ message: "You cannot delete yourself" });
  await User.findByIdAndDelete(req.params.id);
  await Recipe.deleteMany({ author: req.params.id });
  res.json({ message: "Deleted" });
});

r.get("/recipes", async (req, res) => res.json(await Recipe.find().sort("-createdAt").populate("author", "name")));
r.put("/recipes/:id/publish", async (req, res) => {
  const rec = await Recipe.findById(req.params.id);
  rec.isPublished = !rec.isPublished;
  res.json(await rec.save());
});

r.post("/categories", async (req, res) => res.status(201).json(await Category.create(req.body)));
r.put("/categories/:id", async (req, res) => res.json(await Category.findByIdAndUpdate(req.params.id, req.body, { new: true })));
r.delete("/categories/:id", async (req, res) => { await Category.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); });

r.get("/stats", async (req, res) => {
  const [users, recipes, reviews, byCuisine, top] = await Promise.all([
    User.countDocuments(), Recipe.countDocuments(), Review.countDocuments(),
    Recipe.aggregate([{ $group: { _id: "$cuisine", count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 8 }]),
    Recipe.find({ ratingCount: { $gt: 0 } }).sort("-avgRating").limit(5).select("title avgRating ratingCount"),
  ]);
  res.json({ users, recipes, reviews, byCuisine, top });
});
export default r;
