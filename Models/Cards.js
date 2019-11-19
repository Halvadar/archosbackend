const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Cards = new Schema({
  title: { required: true, type: String },
  image: { required: true, type: String },
  description: { required: true, type: String },
  score: [Number],
  category: { required: true, type: String },
  subcategory: { type: String }
});

module.exports = mongoose.model("cards", Cards);
