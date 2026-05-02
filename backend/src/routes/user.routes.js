import express from "express";
import pkg from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authMiddleware from "../middleware/auth.middleware.js";

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

// #########################################
// POST API Route - User Signup
// #########################################
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

    if (
        typeof name !== "string" || typeof email !== "string" || typeof password !== "string"
        || !name.trim() || !email.trim() || !password.trim()
    )
{
    return res.status(400).json({ message: "Name, email, and password are required to create an account" });
}

const normalizedEmail = email.trim().toLowerCase();

if (!normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
    return res.status(400).json({ message: "Please enter a valid email address" });
}

const existingUser = await prisma.user.findUnique({
            where: {
                email: normalizedEmail,
            },
});

        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        await prisma.user.create({
            data: {
                name: name.trim(),
                email: normalizedEmail,
                passwordHash: hashedPassword,
                albumPinHash: "",
                albumLayoutPreference: "gallery",
                mediaLayoutPreference: "gallery",
            },
        });

        res.status(201).json({ message: "New account created successfully" });
    } catch (error) {
        if (error.code === "P2002" && error.meta?.target?.includes("email")) {
            return res.status(409).json({ message: "Email already exists" });
        }
console.error(error);
        res.status(500).json({ message: "Error creating account" });
    }
});

// #########################################
// POST API Route - User Login
// #########################################
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password.trim()) {
        return res.status(400).json({ message: "Email and password are required to login." });
    }

    const normalizedEmail = email.trim().toLowerCase();

        const user = await prisma.user.findUnique({
        where: {
                email: normalizedEmail,
            },
        select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            albumLayoutPreference: true,
            mediaLayoutPreference: true,
            createdAt: true,
        },
    });

    if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    res.status(200).json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            albumLayoutPreference: user.albumLayoutPreference,
            mediaLayoutPreference: user.mediaLayoutPreference,
            createdAt: user.createdAt,
        },
     });
} catch (error) {
    res.status(500).json({ message: "Error logging in" });
}
});

// #########################################
// GET API Route - Get User Profile
// #########################################
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                albumLayoutPreference: true,
                mediaLayoutPreference: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ user });

        } catch (error) {
            res.status(500).json({ message: "Error retrieving user profile" });
        }
});

// #########################################
// PUT API Route - Update User Profile
// #########################################
router.put("/profile", async (req, res) => {
    try {
        res.json({ message: "User profile updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating user profile" });
    }
});

// #########################################
// DELETE API Route - Delete User Account
// #########################################
router.delete("/profile", async (req, res) => {
    try {
        res.json({ message: "User account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting user account" });
    }
});

export default router;
