import { WebSocketServer } from 'ws';

export const CLIENTS = new Set();
export default (http_server) => {
    const wss = new WebSocketServer({server: http_server});

    wss.on('connection', function connection(ws) {
        ws.on('error', console.error);

        ws.uid = Math.random().toString(36).substring(7);
        CLIENTS.add(ws);

        const message = {
            type: 'HELLO',
            data: 'Hello, World!'
        }
        ws.send(JSON.stringify(message));
    });
}
