'use strict';

var localStream;
var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceservers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
var serverConnection;

function makeCall() {
    peerConnection.createOffer(gotDescription, (error) => { console.log("create offer error: " + error);});
}

function resetConn() {
    peerConnection.onclose = function(){};
    peerConnection.close();

    serverConnection.onclose = function(){};
    serverConnection.close();
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        var hostId = document.getElementById("hostId").innerHTML;
        console.log("sending ice");
        serverConnection.send(JSON.stringify({"hostId": hostId, "ice": event.candidate}));
    }
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.srcObject = event.stream;
}

function gotDescription(description) {
    var hostId = document.getElementById("hostId").innerHTML;

    console.log('Got Description');
    peerConnection.setLocalDescription(description, function() {
        console.log("sending sdp");
        serverConnection.send(JSON.stringify({"hostId": hostId, 'sdp': description}));
    }, function() {console.log('Set Description Error')});
}

function gotMessageFromServer(message) {
    console.log("Got message from server: " + message);

    var signal = JSON.parse(message.data);

    if (!peerConnection) {
        start(false);
    }

    if (signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function () {
            if (signal.sdp.type == 'offer') {
                peerConnection.createAnswer(gotDescription, (error) => {
                    console.log('received offer: ' + error);
                });
            }
        });
    }
    else if (signal.ice) {
        peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice));
    }
}

function prepare() {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
    var hostId = document.getElementById('hostId').innerHTML;

    var url = location.origin.replace(/^http/, 'ws');

    serverConnection = new WebSocket(url);
    serverConnection.onmessage = gotMessageFromServer;
    serverConnection.onopen = () => {serverConnection.send(JSON.stringify({"hostId" : hostId, "setup" : true})); console.log("sending setup")};

    const constraints = {video: true/*, audio: true*/};

    navigator.mediaDevices.getUserMedia(constraints)
        .then(videoSuccess)
        .catch(videoError);
}

function videoSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;

    // create peer connection setup
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);
}

function videoError(error) {
    console.log("Error with getUserMedia: " + error);
    alert("Error!\nYou do not have a camera and/or a microphone to use the video chat. Please connect and refresh the page.");
}
