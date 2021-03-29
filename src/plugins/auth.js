const dotenv = require("dotenv").config();
const Hapi = require("@hapi/hapi");
const Joi = require("joi");
const Boom = require("@hapi/boom");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ALGORITHM = "HS256";
const AUTHENTICATION_TOKEN_EXPIRATION_HOURS = 36;
const EMAIL_TOKEN_EXPIRATION_MINUTES = 10;
const API_AUTH_STRATEGY = "API";
const apiTokenSchema = Joi.object({
  tokenId: Joi.number().integer().required(),
});

exports.authPlugin = {
  name: "app/auth",
  version: "0.1",
  dependencies: ["prisma", "hapi-auth-jwt2", "app/email"],
  register: function (server, options, next) {
    server.route({
      //This is our endpoint to login an existing user or register a new user
      method: "POST",
      path: "/login",
      handler: loginHandler,
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required(),
          }),
        },
      },
    });
    //This is our endpoint to authenticate a user
    server.route({
      method: "POST",
      path: "/authenticate",
      handler: authenticateHandler,
      options: {
        auth: false,
        validate: {
          payload: Joi.object({
            email: Joi.string().email().required(),
            emailToken: Joi.string().required(),
          }),
        },
      },
    });
    //Defining an Authentication Strategy
    server.auth.strategy(API_AUTH_STRATEGY, "jwt", {
      key: JWT_SECRET,
      verifyOptions: { algorithms: [JWT_ALGORITHM] },
      validate: validateAPIToken,
    });
    //Make the API_AUTH_STRATEGY the default Strategy for our application
    server.auth.default(API_AUTH_STRATEGY);
  },
};

async function loginHandler(request, h) {
  //Here we deconstruct the prisma instance and the sendEmailToken function from the server.app object
  const { prisma, sendEmailToken } = request.server.app;
  const { email } = request.payload;
  const emailToken = generateEmailToken();
  //Set email Token's expiration time equal to 10 minutes
  const currentDateTime = new Date();
  const futureDateTime = new Date(
    currentDateTime.getTime() + EMAIL_TOKEN_EXPIRATION_MINUTES * 60000
  );
  const tokenExpiration = futureDateTime.toISOString();

  try {
    //Generate a short lived token in the Token table and create an associate with the provided email address
    //If a user with this email address does not exist, create one
    const createdToken = await prisma.token.create({
      data: {
        emailToken,
        type: { create: { type: "EMAIL" } },
        expiration: tokenExpiration,
        user: {
          connectOrCreate: {
            create: {
              email,
            },
            where: {
              email,
            },
          },
        },
      },
    });
    await sendEmailToken(email, emailToken);
    return h.response().code(200);
  } catch (error) {
    return Boom.badImplementation(error.message);
  }
}

function generateEmailToken() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

async function authenticateHandler(request, h) {
  const { prisma } = request.server.app;
  const { email, emailToken } = request.payload;

  try {
    //Fetch the emailToken in the DB that matches the one provided and retrieve the associated user
    const fetchedEmailToken = await prisma.token.findUnique({
      where: {
        emailToken: emailToken,
      },
      include: {
        user: true,
      },
    });

    if (!fetchedEmailToken?.valid) {
      return Boom.unauthorized();
    }

    if (fetchedEmailToken.expiration < new Date()) {
      return Boom.unauthorized("Token expired");
    }

    if (fetchedEmailToken?.user?.email === email) {
      const currentDateTime = new Date();
      const futureDateTime = new Date(
        currentDateTime.getTime() +
          AUTHENTICATION_TOKEN_EXPIRATION_HOURS * 3600000
      );
      const tokenExpiration = futureDateTime.toISOString();
      const createdToken = await prisma.token.create({
        data: {
          type: { create: { type: "API" } },
          expiration: tokenExpiration,
          user: {
            connect: {
              email,
            },
          },
        },
      });

      await prisma.token.update({
        where: {
          id: fetchedEmailToken.id,
        },
        data: {
          valid: false,
        },
      });

      const authToken = generateAuthToken(createdToken.id);
      return h.response().code(200).header("Authorization", authToken);
    } else {
      return Boom.unauthorized();
    }
  } catch (error) {
    return Boom.badImplementation(error.message);
  }
}

function generateAuthToken(tokenId) {
  const jwtPayload = { tokenId };
  return jwt.sign(jwtPayload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    noTimestamp: true,
  });
}

async function validateAPIToken(decoded, request, h) {
  const { prisma } = request.server.app;
  const { tokenId } = decoded;

  const { error } = apiTokenSchema.validate(decoded);

  if (error) {
    console.log(["error", "auth"], `API token error: ${error.message}`);
    return { isValid: false };
  }

  try {
    //Fetch the token from DB to verify it's valid
    const fetchedToken = await prisma.token.findUnique({
      where: {
        id: tokenId,
      },
      include: {
        user: true,
      },
    });
    //Check if token could be found in db and is valid
    if (!fetchedToken || !fetchedToken?.valid) {
      return { isValid: false, errorMessage: "Invalid Token" };
    }
    //Check token expiration
    if (fetchedToken.expiration < new Date()) {
      return { isValid: false, errorMessage: "Token expired" };
    }

    return {
      isValid: true,
      credentials: {
        tokenId: decoded.tokenId,
        userId: fetchedToken.userId,
      },
    };
  } catch (error) {
    request.log(["error", "auth", "db"], error);
    return { isValid: false, errorMessage: "DB Error" };
  }
}
