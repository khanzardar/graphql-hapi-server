const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const Boom = require("@hapi/boom");
const sendgrid = require("@sendgrid/mail");
const dotenv = require("dotenv").config();

exports.emailPlugin = {
  name: "app/email",
  version: "0.1",
  register: function (server, options, next) {
    console.log("I'm entering the emailPlugin");
    if (!process.env.SENDGRID_API_KEY) {
      console.log(
        `The SENDGRID_API_KEY env var must be set, otherwise the API won't be able to send emails.`,
        `Using debug mode which logs the email tokens instead.`
      );
      server.app.sendEmailToken = debugSendEmailToken;
    } else {
      sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
      server.app.sendEmailToken = sendEmailToken;
    }
    console.log("I'm exiting the emailPlugin");
  },
};

async function sendEmailToken(email, token) {
  const msg = {
    to: email,
    from: process.env.EMAIL_ADDRESS_CONFIGURED_IN_SEND_GRID,
    subject: "Login token for Noisey Radar",
    text: `Hi there, your login token for the API is: ${token}`,
  };

  await sendgrid
    .send(msg)
    .then(() => {
      //for testing purposes
      console.log(`email token for ${email}:${token}`);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function debugSendEmailToken(email, token) {
  console.log(`email token for ${email}:${token}`);
}
