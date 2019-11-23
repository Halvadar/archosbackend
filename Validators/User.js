const validator = require("validator");
const { user, facebookuser, gmailuser } = require("../Models/Users");
const fetch = require("node-fetch");
const axios = require("axios");

module.exports = {
  createUserValidator: async args => {
    console.log(args);
    let errors = [];
    username = await user.find({ username: args.username });
    email = await user.find({ email: args.email });

    if (username) {
      errors.push("Username already taken");
    }

    if (!validator.isEmail(args.email)) {
      errors.push("Email is not valid");
    }

    if (email) {
      errors.push("Email already taken");
    }
    if (args.password !== args.repassword) {
      errors.push("Passwords don't match");
    }
    console.log("face");

    if (args.gmailid) {
      let gmailid;
      gmailid = await user.find({ gmailid: args.gmailid });
      if (!gmailid) {
        errors.push("Account already exists with given Gmail Id");
      }
    }
    console.log(errors);
    if (errors.length > 0) {
      return errors;
    }

    return;
  },
  createFacebookUserValidator: async args => {
    console.log(args);
    let errors = [];
    let email;
    let id;

    id = await axios({
      url: `https://graph.facebook.com/me?access_token=${args.token}`
    }).then(result => {
      return result.data.id;
    });
    if (id !== args.facebookid) {
      console.log(id, args.facebookid);
      errors.push("Given Facebook Id is invalid");
    }
    await facebookuser.findOne({ facebookid: id }).then(result => {
      if (result !== null) {
        errors.push(
          "Account already exists with Given Facebook Id, try logging in"
        );
      }
    });

    await Promise.all([
      facebookuser.findOne({ username: args.username }),
      user.findOne({ username: args.username }),
      gmailuser.findOne({ username: args.username })
    ])
      .then(result => {
        result.forEach(a => {
          if (a !== null) {
            errors.push("Username already taken");
          }
        });
      })
      .catch(err => {
        console.log(err);
      });

    email = await facebookuser.findOne({ email: args.email });

    if (!validator.isEmail(args.email)) {
      errors.push("Email is not valid");
    }

    if (email) {
      errors.push("Email already taken");
    }
    if (args.facebookid) {
      let facebookid;
      facebookid = await facebookuser.find({ facebookid: args.facebookid });
      if (!facebookid) {
        errors.push("Account already exists with given Facebook Id");
      }
    }
    if (errors.length > 0) {
      return errors;
    }
    return;
  },
  createGmailUserValidator: async args => {
    console.log("passed");
    let errors = [];
    let username;
    let email;
    let id;
    id = await axios({
      url: `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${args.token}`
    })
      .then(result => {
        console.log(result);
        return result.data.user_id;
      })
      .catch(err => {
        console.log(err);
      });

    await Promise.all([
      gmailuser.findOne({ username: args.username }),
      user.findOne({ username: args.username }),
      facebookuser.findOne({ username: args.username })
    ])
      .then(result => {
        result.forEach(a => {
          if (a !== null) {
            errors.push("Username already taken");
          }
        });
      })
      .catch(err => {
        console.log(err);
      });

    email = await gmailuser.findOne({ email: args.email });

    if (!validator.isEmail(args.email)) {
      errors.push("Email is not valid");
    }

    if (email !== null) {
      errors.push("Email already taken");
    }
    if (args.gmailid) {
      let gmail;
      gmailid = await gmailuser.find({ facebookid: args.facebookid });
      if (!gmailid) {
        errors.push("Account already exists with given Facebook Id");
      }
    }
    if (errors.length > 0) {
      return errors;
    }
    return;
  }
};
