const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));

// Basic route
app.get('/', (req, res) => {
    res.send('SMS Bot Server Running! 🤖');
});

// TWILIO WEBHOOK HANDLER (This is where the magic happens)
app.post('/webhook', (req, res) => {
    const incomingMessage = req.body.Body;
    const fromNumber = req.body.From;
    
    console.log(`Received: "${incomingMessage}" from ${fromNumber}`);
    
    // Process the message and get bot response
    const botResponse = handleMessage(incomingMessage);
    
    // Send SMS reply
    twilioClient.messages
        .create({
            body: botResponse,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: fromNumber
        })
        .then(message => {
            console.log(`Sent reply: "${botResponse}"`);
            res.sendStatus(200);
        })
        .catch(err => {
            console.error('Error sending SMS:', err);
            res.sendStatus(500);
        });
});

// Bot message processing function
function handleMessage(message) {
    const msg = message.toLowerCase().trim();
    
    if (msg.includes('weather')) {
        return ' Weather feature coming soon!';
    } else if (msg.includes('joke')) {
        return 'Why don\'t scientists trust atoms? Because they make up everything!';
    } else if (msg.includes('hello') || msg.includes('hi')) {
        return 'Hello! Try texting "weather" or "joke"';
    } else {
        return ' I didn\'t understand that. Try "weather", "joke", or "hello"';
    }
}

// API route for dashboard
app.get('/api/messages', (req, res) => {
    res.json({ message: 'API endpoint ready' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Webhook URL: http://localhost:${PORT}/webhook`);
});                                                     