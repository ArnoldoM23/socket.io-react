var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var httpProxy = require('http-proxy');
var publicPath = path.resolve(__dirname, 'public');
var mongoose = require('mongoose');
var port = process.env.PORT || 3000;
var User = require('./db/models/usermodel');

// We need to add a configuration to our proxy server,
// as we are now proxying outside localhost
var proxy = httpProxy.createProxyServer({
  changeOrigin: true
});
// connection for production
// mongoose.connect('mongodb://yourmongolabconnection.mlab.com:');

// // connection local
// mongoose.connect('mongo://localhost/yourLocaldb');

//serving our index.html
app.use(express.static(publicPath));
var bundle = require('./server/compiler.js')
bundle()

app.get('/', function(req, res){
	res.render('index.html');
})
// connect to socket io
io.on('connection', function (socket) {
  socket.on('ready', function(data){
    // join chat rooms
  	socket.join(data.chat_room);
  	socket.join(data.signal_room);
    // announce your has join
  	socket.to(data.chat_room).broadcast.emit('announce', {
  		message: 'New client in the ' + data.chat_room + 'room.'
  	});
    socket.to(data.signal_room).broadcast.emit('announce', {
      message: 'New client in the ' + data.signal_room + 'room.'
    });
  });

  socket.on('send', function(data){
    // Send messages to user
  	socket.to(data.room).broadcast.emit('message', {
  		message: data.message,
  		author: data.author
  	})
  });

// Webrtc signaling
  socket.on('signal', function(data){
  	socket.to(data.room).broadcast.emit('signaling_message', {
  		type: data.type,
  		message: data.message
  	})
  });

});

//express now processes all requests to localhost:8080
//app.all is a special routing method used for loading middleware functions
app.all('/build/*', function (req, res) {
  proxy.web(req, res, {
      target: 'http://localhost:8080'
  })
})

proxy.on('error', function(e) {
  console.log('Could not connect to proxy, please try again...')
});

server.listen(port, function () {
  console.log('Server running on port ' + port)
});



