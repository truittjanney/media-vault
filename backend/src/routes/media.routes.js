import express from "express";
import pkg from "@prisma/client";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";
import path from "path";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExtension}`;

    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ###########################################
// POST API Route - Upload Media to Album
// ###########################################
// Mounted at /api/media
router.post(
  "/",
  authMiddleware,
  upload.array("media", 20),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const albumId = Number(req.body.albumId);

      if (!Number.isInteger(albumId)) {
        return res.status(400).json({ message: "Invalid album id." });
      }

      const files = req.files;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one media file is required." });
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
            filePath: `/uploads/${file.filename}`,
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
  },
);

// ###########################################
// PATCH API Route - Move Multiple Media to Another Album
// ###########################################
// Mounted at /api/media
router.patch("/move", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mediaIds } = req.body;
    const targetAlbumId = Number(req.body.targetAlbumId);

    const invalidMediaId =
      Array.isArray(mediaIds) &&
      mediaIds.some((mediaId) => !Number.isInteger(mediaId) || mediaId <= 0);

    if (
      !Array.isArray(mediaIds) ||
      mediaIds.length === 0 ||
      invalidMediaId ||
      !Number.isInteger(targetAlbumId) ||
      targetAlbumId <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid media id or target album id." });
    }

    const existingMediaItems = await prisma.media.findMany({
      where: {
        id: {
          in: mediaIds,
        },
        userId,
        isDeleted: false,
      },
    });

    if (existingMediaItems.length !== mediaIds.length) {
      return res
        .status(404)
        .json({ message: "One or more media items not found." });
    }

    const destinationAlbum = await prisma.album.findFirst({
      where: {
        id: targetAlbumId,
        userId,
      },
    });

    if (!destinationAlbum) {
      return res.status(404).json({ message: "Target album not found." });
    }

    if (existingMediaItems.some((media) => media.albumId === targetAlbumId)) {
      return res.status(400).json({
        message: "One or more media items are already in the target album.",
      });
    }

    const destinationMediaCount = await prisma.media.count({
      where: {
        albumId: targetAlbumId,
        userId,
        isDeleted: false,
      },
    });

    const movedMedia = await prisma.$transaction(
      existingMediaItems.map((mediaItem, index) =>
        prisma.media.update({
          where: {
            id: mediaItem.id,
          },
          data: {
            albumId: targetAlbumId,
            mediaPosition: destinationMediaCount + index + 1,
          },
        }),
      ),
    );

    return res.status(200).json({
      message: "Media moved successfully",
      media: movedMedia,
    });
  } catch (error) {
    console.error("Error moving media to another album", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// PATCH API Route - Move Media to Another Album
// ###########################################
// Mounted at /api/media
router.patch("/:id/move", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mediaId = Number(req.params.id);
    const targetAlbumId = Number(req.body.targetAlbumId);

    if (
      !Number.isInteger(mediaId) ||
      mediaId <= 0 ||
      !Number.isInteger(targetAlbumId) ||
      targetAlbumId <= 0
    ) {
      return res
        .status(400)
        .json({ message: "Invalid media id or target album id." });
    }

    const existingMedia = await prisma.media.findFirst({
      where: {
        id: mediaId,
        userId,
        isDeleted: false,
      },
    });

    if (!existingMedia) {
      return res.status(404).json({ message: "Media not found." });
    }

    const destinationAlbum = await prisma.album.findFirst({
      where: {
        id: targetAlbumId,
        userId,
      },
    });

    if (!destinationAlbum) {
      return res.status(404).json({ message: "Target album not found." });
    }

    if (existingMedia.albumId === targetAlbumId) {
      return res
        .status(400)
        .json({ message: "Media is already in this album." });
    }

    const destinationMediaCount = await prisma.media.count({
      where: {
        albumId: targetAlbumId,
        userId,
        isDeleted: false,
      },
    });

    const movedMedia = await prisma.media.update({
      where: { id: mediaId },
      data: {
        albumId: targetAlbumId,
        mediaPosition: destinationMediaCount + 1,
      },
    });

    return res.status(200).json({
      message: "Media moved successfully",
      media: movedMedia,
    });
  } catch (error) {
    console.error("Error moving media to another album", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// #################################################
// DELETE API Route - Delete Multiple Media Items
// #################################################
// Mounted at /api/media
router.delete("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { mediaIds } = req.body;

    if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
      return res
        .status(400)
        .json({ message: "mediaIds must be a non-empty array." });
    }

    const invalidId = mediaIds.some((id) => !Number.isInteger(id) || id <= 0);

    if (invalidId) {
      return res
        .status(400)
        .json({ message: "All media ids must be positive integers." });
    }

    const deletedMedia = await prisma.media.deleteMany({
      where: {
        id: {
          in: mediaIds,
        },
        userId,
        isDeleted: false,
      },
    });

    return res.status(200).json({
      message: "Media deleted successfully",
      deletedCount: deletedMedia.count,
    });
  } catch (error) {
    console.error("Error deleting multiple media", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// DELETE API Route - Delete One Media Item
// ###########################################
// Mounted at /api/media
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mediaId = Number(req.params.id);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({ message: "Invalid media id." });
    }

    const existingMedia = await prisma.media.findFirst({
      where: {
        id: mediaId,
        userId,
        isDeleted: false,
      },
    });

    if (!existingMedia) {
      return res.status(404).json({ message: "Media not found." });
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    return res.status(200).json({ message: "Media deleted successfully" });
  } catch (error) {
    console.error("Error deleting media", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
