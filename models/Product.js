const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  productName: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  reviews: [{ type: mongoose.Types.ObjectId, ref: "Review", required: true }],
});

module.exports = mongoose.model("Product", productSchema);
