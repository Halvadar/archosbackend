const card = require("../../Models/Cards");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

function usersetter(decoded) {
  if (decoded.usertype === "facebook") {
    return "facebookuser";
  } else if (decoded.usertype === "gmail") {
    return "gmailuser";
  } else {
    return "user";
  }
}

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
        createdby: decoded.id,
        usertype: usersetter(decoded)
      });

      await newCard.save();
    } catch (err) {
      throw new Error("Server Error");
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
      foundcard = await card
        .findById(args.id)
        .populate({ path: "createdby", select: "username name _id lastname" })
        .populate({
          path: "comments.commentedby",
          select: "username name _id lastname"
        });
    } catch {
      throw new Error("Card could not be found");
    }
    console.log(foundcard);
    return { ...foundcard._doc };
  },
  rateCard: async (args, { req, res }) => {
    let foundcard;
    let token;
    let checkrated;
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

    try {
      foundcard = await card.findById(args.id);
      checkrated = await foundcard.score.find((rated, index) => {
        if (rated.ratedby.toString() === token.id) {
          rated.score = args.score;
          return rated;
        }
      });

      if (checkrated === undefined) {
        foundcard.score.push({
          ratedbyusertype: usersetter(token),
          ratedby: token.id,
          score: args.score
        });
      }

      await foundcard.save();

      await foundcard
        .populate({
          path: "score.ratedby",
          select: "name _id username lastname"
        })
        .execPopulate()
        .then(res => {});
    } catch (err) {
      throw new Error("Server error");
    }

    return { score: foundcard.score };
  },
  comment: async (args, { req }) => {
    let foundcard;
    let token;

    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      async (err, decoded) => {
        if (err) {
          throw new Error("You need to be signed in to Comment");
        }
        token = decoded;
      }
    );
    try {
      foundcard = await card.findById(args.id);
      foundcard.comments.push({
        commentedbyusertype: usersetter(token),
        commentedby: token.id,
        comment: args.comment,
        date: Date()
      });
      await foundcard.save();
      await foundcard
        .populate({
          path: "comments.commentedby",

          select: "name username _id lastname"
        })
        .execPopulate();
    } catch (err) {
      throw new Error("Server Error");
    }

    return foundcard.comments;
  }
};
