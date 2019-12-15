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

    errors = await uservalidator.createUserValidator({ ...args.Input });

    if (errors) {
      res.status(500).send(errors[0]);
    }
    try {
      newuser = await new user({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      res.status(500).send("Database Error");
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
      res.status(500).send(errors[0]);
    }
    try {
      newuser = await new facebookuser({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      res.status(500).send("Database Error");
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

    res.cookie("token", token, { httpOnly: true });

    return { ...newuser._doc, usertype: "facebook" };
  },
  createGmailUser: async (args, { req, res }) => {
    let errors;
    let newuser;
    errors = await uservalidator.createGmailUserValidator({ ...args.Input });
    if (errors) {
      res.status(500).send(errors[0]);
    }
    try {
      newuser = await new gmailuser({
        ...args.Input
      });
      await newuser.save();
    } catch (error) {
      res.status(500).send("Database Error");
    }
    let token = jwt.sign(
      { gmailid: args.Input.gmailid, id: newuser.id, usertype: "gmail" },
      process.env.APP_SECRET,
      {
        expiresIn: "1d"
      }
    );
    res.cookie("token", token, { httpOnly: true });

    return { ...newuser._doc, usertype: "gmail" };
  },
  loginFacebook: async (args, { req, res }) => {
    let {
      existingfacebookuser,
      errors
    } = await uservalidator.loginFacebookUserValidator(args.Input);

    if (errors.length > 0) {
      res.status(500).send(errors[0]);
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
      res.status(500).send(errors[0]);
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
      res.status(500).send(errors[0]);
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
          res.status(500).send("You need to be logged in to make this request");
        }
        decoded = decode;
      }
    );
    let founduser;
    console.log(args);

    if (decoded.usertype === "facebook") {
      founduser = await facebookuser.findById(decoded.id);
    } else if (decoded.usertype === "gmail") {
      founduser = await gmailuser.findById(decoded.id);
    } else {
      founduser = await user.findById(decoded.id);
    }
    if (decoded.usertype === "facebook") {
      if (founduser.email !== args.email) {
        res.status(500).send("Email is incorrect for this account");
      }
    } else if (decoded.usertype === "gmail") {
      if (founduser.email !== args.email) {
        res.status(500).send("Email is incorrect for this account");
      }
    } else {
      if (founduser.email !== args.email) {
        res.status(500).send("Email is incorrect for this account");
      }
      if (founduser.password !== args.email) {
        res.status(500).send("Password doesnt match");
      }
    }
    
    const jwtargs = [
      { id: founduser.id, usertype: decoded.usertype },
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
  deleteUserConfirmation: async (args, { req, res }) => {
    console.log("aaa");
    let decoded;
    await jwt.verify(
      args.token,
      process.env.APP_SECRET,
      (err, decodedtoken) => {
        if (err) {
          res.status(500).send("Provided token is not valid");
        }
        decoded = decodedtoken;
      }
    );
    let founduser;
    console.log(decoded);
    await cards.deleteMany({ createdby: decoded.id });
    console.log(decoded);
    if (decoded.usertype === "facebook") {
      console.log("found");
      founduser = await facebookuser.findById(decoded.id);
      await facebookuser.findByIdAndDelete(decoded.id);
    } else if (decoded.usertype === "gmail") {
      founduser = await gmailuser.findById(decoded.id);
      await gmailuser.findOneAndDelete(decoded.id);
    } else {
      founduser = await user.findById(decoded.id);
      await user.findByIdAndDelete(decoded.id);
    }
    return { result: true };
  },
  changePassword: async (args, { req, res }) => {
    console.log(args);
    let decoded;
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      (err, decode) => {
        if (err) {
          res.status(500).send("You need to be logged in to make this request");
        }
        decoded = decode;
      }
    );
    let founduser;

    if (decoded.usertype === "facebook") {
      res.status(500).send("You cant change password on facebook user");
    } else if (decoded.usertype === "gmail") {
      res.status(500).send("You cant change password on gmail user");
    } else {
      founduser = await user.findById(decoded.id);
    }
    if (args.email !== founduser.email) {
      res
        .status(500)
        .send("Provided email address is not valid for this Account");
    }
    const jwtargs = [
      { id: founduser.id, usertype: decoded.usertype },
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
  changePasswordConfirmation: async (args, { req, res }) => {
    console.log(args.token);
    let decodedchangepswtoken;
    let decodedusertoken;
    await jwt.verify(
      args.token,
      process.env.APP_SECRET,
      (err, decodedtoken) => {
        if (err) {
          res
            .status(500)
            .send(
              "Provided token is incorrect. The token might have expired.  "
            );
        }
        decodedchangepswtoken = decodedtoken;
      }
    );
    await jwt.verify(
      req.cookies.token,
      process.env.APP_SECRET,
      (err, decoded) => {
        if (err) {
          res.status(500).send("You are not logged in");
        }
        decodedusertoken = decoded;
      }
    );
    let founduser;
    if (decodedusertoken.usertype === "facebook") {
      res.status(500).send("You cant change password on facebook user");
    } else if (decodedusertoken.usertype === "gmail") {
      res.status(500).send("You cant change password on gmail user");
    } else {
      founduser = await user.findById(decodedusertoken.id);
    }
    await founduser.set({ email: args.changeemail });
    await founduser.save();
    return { result: true };
  }
};
