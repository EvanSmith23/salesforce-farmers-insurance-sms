require('dotenv').config();
const express = require('express')
const session = require('express-session');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express(); 

const { MessagingResponse } = require('twilio').twiml;

const {
    sendMessageToEvan,
    sendMessageFromEvan,
    createConversation,
    addParticipantToConversation,
    sendMessageToParticipant,
    listAllMessagesWithParticpant,
    deleteConversation
  } = require("./middleware/conversations");

app.enable('trust proxy');
app.use(helmet());
app.use(cors());
app.set('json spaces', 40);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // for parsing application/json

app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
      cookie: { sameSite: 'none', secure: false, maxAge: 3600000 },
    })
);

// Remove X-Frame-Options to allow for rendering in an Iframe
app.use((req, res, next) => {
    res.removeHeader('X-Frame-Options');
    next();
});

// Logs every incoming HTTP requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} over ${req.protocol}`);
    next();
});

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    console.log(req.body)
    console.log("From: ", req.body.From)
    console.log("Body: ", req.body.Body)

    if (req.body.Body == "Hey"){
        twiml.message('How can I help you today? Text 1 to Pay My Bill. Text 2 to Add Driver. Text 3 to Remove Driver. Text 4 to Add Vehicle. Text 5 to Remove Vehicle.');
    }

    res.type('text/xml').send(twiml.toString());
});

app.get("/", (req, res) => {
    res.send("Farmers Insurance SMS!");
});

// Catch any promise rejections
process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise ' + p + ' reason: ' + reason);
});

app.listen(PORT, () => {
    console.log('Server running at port:' + PORT);
});