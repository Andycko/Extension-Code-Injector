import {WebSocketServer} from 'ws';
import {v4 as uuidv4} from 'uuid';


export let CLIENTS = [];
export default (http_server) => {

    // Create a new WebSocketServer instance.
    const wss = new WebSocketServer({server: http_server});

    wss.on('connection', function connection(ws) {
        /**
         * If the WebSocket instance does not have a userId property or if there is no client in the CLIENTS array with the same userId,
         * assign a new UUID to the userId property of the WebSocket instance and add it to the CLIENTS array.
         */
        if (!ws.userId || !CLIENTS.find((item) => item.userId === ws.userId)) {
            ws.userId = uuidv4();
            CLIENTS.push(ws);
            console.log("Client Connect: " + ws.userId + ". " + CLIENTS.length + " Online")
        }

        // Mark the current WebSocket instance as alive.
        ws.isAlive = true;

        // Event listener for 'error' event. Logs any errors that occur.
        ws.on('error', console.error);

        /**
         * Event listener for 'close' event.
         * This event is emitted when the client connection is closed.
         * Removes the client from the CLIENTS array.
         */
        ws.on('close', function () {
            removeClient(ws);
        })

        /**
         * Event listener for 'pong' event.
         * This event is emitted in response to a 'ping' event.
         * Calls the heartbeat function to set the isAlive property of the WebSocket instance to true.
         */
        ws.on('pong', heartbeat);
    });

    /**
     * Event listener for 'close' event.
     * This event is emitted when the WebSocket server is closed.
     * Clears the interval set by setInterval.
     */
    wss.on('close', function close() {
        clearInterval(interval);
    });

    /**
     * Set an interval to ping all clients every 10 seconds.
     * If a client does not respond with a 'pong' event, terminate the client connection.
     */
    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 10000);

    /**
     * Function to set the isAlive property of the WebSocket instance to true.
     */
    function heartbeat() {
        this.isAlive = true;
    }

    /**
     * Function to remove a client from the CLIENTS array.
     * @param {Object} ws - The WebSocket instance representing the client connection.
     */
    function removeClient(ws) {
        CLIENTS = CLIENTS.filter((client) => {
            return client.userId !== ws.userId
        })
        console.log("Client Disconnect: " + ws.userId + ". " + CLIENTS.length + " Online")
    }
}
