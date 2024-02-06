import { WebSocketServer } from 'ws';

export const CLIENTS = new Set();
export default (http_server) => {
    const wss = new WebSocketServer({server: http_server});

    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);

        CLIENTS.add(ws);

        ws.send('console.log("Hello, World!")');
    });
}
