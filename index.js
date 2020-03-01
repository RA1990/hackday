const { WebClient } = require('@slack/web-api');
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = 'xoxb-975761698608-965711426673-9t9X8LZsALTHwJpVJ5NaitJs';

const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = 'C1232456';


app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.send('hello world')
  //console.log(req)
})

app.post('/', async function (req, res) {
  res.send(req.body.challenge)
  console.log(req.body)
  if(req.body.event.type == 'member_joined_channel') {
    const test = await web.users.info({user: req.body.event.user});
    console.log(test);
    await web.chat.postMessage({ channel: 'hackathon', text: 'Hello there new user ' + test.user.real_name });
  }
  else {
    await web.chat.postMessage({ channel: 'general', text: 'Hello there' });
  }

})
//https://slack.com/api/users.info?token=xoxb-975761698608-965711426673-9t9X8LZsALTHwJpVJ5NaitJs&user=UUPNDLJKS&pretty=1


app.listen(3000)