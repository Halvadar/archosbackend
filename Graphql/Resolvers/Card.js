const card = require("../../Models/Cards");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = {
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

    try {
      newCard = new card({
        ...args.Input,
        createdby: decoded.id
      });

      await newCard.save();
    } catch (err) {
      throw new Error("Server error");
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
  }
};
