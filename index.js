require("dotenv").config();
const express = require("express");
const app = express();
const port = 8080;
const bodyParser = require("body-parser");
const cors = require("cors");

const { Server } = require("socket.io");
const http = require("http");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    // allowedHeaders: ["my-custom-header"],
  },
});

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

const {
  createConversation,
  addParticipantToConversation,
  sendMessageToParticipant,
  listAllMessagesWithParticpant,
  deleteConversation
} = require("./middleware/conversations");

app.get("/", (req, res) => {
  res.send("Arrow Plumbing Messaging API working!");
});

// twilioNumber, participantNumber
app.post(
  "/create-conversation",
  createConversation,
  addParticipantToConversation,
  (req, res) => {
    const { conversationSid } = res.locals;
    console.log("conversationSid", conversationSid)
    res.json({ conversationSid: conversationSid });
  }
);

app.post("/send-message", sendMessageEvan, (req, res) => {
  res.json({ status: "success" });
});

// converstaionId
/*
app.post("/send-message", sendMessageToParticipant, (req, res) => {
  res.json({ status: "success" });
});
*/

app.post('/sms', createConversation, listAllMessagesWithParticpant, (req, res) => {
  const twiml = new MessagingResponse();

  twiml.message('The Robots are coming! Head for the hills!');

  res.type('text/xml').send(twiml.toString());
});

app.post("/list-messages", listAllMessagesWithParticpant, (req, res) => {
  const { messages, particpantId } = res.locals;
  res.json(messages)
  // res.end("test");
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

app.post("/new-message", (req, res) => {
  // const { newMessage } = req.body;

  console.log("RECIEVED MESSAGE: ",req.body)
  io.emit("new-message", req.body);
  res.end("end of new message");
});

app.delete("/delete-conversation", deleteConversation, (req, res) => {
  const { conversationSid } = res.locals;
  res.end(`Conversation '${conversationSid}' deleted successfully`)
});

server.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
