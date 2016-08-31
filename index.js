import 'babel-polyfill';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import  io from 'socket.io-client/socket.io';

var socket = io();

class PeerChat extends Component {

    constructor(){
        super()
    }

    componentDidMount(){
       
     socket.on('news', (data) => {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      }); 

        var myVideoArea = document.querySelector("#myVideoTag");
     
        var theirVideoArea = document.querySelector("#theirVideoTag");
        var myName = document.querySelector("#myName");
        var myMessage = document.querySelector("#myMessage");
        var sendMessage = document.querySelector("#sendMessage");
        var chatArea = document.querySelector("#chatArea");
        var signalingArea = document.querySelector("#signalingArea")
        var ROOM = "chat";
        var SIGNAL_ROOM = "signal_room";
        var configuration = {
            'iceServers': [{
                'url': 'stun:stun.l.google.com:19302'
            }]
        };
        var rtcPeerConn; 

        
       socket.emit('ready', {
            "chat_room": ROOM, 
            "signal_room": SIGNAL_ROOM
        });

        socket.emit('signal', {
            "type": "user_here", 
            "message": 'Are you ready for a call?', 
            "room": SIGNAL_ROOM
        });
        socket.on('signaling_message', function(data) {
            console.log('data in signaling_message')
            displaySignalMessage("Signal received: " + data.type);
            //Setup the RTC Peer connection object
            if(!rtcPeerConn)
                startSignaling();
            if(data.type !== "user_here"){
                var message = JSON.parse(data.message);
                if(message.sdp) {
                    rtcPeerConn.setRemoteDescription(new RTCSessionDescription(message.sdp), function() {
                        //if we received an offer, we need to answer
                        if (rtcPeerConn.remoteDescription.type === 'offer') {
                            rtcPeerConn.createAnswer(sendLocalDesc, logError);
                        }
                    }, logError);
                }
                else { 
                    rtcPeerConn.addIceCandidate(new RTCIceCandidate(message.candidate));
                }
            }
        });

        function startSignaling(){
            console.log('inside of startSignaling')
            displaySignalMessage("starling signaling...");
            rtcPeerConn = new webkitRTCPeerConnection(configuration);
            //send  any ice candidates to the other peer
            rtcPeerConn.onicecandidate = function(evt) {
                if(evt.candidate){
                    socket.emit('signal', {
                        "type":"ice candidate", 
                        "message": JSON.stringify({
                            'candidate': evt.candidate
                        }), 
                        "room": SIGNAL_ROOM
                    });
                }
                displaySignalMessage("completed that ice candidate...");
            };
            //let the 'negotiationneeded' event trigger offer generation
            rtcPeerConn.onnegotiationneeded = function(){
                displaySignalMessage("on negotiation called");
                rtcPeerConn.createOffer(sendLocalDesc, logError);
            }
            //once remote stream arrives, show it in the remote video element
            rtcPeerConn.onaddstream = function(evt) {
                displaySignalMessage("going to add their stream");
                theirVideoArea.src = URL.createObjectURL(evt.stream);
            }
            //get a local stream, show it in our video tag and add it to be sent
            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            navigator.getUserMedia({
                'audio': true,
                'video': true
            }, function(stream){
                displaySignalMessage("going to display my stream...");
                myVideoArea.src = URL.createObjectURL(stream);
                rtcPeerConn.addStream(stream);
            }, logError)
        }

        function sendLocalDesc(desc){
            rtcPeerConn.setLocalDescription(desc, function() {
                displayMessage("sending local description");
                socket.emit('signal', {"type": "SDP", "message": JSON.stringify({ 'sdp': 
                    rtcPeerConn.localDescription}), "room": SIGNAL_ROOM});
            }, logError);
        }

        function logError(error){
            displaySignalMessage(error.name + ':' + error.message)
        }

        socket.on('announce', function(data){
            displayMessage(data.message);
        });

        socket.on('message', function(data){
            displayMessage(data.author + ": " + data.message);
        });

        function displayMessage(message) {
            chatArea.innerHTML = chatArea.innerHTML + "</br>" + message;
        }

        function displaySignalMessage(message) {
            signalingArea.innerHTML = signalingArea.innerHTML + "</br>" + message;
        }
    }
   
    // testing socket io connection.

        // sendMessage.addEventListener('click', function(ev){
        //     ev.preventDefault();
        //     socket.emit('send', {"author": myName.value, "message": myMessage.value, "room": ROOM});
        // }, false)
    render(){
        return (
            <div>
                <video id="myVideoTag" autoPlay></video>
                <video id="theirVideoTag" autoPlay></video>
                <div>
                    <label>Your Name</label><input id="myName" type="/text" />
                    <label>Message</label><input id="myMessage" type="/text" />
                    <input onClick={() => { socket.emit('send', {"author": myName.value, "message": myMessage.value, "room": ROOM});} } id="sendMessage" type="submit" />
                    <div id="chatArea" >Message Output:<br/></div>
                    <div id="signalingArea">Signaling Messages:<br/></div>
                </div>  
            </div> 
        ); 
    }
    
        


}

ReactDOM.render(<PeerChat/>, document.querySelector('.scene-container'));
