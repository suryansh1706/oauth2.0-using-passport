const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    id: { type: String, required: true },
  },

  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
