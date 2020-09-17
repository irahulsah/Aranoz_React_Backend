const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  message: { type: String, required: true },
  product: { type: mongoose.Types.ObjectId, ref: "Product" },
});

module.exports = mongoose.model("Review", ReviewSchema);
