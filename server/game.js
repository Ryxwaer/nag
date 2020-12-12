const { GRID_SIZE, OBSTICLES } = require('./constants');

module.exports = {
  initGame,
  gameLoop,
  getUpdatedVelocity,
}

function initGame() {
  const state = createGameState()
  randomObsticle(state);
  randomFood(state);
  return state;
}

function createGameState() {
  return {
    players: [{
      pos: {
        x: 3,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 1, y: 10},
        {x: 2, y: 10},
        {x: 3, y: 10},
      ],
    }, {
      pos: {
        x: 18,
        y: 10,
      },
      vel: {
        x: 0,
        y: 0,
      },
      snake: [
        {x: 18, y: 10},
        {x: 17, y: 10},
        {x: 16, y: 10},
      ],
    }],
    food: {},
    obsticle: [],
    gridsize: GRID_SIZE,
  };
}

function gameLoop(state) {
  if (!state) {
    return;
  }

  const playerOne = state.players[0];
  const playerTwo = state.players[1];

  playerOne.pos.x += playerOne.vel.x;
  playerOne.pos.y += playerOne.vel.y;

  playerTwo.pos.x += playerTwo.vel.x;
  playerTwo.pos.y += playerTwo.vel.y;

  // player 1 mimo hracie pole
  if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y < 0 || playerOne.pos.y > GRID_SIZE) {
    console.log("player 1 out of grid");
    return 2;
  }
  // player 2 mimo hracie pole
  if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y < 0 || playerTwo.pos.y > GRID_SIZE) {
    console.log("player 2 out of grid");
    return 1;
  }

  // player 1 papa
  if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
    playerOne.snake.push({ ...playerOne.pos });
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    randomFood(state);
    console.log("player 1 papa");
  }

  // player 2 papa
  if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;
    randomFood(state);
    console.log("player 2 papa");
  }

  // naraz do prekazky
  for (let cell of state.obsticle) {
    // player 1 narazil
    if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
      console.log("player 1 narazil");
      return 2;
    }
    // player 2 narazil
    if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
      console.log("player 2 narazil");
      return 1;
    }
  }

  // player 1 pohyb
  if (playerOne.vel.x || playerOne.vel.y) {
    for (let cell of playerOne.snake) {
      // kolizia
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        console.log("player 1 suicide");
        return 2;
      }
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        console.log("player 2 crashed");
        return 1;
      }
    }

    playerOne.snake.push({ ...playerOne.pos });
    playerOne.snake.shift();
  }

  // player 2 pohyb
  if (playerTwo.vel.x || playerTwo.vel.y) {
    for (let cell of playerTwo.snake) {
      // kolizia
      if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
        console.log("player 2 suicide");
        return 1;
      }
      if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
        console.log("player 1 crashed");
        return 2;
      }
    }

    playerTwo.snake.push({ ...playerTwo.pos });
    playerTwo.snake.shift();
  }

  return false;
}

// nahodne generovanie jedla
function randomFood(state) {
  food = {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  };

  for (let cell of state.players[0].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  for (let cell of state.players[1].snake) {
    if (cell.x === food.x && cell.y === food.y) {
      return randomFood(state);
    }
  }

  state.food = food;
}

// nahodne generovanie prekazok
function randomObsticle(state) {
  console.log("OBSTICLES " + OBSTICLES);
  let i = 0;
  while(i < OBSTICLES){
    console.log("generating obsticle: " + i + " of " + OBSTICLES);
    obsticle = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

    for (let cell of state.players[0].snake) {
      if (cell.x === obsticle.x && cell.y === obsticle.y) {
        return randomObsticle(state);
      }
    }

    for (let cell of state.players[1].snake) {
      if (cell.x === obsticle.x && cell.y === obsticle.y) {
        return randomObsticle(state);
      }
    }
    state.obsticle += obsticle;
    i += 1;
  }
}

function getUpdatedVelocity(keyCode) {
  switch (keyCode) {
    case 37: { // left
      return { x: -1, y: 0 };
    }
    case 38: { // down
      return { x: 0, y: -1 };
    }
    case 39: { // right
      return { x: 1, y: 0 };
    }
    case 40: { // up
      return { x: 0, y: 1 };
    }
  }
}
