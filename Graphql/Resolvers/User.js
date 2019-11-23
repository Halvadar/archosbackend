const { user, facebookuser, gmailuser } = require("../../Models/Users");
const validator = require("validator");
const uservalidator = require("../../Validators/User");
const jwt = require("jsonwebtoken");

module.exports = {
  createUser: async args => {
    let errors;
    let newuser;
    console.log("asdasd");
    errors = await uservalidator.createUserValidator({ ...args.Input });
    if (errors) {
      console.log("error");
      throw new Error([...errors]);
    }
    try {
      newuser = await new user({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      console.log(error);
    }
    console.log(newuser);
    return newuser;
  },
  createFacebookUser: async (args, { req, res }) => {
    let errors;
    let newuser;
    errors = await uservalidator.createFacebookUserValidator({ ...args.Input });
    if (errors) {
      throw new Error([...errors]);
    }
    try {
      newuser = await new facebookuser({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      console.log(error);
    }

    let token = jwt.sign({ id: args.facebookid }, process.env.APP_SECRET, {
      expiresIn: 1
    });
    res.cookie("token", token, { httponly: true });

    return { ...newuser._doc, token };
  },
  createGmailUser: async (args, { req, res }) => {
    let errors;
    let newuser;
    errors = await uservalidator.createGmailUserValidator({ ...args.Input });
    if (errors) {
      throw new Error([...errors]);
    }
    try {
      newuser = await new gmailuser({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      console.log(error);
    }
    let token = jwt.sign({ id: args.facebookid }, process.env.APP_SECRET, {
      expiresIn: 1
    });
    res.cookie("token", token, { httponly: true });

    return { ...newuser._doc, token };
  }
};
