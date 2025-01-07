const { z } = require("zod");
require("dotenv").config();
const express = require("express");
const Users = require("../models/users.model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = z.object({
  username: z.string().min(5, { message: "Username must be at least 5 characters long" }),
  password: z.string().min(5, { message: "Password must be at least 5 characters long" }),
  type: z.union([z.literal("user"), z.literal("admin")]),
});

// REGISTRATION
router.post("/register", async (req, res) => {
  try {
    const validation = userSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.errors.map((error) => ({
          field: error.path.join("."),
          message: error.message,
        })),
      });
    }

    const validUser = validation.data;
    const existUser = await Users.findOne({ username: validUser.username });
    if (existUser) {
      return res.status(400).json({
        success: false,
        message: "Username already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validUser.password, salt);
    validUser.password = hashedPassword;

    const newUser = new Users(validUser);
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, type: newUser.type },
    });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again later.",
    });
  }
});

// LOGIN/TOKEN
router.post("/login", async (req, res) => {
  try {
    let { username, password } = req.body;
    let user = await Users.findOne({ username });
    if (!user) return res.status(400).json({ message: "Username or password is invalid" });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const token = jwt.sign({ id: user._id, username: user.username, type: user.type }, process.env.JWT_SECRET, { expiresIn: "15h" });
    res.json({ token, userId: user._id, userName: user.name });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

router.post("/verify-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ valid: false, message: "Token is required" });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If needed, you can add custom checks, like user roles or other conditions
    return res.status(200).json({ valid: true, decoded });
  } catch (error) {
    console.error("Token verification error:", error.message);

    // Handle invalid or expired tokens
    return res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

module.exports = router;
