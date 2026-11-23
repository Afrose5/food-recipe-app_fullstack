import { del, put } from "@vercel/blob";
import { randomUUID } from "node:crypto";

const imageExtensions = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function saveImage(file, folder) {
  const extension = imageExtensions[file?.mimetype];
  if (!file?.buffer || !extension) throw new Error("Unsupported image upload");

  const blob = await put(`${folder}/${randomUUID()}${extension}`, file.buffer, {
    access: "public",
    contentType: file.mimetype,
  });

  return blob.url;
}

export async function deleteImage(url) {
  if (!url) return;

  let hostname;
  try {
    hostname = new URL(url).hostname;
  } catch {
    return;
  }

  if (!hostname.endsWith(".blob.vercel-storage.com")) return;

  try {
    await del(url);
  } catch (error) {
    console.error("Blob image cleanup failed:", error.message);
  }
}
