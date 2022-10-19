const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const createConversation = (req, res, next) => {
  console.log("CREATE CONVERSATION");
  if (!res.locals.conversationSid) {
    client.conversations.conversations
    .create({ friendlyName: 'Friendly Conversation' })
    .then((conversation) => {
      console.log(conversation)
      res.locals.conversationSid = conversation.sid;
      next();
    })
    .catch((err) => console.log("Error in 'createConversation' middleware: ", err));  
  }
};


const listAllMessagesWithParticpant = (req, res, next) => {
  console.log("listAllMessagesWithParticpant");

  if (res.locals.conversationSid) {
    client.conversations
    .conversations(res.locals.conversationSid)
    .messages.list({})
    .then((messages) => {
      console.log("Messages: ", messages);
      res.locals.messages = messages;
      res.locals.participantId;
    })
    .then(() => next())
    .catch((err) => console.log("Error in 'listAllMessagesWithParticpant' middleware: ", err));
  }
};

const addParticipantToConversation = (req, res, next) => {
  const { conversationSid } = res.locals;
  const { twilioNumber, participantNumber } = req.body;
  console.log("IN ADD PARTICIPANTS");
  client.conversations
    .conversations(conversationSid)
    .participants.create({
      "messagingBinding.address": "+13122610622",
      "messagingBinding.proxyAddress": "+16812983972",
    })
    .then((participant) => {
      console.log("INSIDE INSIDe", participant);
      console.log(participant.sid);
      res.locals.participantSid = participant.sid;
      next();
    })
    .catch((err) => console.log("Error in 'addParticipantToConversation' middleware: ", err));
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
    .catch((err) => console.log("Error in 'sendMessageToParticipant' middleware: ", err));
};



const deleteConversation = (req, res, next) => {
  const { conversationSid } = req.body;
  console.log('inside del', conversationSid)
  res.locals.conversationSid = conversationSid;

  client.conversations.conversations(conversationSid)
  .remove()
  .then(() => next())
  .catch((err) => console.log("Error in 'deleteConversation' middleware: ", err));
}

module.exports = {
  createConversation,
  addParticipantToConversation,
  sendMessageToParticipant,
  listAllMessagesWithParticpant,
  deleteConversation
};
