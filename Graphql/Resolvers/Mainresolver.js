const cardResolver = require("./Card");
const userResolver = require("./User");

module.exports = {
  ...cardResolver,
  ...userResolver
};
