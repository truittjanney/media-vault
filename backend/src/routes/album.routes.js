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
    }
    catch (error) {
        console.error("Error creating album:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

// ###########################################
// GET API Route - List User's Current Albums
// ###########################################



// ###########################################
// PUT API Route - Rename/Update Album
// ###########################################



// ###########################################
// DELETE API Route - Delete Album
// ###########################################

export default router;