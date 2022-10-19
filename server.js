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


/*
SMS Flow
    Q: How can I help you today? Text 1 to Pay My Bill. Text 2 to Add Driver. Text 3 to Remove Driver. Text 4 to Add Vehicle. Text 5 to Remove Vehicle.
    A: 4
    Q: Do you have the vehicles VIN Number? Text 1 for Yes. Text 2 for No.
    A: 1
    Q: Please enter the vehicles VIN Number
    A: 23sf0sdfj450jga
    Q: This vehicle has been added to your policy!
    Q: Is there anything else I can help you with? Text 1 to Pay My Bill. Text 2 to Add Driver. Text 3 to Remove Driver. Text 4 to Add Vehicle. Text 5 to Remove Vehicle.
    A: 2
    Q: Please Enter the New Drivers Full Name
    A: Rachel Morris
    Q: Please Enter the New Drivers Date of Birth
    A: Enter DOB
    Q: Please Enter the Driver License State
    A: Enter State
    Q: Please Enter Driver License Number
    A: Enter Number
    Q: You're new quote is $4560
    Q: Any thing else I can help you with?
    A: Can i pay monthly
    Q: Yes - let me transfer you to a Customer Service Rep
    Q: This is Tim Service, I see you want to change payment terms from Semi-Annually to Monthly. The new monthly cost will be "$283.61" Does that work for you?
    A: Yes
    Q: Is there anything else I can help you with?
    A: Nope
*/

app.post('/sms', 
    createConversation,
    //addParticipantToConversation,
    listAllMessagesWithParticpant, 
    (req, res) => {
    const twiml = new MessagingResponse();

    console.log(req.body)
    console.log("From: ", req.body.From)
    console.log("Body: ", req.body.Body);

    sendMessageToParticipant(res.locals.convsersationSID, req.body.Body);


    console.log(res.locals.messages);

    if (req.body.Body == "Hey"){
        twiml.message("How can I help you today? Text 1 to Pay My Bill. Text 2 to Add Driver. Text 3 to Remove Driver. Text 4 to Add Vehicle. Text 5 to Remove Vehicle.");
    } else if (req.body.Body == "4") {
        twiml.message("Do you have the vehicles VIN Number? Text 1 for Yes. Text 2 for No.");
    } else if (req.body.Body == "1") {
        twiml.message("Please enter the vehicles VIN Number");
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