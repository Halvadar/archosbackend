const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const user = new Schema({
  name: { required: true, type: String },
  lastname: { required: true, type: String },
  username: { required: true, type: String },
  password: { required: true, type: String },
  email: { required: true, type: String }
});

const facebookuser = new Schema({
  name: { required: true, type: String },
  lastname: { required: true, type: String },
  username: { required: true, type: String },
  email: { required: true, type: String },
  facebookid: { required: true, type: Number }
});
const gmailuser = new Schema({
  name: { required: true, type: String },
  lastname: { required: true, type: String },
  username: { required: true, type: String },
  email: { required: true, type: String },
  gmailid: { required: true, type: Number }
});

module.exports = {
  user: mongoose.model("user", user),
  facebookuser: mongoose.model("facebookuser", facebookuser),
  gmailuser: mongoose.model("gmailuser", gmailuser)
};
