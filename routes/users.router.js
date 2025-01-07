const express = require("express");
const { adminVerifyToken } = require("../middleware/token.middleware");
const Users = require("../models/users.model");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const userSchema = z.object({
  username: z.string().min(5, { message: "Username must be at least 5 characters long" }),
  password: z.string().min(5, { message: "Password must be at least 5 characters long" }).optional(),
  type: z.union([z.literal("user"), z.literal("admin")]),
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findById(id);
    res.json(user);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.use(adminVerifyToken);
router.get("/", async (req, res) => {
  try {
    let users = await Users.find();
    res.json(users);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await Users.findByIdAndDelete(id);
    res.json({ message: "User is successfully deleted!" });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { username, type, password } = req.body;

    if (password) {
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
      const hashedPassword = await bcrypt.hash(password, salt);
      await Users.findByIdAndUpdate(
        id,
        {
          username,
          type,
          password: hashedPassword,
        },
        {
          new: true,
        }
      );
    } else {
      await Users.findByIdAndUpdate(
        id,
        {
          username,
          type,
        },
        {
          new: true,
        }
      );
    }

    res.json({ message: "User is successfully changed!" });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

module.exports = router;
