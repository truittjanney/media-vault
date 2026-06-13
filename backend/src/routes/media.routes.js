import express from "express";
import pkg from "@prisma/client";
import authMiddleware from "../middleware/auth.middleware.js";
import multer from "multer";
import path from "path";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

// Configure multer to store uploaded files in the local uploads folder
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
  // Allow up to 50 files per upload request
  upload.array("media", 50),
  async (req, res) => {
    try {
      const userId = req.user.userId;
      const albumId = Number(req.body.albumId);

      // Validate the target album id and uploaded files before creating records
      if (!Number.isInteger(albumId)) {
        return res.status(400).json({ message: "Invalid album id." });
      }

      const files = req.files;

      if (!files || files.length === 0) {
        return res
          .status(400)
          .json({ message: "At least one media file is required." });
      }

      // Confirm the target album exists and belongs to this user
      const existingAlbum = await prisma.album.findFirst({
        where: {
          id: albumId,
          userId,
        },
      });

      if (!existingAlbum) {
        return res.status(404).json({ message: "Album not found." });
      }

      // Count existing album media so new uploads are appended in order
      const mediaCount = await prisma.media.count({
        where: {
          albumId,
          userId,
        },
      });

      const createdMedia = [];

      // Create a media record for each uploaded file with its stored path
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

    // Validate mediaIds array and target album id
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

    // Fetch selected media and verify all requested items exist for this user
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

    // Confirm destination album exists and belongs to this user
    const destinationAlbum = await prisma.album.findFirst({
      where: {
        id: targetAlbumId,
        userId,
      },
    });

    if (!destinationAlbum) {
      return res.status(404).json({ message: "Target album not found." });
    }

    // Prevent moving media into the album it is already in
    if (existingMediaItems.some((media) => media.albumId === targetAlbumId)) {
      return res.status(400).json({
        message: "One or more media items are already in the target album.",
      });
    }

    // Count destination media so moved items are appended in order
    const destinationMediaCount = await prisma.media.count({
      where: {
        albumId: targetAlbumId,
        userId,
        isDeleted: false,
      },
    });

    // Use the first media item to determine the origin album
    // Then verify all selected media came from that same album
    const originAlbumId = existingMediaItems[0].albumId;

    const mediaFromDifferentAlbums = existingMediaItems.some(
      (mediaItem) => mediaItem.albumId !== originAlbumId,
    );

    if (mediaFromDifferentAlbums) {
      return res
        .status(400)
        .json({ message: "All media items must come from the same album." });
    }

    // Fetch the origin album so cover cleanup can happen safely
    const originAlbum = await prisma.album.findFirst({
      where: {
        id: originAlbumId,
        userId,
      },
    });

    if (!originAlbum) {
      return res.status(404).json({ message: "Origin album not found." });
    }

    // Clear the origin album cover if the cover media is being moved out
    if (mediaIds.includes(originAlbum.albumCoverMediaId)) {
      await prisma.album.update({
        where: {
          id: originAlbumId,
        },
        data: {
          albumCoverMediaId: null,
        },
      });
    }

    // Move each media item and place it at the end of the destination album
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

    // Validate the media id and target album id before querying records
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

    // Fetch the media item and confirm it belongs to this user
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

    // Confirm the destination album exists and belongs to this user
    const destinationAlbum = await prisma.album.findFirst({
      where: {
        id: targetAlbumId,
        userId,
      },
    });

    if (!destinationAlbum) {
      return res.status(404).json({ message: "Target album not found." });
    }

    // Prevent moving media into the album it is already in
    if (existingMedia.albumId === targetAlbumId) {
      return res
        .status(400)
        .json({ message: "Media is already in this album." });
    }

    // Count destination media so the moved item is appended at the end
    const destinationMediaCount = await prisma.media.count({
      where: {
        albumId: targetAlbumId,
        userId,
        isDeleted: false,
      },
    });

    const originAlbumId = existingMedia.albumId;

    // Fetch the origin album so cover cleanup can happen safely
    const originAlbum = await prisma.album.findFirst({
      where: {
        id: originAlbumId,
        userId,
      },
    });

    if (!originAlbum) {
      return res.status(404).json({ message: "Origin album not found." });
    }

    // Clear the origin album cover if the cover media is being moved out
    if (mediaId === originAlbum.albumCoverMediaId) {
      await prisma.album.update({
        where: {
          id: originAlbumId,
        },
        data: {
          albumCoverMediaId: null,
        },
      });
    }

    // Move the media item and place it at the end of the destination album
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

// ###########################################
// PATCH API Route - Toggle Media Favorites
// ###########################################
// Mounted at /api/media
router.patch("/:id/favorite", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const mediaId = Number(req.params.id);
    const { isFavorite } = req.body;

    // Validate that the media ID is a positive integer
    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({ message: "Invalid media id." });
    }

    // Validate that favorite status is explicitly true or false
    if (typeof isFavorite !== "boolean") {
      return res
        .status(400)
        .json({ message: "Favorite status must be true or false." });
    }

    // Validate that the media item exists and belongs to this user
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

    // Update only the favorite status for this media item
    const updatedMedia = await prisma.media.update({
      where: {
        id: mediaId,
      },
      data: {
        isFavorite,
      },
    });
    return res.status(200).json({
      message: "Media favorite updated successfully.",
      media: updatedMedia,
    });
  } catch (error) {
    console.error("Error updating favorite", error);
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

    // Validate mediaIds array before querying media records
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

    // Fetch selected media and verify all requested items exist for this user
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

    // Use the first media item to verify all selected media came from one album
    const originAlbumId = existingMediaItems[0].albumId;

    const mediaFromDifferentAlbums = existingMediaItems.some(
      (mediaItem) => mediaItem.albumId !== originAlbumId,
    );

    if (mediaFromDifferentAlbums) {
      return res
        .status(400)
        .json({ message: "All media items must come from the same album." });
    }

    // Fetch the origin album so cover cleanup can happen safely
    const originAlbum = await prisma.album.findFirst({
      where: {
        id: originAlbumId,
        userId,
      },
    });

    if (!originAlbum) {
      return res.status(404).json({ message: "Origin album not found." });
    }

    // Clear album cover if the cover media is being deleted
    if (mediaIds.includes(originAlbum.albumCoverMediaId)) {
      await prisma.album.update({
        where: {
          id: originAlbumId,
        },
        data: {
          albumCoverMediaId: null,
        },
      });
    }

    // Delete all selected media items
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

    // Validate media id before querying the database
    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return res.status(400).json({ message: "Invalid media id." });
    }

    // Find media item and confirm it belongs to this user and is not already deleted
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

    const originAlbumId = existingMedia.albumId;

    // Find the album this media belongs to and confirm it belongs to this user
    const originAlbum = await prisma.album.findFirst({
      where: {
        id: originAlbumId,
        userId,
      },
    });

    if (!originAlbum) {
      return res.status(404).json({ message: "Origin album not found." });
    }

    // Clear album cover before deleting if this media is the cover
    if (mediaId === originAlbum.albumCoverMediaId) {
      await prisma.album.update({
        where: {
          id: originAlbumId,
        },
        data: {
          albumCoverMediaId: null,
        },
      });
    }

    // Delete the media record
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
