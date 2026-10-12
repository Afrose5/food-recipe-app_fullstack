import { Router } from "express";
import mongoose from "mongoose";
import { Recipe, Review, Comment } from "../models.js";
import { protect } from "../middleware.js";

const r = Router();

const recalc = async (id) => {
  const [s] = await Review.aggregate([
    { $match: { recipe: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: null, avg: { $avg: "$rating" }, n: { $sum: 1 } } },
  ]);
  await Recipe.findByIdAndUpdate(id, { avgRating: s ? +s.avg.toFixed(1) : 0, ratingCount: s?.n || 0 });
};

r.get("/:id/reviews", async (req, res) =>
  res.json(await Review.find({ recipe: req.params.id }).sort("-createdAt").populate("user", "name avatar")));

r.post("/:id/reviews", protect, async (req, res) => {
  const rating = +req.body.rating;
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: "Rating must be 1 to 5" });
  const review = await Review.findOneAndUpdate(
    { user: req.user._id, recipe: req.params.id },
    { rating, review: req.body.review }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await recalc(req.params.id);
  res.status(201).json(review);
});

r.delete("/:id/reviews/:reviewId", protect, async (req, res) => {
  const rv = await Review.findById(req.params.reviewId);
  if (!rv) return res.status(404).json({ message: "Not found" });
  if (String(rv.user) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  await rv.deleteOne(); await recalc(req.params.id);
  res.json({ message: "Deleted" });
});

r.get("/:id/comments", async (req, res) =>
  res.json(await Comment.find({ recipe: req.params.id }).sort("-createdAt").populate("user", "name avatar")));

r.post("/:id/comments", protect, async (req, res) => {
  if (!req.body.text?.trim()) return res.status(400).json({ message: "Comment cannot be empty" });
  const c = await Comment.create({ user: req.user._id, recipe: req.params.id, text: req.body.text });
  res.status(201).json(await c.populate("user", "name avatar"));
});

r.delete("/:id/comments/:commentId", protect, async (req, res) => {
  const c = await Comment.findById(req.params.commentId);
  if (!c) return res.status(404).json({ message: "Not found" });
  if (String(c.user) !== String(req.user._id) && req.user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  await c.deleteOne();
  res.json({ message: "Deleted" });
});
export default r;
