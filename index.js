// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');
const ddg = require('ddg');
const rp = require('request-promise-native')

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const express = require('express');
const app = express();
app.use( express.json() );

app.post('/', (req, res) => processWebhook( req, res ));

app.listen(process.env.PORT, () => console.log('App listening on port 3000!'));

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
    var term = agent.parameters.searchphrase;
       var options = {
         uri: 'https://api.duckduckgo.com/?q=duckduckgo&format=json',
         json: true // Automatically parses the JSON string in the response
       };

       return new Promise( function( resolve, reject ){
         ddg.query( term, function( err, data ){
           if( err ){
             console.log(err);
             reject( err );
           } else {
             console.log(data);
              var answer = data.AbstractText;
          	  var imageUrl = data.Image;
          	  var source = data.AbstractSource;
            	var moreUrl = data.AbstractURL;
            	var heading = data.Heading;
            	agent.add(answer + ' Answer provided by DuckDuckGo and ' + source);
            	agent.end(new Card({
       	       title: heading,
        	       imageUrl: imageUrl,
        	       text: answer,
        	       buttonText: 'More about this',
        	       buttonUrl: moreUrl
        	     })
        	   	);
             // Put the previous body of your callback here, concluding with...
             resolve();
           }
         })
  }    );
  	//ddg.query(term, handle);
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
}
