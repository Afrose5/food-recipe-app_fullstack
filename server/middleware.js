import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import { User } from "./models.js";

export const protect = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select("-password");
    if (!req.user) throw new Error();
    next();
  } catch { res.status(401).json({ message: "Not authorized" }); }
};
export const optionalAuth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id).select("-password");
  } catch {}
  next();
};
export const adminOnly = (req, res, next) =>
  req.user?.role === "admin" ? next() : res.status(403).json({ message: "Admins only" });

export const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads",
    filename: (req, f, cb) => cb(null, Date.now() + path.extname(f.originalname)),
  }),
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (req, f, cb) => cb(null, /image\/(jpeg|png|webp)/.test(f.mimetype)),
});
