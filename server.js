const WebSocket = require('ws');
const express = require('express');
const app = express();

const PORT = process.env.PORT || 5000;

// Use Express for static pages
var server = app.use(express.static('public')).listen(PORT);
console.log("Listening for connections on port " + PORT + "...");

// Use web sockets for signaling
var wss = new WebSocket.Server({ server: server});

// Broadcast message to all clients connected to server
wss.broadcast = function(data) {
    this.clients.forEach((client) => {
        console.log("sending")
        client.send(data);
    });
};

// Handler for incoming connections
wss.on('connection', function(ws) {
    ws.on('message', function(message) {
        console.log('received');
        wss.broadcast(message);
    });
});