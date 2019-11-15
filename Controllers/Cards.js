const cards = require("../Models/Cards");

const bcrypt = require("bcryptjs");

let card = new cards({
  title: "asd",
  description: "asd",
  image: "asd",
  score: [1, 2, 3]
});

exports.getcards = (req, res, next) => {
  card.save().then(result =>
    cards
      .find()
      .then(products => {
        res.send(products);
      })
      .catch(err => {
        console.log(err);
      })
  );
};
