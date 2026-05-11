import express from "express";
import pkg from "@prisma/client";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

const upload = multer({ dest: "uploads/" });

// ###########################################
// POST API Route - Upload Media to Album
// ###########################################
router.post("/", authMiddleware, upload.array("media", 20), async (req, res) => {
  try {
    const userId = req.user.userId;
    const albumId = Number(req.body.albumId);

    if (!Number.isInteger(albumId)) {
      return res.status(400).json({ message: "Invalid album id." });
    }

    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ message: "At least one media file is required." });
    }

    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    });

    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found." });
    }

    const mediaCount = await prisma.media.count({
      where: {
        albumId,
        userId,
      },
    });

    const createdMedia = [];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];

    const media = await prisma.media.create({
      data: {
            userId,
            albumId,
            name: file.originalname,
            type: file.mimetype.startsWith("image/") ? "image" : "video",
            format: file.mimetype,
            fileSize: file.size,
            resolution: "unknown",
            createdTime: null,
            importedTime: new Date(),
            isDeleted: false,
            deletedTime: null,
            mediaPosition: mediaCount + i + 1,
      },
    });

    createdMedia.push(media);
    }
    return res.status(201).json({
      message: "Media uploaded successfully",
      media: createdMedia,
    });
  } catch (error) {
    console.error("Error uploading media to album", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// DELETE API Route - Delete One Media Item
// ###########################################



export default router;
