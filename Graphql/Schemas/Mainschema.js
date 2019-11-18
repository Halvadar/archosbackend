const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Card {
        _id:ID!
        title:String!
        description:String!
        image:String!
        score:[Int!]
        category:String!
        subcategory:String!
    }
  
    input CardInput {
        title:String!
        description:String!
        image:String!
        category:String!
        score:[Int!]!
        subcategory:String!
    }
    input GetCardInput {
        category:String
        subcategory:String
    }
    type RootQuery {
        getCards(Input:GetCardInput):[Card!]
    }
    type RootMutation {
        createCard(cardInput:CardInput):Card
        deleteCard(deleteId:ID!):Card!
        
    }
    schema{
        query:RootQuery
        mutation:RootMutation
    }
`);
