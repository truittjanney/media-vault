import express from "express";
import pkg from "@prisma/client";
import authMiddleware from "../middleware/auth.middleware.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

// ###########################################
// POST API Route - Create Album
// ###########################################
router.post("/", authMiddleware, async (req, res) => {
    try {
const userId = req.user.userId;
const { name, albumCoverMediaId, isLocked } = req.body;

if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ message: "Album name is required and must be a non-empty string" });
}

const albumCount = await prisma.album.count({
    where: { userId },
});

const newAlbum = await prisma.album.create({
    data: {
        userId,
        name: name.trim(),
        albumCoverMediaId: typeof albumCoverMediaId === "number" ? albumCoverMediaId : null,
        isLocked: Boolean(isLocked),
        albumPosition: albumCount + 1,
    },
});

return res.status(201).json({ message: "Album created successfully", album: newAlbum });

    } catch (error) {
        console.error("Error creating album:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ###########################################
// GET API Route - List User's Current Albums
// ###########################################
router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

    const albums = await prisma.album.findMany({
        where: {userId},
        orderBy: { albumPosition: "asc" },
    });

    return res.status(200).json({ albums: albums });

    } catch (error) {
        console.error("Error retrieving albums", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ###########################################
// GET API Route - List Media in Album
// ###########################################
router.get("/:id/media", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const albumId = Number(req.params.id);

    if (!Number.isInteger(albumId) || albumId <= 0) {
      return res.status(400).json({ message: "Invalid album id." });
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

    const media = await prisma.media.findMany({
      where: {
        albumId,
        userId,
        isDeleted: false,
    },
      orderBy: {
        mediaPosition: "asc"
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
router.put("/:id", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;
        const albumId = Number(req.params.id);
        const { name, albumCoverMediaId, isLocked } = req.body;

        if (!Number.isInteger(albumId) || albumId <= 0) {
            return res.status(400).json({ message: "Invalid album id." });
        }

        const updateAlbum = {};

        // Name Update Validation
        if (name !== undefined) {
            if (typeof name !== "string" || !name.trim()) {
                return res.status(400).json({ message: "Album name must be a non-empty string." });
            }
            updateAlbum.name = name.trim();
        }

        // albumCoverMediaId Validation
        if (albumCoverMediaId !== undefined) {
            if (albumCoverMediaId !== null && typeof albumCoverMediaId !== "number") {
                return res.status(400).json({ message: "albumCoverMediaId must be a number or null." });
            }
            updateAlbum.albumCoverMediaId = albumCoverMediaId;
        }

        // isLocked Validation
        if (isLocked!== undefined) {
            if (typeof isLocked !== "boolean") {
                return res.status(400).json({ message: "isLocked must be a boolean." });
            }
            updateAlbum.isLocked = isLocked;
        }

        // Prevent Empty Update
        if (Object.keys(updateAlbum).length === 0) {
            return res.status(400).json({ message: "No valid album fields provided for update." });
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
router.delete("/:id", authMiddleware, async (req, res) => {
    try{
        const userId = req.user.userId;
        const albumId = Number(req.params.id);

        if (!Number.isInteger(albumId)) {
            return req.status(400).json({ message: "Invalid album id." });
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
