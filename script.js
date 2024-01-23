const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

// Player class with it's information
class Player {
  constructor() {
    this.position = {
      x: 10,
      y: 400,
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = 40;
    this.height = 40;
  }

  // To draw the player position (Square Shape)
  draw() {
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  
// To update the position of the player
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

// To make a limit of the position
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    if (this.position.x < this.width) {
      this.position.x = this.width;
    }
  }
}

// Create a platform for the game
class Platform {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.width = 200;
    this.height = 40;
  }
  draw() {
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// Create a Checkpoint box
class CheckPoint {
  constructor(x, y) {
    this.position = {
      x,
      y,
    };
    this.width = 40;
    this.height = 70;
  };

  draw() {
    ctx.fillStyle = "#f1be32";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
  }
};

// Make an Object for the player to play the game
const player = new Player();

// Position of the platform in the game
const platformPositions = [
  { x: 500, y: 450 },
  { x: 700, y: 400 },
  { x: 850, y: 350 },
  { x: 900, y: 350 },
  { x: 1050, y: 150 },
  { x: 2500, y: 450 },
  { x: 2900, y: 400 },
  { x: 3150, y: 350 },
  { x: 3900, y: 450 },
  { x: 4200, y: 400 },
  { x: 4400, y: 200 },
  { x: 4700, y: 150 }
];

// To put all platforms based on the platformPositions variable information in the game
const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

// Position of the checkpoint Positions
const checkpointPositions = [
  { x: 1170, y: 80 },
  { x: 2900, y: 330 },
  { x: 4800, y: 80 },
];

// To put all checkpoints based on checkpointPositions variable inforation in the game
const checkpoints = checkpointPositions.map(
  checkpoint => new CheckPoint(checkpoint.x, checkpoint.y)
);

// To create the moving animation of the player
const animate = () => {
// WEB API to create animation
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

// To draw platform animation
  platforms.forEach((platform) => {
    platform.draw();
  });

// To draw checkpoint animation
  checkpoints.forEach(checkpoint => {
    checkpoint.draw();
  });

// To update the player information
  player.update();

// To move the position of the player
  if (keys.rightKey.pressed && player.position.x < 400) {
    player.velocity.x = 5;
  } else if (keys.leftKey.pressed && player.position.x > 100) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x -= 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x -= 5;
      });
    
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => {
        platform.position.x += 5;
      });

      checkpoints.forEach((checkpoint) => {
        checkpoint.position.x += 5;
      });
    }
  }

// To make the player can stand on the platform
  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >= platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <= platform.position.x + platform.width - player.width / 3,
    ];

    if (collisionDetectionRules.every((rule) => rule)) {
      player.velocity.y = 0;
      return;
    }

    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <=
        platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every(rule => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    };
  });

  checkpoints.forEach((checkpoint, index) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <=
        checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive
    ];

    if (checkpointDetectionRules.every((rule) => rule)) {
      checkpoint.claim();


      if (index === checkpoints.length - 1) {
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("You reached the final checkpoint!");
        movePlayer("ArrowRight", 0, false);
      }

      else if(player.position.x >= checkpoint.position.x && player.position.x <= checkpoint.position.x+40){
        showCheckpointScreen("You reached a checkpoint!");
      }

    };
  });
}

// create keys objects
const keys = {
  rightKey: {
    pressed: false
  },
  leftKey: {
    pressed: false
  }
};

// To move the player
const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) {
        player.velocity.x = xVelocity;
      }
      player.velocity.x += xVelocity;
  }
}

// To start the game
const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  animate();
}

// To show the checkpoint message
const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
  }
};

// Event Listener to listen to start game button to start the game
startBtn.addEventListener("click", startGame);

// Event listener to listen to the key pressed by the player
window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});
