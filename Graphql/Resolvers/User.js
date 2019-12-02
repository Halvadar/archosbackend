const { user, facebookuser, gmailuser } = require("../../Models/Users");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const uservalidator = require("../../Validators/User");
const jwt = require("jsonwebtoken");
const cards = require("../../Models/Cards");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: process.env.EMAILAPIKEY
    }
  })
);

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
    let token = jwt.sign(
      { id: newuser.id, usertype: "archos" },
      process.env.APP_SECRET,
      {
        expiresIn: "1h"
      }
    );

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
      {
        facebookid: args.Input.facebookid,
        id: newuser.id,
        usertype: "facebook"
      },
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
    let token = jwt.sign(
      { gmailid: args.Input.gmailid, id: newuser.id, usertype: "gmail" },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );
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
    const foundfacebookuser = await facebookuser.findOne({
      facebookid: args.Input.id
    });

    let token = jwt.sign(
      {
        facebookid: args.Input.id,
        id: foundfacebookuser.id,
        usertype: "facebook"
      },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );
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
    const foundgmailuser = await gmailuser.findOne({ gmailid: args.Input.id });

    let token = jwt.sign(
      { gmailid: args.Input.id, id: foundgmailuser.id, usertype: "gmail" },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );
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

    let token = jwt.sign(
      { id: existinguser.id, usertype: "archos" },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.cookie("token", token, { expiresIn: "1d", httpOnly: true });
    console.log(token);
    return { ...existinguser._doc, usertype: "archos" };
  },
  deleteUser: async (args, { req, res }) => {
    let decoded;
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      (err, decode) => {
        if (err) {
          throw new Error("You need to be logged in to make this request");
        }
        decoded = decode;
      }
    );
    let founduser;

    if (decoded.usertype === "facebook") {
      founduser = await facebookuser.findById(decoded.id);
    } else if (decoded.usertype === "gmail") {
      founduser = await gmailuser.findById(decoded.id);
    } else {
      founduser = await user.findById(decoded.id);
    }
    if (args.email !== founduser.email) {
      throw new Error("Provided email address is not valid for this Account");
    }
    const jwtargs = [
      { id: founduser.id, usertype: founduser.usertype },
      { expiresIn: "10m" }
    ];
    console.log(founduser.email);
    transporter.sendMail(
      {
        to: founduser.email,
        from: "Archos@verification.com",
        subject: "Email Verification code",
        html: `<h1>This will expire in 10 minutes - ${jwt.sign(
          jwtargs[0],
          process.env.APP_SECRET,
          jwtargs[1]
        )}</h1>`
      },
      (err, info) => {
        if (err) {
          console.log(err);
        }
        console.log(info);
      }
    );
    console.log("asdasd");

    return { result: true };
  },
  deleteUserConfirmation: async args => {
    let decoded;
    jwt.verify(
      args.deletetoken,
      process.env.APP_SECRET,
      (err, decodedtoken) => {
        if (err) {
          throw new Error("Provided token is not valid");
        }
        decoded = decodedtoken;
      }
    );
    let founduser;
    let foundcards;
    if (decoded.usertype === "facebook") {
      founduser = await facebookuser.findById(decoded.id);
    } else if (decoded.usertype === "gmail") {
      founduser = await gmailuser.findById(decoded.id);
    } else {
      founduser = await user.findById(decoded.id);
    }
    await cards.deleteMany({ created: founduser.id });
    await cards.save();
  }
};
