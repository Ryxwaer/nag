const BG_COLOUR = '#231f20';
const SNAKE_1_COLOUR = '#75FF33';
const SNAKE_2_COLOUR = '#00F2FF';
const FOOD_COLOUR = '#e66916';
const OBSTICLE_COLOUR = '#808080';

const socket = io('https://salty-wave-03675.herokuapp.com/');

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');

newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);


function newGame() {
  console.log("new game");
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value;
  socket.emit('joinGame', code);
  init();
}

let canvas, ctx;
let playerNumber;
let gameActive = false;

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = 600;

  const size = canvas.width / 30;

  var c = document.getElementById("canvas");
  var ctx = c.getContext("2d");
  var img = document.getElementById("image");
  ctx.drawImage(img, 0, 0);
  console.log("canvas filled");
  
  //ctx.fillStyle = 'hsl(113,70%,' + (20 + 20*Math.random()) + '%)';
  //ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  socket.emit('keydown', e.keyCode);
}

function paintGame(state) {

  //ctx.fillStyle = BG_COLOUR;
  //ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (playerNumber === 1) {
    bar1 = document.getElementById('bar1');
    bar1.innerHTML = 'Your score: ' + state.players[0].score;
    bar1.style.width = 100 + (state.players[0].score * 5) + '%';
    bar1.style.background = SNAKE_1_COLOUR;
    bar2 = document.getElementById('bar2');
    bar2.innerHTML = 'Oponent score: ' + state.players[1].score;
    bar2.style.width = 100 + (state.players[1].score * 5) + '%';
    bar2.style.background = SNAKE_2_COLOUR;
  } else {
    bar1 = document.getElementById('bar1');
    bar1.innerHTML = 'Your score: ' + state.players[1].score;
    bar1.style.width = 100 + (state.players[1].score * 5) + '%';
    bar1.style.background = SNAKE_2_COLOUR;
    bar2 = document.getElementById('bar2');
    bar2.innerHTML = 'Oponent score: ' + state.players[0].score;
    bar2.style.width = 100 + (state.players[0].score * 5) + '%';
    bar2.style.background = SNAKE_1_COLOUR;
  }
  

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  var is = 0;
  var js = 0;
  for (var i = size; i <= canvas.width; i += size) {
    for (var j = size; j <= canvas.height; j += size) {
      is = i - size;
      js = j - size;
      ctx.fillStyle = 'hsl(113,70%,' + (20 + 5*Math.random()) + '%)';
      ctx.fillRect(is, js, i, j);
    }
  }

  ctx.fillStyle = FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  ctx.fillStyle = OBSTICLE_COLOUR;
  for (let cell of state.obsticle) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }

  paintPlayer(state.players[0], size, SNAKE_1_COLOUR);
  paintPlayer(state.players[1], size, SNAKE_2_COLOUR);
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
  console.log("player number: " + playerNumber)
}

function handleGameState(gameState) {
  if (!gameActive) {
    return;
  }
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameOver(data) {
  if (!gameActive) {
    return;
  }
  data = JSON.parse(data);

  gameActive = false;

  if (data.winner === playerNumber) {
    alert('You Win!');
  } else {
    alert('You Lose :(');
  }
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleUnknownCode() {
  reset();
  alert('Unknown Game Code')
}

function handleTooManyPlayers() {
  reset();
  alert('This game is already in progress');
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  initialScreen.style.display = "block";
  gameScreen.style.display = "none";
}
