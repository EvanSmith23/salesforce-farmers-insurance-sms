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


const listAllMessagesWithParticpant = async (conversationSid) => {
  console.log("LIST ALL MESSAGES");

  if (conversationSid) {
    await client.conversations
    .conversations(conversationSid)
    .messages.list({})
    .then((messages) => {
      console.log("Messages: ", messages);
      res.locals.messages = messages;
      res.locals.participantId;
    })
    .catch((err) => console.log("Error in 'listAllMessagesWithParticpant' middleware: ", err));
  }

  return;
};

// MBc6c91ee2369d4e5081e81457feeb31bc
const sendMessageToParticipant = async (conversationSid, body) => {
  console.log("ADD MESSAGE TO CONVERSATION");

  if (conversationSid) {
    await client.conversations.conversations(conversationSid).messages.create({ body: body })
    .catch((err) => console.log("Error in 'sendMessageToParticipant' middleware: ", err));
  }

  return;
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
  sendMessageToParticipant,
  listAllMessagesWithParticpant,
  deleteConversation
};
