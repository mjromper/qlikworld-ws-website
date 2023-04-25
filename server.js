const path = require("path");
const handlebars = require("handlebars");
var cloudshare = require("./src/cloudshare.js");
var automations = require("./src/automations.js");
var fs = require('fs');
var myS3 = require('./src/s3.js');
const axios = require("axios");


//const DATAFOLDER = process.env.DATAFOLDER || './.data';


// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  
  logger: false,
  /*https: {
    allowHTTP1: true,
    key: fs.readFileSync(path.join(__dirname, DATAFOLDER, "server.key")),
    cert: fs.readFileSync(path.join(__dirname, DATAFOLDER, "server.cert"))
  }*/
});
const authenticate = {realm: 'QlikWorld'};
fastify.register(require('@fastify/basic-auth'), { validate, authenticate });
async function validate (username, password, req, reply) {
  if (username !== 'admin' || password !== 'QlikWorld23!!') {
    return new Error('Winter is coming')
  }
}

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

fastify.get("/", async function (request, reply) {
  
  
  /*var sessions = await myS3.read( "sessions.json", true);
  
  var sessionId = request.query.session;
  var sessionName = null;
  sessions.forEach(function(s){
    if (sessionId && s.id === sessionId) {
      sessionName = s.name;
      s.selected = "selected";
      s.disabled = "";
    } else if(sessionId) {
      s.selected = "";
      s.disabled = "disabled";
    } else {
      s.selected = "";
    }
  });

  let params = { sessions: sessions, sessionId: sessionName? sessionId : "main", sessionName: sessionName };

  return reply.view("/src/index.hbs", params);
  */
  return reply.view("/src/thanks.hbs", {});
});

/*
fastify.get("/error", function (request, reply) {
  return reply.view("/src/result.hbs", {"error": true});
});

fastify.get("/done", function (request, reply) {
  return reply.view("/src/result.hbs", {"done": true});
});


fastify.post("/submit", async function (request, reply) {
  
  var sDetails = await myS3.read( "session-details.json");
  
  var email = request.body.email;
  var sessionId = request.body.session;

  console.log(`Event for sessionId '${sessionId}' and user '${email}'`);

  var details = sDetails[sessionId];
  var result1, result2;
  
  axios({
    method: "post",
    url: "https://manuel-romero.eu.qlikcloud.com/api/v1/automations/0d435fb0-d227-11ed-a27c-95968549199d/actions/execute",
    headers: {
      "X-Execution-Token": "J0E09UxLf2kX8HqLB40MIr9vEKEreIU7SCxTqwa4IVDd7YwwgPEoOHzXmH0JuErX",
      "Content-Type": "application/json"
    },
    data: {
      email: email,
      session: sessionId
    }
  });

  if (details && details['classId'] ) {
    result1 = await cloudshare.addStudentToClass(details, email);
  } 
  if (details && details['url']) {
    result2 = await automations.runQlikAutomation(details, email);
  }

  if (result1 && result1.error || result2 && result2.error) {
    return reply.redirect("/error");
  } else {
    return reply.redirect("/done");
  }
});
*/


/**
 * Our home page route
 *
 * Returns src/index.hbs with data built into it
 */
fastify.get("/api/sessions", async function (request, reply) {
  
  var sessions = await myS3.read( "sessions.json", true);
  var details = await myS3.read( "session-details.json");
  
  return reply.send({sessions: sessions, details: details});
});

fastify.post("/api/sessions", async function (request, reply) {
  
  var sessions = request.body.sessions;
  var details = request.body.details;
  
  var out = {};
  if (sessions){
    out.sessions = await myS3.store("sessions.json", sessions);
  }
  
  if (details){
    out.details = await myS3.store("session-details.json", details);
  }
  
  
  return reply.send(out);
});

/*fastify.get("/admin", function (request, reply) {
  return reply.view("/src/db.hbs");
});*/

fastify.after(() => {
  fastify.route({
    method: 'GET',
    url: '/admin',
    onRequest: fastify.basicAuth,
    handler: async (req, reply) => {
      return reply.view("/src/db.hbs");
    }
  })
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
