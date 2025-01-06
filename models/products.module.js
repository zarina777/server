const mongoose = require("mongoose");
const ProductsSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Categories" },
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Users" },
});
const Products = mongoose.model("Products", ProductsSchema);
module.exports = Products;
