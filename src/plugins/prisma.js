const { PrismaClient } = require("@prisma/client");
const Hapi = require("@hapi/hapi");

exports.prismaPlugin = {
  name: "prisma",
  register: function (server) {
    console.log("I'm entering prismaPLugin");
    const prisma = new PrismaClient();

    server.app.prisma = prisma;
    server.ext({
      type: "onPostStop",
      method: async function (server) {
        server.app.prisma.$disconnect();
      },
    });

    console.log("I'm exiting prismaPlugin");
  },
};
