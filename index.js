// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const ddg = require('ddg');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const express = require('express');
const app = express();
app.use( express.json() );

app.get('/', (req, res) => processWebhook( req, res ));

app.listen(3000, () => console.log('App listening on port 3000!'));

function processWebhook(request, response) {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}
  function search(agent) {
    agent.add(`Here is what I found.`);
    agent.add('Here is what I found too!');
    var term = agent.parameters.searchphrase;
  	ddg.query(term, function(err, data){
		var answer = data.AbstractText;
    	var imageUrl = data.Image;
    	var source = data.AbstractSource;
      	var moreUrl = data.AbstractURL;
      	var heading = data.Heading;

      	agent.add(answer);
      	agent.add(new Card({
 	       title: heading,
  	       imageUrl: imageUrl,
  	       text: answer,
  	       buttonText: 'More about this',
  	       buttonUrl: moreUrl
  	     })
  	   	);
      	agent.add('Answer provided by DuckDuckGo and ' + source);
	});
  }


  // // Uncomment and edit to make your own intent handler
  // // uncomment `intentMap.set('your intent name here', yourFunctionHandler);`
  // // below to get this function to be run when a Dialogflow intent is matched
  // function yourFunctionHandler(agent) {
  //   agent.add(`This message is from Dialogflow's Cloud Functions for Firebase editor!`);
  //   agent.add(new Card({
  //       title: `Title: this is a card title`,
  //       imageUrl: 'https://developers.google.com/actions/images/badges/XPM_BADGING_GoogleAssistant_VER.png',
  //       text: `This is the body text of a card.  You can even use line\n  breaks and emoji! 💁`,
  //       buttonText: 'This is a button',
  //       buttonUrl: 'https://assistant.google.com/'
  //     })
  //   );
  //   agent.add(new Suggestion(`Quick Reply`));
  //   agent.add(new Suggestion(`Suggestion`));
  //   agent.setContext({ name: 'weather', lifespan: 2, parameters: { city: 'Rome' }});
  // }
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('Search', search);
  agent.handleRequest(intentMap);
});
