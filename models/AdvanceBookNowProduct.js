const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const BookNowSchema = new Schema({
  email: { type: String, required: true },
});

module.exports = mongoose.model("AdvanceBookNowProduct", BookNowSchema);
