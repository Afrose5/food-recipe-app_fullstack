import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { User, Category, Recipe } from "./models.js";
dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User.deleteMany(), Category.deleteMany(), Recipe.deleteMany()]);
const admin = await User.create({ name: "Admin", email: "admin@food.com", password: await bcrypt.hash("admin123", 10), role: "admin" });
const cats = await Category.insertMany(["Main course", "Dessert", "Quick meals", "Healthy"].map((name) => ({ name, description: name + " recipes" })));
const ing = (...a) => a.map((s) => { const [quantity, name] = s.split("|"); return { name, quantity }; });
await Recipe.insertMany([
  { title: "Tomato Egg Curry", description: "A quick, comforting curry.", cuisine: "Indian", mealType: "lunch", dietary: ["vegetarian"], cookingTime: 25, difficulty: "easy", ingredients: ing("4|egg", "3|tomato", "1|onion", "1 tsp|turmeric"), instructions: ["Boil the eggs.", "Fry onion and tomato with spices.", "Add eggs and simmer 5 minutes."] },
  { title: "Veg Fried Rice", description: "Weeknight favourite.", cuisine: "Chinese", mealType: "dinner", dietary: ["vegan"], cookingTime: 20, difficulty: "easy", ingredients: ing("2 cups|rice", "1 cup|carrot", "1/2 cup|peas", "2 tbsp|soy sauce"), instructions: ["Cook the rice and cool it.", "Stir-fry vegetables on high heat.", "Add rice and soy sauce, toss."] },
  { title: "Chocolate Mug Cake", description: "Ready in minutes.", cuisine: "American", mealType: "dessert", dietary: ["vegetarian"], cookingTime: 5, difficulty: "easy", ingredients: ing("4 tbsp|flour", "2 tbsp|cocoa", "3 tbsp|sugar", "3 tbsp|milk", "1 tbsp|butter"), instructions: ["Mix everything in a mug.", "Microwave for 90 seconds."] },
  { title: "Masala Dosa", description: "Crispy South Indian crepe.", cuisine: "Indian", mealType: "breakfast", dietary: ["vegan"], cookingTime: 45, difficulty: "hard", ingredients: ing("2 cups|dosa batter", "3|potato", "1|onion", "1 tsp|mustard seeds"), instructions: ["Make potato masala.", "Spread batter thin on a hot pan.", "Fill, fold and serve."] },
].map((r, i) => ({ ...r, author: admin._id, category: cats[i % cats.length]._id })));
console.log("Seeded. Admin: admin@food.com / admin123");
process.exit();
