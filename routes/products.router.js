const express = require("express");
const { verifyToken } = require("../middleware/token.middleware");
const Products = require("../models/products.module");
const router = express.Router();
router.use(verifyToken);
router.get("/", async (req, res) => {
  try {
    let { category } = req.query;
    let products;
    if (category == "all") {
      products = await Products.find().populate("user").populate("category");
    } else {
      products = await Products.find({ category }).populate("user").populate("category");
    }
    res.json(products);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.post("/", async (req, res) => {
  try {
    let { name, price, category, user } = req.body;
    let newProduct = new Products({
      name,
      price,
      category,
      user,
      likedUsers: [],
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findById(id);
    res.json(product);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Products.findByIdAndDelete(id);
    res.json({ message: "Product is successfully deleted!", product });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { name, price, category, userId } = req.body;
    const product = await Products.findByIdAndUpdate(
      id,
      {
        name,
        price,
        category,
        userId,
      },
      {
        new: true,
      }
    );
    res.json({ message: "Product is successfully changed!", product });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
// POST route to add a like
router.post("/:id/likeds", async (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // If the user has not already liked the product, add the like
    if (!product.likeds.includes(liked)) {
      product.likeds.unshift(liked); // Adds to the beginning of the array
      await product.save();
      return res.status(200).json({ message: "Liked successfully added!", product });
    } else {
      return res.status(400).json({ message: "Product already liked by this user" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE route to remove a like
router.delete("/:id/likeds", async (req, res) => {
  try {
    const { id } = req.params;
    const { liked } = req.body;

    const product = await Products.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Filter out the user ID from the likeds array
    const updatedLikeds = product.likeds.filter((el) => el != liked);

    // If the liked array has changed, update it
    if (updatedLikeds.length !== product.likeds.length) {
      product.likeds = updatedLikeds;
      await product.save();
      return res.status(200).json({ message: "Liked successfully deleted!", product });
    } else {
      return res.status(400).json({ message: "User has not liked this product" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;
