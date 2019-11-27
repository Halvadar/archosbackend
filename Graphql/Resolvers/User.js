const { user, facebookuser, gmailuser } = require("../../Models/Users");

const uservalidator = require("../../Validators/User");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

module.exports = {
  logoutUser: (args, { req, res }) => {
    res.clearCookie("token");
    return {
      name: undefined,
      username: undefined,
      lastname: undefined,
      usertype: undefined
    };
  },
  createUser: async (args, { req, res }) => {
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
      throw new Error("Database Error");
    }
    let token = jwt.sign({ id: newuser.id }, process.env.APP_SECRET, {
      expiresIn: "1h"
    });

    res.cookie("access_token", token, { httpOnly: true });
    console.log();
    return { ...newuser._doc, usertype: "archos" };
  },
  createFacebookUser: async (args, { req, res }) => {
    console.log("aaaaaaaaa", res.cookie);
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
      throw new Error("Database Error");
    }
    let token = jwt.sign(
      { id: args.Input.facebookid },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("access_token", token, { httpOnly: true });

    return { ...newuser._doc, usertype: "facebook" };
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
      throw new Error("Database Error");
    }
    let token = jwt.sign({ id: args.Input.gmailid }, process.env.APP_SECRET, {
      expiresIn: "1d"
    });
    res.cookie("acccess_token", token, { httpOnly: true });

    return { ...newuser._doc, usertype: "gmail" };
  },
  loginFacebook: async (args, { req, res }) => {
    let {
      existingfacebookuser,
      errors
    } = await uservalidator.loginFacebookUserValidator(args.Input);

    if (errors.length > 0) {
      throw new Error(errors);
    }

    let token = jwt.sign({ id: args.Input.id }, process.env.APP_SECRET, {
      expiresIn: "1d"
    });
    res.cookie("token", token, { expiresIn: "1d", httpOnly: true });

    return {
      ...existingfacebookuser._doc,
      usertype: "facebook",
      httponly: true
    };
  },
  loginGoogle: async (args, { req, res }) => {
    let {
      existinggmailuser,
      errors
    } = await uservalidator.loginGmailUserValidator(args.Input);

    if (errors.length > 0) {
      throw new Error(errors);
    }

    let token = jwt.sign({ id: args.Input.id }, process.env.APP_SECRET, {
      expiresIn: "1d"
    });
    res.cookie("token", token, { expiresIn: "1d", httpOnly: true });

    return { ...existinggmailuser._doc, usertype: "gmail" };
  },
  loginArchos: async (args, { req, res }) => {
    let { existinguser, errors } = await uservalidator.loginArchosUserValidator(
      args.Input
    );
    if (errors.length > 0) {
      throw new Error(errors);
    }

    let token = jwt.sign({ id: existinguser.id }, process.env.APP_SECRET, {
      expiresIn: "1d"
    });

    res.cookie("token", token, { expiresIn: "1d", httpOnly: true });
    console.log(token);
    return { ...existinguser._doc, usertype: "archos" };
  }
};
