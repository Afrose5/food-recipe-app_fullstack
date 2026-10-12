import { Router } from "express";
import { Collection } from "../models.js";
import { protect } from "../middleware.js";

const r = Router();
r.use(protect);

const favorites = async (user) =>
  (await Collection.findOne({ user, isDefault: true })) || Collection.create({ user, name: "Favorites", isDefault: true });

r.get("/", async (req, res) => {
  await favorites(req.user._id);
  res.json(await Collection.find({ user: req.user._id }).populate({ path: "recipes", populate: { path: "author", select: "name" } }));
});

r.post("/", async (req, res) => {
  if (!req.body.name?.trim()) return res.status(400).json({ message: "Name is required" });
  res.status(201).json(await Collection.create({ user: req.user._id, name: req.body.name }));
});

r.get("/favorites/ids", async (req, res) => res.json((await favorites(req.user._id)).recipes));

r.post("/favorites/:recipeId", async (req, res) => {
  const fav = await favorites(req.user._id);
  const has = fav.recipes.some((id) => String(id) === req.params.recipeId);
  has ? fav.recipes.pull(req.params.recipeId) : fav.recipes.push(req.params.recipeId);
  await fav.save();
  res.json({ saved: !has });
});

r.put("/:id/recipes", async (req, res) => {
  const { recipeId, action } = req.body;
  const c = await Collection.findOne({ _id: req.params.id, user: req.user._id });
  if (!c) return res.status(404).json({ message: "Collection not found" });
  action === "remove" ? c.recipes.pull(recipeId) : c.recipes.addToSet(recipeId);
  res.json(await c.save());
});

r.delete("/:id", async (req, res) => {
  const c = await Collection.findOne({ _id: req.params.id, user: req.user._id });
  if (!c) return res.status(404).json({ message: "Collection not found" });
  if (c.isDefault) return res.status(400).json({ message: "Favorites cannot be deleted" });
  await c.deleteOne();
  res.json({ message: "Deleted" });
});
export default r;
