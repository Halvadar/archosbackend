const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Cards = new Schema({
  title: { required: true, type: String },
  image: { type: String },
  description: { required: true, type: String },
  score: [
    { ratedby: { type: Schema.Types.ObjectId, ref: "usertype" }, score: Number }
  ],
  category: { required: true, type: String },
  subcategory: { type: String },
  createdby: { type: Schema.Types.ObjectId, ref: "usertype" },
  usertype: { type: String, required: true }
});

module.exports = mongoose.model("cards", Cards);
