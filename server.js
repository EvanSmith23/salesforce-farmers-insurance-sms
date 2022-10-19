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
    addMessageToConversation,
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

let responses = [
    "You want to add a new vehicle to your policy, is that correct? Y/N",
    "Do you have the vehicles VIN Number? Y/N",
    "Please enter the vehicles VIN Number",
    "Is this vehicle a White 2022 Honda Pilot? Y/N",
    "What is the purchase price of the vehicle?",
    "Your new six monthly premium will be $1508, Do you accept?",
    "This vehicle has been added to your policy! Is there anything else I can help you with?",
    "Let me transfer you to a Customer Service Rep",
    "This is Tim Service, I see you want to change payment terms from Semi-Annually to Monthly. The new monthly cost will be $283.61 Does that work for you?",
    "I have made the change, you are all set. Is there anything else I can help you with?"
]

app.post('/sms', createConversation, async (req, res) => {
    let counter = req.session.counter || 0;

    console.log("Before: ", req.session.counter);

    const twiml = new MessagingResponse();

    if (req.body.Body == "Reset"){
        req.session.counter = 0;

        await twiml.message("Reset");

        await res.type('text/xml').send(twiml.toString());
    } else {
        await twiml.message(responses[counter]);

        req.session.counter = counter + 1;

        await res.type('text/xml').send(twiml.toString());
    }

    console.log("After: ", req.session.counter);
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