const WebSocket = require('ws');
const express = require('express');
const app = express();

const db = require('./database/database');

const PORT = process.env.PORT || 5000;

// Use Express for static pages
var server = app.use(express.static('public'))
                .use(express.json())
                .use(express.urlencoded({extended:true}))
                .get("/getHosts", db.getHosts)
                .get("/getRooms", db.getRooms)
                .post("/addHost", db.addHost)
                .post("/addRoom", db.addRoom)
                .post("/addHostToRoom", db.addHostToRoom)
                .delete("/removeHost", db.removeHost)
                .listen(PORT);

console.log("Listening for connections on port " + PORT + "...");


class Clients {
    constructor() {
        this.clientList = {};
        this.saveClient = this.saveClient.bind(this);
    }

    saveClient(id, client) {
        this.clientList[id] = client;
    }

    removeClient(id) {
        delete this.clientList[id];
    }
}

// Create variable to keep track of WSS clients
var clients = new Clients();

// Use web sockets for signaling
var wss = new WebSocket.Server({ server: server, pingtimeout: 60000});

// Handler for incoming connections
wss.on('connection', function(socket) {
    socket.on('message', function(message) {
        const signal = JSON.parse(message);

        // Save the client to be used later
        clients.saveClient(signal.hostId, socket);

        console.log("Message from host " + signal.hostId + ": " + message);

        // Broadcast just the ice/sdp message
        if (signal.ice) {
            broadcastToRoomMembers(signal.hostId, message);
        }
        else if (signal.sdp) {
            broadcastToRoomMembers(signal.hostId, message);
        }
        else if (signal.setup) {

            console.log("Received initial setup message from hostId " + signal.hostId);
        }
        else {
            console.log("ERROR in JSON Parse WebSockets Connection: " + message);
        }
    });
});

function broadcastToRoomMembers(id, message) {
    db.getHostIdsInRoom(id, clients, message);
}