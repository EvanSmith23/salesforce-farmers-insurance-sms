const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const createConversation = (req, res, next) => {
  console.log("CREATE CONVERSATIOn");
  client.conversations.conversations
    .create({ friendlyName: "My First Conversation" })
    .then((conversation) => {
      console.log(conversation.sid);
      res.locals.conversationSid = conversation.sid;
      next();
    });
};

const addParticipantToConversation = (req, res, next) => {
  const { conversationSid } = res.locals;
  const { twilioNumber, participantNumber } = req.body;
  console.log("IN ADD PARTICIPANTS");
  client.conversations
    .conversations(conversationSid)
    .participants.create({
      "messagingBinding.address": participantNumber,
      "messagingBinding.proxyAddress": twilioNumber,
    })
    .then((participant) => {
      console.log("INSIDE INSIDe", participant);
      console.log(participant.sid);
      res.locals.participantSid = participant.sid;
      next();
    })
    .catch((err) => console.log("ERR", err));
};
// MBc6c91ee2369d4e5081e81457feeb31bc
const sendMessageToParticipant = (req, res, next) => {
  const { conversationSid, messageBody } = req.body;
  console.log("INSIDE SEND MESSAGE");
  client.conversations
    .conversations(conversationSid)
    .messages.create({ body: messageBody })
    .then((message) => {
      console.log(message.sid);
      console.log("INSIDE SEND MESSAGE");
    })
    .then(() => next())
    .catch((err) => console.log("ERR", err));
};

const listAllMessagesWithParticpant = (req, res, next) => {
  const { conversationSid } = req.body;
  client.conversations
    .conversations(conversationSid)
    .messages.list({ limit: 20 })
    .then((messages) => messages.forEach((m) => console.log(m.body)))
    .then(() => next())
    .catch((err) => console.log("ERR", err));
};

module.exports = {
  createConversation,
  addParticipantToConversation,
  sendMessageToParticipant,
  listAllMessagesWithParticpant,
};
