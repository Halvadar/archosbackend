const card = require("../../Models/Cards");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const usersetter = function() {
  console.log(this.a);
  /* if (this.decoded.usertype === "facebook") {
    return "facebookuser";
  } else if (this.decoded.usertype === "gmail") {
    return "gmailuser";
  } else {
    return "user";
  } */
};

module.exports = {
  a: 1,
  getCards: async (args, req) => {
    let cards;
    console.log("asdfff");
    try {
      cards = await card.find({
        ...args.Input
      });
    } catch (error) {}

    return cards;
  },
  createCard: async (args, { req, res }) => {
    let a = 1;
    let errors;
    let decoded;
    let newCard;
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      (err, result) => {
        if (err) {
          throw new Error("You need to be logged in to post a service");
        }
        decoded = result;
      }
    );
    usersetter();
    try {
      newCard = new card({
        ...args.Input,
        createdby: decoded.id,
        usertype: usersetter()
      });

      await newCard.save();
    } catch (err) {
      throw new Error(err);
    }

    return { ...newCard._doc };
  },
  getPostedCards: async (args, { req, res }) => {
    let foundcards;
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      async (err, decoded) => {
        if (err) {
          throw new Error("You need to be signed in to see Posted Services");
        }

        foundcards = await card.find({ createdby: decoded.id });
      }
    );

    return foundcards;
  },
  deleteCard: async args => {
    const deletedCard = await card.deleteOne({ _id: args.deleteId });
    return deletedCard;
  },
  getCard: async args => {
    let foundcard;
    try {
      foundcard = await card.findById(args.id);
    } catch {
      throw new Error("Card could not be found");
    }
    return { ...foundcard._doc };
  },
  rateCard: async (args, { req, res }) => {
    let foundcard;
    let token;
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      async (err, decoded) => {
        if (err) {
          throw new Error("You need to be signed in to Rate");
        }
        token = decoded;
      }
    );
    foundcard = await card
      .findById(args.id)
      .populate("createdby")
      .exec((err, res) => {
        console.log(err, res);
      });

    console.log(foundcard);

    foundcard.score.push({ ratedby: token.id, score: args.score });
    foundcard.save();
    return { score: foundcard.score };
  }
};
