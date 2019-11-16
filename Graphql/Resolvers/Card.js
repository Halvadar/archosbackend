const card = require("../../Models/Cards");

module.exports = {
  getCards: async (args, req) => {
    console.log(req.body);
    const cards = await card.find({});
    console.log(cards);
    return cards;
  },
  createCard: async args => {
    const newCard = new card({
      title: args.cardInput.title,
      description: args.cardInput.description,
      image: args.cardInput.image,
      category: args.cardInput.category
    });
    const createdCard = await newCard.save();
    return createdCard;
  },
  deleteCard: async args => {
    const deletedCard = await card.deleteOne({ _id: args.deleteId });
    return deletedCard;
  }
};
