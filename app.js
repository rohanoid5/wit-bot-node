const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const Wit = require('node-wit').Wit;
const token = "7FT3FOM7CGM2AAN2K7OST6H7WOFGGTGS";
const apiKey = "338fcef200d92da1408c75043a3a1c7c";
const sessionId = 'my-user-session-42';
const log = require('node-wit').log;
const users = require('./routes/users');
const request = require('request');

mongoose.connect('mongodb://localhost/chat');
mongoose.Promise = require('bluebird');

const app = express();

const actions = {
  send(request, response) {
    const {sessionId, context, entities} = request;
    const {text, quickreplies} = response;
    return new Promise(function(resolve, reject) {
      console.log('sending...', JSON.stringify(response));
      return resolve();
    });
  },
  getForecast({context, entities}) {
    return new Promise(function(resolve, reject) {
      // Here should go the api call, e.g.:
      // context.forecast = apiCall(context.loc)
      context.forecast = 'sunny';
      return resolve(context);
    });
  },
};

const wit = new Wit({
  accessToken: token,
  actions,
  logger: new log.Logger(log.INFO)
});

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/users', users);

require('./config/passport')(passport);

const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

app.get('/', (req,res) => {
	res.setHeader('content-type', 'application/json');
	res.json({status: "ok", message: "you are in the root"});
});

app.post('/chat', (req,res) => {
	res.setHeader('content-type', 'application/json');
	let message = req.body.message;
	wit.converse('my-user-session-42', message, {})
  .then((data) => {
    console.log('Yay, got Wit.ai response: ' + JSON.stringify(data));
    res.json({location: data.entities.location, intent:data.entities.intent});
  })
});

app.listen(3000, () => {
	console.log("Chat Bot started!");
});