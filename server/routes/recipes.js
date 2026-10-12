import { Router } from "express";
import { Recipe, Review, Comment, Collection } from "../models.js";
import { protect, optionalAuth, upload } from "../middleware.js";

const r = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const sorts = { newest: "-createdAt", rating: "-avgRating", time: "cookingTime", title: "title" };

r.get("/", optionalAuth, async (req, res) => {
  const { search, ingredients, cuisine, diet, mealType, maxTime, difficulty, category, mine, sort = "newest" } = req.query;
  const page = Math.max(+req.query.page || 1, 1), limit = +req.query.limit || 12;
  const q = {};
  if (mine && req.user) q.author = req.user._id; else q.isPublished = true;
  if (search) q.title = new RegExp(esc(search), "i");
  if (ingredients) q.$and = ingredients.split(",").filter(Boolean)
    .map((i) => ({ "ingredients.name": new RegExp(esc(i.trim()), "i") }));
  if (cuisine) q.cuisine = new RegExp(`^${esc(cuisine)}$`, "i");
  if (diet) q.dietary = diet;
  if (mealType) q.mealType = mealType;
  if (difficulty) q.difficulty = difficulty;
  if (category) q.category = category;
  if (maxTime) q.cookingTime = { $lte: +maxTime };
  const [items, total] = await Promise.all([
    Recipe.find(q).sort(sorts[sort] || sorts.newest).skip((page - 1) * limit).limit(limit)
      .populate("author", "name avatar").populate("category", "name"),
    Recipe.countDocuments(q),
  ]);
  res.json({ items, total, pages: Math.ceil(total / limit), page });
});

r.get("/:id", optionalAuth, async (req, res) => {
  const recipe = await Recipe.findById(req.params.id).populate("author", "name avatar").populate("category", "name");
  if (!recipe || (!recipe.isPublished && String(recipe.author._id) !== String(req.user?._id) && req.user?.role !== "admin"))
    return res.status(404).json({ message: "Recipe not found" });
  res.json(recipe);
});

const parse = (b) => {
  const j = (v, d) => { try { return typeof v === "string" ? JSON.parse(v) : v ?? d; } catch { return d; } };
  const out = { ...b, ingredients: j(b.ingredients, []), instructions: j(b.instructions, []), dietary: j(b.dietary, []) };
  if (!out.category) delete out.category;
  if (b.isPublished !== undefined) out.isPublished = b.isPublished === "true" || b.isPublished === true;
  return out;
};

r.post("/", protect, upload.single("image"), async (req, res) => {
  const data = parse(req.body);
  if (!data.title) return res.status(400).json({ message: "Title is required" });
  const recipe = await Recipe.create({ ...data, author: req.user._id, image: req.file ? "/uploads/" + req.file.filename : undefined });
  res.status(201).json(recipe);
});

const owned = async (req, res, next) => {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) return res.status(404).json({ message: "Recipe not found" });
  if (String(recipe.author) !== String(req.user._id) && req.user.role !== "admin")
    return res.status(403).json({ message: "Not your recipe" });
  req.recipe = recipe; next();
};

r.put("/:id", protect, owned, upload.single("image"), async (req, res) => {
  const data = parse(req.body);
  delete data.author;
  Object.assign(req.recipe, data);
  if (req.file) req.recipe.image = "/uploads/" + req.file.filename;
  res.json(await req.recipe.save());
});

r.delete("/:id", protect, owned, async (req, res) => {
  await Promise.all([
    req.recipe.deleteOne(), Review.deleteMany({ recipe: req.params.id }), Comment.deleteMany({ recipe: req.params.id }),
    Collection.updateMany({}, { $pull: { recipes: req.params.id } }),
  ]);
  res.json({ message: "Deleted" });
});

r.post("/:id/share", async (req, res) => {
  const rec = await Recipe.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
  res.json({ shares: rec?.shares ?? 0 });
});
export default r;
