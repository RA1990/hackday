// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';
// import App from './App';
// import * as serviceWorker from './serviceWorker';

// ReactDOM.render(<App />, document.getElementById('root'));

// // If you want your app to work offline and load faster, you can change
// // unregister() to register() below. Note this comes with some pitfalls.
// // Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();
equire("dotenv").config();

const express = require("express"),
  bodyParser = require("body-parser"),
  request = require("request");

const client = redis.createClient();
const app = express();

// Starts server
app.listen(process.env.PORT, () => {
  console.log("Bot is listening on port " + process.env.PORT);
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

client.on("connect", function () {
  console.log("connected");
});

// leave in place to test if running
app.post("/", (req, res) => {
  let data = {
    form: {
      token: process.env.SLACK_AUTH_TOKEN,
      channel: "#bot",
      text: "Hi! I'm fully functional!",
    },
  };

  // post request to slack API
  request.post("https://slack.com/api/chat.postMessage", data, (error, response, body) => {
    res.json(); // sends message
  });
});

// events
// TODO: break out in to own file for events
app.post("/events", (req, res) => {
  console.log(req.body); // for debugging

  // event verification
  if (req.body.challenge) {
    res.send(req.body.challenge);
    res.end(); // end connection
  }

  /**
   * App Mention (when tacoBytes is called)
   */
  if (req.body.event && req.body.event.type === "app_mention") {
    const event = req.body.event;

    /**
     * Prepare data to be sent via API to Slack
     * @type {{form: {token: *, link_names: boolean, thread_ts: *, channel: (string|string), text: string}}}
     */
    let data = {
      form: {
        token: process.env.SLACK_AUTH_TOKEN,
        link_names: true,
        thread_ts: event.event_ts,
        channel: event.channel,
        text: `Hi! <@${event.user}>!`, // setting default text
      },
    };

    // Giving tacos - rough
    if (event.text && areThereTacos(event.text)) {
      const tacos = getTacos(event.text); // number of tacos in event
      console.log(tacos);

      const users = findAllUser(event.text); // find all users mentioned in event

      let messages = [];

      // if at least 2 users are found (bot and 1 user)
      if (users.length !== 0) {

        // Wrap as promise to make sure all data is ready
        // when we need it to send back
        new Promise((resolve, reject) => {

          users.forEach(user => {
            client.get(user, (err, value) => {
              if (err) return reject(err); // handle error

              let staleTacos = value; // assign value null | number

              // check if user trying to send self tacos
              if (event.user && isUserTacoThieving(user, event.user)) {

                // don't update their count, return message and current count
                messages.push(user + " nice try bad hombre! You still have " + staleTacos + " tacos! \n");
              } else {
                // checks if user is found, sets initial count if not,
                // updates count otherwise
                staleTacos = setTacos(staleTacos, tacos);

                // update database with number of tacos
                client.set(user, parseInt(staleTacos)); // update database

                messages.push(user + " now has a total of " + staleTacos + "! \n");
              }

              resolve();

            });
          });
        })
          .then(() => {
            console.log(messages); // for debugging

            // let user know how many tacos were sent
            data.form.text = `Sending ${tacos} taco(s) to ${users.join(", ")} \n\n`;

            // add all messages to text sent to user
            data.form.text += `${messages.join("")}`;

            request.post("https://slack.com/api/chat.postMessage", data, (error, response, body) => {
              res.json(); // sends message
              res.end(); // end connection
            });
          });

      }

    }
  }
});

/**
 * Get all users mentioned except the bot
 * @param str
 * @returns Array
 */
const findAllUser = str => str.match(/<(.*?)>/g).slice(1);

/**
 * Get number of tacos
 * @param str
 * @returns {number}
 */
const getTacos = str => parseInt(str.match(/:taco:/g).length);

/**
 * Check if even text has tacos
 * @param str
 * @returns {boolean}
 */
const areThereTacos = str => str.indexOf(":taco:") !== -1;

/**
 * Check if user is trying to give self tacos
 * @param users
 * @param user
 * @returns {boolean}
 */
const isUserTacoThieving = (users, user) => users.indexOf(`<@${user}>`) !== -1;

/**
 * Check if user key is found.
 * If not found, set initial taco count
 * else, update taco count to include fresh new tacos.
 *
 * @param staleTacos
 * @param tacos
 * @returns {number}
 */
const setTacos = (staleTacos, tacos) => staleTacos === null ? tacos : parseInt(staleTacos) + parseInt(tacos);
