const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Cards = new Schema({
  title: { required: true, type: String },
  image: { type: String },
  description: { required: true, type: String },
  score: [
    {
      ratedbyusertype: String,
      ratedby: {
        type: Schema.Types.ObjectId,
        refPath: "score.ratedbyusertype"
      },
      score: Number
    }
  ],
  comments: [
    {
      commentedbyusertype: String,
      commentedby: {
        type: Schema.Types.ObjectId,
        refPath: "comments.commentedbyusertype"
      },
      comment: String,
      date: Date
    }
  ],
  category: { required: true, type: String },
  subcategory: { type: String },
  createdby: { type: Schema.Types.ObjectId, refPath: "usertype" },
  usertype: { type: String, required: true }
});

module.exports = mongoose.model("cards", Cards);
