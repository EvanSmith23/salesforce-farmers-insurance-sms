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

app.use(bodyParser.json());
app.use(cors());

const {
  createConversation,
  addParticipantToConversation,
  sendMessageToParticipant,
  listAllMessagesWithParticpant,
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
    res.end(conversationSid);
  }
);

// converstaionId
app.post("/send-message", sendMessageToParticipant, (req, res) => {
  console.log("test");
  res.end("message has been sent");
});

app.post("/list-messages", listAllMessagesWithParticpant, (req, res) => {
  const { messages } = res.locals;
  res.end({ "messages" : messages })
  // res.end("test");
});

io.on("connection", (socket) => {
  console.log("a user connected");
});

app.post("/new-message", (req, res) => {
  // const { newMessage } = req.body;
  console.log(req.body)
  io.emit("new-message", req.body);
  res.end("end of new message");
});

server.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
