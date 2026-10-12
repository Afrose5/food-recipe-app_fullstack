import mongoose from "mongoose";
const { Schema, model } = mongoose;
const ref = (m) => ({ type: Schema.Types.ObjectId, ref: m });

export const User = model("User", new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  avatar: String,
  bio: { type: String, default: "" },
}, { timestamps: true }));

export const Category = model("Category", new Schema({
  name: { type: String, required: true, unique: true },
  description: String,
}));

export const Recipe = model("Recipe", new Schema({
  title: { type: String, required: true, trim: true },
  description: String,
  cuisine: String,
  mealType: { type: String, enum: ["breakfast", "lunch", "dinner", "snack", "dessert", "drink"] },
  dietary: [String],
  ingredients: [{ name: String, quantity: String }],
  instructions: [String],
  cookingTime: Number,
  difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
  image: String,
  author: ref("User"),
  category: ref("Category"),
  isPublished: { type: Boolean, default: true },
  avgRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
}, { timestamps: true }));

export const Collection = model("Collection", new Schema({
  user: ref("User"),
  name: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  recipes: [ref("Recipe")],
}, { timestamps: true }));

const reviewSchema = new Schema({
  user: ref("User"), recipe: ref("Recipe"),
  rating: { type: Number, min: 1, max: 5, required: true },
  review: String,
}, { timestamps: true });
reviewSchema.index({ user: 1, recipe: 1 }, { unique: true });
export const Review = model("Review", reviewSchema);

export const Comment = model("Comment", new Schema({
  user: ref("User"), recipe: ref("Recipe"), text: { type: String, required: true },
}, { timestamps: true }));
