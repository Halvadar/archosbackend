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
        subcategory:String
    }
    input GetCardInput {
        category:String
        subcategory:String
    }
    input UserInput {
        name:String!
        lastname:String!
        username:String!
        password:String!
        repassword:String!
        email:String!
        phone:Int
    }
    input UserInputFacebook {
        name:String!
        lastname:String!
        username:String!
        email:String!
        phone:Int
        token:String!
        facebookid:String!
    }
    input UserInputGmail {
        name:String!
        lastname:String!
        username:String!
        email:String!
        phone:Int
        token:String!
        gmailid:String!
    }
    type User {
        name:String!
        username:String!
        token:String!
    }
    type RootQuery {
        getCards(Input:GetCardInput):[Card!]
    }
    type RootMutation {
        createCard(cardInput:CardInput):Card
        deleteCard(deleteId:ID!):Card!
        createUser(Input:UserInput!):User
        createFacebookUser(Input:UserInputFacebook!):User
        createGmailUser(Input:UserInputGmail!):User
    }
    schema{
        query:RootQuery
        mutation:RootMutation
    }
`);
