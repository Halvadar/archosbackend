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
        name:String
        username:String
        lastname:String
        usertype:String
    }
    input FacebookGoogleLoginType {
        token:String!
        id:String!
    }
    input ArchosUserType {
        email:String!
        password:String!
    }
    type RootQuery {
        getCards(Input:GetCardInput):[Card!]
        loginFacebook(Input:FacebookGoogleLoginType):User!
        loginGoogle(Input:FacebookGoogleLoginType):User!
        loginArchos(Input:ArchosUserType):User!
    }
    type RootMutation {
        createCard(cardInput:CardInput):Card
        deleteCard(deleteId:ID!):Card!
        createUser(Input:UserInput!):User
        createFacebookUser(Input:UserInputFacebook!):User
        createGmailUser(Input:UserInputGmail!):User
        logoutUser(Input:Boolean):User
    }
    schema{
        query:RootQuery
        mutation:RootMutation
    }
`);
