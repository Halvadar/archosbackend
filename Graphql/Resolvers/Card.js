const card = require("../../Models/Cards");

module.exports = {
  getCards: async (args, req) => {
    let cards;
    console.log("asdfff");
    try {
      cards = await card.find({
        ...args.Input
      });
    } catch (error) {
      console.log("asd");
      console.log(error);
    }
    console.log(cards);
    return cards;
  },
  createCard: async args => {
    const newCard = new card({
      title: args.cardInput.title,
      description: args.cardInput.description,
      image: args.cardInput.image,
      category: args.cardInput.category,
      subcategory: args.cardInput.subcategory || ""
    });
    const createdCard = await newCard.save();
    return createdCard;
  },
  deleteCard: async args => {
    const deletedCard = await card.deleteOne({ _id: args.deleteId });
    return deletedCard;
  }
};
