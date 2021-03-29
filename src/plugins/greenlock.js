//Stays in plugin file
exports.greenlockPlugin = {
  name: "app/greenlock",
  version: "0.1",
  register: function (server, options, next) {
    server.route({
      method: "GET",
      path: "/.well-known/acme-challenge",
      handler: greenlockHandler,
      options: {
        auth: false,
      },
    });
  },
};

function approveDomain(opts, certs, cb) {
  console.log(opts);
  //If we don't have this domain in the db, then return error???!
  // if (opts.domain)
  // cb(new Error(`No config found for ${opts.domain}`));
  opts.email = "team@noisey.ca";
  opts.agreeTos = true;
  opts.domains = [
    "app.noisey.ca",
    "www.app.noisey.ca",
    "www.noisey.ca",
    "noisey.ca",
  ];
  cb(null, { options: opts, certs: certs });
}

exports.greenlock = require("greenlock-hapi").create({
  version: "draft-11",
  // You MUST change this to 'https://acme-v02.api.letsencrypt.org/directory' in production
  server: "https://acme-staging-v02.api.letsencrypt.org/directory",
  approveDomains: function (opts, certs, db) {
    approveDomain(opts, certs, cb);
  },
  communityMember: true,
  configDir: require("os").homedir() + "/acme/etc",
  //disable for PROD
  debug: true,
});

async function greenlockHandler(request, h) {
  const req = request.raw.req;
  const res = request.raw.res;
  h.close(false);
  acmeResponder(req, res);
}
