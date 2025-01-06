const express = require("express");
const Categories = require("../models/categories.module");
const router = express.Router();
router.get("/", async (req, res) => {
  try {
    let categories = await Categories.find();
    res.json(categories);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.post("/", async (req, res) => {
  try {
    let { name } = req.body;
    let newCategory = new Categories({
      name,
    });
    await newCategory.save();
    res.json(newCategory);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findById(id);
    res.json(category);
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByIdAndDelete(id);
    res.json({ message: "Product is successfully deleted!" });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let { name } = req.body;
    const category = await Categories.findByIdAndUpdate(
      id,
      {
        name,
      },
      {
        new: true,
      }
    );
    res.json({ message: "Category is successfully changed!", product });
  } catch (err) {
    res.json({
      message: err.message,
    });
  }
});

module.exports = router;
