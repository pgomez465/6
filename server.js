const WebSocket = require('ws');

const PORT = process.env.PORT || 5000;
var wss = new WebSocket.Server({port:PORT});

console.log("Listening for connections on port " + PORT + "...");

wss.broadcast = function(data) {
    console.log("in broadcast");

    this.clients.forEach((client) => {
        console.log("sending...");
        client.send(data);
    });
};

wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received');
        // console.log('received: %s', message);
        wss.broadcast(message);
    });
});