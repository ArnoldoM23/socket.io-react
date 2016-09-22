import 'babel-polyfill';
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import  io from 'socket.io-client/socket.io';

var socket = io();
var ROOM = "chat";
var SIGNAL_ROOM = "signal_room";

class PeerChat extends Component {
  constructor(){
    super()
  }

  componentDidMount(){
    const myVideoArea = document.querySelector("#myVideoTag");
    const theirVideoArea = document.querySelector("#theirVideoTag");
    const myName = document.querySelector("#myName");
    const myMessage = document.querySelector("#myMessage");
    const chatArea = document.querySelector("#chatArea");
    const signalingArea = document.querySelector("#signalingArea")
    let rtcPeerConn; 
    // connect to stun server.
    const configuration = {
      'iceServers': [{
        'url': 'stun:stun.l.google.com:19302'
      }]
    };
// Connect to chat room
    socket.emit('ready', {
      "chat_room": ROOM, 
      "signal_room": SIGNAL_ROOM
    });
// send signal message
    socket.emit('signal', {
      "type": "user_here", 
      "message": 'Are you ready for a call?', 
      "room": SIGNAL_ROOM
    });
    // Signal for webrtc connection.
    socket.on('signaling_message', function(data) {  
    //Setup the RTC Peer connection object
      if(!rtcPeerConn){
        startSignaling();
      }
      if(data.type !== "user_here"){
        let message = JSON.parse(data.message);
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
      };
        //let the 'negotiationneeded' event trigger offer generation
      rtcPeerConn.onnegotiationneeded = function(){
        rtcPeerConn.createOffer(sendLocalDesc, logError);
      }
        //once remote stream arrives, show it in the remote video element
      rtcPeerConn.onaddstream = function(evt) {
        theirVideoArea.src = URL.createObjectURL(evt.stream);
      }
        // get usermedia from brower.
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        // set configuration for audio and video.
      navigator.getUserMedia({
            'audio': true,
            'video': true
      }, function(stream){
          myVideoArea.src = URL.createObjectURL(stream);
          rtcPeerConn.addStream(stream);
      }, logError)
    }

    function sendLocalDesc(desc){
      rtcPeerConn.setLocalDescription(desc, function() {
        socket.emit('signal', {
          "type": "SDP", 
          "message": JSON.stringify({ 
            'sdp': rtcPeerConn.localDescription
          }), 
          "room": SIGNAL_ROOM});
      }, logError);
    }

    function logError(error){
      console.log(`${error.name}:${error.message}`)
    }

    socket.on('announce', function(data){
      console.log(data.message);
    });

    socket.on('message', function(data){
      console.log(`${data.author}:${data.message}`)
    });

    function displayMessage(message) {
      chatArea.innerHTML = `${chatArea.innerHTML}</br>${message}`;
    }

    function displaySignalMessage(message) {
      signalingArea.innerHTML = `${signalingArea.innerHTML}</br>${message}`;
    } 

    function sendMessage() {
      console.log('in sendMessage')
      let data = {
        "author": myName.value, 
        "message": myMessage.value, 
        "room": ROOM
      };
      socket.emit('send', data);
    }
    
  } 
  

  render(){
    return (
      <div>
        <video id="myVideoTag" autoPlay></video>
        <video id="theirVideoTag" autoPlay></video>
        <div>
          <label>Your Name</label><input id="myName" type="/text" />
          <label>Message</label><input id="myMessage" type="/text" />
          <button  id="sendMessage" type="submit">Send</button>
          <div id="chatArea" >Message Output:<br/></div>
          <div id="signalingArea">Signaling Messages:<br/></div>
        </div>  
      </div> 
    ); 
  }
}

ReactDOM.render(<PeerChat/>, document.querySelector('.container'));
