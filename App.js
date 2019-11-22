const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./Graphql/Schemas/Mainschema");
const graphqlResolvers = require("./Graphql/Resolvers/Mainresolver");
const path = require("path");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN
  })
);

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
  graphqlHttp((req, res) => ({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    context: { req, res },
    graphiql: true
  }))
);

mongoose
  .connect(
    "mongodb+srv://Archos123:jldgnWgqRelkGcCl@archos-dqxu9.mongodb.net/Main?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => app.listen(4000));
