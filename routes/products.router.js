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
router.post("/:id/likeds", async (req, res) => {
  try {
    const { id } = req.params;
    let { liked } = req.body;
    const productLikeds = await Products.findOne(id);
    let product;
    if (productLikeds) {
      product = await Products.findByIdAndUpdate(
        id,
        {
          likeds: [liked, ...productLikeds.likeds],
        },
        {
          new: true,
        }
      );
    } else {
      product = await Products.findByIdAndUpdate(
        id,
        {
          likeds: [liked],
        },
        {
          new: true,
        }
      );
    }
    res.json({ message: "Liked is successfully added!", product });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.delete("/:id/likeds", async (req, res) => {
  try {
    const { id } = req.params;
    let { liked } = req.body;
    const productLikeds = await Products.findOne(id);
    const likedsFilter = productLikeds.likeds.filter((el) => el == liked);
    const product = await Products.findByIdAndUpdate(
      id,
      {
        likeds: likedsFilter,
      },
      {
        new: true,
      }
    );
    res.json({ message: "Liked is successfully deleted!", product });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

module.exports = router;
