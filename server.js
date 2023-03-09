const path = require("path");
const handlebars = require("handlebars");
const axios = require("axios");
var cloudshare = require("./src/cloudshare.js");
var automations = require("./src/automations.js");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// second plugin
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "node_modules"),
  prefix: "/node_modules/",
  decorateReply: false, // the reply decorator has been added by the first plugin registration
});

// Formbody lets us parse incoming forms
fastify.register(require("@fastify/formbody"));

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: handlebars,
  },
});

/**
 * Our home page route
 *
 * Returns src/index.hbs with data built into it
 */
fastify.get("/", function (request, reply) {
  // params is an object we'll pass to our handlebars template
  const sessions = require("./.data/sessions.json");

  let params = { sessions: sessions, get: true };

  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view("/src/index.hbs", params);
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/submit", async function (request, reply) {
  const sDetails = require("./.data/session-details.json");
  const sessions = require("./.data/sessions.json");

  var email = request.body.email;
  var sessionId = request.body.session;

  console.log(`Event for sessionId '${sessionId}' and user '${email}'`);

  var details = sDetails[sessionId];
  var result;

  if (sessionId.indexOf("qcdi") !== -1) {
    result = cloudshare.addStudentToClass(details, email);
  } else {
    result = await automations.runQlikAutomation(details, email);
  }

  if (result.error) {
    return reply.redirect("/error.html");
  } else {
    return reply.redirect("/done.html");
  }
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
