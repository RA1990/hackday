const { WebClient } = require('@slack/web-api');

// Read a token from the environment variables
const token = `xoxb-975761698608-975853168373-lyuNBGp489CnM3UMxYkimUZo`;

// Initialize
const web = new WebClient(token);
const conversationId = '...';

(async () => {

  // Post a message to the channel, and await the result.
  // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
  const result = await web.chat.postMessage({
    text: 'Hello world!  🔥',
    channel: `#general`,
  });

  // The result contains an identifier for the message, `ts`.
  console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
})();

// const express = require("express"),
//   bodyParser = require("body-parser"),
//   request = require("request");

// const app = express();

// // Starts server
// app.listen(`http://localhost:3000/`, () => {
//   console.log("Bot is listening on port " + `http://localhost:3000/`);
// });

// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// client.on("connect", function () {
//   console.log("connected");
// });

// // leave in place to test if running
// app.post("/", (req, res) => {
//   let data = {
//     form: {
//       token: `process.env.SLACK_AUTH_TOKEN`,
//       channel: "#bot",
//       text: "Hi! I'm fully functional!",
//     },
//   };
