const express = require('express');
const app = express();
const server = require('http').Server(app);
// const io = require('socket.io');
const { Server } = require("socket.io");
const io = new Server(server);

var players = {};

io.listen(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


io.on('connection', function (socket) {
  players[socket.id] = {
  rotation: 0,
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50,
  playerId: socket.id,
  team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
  };

  // send the players object to the new player
  socket.emit('currentPlayers', players);
  // update all other players of the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);
  // console.log('a user connected : ' + socket.id);
  // console.log(players[socket.id].x);

  socket.on('disconnect', function () {
    // remove this player from our players object
    delete players[socket.id];
    console.log('user disconnected : '+ socket.id);
  });

  socket.on('playerMovement', function (movementData) {
  players[socket.id].x = movementData.x;
  players[socket.id].y = movementData.y;
  players[socket.id].rotation = movementData.rotation;
  // emit a message to all players about the player that moved
  socket.broadcast.emit('playerMoved', players[socket.id]);
  // console.log('player moving : ' + socket.id);
  });
});

server.listen(4000, function () {
  console.log(`Listening on ${server.address().port}`);
});
