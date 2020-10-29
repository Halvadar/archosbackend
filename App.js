require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./Graphql/Schemas/Mainschema");
const graphqlResolvers = require("./Graphql/Resolvers/Mainresolver");
const path = require("path");
const cookieparser = require("cookie-parser");
const cors = require("cors");
const cards = require("./Models/Cards");
const upload = require("./Multer/Multer");
const jwt = require("jsonwebtoken");
const { user, facebookuser, gmailuser } = require("./Models/Users");

const app = express();

app.use(bodyParser.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({ extended: true }));
console.log(process.env.ORIGIN)
app.use(
  cors({
    credentials: true,
    origin: process.env.ORIGIN,
  })
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Aceess-Control-Allow-Credentials",true),
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  
  if (req.method === "OPTIONS") {
    
    return res.sendStatus(200);
  }
  next();
});

app.get('/test',async (req,res,next)=>{
  
  res.send('whats up')
})

app.get("/checklogin", async (req, res, next) => {
  console.log(req.cookies['asd'])
  jwt.verify(
    req.cookies.token,
    process.env.APP_SECRET,
    async (err, decoded) => {
      if (err) {
        res.send('no user')
      }
      let founduser;
      if (decoded.usertype === "archos") {
        founduser = await user.findById(decoded.id);
        res.send({
          usertype: "archos",
          name: founduser.name,
          username: founduser.username,
          lastname: founduser.lastname,
        });
      } else if (decoded.usertype === "facebook") {
        founduser = await facebookuser.findById(decoded.id);
        res.send({
          usertype: "facebook",
          name: founduser.name,
          username: founduser.username,
          lastname: founduser.lastname,
        });
      } else {
        founduser = await gmailuser.findById(decoded.id);
        res.send({
          usertype: "gmail",
          name: founduser.name,
          username: founduser.username,
          lastname: founduser.lastname,
        });
      }
    }
  );
});

app.post("/uploadimage", upload.single("image"), async (req, res, next) => {
  try {
    await cards
      .findById(req.body._id)
      .exec()
      .then((result) => {
        result.set("image", req.file.location);
        result.save();
      });
  } catch (err) {
    throw new Error("Server error");
  }
  res.send(true);
});
const graphqlfunc = graphqlHttp((req, res) => {
  return {
    schema: graphqlSchema,
    rootValue: graphqlResolvers,
    context: { req, res },
    graphiql: true,
  };
});
app.use("/graphql", async (req, res, next) => {
  try {
    await graphqlfunc(req, res);
  } catch (err) {}
});

mongoose
  .connect(
    "mongodb+srv://Archos123:jldgnWgqRelkGcCl@archos-dqxu9.mongodb.net/Main?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => app.listen(process.env.PORT || 4000));
