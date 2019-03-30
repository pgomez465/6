'use strict';

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

var localStream;
var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceservers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
var serverConnection;

function makeCall() {
    var hostId = document.getElementById("hostId").innerHTML;

    peerConnection.createOffer((description) => {
        peerConnection.setLocalDescription(description, () => {
            serverConnection.send(JSON.stringify({"hostId": hostId, "sdp": description}));
        }, () => { console.log('Set Description Error')});
    }
    ,(error) => {
        console.log('sending offer: ' + error);
    });
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        var hostId = document.getElementById("hostId").innerHTML;
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

    // const localUrl = 'ws://127.0.0.1:5000';
    const remoteUrl = 'wss://murmuring-wave-91490.herokuapp.com';

    serverConnection = new WebSocket(remoteUrl);
    serverConnection.onmessage = gotMessageFromServer;

    const constraints = {video: true};

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

    var hostId = document.getElementById("hostId").innerHTML;

    serverConnection.send(JSON.stringify({"hostId" : hostId, "setup" : true}));
}

function videoError(error) {
    console.log("Error with getUserMedia: " + error);
}
