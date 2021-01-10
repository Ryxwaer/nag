import { speedUp } from './game';

const io = require('socket.io')();
const { initGame, gameLoop, getUpdatedVelocity, changeControls} = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');

const state = {};
const clientRooms = {};

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('joinGame', handleJoinGame);
  client.on('setKey', setKey);

  function setKey(id, keyCode) {
    console.log(" id: " + id + " keyCode: " + keyCode);
    changeControls(id, keyCode);
  }

  function handleJoinGame(roomName) {
    const room = io.sockets.adapter.rooms[roomName];

    let allUsers;
    if (room) {
      allUsers = room.sockets;
    }

    let numClients = 0;
    if (allUsers) {
      numClients = Object.keys(allUsers).length;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    console.log("game interval started");
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5);
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame();

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
  }

  function handleKeydown(keyCode) {
    console.log("keyCode: " + keyCode);
    const roomName = clientRooms[client.id];
    if (!roomName) {
      return;
    }
    try {
      keyCode = parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);

    if (vel && vel.x != state[roomName].players[client.number - 1].vel.x * (-1) && vel.y != state[roomName].players[client.number - 1].vel.y * (-1)) {
      console.log(state[roomName].players[client.number - 1].vel);
      state[roomName].players[client.number - 1].vel = vel;
    } 
    else if (vel && state[roomName].players[0].vel.x == 0 && state[roomName].players[0].vel.y == 0) {
      console.log("START");
      state[roomName].players[0].vel = vel;
      state[roomName].players[1].vel = vel;

      console.log(state[roomName].players[client.number - 1].vel);
    }
  }
});

function startGameInterval(roomName) {
  const intervalId = setInterval(() => {
    const winner = gameLoop(state[roomName]);
    if (!winner) {
      emitGameState(roomName, state[roomName])
    } else {
      emitGameOver(roomName, winner);
      state[roomName] = null;
      clearInterval(intervalId);
    }
    console.log("SPEED: ", speedUp)
  }, 1000 / speedUp);
}

function emitGameState(room, gameState) {
  // Send this event to everyone in the room.
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

io.listen(process.env.PORT || 3000);
