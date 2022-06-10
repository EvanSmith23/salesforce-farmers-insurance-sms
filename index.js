const express = require('express')
const app = express()
const port = 8080
require('dotenv').config();
const bodyParser = require('body-parser')
const cors = require('cors')
app.use(bodyParser.json());
app.use(cors());

const { createConversation, addParticipantToConversation, sendMessageToParticipant, listAllMessagesWithParticpant } = require("./middleware/conversations");

app.get('/', (req, res) => {
  res.send('Arrow Plumbing Messaging API working!')
})

// twilioNumber, participantNumber
app.post('/create-conversation', createConversation, addParticipantToConversation, (req,res) => {
  const { conversationSid } = res.locals;
  res.end(conversationSid)
});

// converstaionId
app.post('/send-message', sendMessageToParticipant, (req,res) => {
  console.log("test")
  res.end("message has been sent");
});

app.post('/list-messages', listAllMessagesWithParticpant, (req, res) => {
  res.end("test");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})