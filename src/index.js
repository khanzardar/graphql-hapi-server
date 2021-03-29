const Hapi = require("@hapi/hapi");
const { ApolloServer } = require("apollo-server-hapi");
const fs = require("fs");
const path = require("path");

const Query = require("./resolvers/Query");
const Mutation = require("./resolvers/Mutation");

const hapiAuthJWT = require("hapi-auth-jwt2");
const { emailPlugin } = require("./plugins/email");
const { authPlugin } = require("./plugins/auth");
const { prismaPlugin } = require("./plugins/prisma");
const Url = require("url");

const API_AUTH_STRATEGY = "API";
const PORT = 443;
const HOST = "localhost";

//Defining our Query and Mutation resolvers for GraphQL server (ApolloServer)
const resolvers = {
  Query,
  Mutation,
};

const typeDefs = fs.readFileSync(
  path.join(__dirname, "schema.graphql"),
  "utf8"
);

async function StartServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ request, h }) => {
      return request, h;
    },
  });

  //This is optional, if not called, it will be invoked when we call server.applyMiddleware however calling start() is recommended so web server doesn't accept GraphQL request until Apollo Server is ready to process them
  await server.start();

  const httpsApp = new Hapi.server({
    port: PORT,
    host: HOST,
    tls: {
      key: fs.readFileSync(path.join(__dirname, "../server.key")),
      cert: fs.readFileSync(path.join(__dirname, "../server.crt")),
    },
    routes: {
      security: {
        hsts: true,
      },
    },
  });

  const httpApp = new Hapi.server({
    port: 80,
    host: HOST,
  });

  await httpApp.ext({
    type: "onRequest",
    method: function (request, h) {
      if (request.server.info.protocol === "http") {
        const hostname = request.headers.host;
        const pathname = request.url.pathname;
        //in PROD, we only need hostname, pathname
        const secureUrl = `https://${hostname}:443${pathname}`;
        return h.redirect(secureUrl).takeover().code(307);
      }
      return h.continue;
    },
  });

  // await httpApp.register({
  //   plugin: require("hapi-require-https"),
  //   options: { proxy: false },
  // });

  await httpsApp.register([hapiAuthJWT, emailPlugin, authPlugin, prismaPlugin]);

  await server.applyMiddleware({
    app: httpsApp,
    route: {
      auth: {
        mode: "required",
        strategy: API_AUTH_STRATEGY,
      },
    },
    path: "/graphql",
  });

  await server.applyMiddleware({
    app: httpApp,
  });

  await server.installSubscriptionHandlers(httpsApp.listener);

  try {
    await httpsApp.start();
    await httpApp.start();
    console.log(`TLS server running at: ${httpsApp.info.uri} 🚀 `);
    console.log(`non-TLS server running at: ${httpApp.info.uri} 🚀 `);
  } catch (error) {
    console.log(`Error while starting server: ${error.message}`);
  }
}

StartServer();
