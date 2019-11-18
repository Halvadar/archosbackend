const express = require("express");
const bodyParser = require("body-parser");
const cardsrouter = require("./Routes/Categories");
const mongoose = require("mongoose");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./Graphql/Schemas/Mainschema");
const graphqlResolvers = require("./Graphql/Resolvers/Mainresolver");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
  console.log("asdasd", req.body);
  next();
});
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(
  "/graphql",
  graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    graphiql: true
  })
);

mongoose
  .connect(
    "mongodb+srv://Archos123:jldgnWgqRelkGcCl@archos-dqxu9.mongodb.net/Main?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => app.listen(4000));
