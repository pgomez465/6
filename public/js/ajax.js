function getRooms() {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {   // XMLHttpRequest.DONE == 4
            var result = JSON.parse(xmlhttp.responseText);

            var html = "";
            for (var i = 0; i < result.length; ++i) {
                var name = result[i].room_name;
                var id = result[i].room_id;

                html += "<option value=" + id + ">";
                html += name;
                html += "</option>";
            }

            document.getElementById("rooms").innerHTML = html;
        }
    };
    xmlhttp.open("GET", "/getRooms", true);
    xmlhttp.send();
}

function joinRoom() {
    var hostId = document.getElementById("hostId").innerHTML;
    var roomSelect = document.getElementById("rooms");

    var currentRoomId = roomSelect.options[roomSelect.selectedIndex].value;
    console.log("Current Room: " + currentRoomId);

    var xmlhttp = new XMLHttpRequest();

     xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {   // XMLHttpRequest.DONE == 4
            console.log("Successfully added host to room");
        }
        else if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status != 200) {
            console.log("Host was not added to room");
        }
    };
    xmlhttp.open("POST", "/addHostToRoom", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("roomId=" + currentRoomId + "&hostId=" + hostId);
}

function createRoom() {
    var xmlhttp = new XMLHttpRequest();

    var roomName = prompt("Enter the room name:");

     xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {   // XMLHttpRequest.DONE == 4
            console.log("Successfully created room");
            getRooms();
        }
        else if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status != 200) {
            console.log("Host was not added to room");
        }
    };
    xmlhttp.open("POST", "/addRoom", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("name=" + roomName);
}

function addHost() {
    var hostName = document.getElementById("hostName").innerHTML;

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {   // XMLHttpRequest.DONE == 4
            var object = JSON.parse(this.responseText);
            document.getElementById("hostId").innerHTML = object.host_id;
            console.log("Successfully added host");
            console.log("Response:" + this.responseText);

            // Send Initial setup message for WebSocket Connection
            prepare();
        }
        else if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status != 200) {
            console.log("Host was not added");
        }
    };

    console.log("Name: " + hostName);
    xmlhttp.open("POST", "/addHost", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("name=" + hostName);
}

function removeHost() {
    var hostId = document.getElementById("hostId").innerHTML;

    serverConnection.onclose = function(){};
    serverConnection.close();

    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status == 200) {   // XMLHttpRequest.DONE == 4
            console.log("Host was removed successfully");
        }
        else if (xmlhttp.readyState == XMLHttpRequest.DONE && xmlhttp.status != 200) {
            console.log("Host was unable to be removed");
        }
    };

    xmlhttp.open("DELETE", "/removeHost", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("hostId=" + hostId);

}