const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
    country: { type: String, required: true },
    address1: { type: String, required: true },
    //   address2: { type: String },
    city: { type: String, required: true },
    zipCode: { type: String, required: true },
    items: { type: Array, required: true },
    totalAmount: { type: Number, required: true },
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
