import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import socket from 'socket.io';


const peerChat = () => {
    var socket = io();
    socket.on('news', function (data) {
      console.log(data);
      socket.emit('my other event', { my: 'data' });
    });
 
        // var myVideoArea = document.querySelector("#myVideoTag");
        // var theirVideoArea = document.querySelector("#theirVideoTag");
        // var myName = document.querySelector("#myName");
        // var myMessage = document.querySelector("#myMessage");
        // var sendMessage = document.querySelector("#sendMessage");
        // var chatArea = document.querySelector("#chatArea");
        // var signalingArea = document.querySelector("#signalingArea")
        // var ROOM = "chat";
        // var SIGNAL_ROOM = "signal_room";
        // var configuration = {
        //     'iceServers': [{
        //         'url': 'stun:stun.l.google.com:19302'
        //     }]
        // };
        // var rtcPeerConn; 
        // io = io.connect();
        // io.emit('ready', {"chat_room": ROOM, "signal_room": SIGNAL_ROOM});
        // io.emit('signal', {"type": "user_here", "message": 'Are you ready for a call?', "room": SIGNAL_ROOM});
        // io.on('signaling_message', function(data) {
        //     displaySignalMessage("Signal received: " + data.type);
        //     //Setup the RTC Peer connection object
        //     if(!rtcPeerConn)
        //         startSignaling();
        //     if(data.type !== "user_here"){
        //         var message = JSON.parse(data.message);
        //         if(message.sdp) {
        //             rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
        //                 //if we received an offer, we need to answer
        //                 if (rtcPeerConn.remoteDescription.type === 'offer') {
        //                     rtcPeerConn.createAnswer(sendLocalDesc, logError);
        //                 }
        //             }, logError);
        //         }
        //         else { 
        //             rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
        //         }
        //     }
        // });
        // function startSignaling(){
        //     displaySignalMessage("starling signaling...");
        //     rtcPeerConn = new webkitRTCPeerConnection(configuration);
        //     //send  any ice candidates to the other peer
        //     rtcPeerConn.onicecandidate = function(evt) {
        //         if(evt.candidate)
        //                 io.emit('signal', {"type":"ice candidate", "message": JSON.stringify({
        //                     'candidate': evt.candidate}), "room": SIGNAL_ROOM});
        //         displaySignalMessage("completed that ice candidate...");
        //     };
        //     //let the 'negotiationneeded' event trigger offer generation
        //     rtcPeerConn.onnegotiationneeded = function(){
        //         displaySignalMessage("on negotiation called");
        //         rtcPeerConn.createOffer(sendLocalDesc, logError);
        //     }
        //     //once remote stream arrives, show it in the remote video element
        //     rtcPeerConn.onaddstream = function(evt) {
        //         displaySignalMessage("going to add their stream");
        //         theirVideoArea.src = URL.createObjectURL(evt.stream);
        //     }
        //     //get a local stream, show it in our video tag and add it to be sent
        //     navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        //     navigator.getUserMedia({
        //         'audio': true,
        //         'video': {
        //             mandatory:{
        //                 maxWidth: 640,
        //                 minWidth: 640,
        //                 maxHeight: 480,
        //                 minHeight: 480
        //             }
        //         }
        //     }, function(stream){
        //         displaySignalMessage("going to display my stream...");
        //         myVideoArea.src = URL.createObjectURL(stream);
        //         rtcPeerConn.addStream(stream);
        //     }, logError)
        // }
        // function sendLocalDesc(desc){
        //     rtcPeerConn.setLocalDescription(desc, function() {
        //         displayMessage("sending local description");
        //         io.emit('signal', {"type": "SDP", "message": JSON.stringify({ 'sdp': 
        //             rtcPeerConn.localDescription}), "room": SIGNAL_ROOM});
        //     }, logError);
        // }
        // function logError(error){
        //     displaySignalMessage(error.name + ':' + error.message)
        // }
        // io.on('announce', function(data){
        //     displayMessage(data.message);
        // });
        // io.on('message', function(data){
        //     displayMessage(data.author + ": " + data.message);
        // });
        // function displayMessage(message) {
        //     chatArea.innerHTML = chatArea.innerHTML + "</br>" + message;
        // }
        // function displaySignalMessage(message) {
        //     signalingArea.innerHTML = signalingArea.innerHTML + "</br>" + message;
        // }
        // sendMessage.addEventListener('click', function(ev){
        //     io.emit('send', {"author": myName.value, "message": myMessage.value, "room": ROOM});
        //     ev.preventDefault();
        // }, false)


    return (
        <div>
            <video id="myVideoTag" autoplay> </video>
            <video id="theirVideoTag" autoplay> </video>

            <div>
                <label>Your Name</label> <input id="myName" type="/text" />
                <label>Message</label> <input id="myMessage" type="/text" />
                <input id="sendMessage" type="submit" />
                <div id="chatArea" >Message Output:</div>
                <div id="signalingArea">Signaling Messages:</div>
            </div>
        </div>    
    );

}

ReactDOM.render(<peerChat/>, document.querySelector('.scene-container'));
