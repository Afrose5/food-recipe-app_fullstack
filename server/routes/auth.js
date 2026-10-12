import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models.js";
import { protect, upload } from "../middleware.js";

const r = Router();
const sign = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" }),
  user: { _id: u._id, name: u.name, email: u.email, role: u.role, bio: u.bio, avatar: u.avatar },
});

r.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    return res.status(400).json({ message: "Name, email and a password of 6+ characters are required" });
  if (await User.findOne({ email: email.toLowerCase() }))
    return res.status(400).json({ message: "Email already registered" });
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json(sign(user));
});

r.post("/login", async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || "").toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    return res.status(401).json({ message: "Invalid email or password" });
  res.json(sign(user));
});

r.get("/me", protect, (req, res) => res.json(req.user));

r.put("/me", protect, upload.single("avatar"), async (req, res) => {
  const { name, bio } = req.body;
  if (name) req.user.name = name;
  if (bio !== undefined) req.user.bio = bio;
  if (req.file) req.user.avatar = "/uploads/" + req.file.filename;
  await req.user.save();
  res.json(req.user);
});
export default r;
