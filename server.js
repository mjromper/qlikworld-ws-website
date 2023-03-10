const path = require("path");
const handlebars = require("handlebars");
const axios = require("axios");
var cloudshare = require("./src/cloudshare.js");
var automations = require("./src/automations.js");
var fs = require('fs');

const DATAFOLDER = './.data';

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
  
  
  var sessions = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "sessions.json")));
  
  var sessionId = request.query.session;
  
  sessions.forEach(function(s){
    if (sessionId && s.id === sessionId) {
      s.selected = "selected";
      s.disabled = "";
    } else if(sessionId) {
      s.selected = "";
      s.disabled = "disabled";
    } else {
      s.selected = "";
      s.disabled = "";
    }
  });
  

  let params = { sessions: sessions};

  return reply.view("/src/index.hbs", params);
});

fastify.get("/dbadmin", function (request, reply) {
  
  var sessions = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "sessions.json")));
  var details = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "session-details.json")));
  
  let params = {sessions: sessions, details: details};

  // The Handlebars code will be able to access the parameter values and build them into the page
  return reply.view("/src/db.hbs", params);
});

/**
 * Our POST route to handle and react to form submissions
 *
 * Accepts body data indicating the user choice
 */
fastify.post("/submit", async function (request, reply) {
  
  var sessions = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "sessions.json")));
  var sDetails = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "session-details.json")));
  
  var email = request.body.email;
  var sessionId = request.body.session;

  console.log(`Event for sessionId '${sessionId}' and user '${email}'`);

  var details = sDetails[sessionId];
  var result;

  if (sessionId.indexOf("qcdi") !== -1) {
    result = await cloudshare.addStudentToClass(details, email);
  } else {
    result = await automations.runQlikAutomation(details, email);
  }

  if (result.error) {
    return reply.redirect("/error.html");
  } else {
    return reply.redirect("/done.html");
  }
});


/**
 * Our home page route
 *
 * Returns src/index.hbs with data built into it
 */
fastify.get("/api/sessions", function (request, reply) {
  
  var sessions = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "sessions.json")));
  var details = JSON.parse(fs.readFileSync(path.join(__dirname, DATAFOLDER, "session-details.json")));
  
  
  return reply.send({sessions: sessions, details: details});
});

fastify.post("/api/sessions", function (request, reply) {
  
  var sessions = request.body.sessions;
  var details = request.body.details;
  
  var out = {};
  var jsonContent;
  if (sessions){
    jsonContent = JSON.stringify(sessions, null, 2);
    fs.writeFileSync(path.join(__dirname, DATAFOLDER, "sessions.json"), jsonContent, 'utf8');
  }
  
  if (details){
    jsonContent = JSON.stringify(details, null, 2);
    fs.writeFileSync(path.join(__dirname, DATAFOLDER, "session-details.json"), jsonContent, 'utf8');
    out.details = details;
  }
  
  
  return reply.send(out);
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
