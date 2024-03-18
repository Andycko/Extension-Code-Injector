import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';


export let CLIENTS = [];
export default (http_server) => {
    const wss = new WebSocketServer({server: http_server});

    wss.on('connection', function connection(ws) {
        if (!ws.userId || !CLIENTS.find((item) => item.userId === ws.userId)) {
            ws.userId = uuidv4();
            CLIENTS.push(ws);
            console.log("Client Connect: " + ws.userId + ". " + CLIENTS.length + " Online")
        }

        ws.isAlive = true;

        ws.on('error', console.error);
        ws.on('close', function () {
            removeClient(ws);
        })
        ws.on('pong', heartbeat);
    });

    wss.on('close', function close() {
        clearInterval(interval);
    });

    const interval = setInterval(function ping() {
        wss.clients.forEach(function each(ws) {
            if (ws.isAlive === false) return ws.terminate();

            ws.isAlive = false;
            ws.ping();
        });
    }, 10000);


    function heartbeat() {
        this.isAlive = true;
    }

    function removeClient(ws) {
        CLIENTS = CLIENTS.filter((client) => {
            return client.userId !== ws.userId
        })
        console.log("Client Disconnect: " + ws.userId + ". " + CLIENTS.length + " Online")
    }
}
