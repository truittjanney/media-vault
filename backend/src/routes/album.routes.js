import express from "express";
import pkg from "@prisma/client";
import authMiddleware from "../middleware/auth.middleware.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

// ###########################################
// POST API Route - Create Album
// ###########################################
// Mounted at /api/albums
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, albumCoverMediaId, isLocked } = req.body;

    // Validate required album fields before creating the album record
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        message: "Album name is required and must be a non-empty string",
      });
    }

    // Count existing albums so the new album is appended in order
    const albumCount = await prisma.album.count({
      where: { userId },
    });

    // Create the album with optional cover and lock settings
    const newAlbum = await prisma.album.create({
      data: {
        userId,
        name: name.trim(),
        albumCoverMediaId:
          typeof albumCoverMediaId === "number" ? albumCoverMediaId : null,
        isLocked: Boolean(isLocked),
        albumPosition: albumCount + 1,
      },
    });

    return res
      .status(201)
      .json({ message: "Album created successfully", album: newAlbum });
  } catch (error) {
    console.error("Error creating album:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// GET API Route - List User's Current Albums
// ###########################################
// Mounted at /api/albums
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch this user's albums with cover media and media counts
    const albums = await prisma.album.findMany({
      where: { userId },
      orderBy: { albumPosition: "asc" },
      include: {
        albumCoverMedia: true,
        _count: {
          select: {
            media: true,
          },
        },
      },
    });

    // Flatten Prisma's count data into a totalCount field for the client
    const albumsWithCounts = albums.map((album) => ({
      ...album,
      totalCount: album._count.media,
    }));

    return res.status(200).json({ albums: albumsWithCounts });
  } catch (error) {
    console.error("Error retrieving albums", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// GET API Route - List Media in Album
// ###########################################
// Mounted at /api/albums
router.get("/:id/media", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const albumId = Number(req.params.id);

    // Validate album id before querying the database
    if (!Number.isInteger(albumId) || albumId <= 0) {
      return res.status(400).json({ message: "Invalid album id." });
    }

    // Confirm the album exists and belongs to this user
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    });

    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found." });
    }

    // Fetch active media in album order for this user
    const media = await prisma.media.findMany({
      where: {
        albumId,
        userId,
        isDeleted: false,
      },
      orderBy: {
        mediaPosition: "asc",
      },
    });

    return res.status(200).json({ media });
  } catch (error) {
    console.error("Error listing album contents.", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// PUT API Route - Update Album
// ###########################################
// Mounted at /api/albums
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const albumId = Number(req.params.id);
    const { name, albumCoverMediaId, isLocked } = req.body;

    // Validate album id before building the update data
    if (!Number.isInteger(albumId) || albumId <= 0) {
      return res.status(400).json({ message: "Invalid album id." });
    }

    const updateAlbum = {};

    // Build the update data from only the fields provided in the request
    // Name Update Validation
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res
          .status(400)
          .json({ message: "Album name must be a non-empty string." });
      }
      updateAlbum.name = name.trim();
    }

    // albumCoverMediaId Validation
    if (albumCoverMediaId !== undefined) {
      if (albumCoverMediaId !== null && typeof albumCoverMediaId !== "number") {
        return res
          .status(400)
          .json({ message: "albumCoverMediaId must be a number or null." });
      }
      updateAlbum.albumCoverMediaId = albumCoverMediaId;
    }

    // isLocked Validation
    if (isLocked !== undefined) {
      if (typeof isLocked !== "boolean") {
        return res.status(400).json({ message: "isLocked must be a boolean." });
      }
      updateAlbum.isLocked = isLocked;
    }

    // Prevent Empty Update
    if (Object.keys(updateAlbum).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid album fields provided for update." });
    }

    // Confirm the album exists and belongs to this user before updating
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    });

    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found." });
    }

    // Update the album and return the fields the client needs
    const updatedAlbum = await prisma.album.update({
      where: {
        id: albumId,
      },
      data: updateAlbum,
      select: {
        id: true,
        userId: true,
        name: true,
        albumCoverMediaId: true,
        isLocked: true,
        albumPosition: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      message: "Album updated successfully",
      album: updatedAlbum,
    });
  } catch (error) {
    console.error("Error updating album", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ###########################################
// DELETE API Route - Delete Album
// ###########################################
// Mounted at /api/albums
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const albumId = Number(req.params.id);

    // Validate album id before querying the database
    if (!Number.isInteger(albumId)) {
      return res.status(400).json({ message: "Invalid album id." });
    }

    // Confirm the album exists and belongs to this user before deleting
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId,
      },
    });

    if (!existingAlbum) {
      return res.status(404).json({ message: "Album not found." });
    }

    // Delete the album record
    await prisma.album.delete({
      where: { id: albumId },
    });

    return res.status(200).json({ message: "Album deleted successfully" });
  } catch (error) {
    console.error("Error deleting album", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
