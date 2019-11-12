const express = require("express");
const bodyParser = require("body-parser");

const App = express();

App.listen(process.env.PORT || 4000);

App.get("/", (req, res, err) => {
  res.send("<h1>hola<h1>");
});
