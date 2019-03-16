'use strict';
var localStream;
var localVideo;
var remoteVideo;
var peerConnection;
var peerConnectionConfig = {'iceservers': [{'url': 'stun:stun.services.mozilla.com'}, {'url': 'stun:stun.l.google.com:19302'}]};
var serverConnection;

function start(isCaller) {
    peerConnection = new RTCPeerConnection(peerConnectionConfig);
    peerConnection.onicecandidate = gotIceCandidate;
    peerConnection.onaddstream = gotRemoteStream;
    peerConnection.addStream(localStream);

    if (isCaller) {
        peerConnection.createOffer(gotDescription, (error) => {console.log(error);});
    }
}

function gotIceCandidate(event) {
    if (event.candidate != null) {
        serverConnection.send(JSON.stringify({'ice': event.candidate}));
    }
}

function gotRemoteStream(event) {
    console.log('got remote stream');
    remoteVideo.srcObject = event.stream;
}

function gotDescription(description) {
    console.log('Got Description');
    peerConnection.setLocalDescription(description, function() {
        serverConnection.send(JSON.stringify({'sdp': description}));
    }, function() {console.log('Set Description Error')});
}

function gotMessageFromServer(message) {
    console.log("Got message from server");
    if (!peerConnection) {
        start(false);
    }

    var signal = JSON.parse(message.data);
    if (signal.sdp) {
        peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp), function() {
            if(signal.sdp.type == 'offer') {
                peerConnection.createAnswer(gotDescription, (error) => {console.log(error);});
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

    serverConnection = new WebSocket('ws://murmuring-wave-91490.herokuapp.com/');
    serverConnection.onmessage = gotMessageFromServer;

    const constraints = {video: true};

    navigator.mediaDevices.getUserMedia(constraints)
        .then(videoSuccess)
        .catch(videoError);
}

function videoSuccess(mediaStream) {
    localStream = mediaStream;
    localVideo.srcObject = mediaStream;
}

function videoError(error) {
    console.log("Error with getUserMedia: " + error);
}
