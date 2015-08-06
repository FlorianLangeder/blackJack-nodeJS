var express = require('express'),
  app = express(),
  http = require('http'),
  server = http.createServer(app),
  io = require('socket.io').listen(server);

io.set('transports', ['htmlfile', 'xhr-polling', 'jsonp-polling']);

// listen for new web clients:
server.listen(63924);
var curPlayer = 0;
var totalCards = [];
app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function(socket) {

  socket.emit('initConnection', curPlayer, totalCards);

  socket.on('disconnect', function() {
    clientDisconnect(socket);
  });

  socket.on('leave', function() {
    leaveRoom(socket);
  });

  socket.on('drawCard', function(player, value, cardIndex, x, y) {
    totalCards.push({"player":player, 
            "value":value,
            "cardIndex":cardIndex,
            "x":x,
          "y":y});
    curPlayer = player;
    socket.broadcast.emit('drawCard', player, value, cardIndex, x, y);
  });

  socket.on('dealSync', function(player, value, cardIndex, x, y) {
    curPlayer = player;
    socket.broadcast.emit('dealSync', player, value, cardIndex, x, y);
  });

  socket.on('stand', function(p) {
    socket.broadcast.emit('stand',p);
  });

  socket.on('emptyCards', function() {
    totalCards.length = 0;
  });

  socket.on('sendMessage', function(text) {
    if (!isBlank(text)) {
      io.sockets.emit('setMessage', text);
    }
  });
});

function clientDisconnect(socket) {
  
}

//For checking if a string is blank, null or undefined
function isBlank(str) {
  return (!str || /^\s*$/.test(str) || typeof str !== "string");
}

function isValid(par) {
  return typeof par !== "undefined" && par !== null;
}