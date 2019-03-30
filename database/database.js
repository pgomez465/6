const pg = require('pg');
const connectionString = process.env.DATABASE_URL || "postgres://postgres:admin@localhost:5432/postgres";

function getRooms(request, response) {
    var client = new pg.Client(connectionString);
    console.log("Connecting with " + connectionString);
    client.connect(dbConnectionError);

    client.query('SELECT * FROM room;')
        .then(res => response.json(res.rows))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function getHosts(request, response) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('SELECT * FROM host;')
        .then(res => response.json(res.rows))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function addHost(request, response) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('INSERT INTO host VALUES (DEFAULT, $1, NULL) RETURNING host_id;', [request.body.name])
        .then(res => response.json(res.rows[0]))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function addRoom(request, response) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('INSERT INTO room VALUES (DEFAULT, $1);', [request.body.name])
        .then(res => response.json(res.rows))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function addHostToRoom(request, response) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('UPDATE host SET room_id = $1 WHERE host_id = $2;', [request.body.roomId, request.body.hostId])
        .then(res => response.json(res.rows))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function removeHost(request, response) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('DELETE FROM host WHERE host_id = $1;', [request.body.hostId])
        .then(res => response.json(res.rows))
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function dbConnectionError(error) {
    if (error) {
        console.error("Error connecting to DB: " + error);
    }
    else {
        console.log("Successfully connected to DB");
    }
}

// Non-Endpoint function
function getHostIdsInRoom(hostId, clients, message) {
    var client = new pg.Client(connectionString);
    client.connect();

    client.query('SELECT host_id FROM host WHERE room_id = (SELECT room_id FROM host WHERE host_id = $1) AND host_id != $1;', [hostId])
        .then(res => {
            console.log(res.rows);
            var ids = [];

            // Get the hostIds of hosts that need the message (in the same room)
            for (var i = 0; i < res.rows.length; ++i) {
                ids.push(res.rows[i].host_id.toString());
            }

            // Broadcast messages only to clients within the same room
            var keys = Object.keys(clients.clientList);
            console.log("Available clients: " + JSON.stringify(keys));

            for (var i = 0; i < keys.length; ++i) {

                // Check for closed connections and remove them
                if (clients.clientList[keys[i]].readyState == clients.clientList[keys[i]].CLOSED) {
                    console.log("remove hostId: " + keys[i]);
                    clients.removeClient(keys[i]);
                    continue;
                }

                // If the list of ids includes the current client, then send the message
                if (ids.includes(keys[i])) {
                    console.log("Sending message to host with id: " + keys[i])
                    console.log("Here is the message: " + message);
                    clients.clientList[keys[i]].send(message);
                }
            }

        })
        .then(res => client.end(closeError))
        .catch(e => console.error(e.stack));
}

function closeError(err) {
    if (err) throw err;
}

module.exports = {
    getRooms: getRooms,
    getHosts: getHosts,
    addRoom: addRoom,
    addHost: addHost,
    addHostToRoom: addHostToRoom,
    removeHost: removeHost,
    getHostIdsInRoom: getHostIdsInRoom
}