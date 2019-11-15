const express = require("express");


const router = express.Router();

const cardsresponses = require("../Controllers/Cards");

router.get("/categories", cardsresponses.getcards);

module.exports = router;
