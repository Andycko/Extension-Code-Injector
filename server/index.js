import { http_server } from "./http_server.js";
import ws_server from "./ws_server.js";

// Start the server
const PORT = process.env.PORT || 3000;

ws_server(http_server);
http_server.listen(PORT, () => {
    console.log(`HTTP Server running on http://localhost:${PORT}`);
    console.log(`WebSocket Server running on ws://localhost:${PORT}`);
});

